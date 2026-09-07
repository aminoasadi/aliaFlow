export type FieldSchema =
  | { type: "text"; label: string }
  | { type: "textarea"; label: string }
  | { type: "image"; label: string }
  | {
      type: "list";
      label: string;
      itemLabel: string;
      fields: Record<string, FieldSchema>;
    };

export type SectionSchema = {
  label: string;
  fields: Record<string, FieldSchema>;
};

export function validateSectionData(
  fields: Record<string, FieldSchema>,
  data: unknown,
  path = "root",
): string[] {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return [`${path}: expected an object`];
  }
  const record = data as Record<string, unknown>;
  const issues: string[] = [];
  for (const [key, field] of Object.entries(fields)) {
    issues.push(...validateField(field, record[key], `${path}.${key}`));
  }
  return issues;
}

function validateField(field: FieldSchema, value: unknown, path: string): string[] {
  if (field.type === "text" || field.type === "textarea" || field.type === "image") {
    return typeof value === "string" ? [] : [`${path}: expected a string`];
  }
  if (!Array.isArray(value)) {
    return [`${path}: expected an array`];
  }
  return value.flatMap((item, index) =>
    validateSectionData(field.fields, item, `${path}[${index}]`),
  );
}
