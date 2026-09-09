import { notFound } from "next/navigation";
import { getSection } from "../../../../../lib/sections";
import { sectionSchemas } from "../../../../../lib/sections.schema";
import { DynamicSectionForm } from "../../../../../components/admin/DynamicSectionForm";

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const schema = sectionSchemas[key];
  if (!schema) notFound();

  const data = (await getSection(key)) ?? {};

  return <DynamicSectionForm sectionKey={key} schema={schema} initialData={data} />;
}
