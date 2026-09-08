import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, isFileReferenced } from "../../../../lib/media";

type RouteContext = { params: Promise<{ filename: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { filename } = await params;
  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const usedBy = await isFileReferenced(`/uploads/${filename}`);
  if (usedBy.length > 0) {
    return NextResponse.json(
      { error: `Still used by: ${usedBy.join(", ")}` },
      { status: 409 },
    );
  }

  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
