import { prisma } from "./db";
import { sectionSchemas } from "./sections.schema";
import { validateSectionData } from "./section-validation";

export class SectionValidationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    super(issues.join("; "));
    this.issues = issues;
  }
}

export async function getSection(key: string): Promise<Record<string, unknown> | null> {
  const row = await prisma.section.findUnique({ where: { key } });
  if (!row) return null;
  const source = row.status === "published" && row.publishedData ? row.publishedData : row.data;
  return JSON.parse(source) as Record<string, unknown>;
}

export async function getSectionDraft(key: string) {
  const row = await prisma.section.findUnique({
    where: { key },
    include: { revisions: { orderBy: { createdAt: "desc" }, take: 8 } },
  });
  if (!row) return null;
  return { ...row, data: JSON.parse(row.data) as Record<string, unknown> };
}

export async function updateSection(
  key: string,
  data: unknown,
  options: { intent?: "save" | "publish"; actorEmail?: string } = {},
): Promise<Record<string, unknown>> {
  const schema = sectionSchemas[key];
  if (!schema) {
    throw new SectionValidationError([`Unknown section "${key}"`]);
  }

  const issues = validateSectionData(schema.fields, data);
  if (issues.length > 0) {
    throw new SectionValidationError(issues);
  }

  const serialized = JSON.stringify(data);
  const intent = options.intent ?? "save";
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.section.upsert({
      where: { key },
      update: {
        data: serialized,
        status: intent === "publish" ? "published" : "draft",
        publishedData: intent === "publish" ? serialized : undefined,
        publishedAt: intent === "publish" ? now : undefined,
        updatedBy: options.actorEmail,
      },
      create: {
        key,
        data: serialized,
        status: intent === "publish" ? "published" : "draft",
        publishedData: intent === "publish" ? serialized : null,
        publishedAt: intent === "publish" ? now : null,
        updatedBy: options.actorEmail,
      },
    });
    await tx.revision.create({ data: { sectionKey: key, data: serialized, action: intent, actorEmail: options.actorEmail } });
    await tx.activity.create({
      data: {
        action: intent === "publish" ? "Published" : "Saved draft",
        entityType: "section",
        entityKey: key,
        actorEmail: options.actorEmail,
      },
    });
  });

  return data as Record<string, unknown>;
}

export async function listSectionsMeta(): Promise<
  { key: string; label: string; status: string; updatedAt: Date; updatedBy: string | null }[]
> {
  const rows = await prisma.section.findMany({ select: { key: true, status: true, updatedAt: true, updatedBy: true } });
  const byKey = new Map(rows.map((row) => [row.key, row]));
  return Object.entries(sectionSchemas).map(([key, schema]) => ({
    key,
    label: schema.label,
    status: byKey.get(key)?.status ?? "missing",
    updatedAt: byKey.get(key)?.updatedAt ?? new Date(0),
    updatedBy: byKey.get(key)?.updatedBy ?? null,
  }));
}
