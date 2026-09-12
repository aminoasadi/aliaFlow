type BaseFieldSchema = {
  label: string;
  description?: string;
  /** Value shown for sections created before this field existed. */
  defaultValue?: string;
};

export type FieldSchema =
  | (BaseFieldSchema & { type: "text" })
  | (BaseFieldSchema & { type: "textarea" })
  | (BaseFieldSchema & { type: "image" })
  | {
      type: "list";
      label: string;
      description?: string;
      itemLabel: string;
      fields: Record<string, FieldSchema>;
    };

export type SectionSchema = {
  label: string;
  fields: Record<string, FieldSchema>;
};

/**
 * Add schema defaults to older JSON records before they reach the editor.
 * Extra keys are intentionally preserved so a schema change never discards
 * previously published content during an unrelated edit.
 */
export function normalizeSectionData(
  fields: Record<string, FieldSchema>,
  data: unknown,
): Record<string, unknown> {
  const source =
    typeof data === "object" && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  const normalized: Record<string, unknown> = { ...source };

  for (const [key, field] of Object.entries(fields)) {
    const value = source[key];
    if (field.type === "list") {
      normalized[key] = Array.isArray(value)
        ? value.map((item) => normalizeSectionData(field.fields, item))
        : [];
    } else {
      normalized[key] = typeof value === "string" ? value : (field.defaultValue ?? "");
    }
  }

  return normalized;
}

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
