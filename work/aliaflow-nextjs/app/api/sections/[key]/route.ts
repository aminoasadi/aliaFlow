import { NextRequest, NextResponse } from "next/server";
import { getSection, updateSection, SectionValidationError } from "../../../../lib/sections";
import { sectionSchemas } from "../../../../lib/sections.schema";

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
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = await updateSection(key, body);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof SectionValidationError) {
      return NextResponse.json({ error: error.message, issues: error.issues }, { status: 400 });
    }
    throw error;
  }
}
