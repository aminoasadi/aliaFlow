import { describe, expect, it } from "vitest";
import { validateSectionData } from "./section-validation";
import { sectionSchemas } from "./sections.schema";

const EXPECTED_KEYS = [
  "header",
  "hero",
  "outcomes",
  "service-catalogue-nav",
  "thrivable-business",
  "business-leadership",
  "technocratic-design",
  "execution-management",
  "why-choose-us",
  "portfolio-people",
  "testimonials-footer",
  "footer",
];

describe("sectionSchemas", () => {
  it("declares exactly the 12 expected section keys", () => {
    expect(Object.keys(sectionSchemas).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it("every schema has a non-empty label and at least one field", () => {
    for (const [key, schema] of Object.entries(sectionSchemas)) {
      expect(schema.label, `${key} label`).not.toEqual("");
      expect(Object.keys(schema.fields).length, `${key} fields`).toBeGreaterThan(0);
    }
  });

  it("an empty object always fails validation (every section has required fields)", () => {
    for (const [key, schema] of Object.entries(sectionSchemas)) {
      const issues = validateSectionData(schema.fields, {});
      expect(issues.length, `${key} should reject {}`).toBeGreaterThan(0);
    }
  });
});
