import { describe, expect, it } from "vitest";
import { normalizeLocalizedSectionData, validateLocalizedSectionData } from "./locales";
import type { FieldSchema } from "./section-validation";

const fields: Record<string, FieldSchema> = {
  heading: { type: "text", label: "Heading", defaultValue: "Default" },
  items: { type: "list", label: "Items", itemLabel: "Item", fields: { title: { type: "text", label: "Title" } } },
};

describe("localized section data", () => {
  it("migrates legacy content into both locales without losing fields", () => {
    const result = normalizeLocalizedSectionData(fields, { heading: "Legacy", items: [{ title: "One" }] });
    expect(result.en).toEqual(result.fa);
    expect(result.fa.heading).toBe("Legacy");
  });

  it("requires independently valid English and Persian payloads", () => {
    expect(validateLocalizedSectionData(fields, { en: { heading: "English", items: [] }, fa: { heading: "فارسی", items: [] } })).toEqual([]);
    expect(validateLocalizedSectionData(fields, { heading: "Legacy" })[0]).toMatch(/both English and Persian/);
  });
});
