import Image from "next/image";
import Link from "next/link";
import { CardRail } from "../CardRail";
import type { CardPageSection } from "../../lib/card-pages";

export type RelatedCard = {
  image: string;
  label: string;
  title: string;
  body: string;
  image_alt: string;
  href: string;
};

/**
 * A "composed" card image is a finished card design with its title and body
 * baked into the pixels, which is why the landing page shows those cards with
 * no HTML copy at all. The rail follows suit: it shows the artwork whole, with
 * no copy block, so the card's own text is not repeated beneath it. Only
 * "photo" cards, whose images are plain photographs, get a copy block.
 */
function RelatedArtwork({ card }: { card: RelatedCard }) {
  return (
    <div className="card-article-related-image card-article-related-image--contain">
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
              <Link
                key={card.href}
                href={card.href}
                className="card-article-related-card"
                aria-label={section.cardArt === "composed" ? card.title : undefined}
              >
                {section.cardArt === "composed" ? (
                  <RelatedArtwork card={card} />
                ) : (
                  <>
                    <div className="card-article-related-image">
                      {card.image ? <Image src={card.image} alt={card.image_alt} fill sizes="33vw" /> : null}
                    </div>
                    <div className="card-article-related-copy">
                      {card.label ? <small>{card.label}</small> : null}
                      <h3>{card.title}</h3>
                      {card.body ? <p>{card.body}</p> : null}
                    </div>
                  </>
                )}
              </Link>
            ))}
          </CardRail>
        </section>
      ) : null}
    </>
  );
}
