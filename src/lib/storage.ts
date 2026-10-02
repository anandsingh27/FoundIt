import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export class UploadError extends Error {}

/**
 * Saves an uploaded photo (from a <input type="file"> inside a Server Action's
 * FormData) to /public/uploads and returns the public path to store on the item.
 * Returns null if no file (or an empty file input) was provided.
 */
export async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (file.size > MAX_BYTES) {
    throw new UploadError("Image is too large. Please use a file under 5MB.");
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Unsupported image type. Please upload a JPG, PNG, WEBP, or GIF.");
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}

export async function deleteUploadedImage(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", publicPath);
  try {
    await fs.unlink(filePath);
  } catch {
    // Best-effort cleanup; ignore if already gone.
  }
}
