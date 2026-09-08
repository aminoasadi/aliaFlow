import path from "node:path";
import { readdir } from "node:fs/promises";
import { prisma } from "./db";

export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

export const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export type UploadedFile = { filename: string; url: string };

export async function listUploadedFiles(): Promise<UploadedFile[]> {
  let entries: string[];
  try {
    entries = await readdir(UPLOAD_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((name) => !name.startsWith("."))
    .sort()
    .map((filename) => ({ filename, url: `/uploads/${filename}` }));
}

export async function isFileReferenced(url: string): Promise<string[]> {
  const sections = await prisma.section.findMany();
  return sections.filter((section) => section.data.includes(url)).map((section) => section.key);
}
