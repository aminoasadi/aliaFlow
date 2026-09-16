import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, type FooterData } from "../../../../components/Footer";
import { ArticleBody } from "../../../../components/card-page/ArticleBody";
import { ArticleFooter, type RelatedCard } from "../../../../components/card-page/ArticleFooter";
import { ArticleHeader } from "../../../../components/card-page/ArticleHeader";
import {
  cardSlug,
  displayTitle,
  extractCards,
  findSection,
  heroImage,
  type RawCard,
} from "../../../../lib/card-pages";
import { getSection } from "../../../../lib/sections";

/*
 * Rendered on demand, like the landing page. There is deliberately no
 * generateStaticParams here: it would override force-dynamic and freeze all 27
 * articles at build time, so a CMS publish would not appear until the next
 * deploy. Section content is the thing most likely to change after launch.
 */
export const dynamic = "force-dynamic";

type Params = { section: string; slug: string };

function str(card: RawCard, key: string): string {
  const value = card[key];
  return typeof value === "string" ? value.trim() : "";
}

function rows(card: RawCard, key: string): Record<string, unknown>[] {
  const value = card[key];
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

/**
 * Resolves a route to its card, or null when either half is unknown. A missing
 * section record returns null rather than throwing, so a public URL never
 * surfaces a stack trace the way the landing page deliberately does.
 */
async function resolve({ section: segment, slug }: Params) {
  const section = findSection(segment);
  if (!section) return null;
  const data = await getSection(section.sectionKey);
  if (!data) return null;
  const cards = extractCards(section, data);
  const card = cards.find((item) => cardSlug(item) === slug);
  if (!card) return null;
  return { section, data, cards, card };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await resolve(await params);
  if (!resolved) return { title: "Not found" };
  const title = displayTitle(resolved.card);
  return {
    title: `${title} — ${resolved.section.label} | Aliaflow`,
    description: str(resolved.card, "lead") || str(resolved.card, "body"),
  };
}

export default async function CardArticlePage({ params }: { params: Promise<Params> }) {
  const resolved = await resolve(await params);
  if (!resolved) notFound();
  const { section, data, cards, card } = resolved;

  const title = displayTitle(card);
  const slug = cardSlug(card);
  const lead = str(card, "lead") || str(card, "body");

  const related: RelatedCard[] = cards
    .filter((item) => cardSlug(item) !== slug)
    .map((item) => ({
      image: str(item, "image"),
      title: displayTitle(item),
      href: `/services/${section.segment}/${cardSlug(item)}`,
    }));

  const footer = (await getSection("footer")) as FooterData | null;

  return (
    <main className={`card-article card-article--${section.theme}`}>
      <ArticleHeader
        section={section}
        label={str(card, "label")}
        title={title}
        heroImage={heroImage(card, data)}
        heroAlt={str(card, "hero_image_alt") || str(card, "image_alt") || title}
      />
      <ArticleBody
        lead={lead}
        sections={rows(card, "sections").map((entry) => ({
          heading: str(entry, "heading"),
          body: str(entry, "body"),
        }))}
        keyPoints={rows(card, "key_points").map((entry) => ({
          title: str(entry, "title"),
          body: str(entry, "body"),
        }))}
      />
      <ArticleFooter
        section={section}
        ctaHeading={str(card, "cta_heading")}
        ctaLabel={str(card, "cta_label")}
        ctaHref={str(card, "cta_href")}
        related={related}
      />
      {footer ? <Footer {...footer} /> : null}
    </main>
  );
}
