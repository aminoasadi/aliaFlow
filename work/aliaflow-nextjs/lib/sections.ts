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
  return JSON.parse(row.data) as Record<string, unknown>;
}

export async function updateSection(
  key: string,
  data: unknown,
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
  await prisma.section.upsert({
    where: { key },
    update: { data: serialized },
    create: { key, data: serialized },
  });

  return data as Record<string, unknown>;
}
