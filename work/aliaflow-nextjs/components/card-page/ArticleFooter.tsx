import { ImageCarousel, type FutureImage } from "../FutureImageCarousel";
import type { CardPageSection } from "../../lib/card-pages";

export type RelatedCard = {
  image: string;
  title: string;
  href: string;
};

export function ArticleFooter({
  section,
  ctaHeading,
  ctaLabel,
  ctaHref,
  related,
}: {
  section: CardPageSection;
  ctaHeading: string;
  ctaLabel: string;
  ctaHref: string;
  related: RelatedCard[];
}) {
  // Reuses the exact same carousel the landing page uses for this section's
  // cards (ThreeCards / ImageCarousel), so "More in <section>" shows the
  // cards at their real, fixed frame size — 475x760 on desktop, full-bleed
  // at the same ratio on mobile — instead of a smaller frame invented just
  // for this rail.
  const slides: FutureImage[] = related.map((card) => ({
    src: card.image || undefined,
    alt: card.title,
    href: card.href,
  }));

  return (
    <>
      {ctaHeading || ctaLabel ? (
        <section className="card-article-cta">
          {ctaHeading ? <h2>{ctaHeading}</h2> : null}
          {ctaLabel ? <a className="card-article-cta-button" href={ctaHref || "#contact-us"}>{ctaLabel}</a> : null}
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className="card-article-related" aria-labelledby="card-article-related-heading">
          <h2 id="card-article-related-heading">More in {section.label}</h2>
          <ImageCarousel items={slides} dark={section.theme === "dark"} label={`More in ${section.label}`} />
        </section>
      ) : null}
    </>
  );
}
