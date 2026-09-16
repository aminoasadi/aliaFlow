import { describe, expect, it } from "vitest";
import {
  CARD_PAGE_SECTIONS,
  cardSlug,
  displayTitle,
  duplicateSlugs,
  extractCards,
  findSection,
  heroImage,
  slugify,
} from "./card-pages";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("Future of Banking")).toBe("future-of-banking");
  });

  it("strips punctuation", () => {
    expect(slugify("Brand Culture & XP!")).toBe("brand-culture-xp");
  });

  it("leaves an already-slugged value unchanged", () => {
    expect(slugify("future-of-banking")).toBe("future-of-banking");
  });

  it("collapses repeated separators and trims them", () => {
    expect(slugify("  Risk --- Setting  ")).toBe("risk-setting");
  });
});

describe("displayTitle", () => {
  it("prefers heading when set", () => {
    expect(displayTitle({ heading: "Business Game", title: "alt text" })).toBe("Business Game");
  });

  it("falls back to title when heading is blank", () => {
    expect(displayTitle({ heading: "", title: "Future of Banking" })).toBe("Future of Banking");
  });
});

describe("cardSlug", () => {
  it("uses an explicit slug", () => {
    expect(cardSlug({ slug: "custom", title: "Future of Banking" })).toBe("custom");
  });

  it("derives from the display title when slug is blank", () => {
    expect(cardSlug({ slug: "", heading: "Business Game 1" })).toBe("business-game-1");
  });
});

describe("CARD_PAGE_SECTIONS", () => {
  it("declares nine sections with unique segments", () => {
    expect(CARD_PAGE_SECTIONS).toHaveLength(9);
    const segments = CARD_PAGE_SECTIONS.map((s) => s.segment);
    expect(new Set(segments).size).toBe(9);
  });

  it("finds a section by segment and returns undefined for an unknown one", () => {
    expect(findSection("risk-setting")?.sectionKey).toBe("technocratic-design");
    expect(findSection("nope")).toBeUndefined();
  });
});

describe("extractCards", () => {
  const thrivable = { futures: [{ title: "Future of Banking" }] };

  it("reads a top-level list", () => {
    const section = findSection("future-of-x-book")!;
    expect(extractCards(section, thrivable)).toHaveLength(1);
  });

  it("finds a statement by number, not by array position", () => {
    const section = findSection("leadership-model")!;
    const reordered = {
      statements: [
        { number: "6", cards: [{ title: "Leadership model 1" }] },
        { number: "4", cards: [{ title: "Business Game 1" }] },
        { number: "5", cards: [{ title: "Strategic Role 1" }] },
      ],
    };
    expect(displayTitle(extractCards(section, reordered)[0])).toBe("Leadership model 1");
  });

  it("returns an empty array when the section data is missing the list", () => {
    expect(extractCards(findSection("future-of-x-book")!, {})).toEqual([]);
  });

  it("returns an empty array when no statement carries the number", () => {
    expect(extractCards(findSection("business-game")!, { statements: [{ number: "99", cards: [{}] }] })).toEqual([]);
  });
});

describe("heroImage", () => {
  const sectionData = { question_image: "/assets/question.png" };

  it("prefers the card's own hero image", () => {
    expect(heroImage({ hero_image: "/a.png", image: "/b.png" }, sectionData)).toBe("/a.png");
  });

  it("falls back to the parent question image before the card image", () => {
    expect(heroImage({ hero_image: "", image: "/b.png" }, sectionData)).toBe("/assets/question.png");
  });

  it("falls back to the card image when there is no question image", () => {
    expect(heroImage({ image: "/b.png" }, {})).toBe("/b.png");
  });

  it("returns an empty string when nothing is available", () => {
    expect(heroImage({}, {})).toBe("");
  });
});

describe("duplicateSlugs", () => {
  it("reports a slug used twice", () => {
    expect(duplicateSlugs([{ title: "A" }, { title: "A" }])).toEqual(["a"]);
  });

  it("reports nothing when all slugs are unique", () => {
    expect(duplicateSlugs([{ title: "A" }, { title: "B" }])).toEqual([]);
  });
});
