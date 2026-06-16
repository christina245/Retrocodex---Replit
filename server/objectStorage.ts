import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Response } from "express";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { Readable } from "stream";

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_R2_BUCKET = process.env.CF_R2_BUCKET!;
const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE || "https://images.theretrocodex.com";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
  },
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  async uploadBuffer(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const objectId = randomUUID();
    const isImage = mimeType.startsWith("image/");
    let finalBuffer = buffer;
    let finalMime = mimeType;
    let finalExt: string;

    if (isImage) {
      const animated = mimeType === "image/gif";
      finalBuffer = await sharp(buffer, { animated })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      finalMime = "image/webp";
      finalExt = "webp";
    } else {
      finalExt = filename.includes(".") ? filename.split(".").pop()! : "bin";
    }

    const key = `uploads/${objectId}.${finalExt}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: CF_R2_BUCKET,
        Key: key,
        Body: finalBuffer,
        ContentType: finalMime,
      })
    );

    return `${R2_PUBLIC_BASE}/${key}`;
  }

  async downloadObject(key: string, res: Response, cacheTtlSec = 3600): Promise<void> {
    try {
      const command = new GetObjectCommand({ Bucket: CF_R2_BUCKET, Key: key });
      const { Body, ContentType, ContentLength } = await r2.send(command);

      if (!Body) throw new ObjectNotFoundError();

      res.set({
        "Content-Type": ContentType || "application/octet-stream",
        ...(ContentLength && { "Content-Length": String(ContentLength) }),
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      (Body as Readable).pipe(res);
    } catch (err: any) {
      if (err?.name === "NoSuchKey" || err instanceof ObjectNotFoundError) {
        throw new ObjectNotFoundError();
      }
      throw err;
    }
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await r2.send(new HeadObjectCommand({ Bucket: CF_R2_BUCKET, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}
