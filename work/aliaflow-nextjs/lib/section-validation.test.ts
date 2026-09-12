import { describe, expect, it } from "vitest";
import { normalizeSectionData, validateSectionData, type FieldSchema } from "./section-validation";

describe("validateSectionData", () => {
  const fields: Record<string, FieldSchema> = {
    title: { type: "text", label: "Title" },
    body: { type: "textarea", label: "Body" },
    image: { type: "image", label: "Image" },
    items: {
      type: "list",
      label: "Items",
      itemLabel: "Item",
      fields: {
        label: { type: "text", label: "Label" },
      },
    },
  };

  it("accepts a fully valid payload", () => {
    const issues = validateSectionData(fields, {
      title: "Hello",
      body: "World",
      image: "/uploads/a.png",
      items: [{ label: "one" }, { label: "two" }],
    });
    expect(issues).toEqual([]);
  });

  it("rejects a non-object payload", () => {
    expect(validateSectionData(fields, null)).toEqual(["root: expected an object"]);
    expect(validateSectionData(fields, [])).toEqual(["root: expected an object"]);
  });

  it("reports a missing/non-string scalar field", () => {
    const issues = validateSectionData(fields, {
      title: 123,
      body: "World",
      image: "/uploads/a.png",
      items: [],
    });
    expect(issues).toEqual(["root.title: expected a string"]);
  });

  it("reports a non-array list field", () => {
    const issues = validateSectionData(fields, {
      title: "Hello",
      body: "World",
      image: "/uploads/a.png",
      items: "not a list",
    });
    expect(issues).toEqual(["root.items: expected an array"]);
  });

  it("reports issues inside list items with their index", () => {
    const issues = validateSectionData(fields, {
      title: "Hello",
      body: "World",
      image: "/uploads/a.png",
      items: [{ label: "ok" }, { label: 5 }],
    });
    expect(issues).toEqual(["root.items[1].label: expected a string"]);
  });

  it("fills newly introduced fields in older nested records without dropping legacy data", () => {
    const normalized = normalizeSectionData(fields, {
      title: "Legacy title",
      body: "Legacy body",
      legacy: "keep me",
      items: [{ legacyItem: true }],
    });

    expect(normalized).toEqual({
      title: "Legacy title",
      body: "Legacy body",
      image: "",
      legacy: "keep me",
      items: [{ label: "", legacyItem: true }],
    });
    expect(validateSectionData(fields, normalized)).toEqual([]);
  });

  it("uses schema defaults for fields introduced after a section was published", () => {
    const normalized = normalizeSectionData({
      label: { type: "text", label: "Label", defaultValue: "Existing label" },
    }, {});

    expect(normalized).toEqual({ label: "Existing label" });
  });
});
