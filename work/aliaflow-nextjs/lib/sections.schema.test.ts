import { describe, expect, it } from "vitest";
import { normalizeSectionData, validateSectionData } from "./section-validation";
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

  it("exposes an image field for every CMS-managed visual card collection", () => {
    const thrivable = sectionSchemas["thrivable-business"].fields;
    for (const key of ["futures", "loops", "cultures"]) {
      const collection = thrivable[key];
      expect(collection.type, `${key} should be a list`).toBe("list");
      if (collection.type === "list") expect(collection.fields.image?.type).toBe("image");
    }

    for (const key of ["business-leadership", "technocratic-design"]) {
      const statements = sectionSchemas[key].fields.statements;
      expect(statements.type, `${key}.statements should be a list`).toBe("list");
      if (statements.type !== "list") continue;
      const cards = statements.fields.cards;
      expect(cards?.type, `${key}.statements.cards should be a list`).toBe("list");
      if (cards?.type === "list") expect(cards.fields.image?.type).toBe("image");
    }

    const portfolioPeople = sectionSchemas["portfolio-people"].fields;
    for (const key of ["people", "toolkits"]) {
      const collection = portfolioPeople[key];
      expect(collection.type, `${key} should be a list`).toBe("list");
      if (collection.type === "list") expect(collection.fields.image?.type).toBe("image");
    }

    const testimonialsFooter = sectionSchemas["testimonials-footer"].fields;
    const testimonials = testimonialsFooter.testimonials;
    expect(testimonials.type).toBe("list");
    if (testimonials.type === "list") expect(testimonials.fields.image?.type).toBe("image");

    const partners = testimonialsFooter.partners;
    expect(partners.type).toBe("list");
    if (partners.type === "list") expect(partners.fields.logo?.type).toBe("image");
  });
});

describe("article fields on card lists", () => {
  const cardLists: [string, string[]][] = [
    ["thrivable-business", ["futures", "loops", "cultures"]],
    ["business-leadership", ["statements"]],
    ["technocratic-design", ["statements"]],
  ];

  function cardFields(sectionKey: string, listKey: string) {
    const list = sectionSchemas[sectionKey].fields[listKey];
    if (list.type !== "list") throw new Error(`${listKey} is not a list`);
    if (listKey !== "statements") return list.fields;
    const cards = list.fields.cards;
    if (cards.type !== "list") throw new Error("cards is not a list");
    return cards.fields;
  }

  it("every card list carries the article fields", () => {
    for (const [sectionKey, lists] of cardLists) {
      for (const listKey of lists) {
        const fields = cardFields(sectionKey, listKey);
        for (const name of ["slug", "hero_image", "hero_image_alt", "lead", "cta_heading", "cta_label", "cta_href"]) {
          expect(fields[name], `${sectionKey}.${listKey}.${name}`).toBeDefined();
        }
        expect(fields.sections?.type, `${sectionKey}.${listKey}.sections`).toBe("list");
        expect(fields.key_points?.type, `${sectionKey}.${listKey}.key_points`).toBe("list");
      }
    }
  });

  it("image-card sections gain heading, label and body", () => {
    for (const sectionKey of ["business-leadership", "technocratic-design"]) {
      const fields = cardFields(sectionKey, "statements");
      for (const name of ["heading", "label", "body"]) {
        expect(fields[name], `${sectionKey}.${name}`).toBeDefined();
      }
      expect(fields.title, `${sectionKey}.title still present`).toBeDefined();
    }
  });

  it("a card carrying no article content still validates once normalized", () => {
    const schema = sectionSchemas["business-leadership"];
    const normalized = normalizeSectionData(schema.fields, {
      statements: [{ number: "4", title: "t", body: "b", cards: [{ title: "alt", image: "/a.png" }] }],
    });
    expect(validateSectionData(schema.fields, normalized)).toEqual([]);
  });
});
