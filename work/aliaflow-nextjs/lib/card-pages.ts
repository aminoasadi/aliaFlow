export type CardPageTheme = "light" | "dark";

export type RawCard = Record<string, unknown>;

/**
 * One entry per clickable card section. `list` names a top-level array on the
 * section record; `statement` instead selects a statement by its `number` field
 * and reads that statement's `cards`. Statements are addressed by number rather
 * than array position so that reordering them in the CMS cannot silently
 * retarget every article URL in the section.
 */
export type CardPageSection = {
  segment: string;
  sectionKey: string;
  list?: string;
  statement?: string;
  theme: CardPageTheme;
  number: string;
  label: string;
  anchor: string;
};

export const CARD_PAGE_SECTIONS: CardPageSection[] = [
  { segment: "future-of-x-book", sectionKey: "thrivable-business", list: "futures", theme: "light", number: "1", label: "Future of X Book", anchor: "/#thrivable-title" },
  { segment: "critical-business-loop", sectionKey: "thrivable-business", list: "loops", theme: "light", number: "2", label: "Critical Business Loop", anchor: "/#thrivable-title" },
  { segment: "brand-culture-xp", sectionKey: "thrivable-business", list: "cultures", theme: "light", number: "3", label: "Brand Culture & XP", anchor: "/#thrivable-title" },
  { segment: "business-game", sectionKey: "business-leadership", statement: "4", theme: "dark", number: "4", label: "Business Game", anchor: "/#business-leadership" },
  { segment: "strategic-roles", sectionKey: "business-leadership", statement: "5", theme: "dark", number: "5", label: "Strategic Roles", anchor: "/#business-leadership" },
  { segment: "leadership-model", sectionKey: "business-leadership", statement: "6", theme: "dark", number: "6", label: "Leadership Model", anchor: "/#business-leadership" },
  { segment: "risk-setting", sectionKey: "technocratic-design", statement: "7", theme: "light", number: "7", label: "Risk Setting", anchor: "/#technocratic-design-heading" },
  { segment: "change-solving", sectionKey: "technocratic-design", statement: "8", theme: "light", number: "8", label: "Change Solving", anchor: "/#technocratic-design-heading" },
  { segment: "performance-testing", sectionKey: "technocratic-design", statement: "9", theme: "light", number: "9", label: "Performance Testing", anchor: "/#technocratic-design-heading" },
];

export function findSection(segment: string): CardPageSection | undefined {
  return CARD_PAGE_SECTIONS.find((section) => section.segment === segment);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(card: RawCard, key: string): string {
  const value = card[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The three structured sections carry a real display title in `title`. The six
 * image-card sections use `title` for alt text — the landing page passes it to
 * the `alt` attribute — so they carry their display title in `heading` instead.
 */
export function displayTitle(card: RawCard): string {
  return str(card, "heading") || str(card, "title");
}

export function cardSlug(card: RawCard): string {
  return str(card, "slug") || slugify(displayTitle(card));
}

/**
 * A card image in the six image-card sections is a complete pre-designed card
 * with its text baked into the pixels. At hero width that text would reappear
 * at the wrong scale beside the real HTML title, so the parent section's
 * photograph is preferred over it.
 */
export function heroImage(card: RawCard, sectionData: Record<string, unknown>): string {
  const own = str(card, "hero_image");
  if (own) return own;
  const question = sectionData.question_image;
  if (typeof question === "string" && question.trim()) return question.trim();
  return str(card, "image");
}

export function extractCards(section: CardPageSection, sectionData: Record<string, unknown>): RawCard[] {
  if (section.list) {
    const value = sectionData[section.list];
    return Array.isArray(value) ? (value as RawCard[]) : [];
  }
  const statements = sectionData.statements;
  if (!Array.isArray(statements)) return [];
  const match = (statements as RawCard[]).find((item) => str(item, "number") === section.statement);
  const cards = match?.cards;
  return Array.isArray(cards) ? (cards as RawCard[]) : [];
}

export function duplicateSlugs(cards: RawCard[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const card of cards) {
    const slug = cardSlug(card);
    if (seen.has(slug)) duplicates.add(slug);
    seen.add(slug);
  }
  return [...duplicates];
}
