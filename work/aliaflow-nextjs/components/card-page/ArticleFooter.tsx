import Image from "next/image";
import Link from "next/link";
import { CardRail } from "../CardRail";
import type { CardPageSection } from "../../lib/card-pages";

export type RelatedCard = {
  image: string;
  title: string;
  href: string;
};

/**
 * Every card on the site is now a single uploaded artwork with its title and
 * body baked into the pixels, which is why the landing page shows these cards
 * with no HTML copy at all. The related rail follows suit: it shows the
 * artwork whole (contained, not cropped, since it is a finished design and a
 * crop would cut through its own text), with no copy block underneath.
 */
function RelatedArtwork({ card }: { card: RelatedCard }) {
  return (
    <div className="card-article-related-image">
      {card.image ? <Image src={card.image} alt="" fill sizes="33vw" /> : null}
    </div>
  );
}

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
          <CardRail className="card-article-related-grid">
            {related.map((card) => (
              <Link key={card.href} href={card.href} className="card-article-related-card" aria-label={card.title}>
                <RelatedArtwork card={card} />
              </Link>
            ))}
          </CardRail>
        </section>
      ) : null}
    </>
  );
}
