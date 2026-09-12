import { notFound } from "next/navigation";
import { getSectionDraft } from "../../../../../lib/sections";
import { sectionSchemas } from "../../../../../lib/sections.schema";
import { DynamicSectionForm } from "../../../../../components/admin/DynamicSectionForm";
import { normalizeSectionData } from "../../../../../lib/section-validation";

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const schema = sectionSchemas[key];
  if (!schema) notFound();

  const section = await getSectionDraft(key);
  if (!section) notFound();

  return <DynamicSectionForm sectionKey={key} schema={schema} initialData={normalizeSectionData(schema.fields, section.data)} status={section.status} updatedAt={section.updatedAt.toISOString()} updatedBy={section.updatedBy} revisions={section.revisions.map((revision) => ({ ...revision, createdAt: revision.createdAt.toISOString() }))} />;
}
