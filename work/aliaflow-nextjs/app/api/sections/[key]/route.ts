import { NextRequest, NextResponse } from "next/server";
import { getSection, updateSection, SectionValidationError } from "../../../../lib/sections";
import { sectionSchemas } from "../../../../lib/sections.schema";
import { prisma } from "../../../../lib/db";
import { getSessionUserId } from "../../../../lib/auth";

type RouteContext = { params: Promise<{ key: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { key } = await params;
  if (!sectionSchemas[key]) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }
  const data = await getSection(key);
  if (!data) {
    return NextResponse.json({ error: "Section not seeded" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { key } = await params;
  const body = await request.json().catch(() => null) as { data?: unknown; intent?: "save" | "publish" } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const userId = await getSessionUserId();
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }) : null;
    const payload = Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body;
    const data = await updateSection(key, payload, { intent: body.intent, actorEmail: user?.email });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof SectionValidationError) {
      return NextResponse.json({ error: error.message, issues: error.issues }, { status: 400 });
    }
    throw error;
  }
}
