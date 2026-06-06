/**
 * One-time migration: copy all images from Replit App Storage → Cloudflare R2
 * and update every DB reference to point to the new public URL.
 *
 * Run with:  npx tsx scripts/migrate-to-r2.ts
 */

import { Storage } from "@google-cloud/storage";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { facts, blogPosts, externalArticles } from "../shared/schema";

// ─── Config ────────────────────────────────────────────────────────────────

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_R2_BUCKET = process.env.CF_R2_BUCKET!;
const CF_R2_API_TOKEN = process.env.CF_R2_API_TOKEN!;
const R2_PUBLIC_BASE = "https://images.theretrocodex.com";

// ─── GCS client (Replit App Storage) ────────────────────────────────────────

const gcs = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  } as any,
  projectId: "",
});

// ─── DB ─────────────────────────────────────────────────────────────────────

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseGcsPath(path: string): { bucketName: string; objectName: string } {
  if (!path.startsWith("/")) path = `/${path}`;
  const parts = path.split("/");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

async function downloadFromAppStorage(dbPath: string): Promise<{ buffer: Buffer; contentType: string }> {
  // dbPath is like /objects/uploads/<uuid>.webp
  const entityId = dbPath.replace(/^\/objects\//, ""); // "uploads/<uuid>.webp"
  let dir = PRIVATE_OBJECT_DIR;
  if (!dir.endsWith("/")) dir += "/";
  const fullPath = `${dir}${entityId}`;

  const { bucketName, objectName } = parseGcsPath(fullPath);
  const file = gcs.bucket(bucketName).file(objectName);

  const [exists] = await file.exists();
  if (!exists) throw new Error(`Not found in App Storage: ${fullPath}`);

  const [buffer] = await file.download();
  const [meta] = await file.getMetadata();
  return { buffer, contentType: (meta.contentType as string) || "image/webp" };
}

async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${CF_R2_BUCKET}/objects/${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${CF_R2_API_TOKEN}`,
      "Content-Type": contentType,
    },
    body: buffer,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`R2 upload failed ${res.status}: ${body}`);
  }

  return `${R2_PUBLIC_BASE}/${key}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Retrocodex App Storage → Cloudflare R2 Migration ===\n");

  // 1. Collect all /objects/ paths from the DB
  const allFacts = await db.select().from(facts);
  const allPosts = await db.select().from(blogPosts);
  const allArticles = await db.select().from(externalArticles);

  const pathsToMigrate = new Set<string>();

  for (const f of allFacts) {
    if (f.coverPhoto?.startsWith("/objects/")) pathsToMigrate.add(f.coverPhoto);
    for (const s of f.sources ?? []) {
      if (s.logoUrl?.startsWith("/objects/")) pathsToMigrate.add(s.logoUrl);
    }
    for (const t of f.timeline ?? []) {
      if (t.imageUrl?.startsWith("/objects/")) pathsToMigrate.add(t.imageUrl);
    }
  }
  for (const p of allPosts) {
    if (p.coverImage?.startsWith("/objects/")) pathsToMigrate.add(p.coverImage);
  }
  for (const a of allArticles) {
    if (a.coverImage?.startsWith("/objects/")) pathsToMigrate.add(a.coverImage);
  }

  console.log(`Found ${pathsToMigrate.size} unique images to migrate.\n`);

  // 2. Download from App Storage, upload to R2
  const migrationMap = new Map<string, string>(); // oldPath → newUrl
  let ok = 0;
  let fail = 0;

  for (const oldPath of pathsToMigrate) {
    const key = oldPath.replace(/^\/objects\//, ""); // e.g. "uploads/<uuid>.webp"
    process.stdout.write(`  ${oldPath} → `);
    try {
      const { buffer, contentType } = await downloadFromAppStorage(oldPath);
      const newUrl = await uploadToR2(key, buffer, contentType);
      migrationMap.set(oldPath, newUrl);
      console.log(newUrl);
      ok++;
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nUploads: ${ok} succeeded, ${fail} failed.\n`);

  if (migrationMap.size === 0) {
    console.log("Nothing to update in the database.");
    return;
  }

  // 3. Update DB records
  console.log("Updating database...\n");

  // Facts
  for (const f of allFacts) {
    let changed = false;
    let newCoverPhoto = f.coverPhoto;
    let newSources = f.sources;
    let newTimeline = f.timeline;

    if (f.coverPhoto && migrationMap.has(f.coverPhoto)) {
      newCoverPhoto = migrationMap.get(f.coverPhoto)!;
      changed = true;
    }
    if (f.sources) {
      const updated = f.sources.map((s) => {
        if (s.logoUrl && migrationMap.has(s.logoUrl)) {
          changed = true;
          return { ...s, logoUrl: migrationMap.get(s.logoUrl)! };
        }
        return s;
      });
      if (changed) newSources = updated;
    }
    if (f.timeline) {
      const updated = f.timeline.map((t) => {
        if (t.imageUrl && migrationMap.has(t.imageUrl)) {
          changed = true;
          return { ...t, imageUrl: migrationMap.get(t.imageUrl)! };
        }
        return t;
      });
      if (changed) newTimeline = updated;
    }

    if (changed) {
      await db.update(facts)
        .set({ coverPhoto: newCoverPhoto, sources: newSources as any, timeline: newTimeline as any })
        .where(eq(facts.id, f.id));
      console.log(`  [fact] ${f.slug}`);
    }
  }

  // Blog posts
  for (const p of allPosts) {
    if (p.coverImage && migrationMap.has(p.coverImage)) {
      await db.update(blogPosts)
        .set({ coverImage: migrationMap.get(p.coverImage)! })
        .where(eq(blogPosts.id, p.id));
      console.log(`  [blog] ${p.slug}`);
    }
  }

  // External articles
  for (const a of allArticles) {
    if (a.coverImage && migrationMap.has(a.coverImage)) {
      await db.update(externalArticles)
        .set({ coverImage: migrationMap.get(a.coverImage)! })
        .where(eq(externalArticles.id, a.id));
      console.log(`  [ext]  ${a.id}`);
    }
  }

  console.log("\n=== Migration complete! ===");
  console.log(`${migrationMap.size} images now served from ${R2_PUBLIC_BASE}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
