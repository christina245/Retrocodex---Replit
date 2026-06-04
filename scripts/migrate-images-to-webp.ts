/**
 * One-time migration: convert all existing images in App Storage to WebP,
 * then update every DB reference that pointed to the old path.
 *
 * Run with:  npx tsx scripts/migrate-images-to-webp.ts
 */

import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { sql } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const BUCKET = process.env.PRIVATE_OBJECT_DIR!.split("/")[1];
const PRIVATE_PREFIX = process.env.PRIVATE_OBJECT_DIR!.replace(`/${BUCKET}/`, "");

const storage = new Storage({
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
  },
  projectId: "",
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const CONVERTIBLE = new Set(["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]);

async function convertToWebP(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const img = sharp(buffer, { animated: mimeType === "image/gif" });
  return img
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function run() {
  const bucket = storage.bucket(BUCKET);
  const [files] = await bucket.getFiles({ prefix: `${PRIVATE_PREFIX}/uploads/` });

  console.log(`Found ${files.length} files in bucket.`);

  const renames: Array<{ oldPath: string; newPath: string }> = [];
  let skipped = 0;
  let converted = 0;
  let errors = 0;

  for (const file of files) {
    const contentType = (file.metadata.contentType as string) || "";
    const objectName = file.name.replace(`${PRIVATE_PREFIX}/`, ""); // e.g. "uploads/uuid.png"
    const oldObjectsPath = `/objects/${objectName}`;                  // e.g. "/objects/uploads/uuid.png"

    // Skip files already WebP
    if (contentType === "image/webp" || objectName.endsWith(".webp")) {
      skipped++;
      continue;
    }

    if (!CONVERTIBLE.has(contentType)) {
      console.log(`  SKIP (non-image): ${file.name}`);
      skipped++;
      continue;
    }

    const newObjectName = objectName.replace(/\.[^.]+$/, ".webp"); // "uploads/uuid.webp"
    const newObjectsPath = `/objects/${newObjectName}`;

    try {
      // Download
      const [originalBuffer] = await file.download();

      // Convert
      const webpBuffer = await convertToWebP(originalBuffer, contentType);
      const savings = (((originalBuffer.length - webpBuffer.length) / originalBuffer.length) * 100).toFixed(1);
      console.log(`  ${objectName} → ${newObjectName}  (${(originalBuffer.length/1024).toFixed(0)}KB → ${(webpBuffer.length/1024).toFixed(0)}KB, -${savings}%)`);

      // Upload WebP version
      const newFile = bucket.file(`${PRIVATE_PREFIX}/${newObjectName}`);
      await newFile.save(webpBuffer, { contentType: "image/webp", resumable: false });

      // Delete old file
      await file.delete();

      renames.push({ oldPath: oldObjectsPath, newPath: newObjectsPath });
      converted++;
    } catch (err) {
      console.error(`  ERROR converting ${file.name}:`, err);
      errors++;
    }
  }

  console.log(`\nConverted: ${converted}, Skipped: ${skipped}, Errors: ${errors}`);

  if (renames.length === 0) {
    console.log("No paths to update in DB.");
    await pool.end();
    return;
  }

  console.log(`\nUpdating ${renames.length} DB references...`);

  for (const { oldPath, newPath } of renames) {
    // facts.cover_photo
    await db.execute(sql`
      UPDATE facts SET cover_photo = ${newPath}
      WHERE cover_photo = ${oldPath}
    `);

    // blog_posts.cover_image
    await db.execute(sql`
      UPDATE blog_posts SET cover_image = ${newPath}
      WHERE cover_image = ${oldPath}
    `);

    // external_articles.cover_image
    await db.execute(sql`
      UPDATE external_articles SET cover_image = ${newPath}
      WHERE cover_image = ${oldPath}
    `);

    // facts.sources JSONB — update logoUrl inside each source object
    await db.execute(sql`
      UPDATE facts
      SET sources = (
        SELECT jsonb_agg(
          CASE
            WHEN src->>'logoUrl' = ${oldPath}
            THEN jsonb_set(src, '{logoUrl}', ${JSON.stringify(newPath)}::jsonb)
            ELSE src
          END
        )
        FROM jsonb_array_elements(sources) AS src
      )
      WHERE sources::text LIKE ${'%' + oldPath + '%'}
    `);

    // facts.timeline JSONB — update imageUrl inside each timeline entry
    await db.execute(sql`
      UPDATE facts
      SET timeline = (
        SELECT jsonb_agg(
          CASE
            WHEN entry->>'imageUrl' = ${oldPath}
            THEN jsonb_set(entry, '{imageUrl}', ${JSON.stringify(newPath)}::jsonb)
            ELSE entry
          END
        )
        FROM jsonb_array_elements(timeline) AS entry
      )
      WHERE timeline::text LIKE ${'%' + oldPath + '%'}
    `);
  }

  console.log("DB update complete.");
  await pool.end();
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
