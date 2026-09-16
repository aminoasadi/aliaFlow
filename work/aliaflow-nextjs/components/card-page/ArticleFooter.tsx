import Image from "next/image";
import Link from "next/link";
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
 * A "composed" card image is a finished card design with its text baked in.
 * Cropping it to fill the frame would cut that text, so it is shown whole.
 */
function imageClass(cardArt: CardPageSection["cardArt"]) {
  return cardArt === "composed"
    ? "card-article-related-image card-article-related-image--contain"
    : "card-article-related-image";
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
          <div className="card-article-related-grid">
            {related.map((card) => (
              <Link key={card.href} href={card.href} className="card-article-related-card">
                <div className={imageClass(section.cardArt)}>
                  {card.image ? <Image src={card.image} alt={card.image_alt} fill sizes="33vw" /> : null}
                </div>
                <div className="card-article-related-copy">
                  {card.label ? <small>{card.label}</small> : null}
                  <h3>{card.title}</h3>
                  {card.body ? <p>{card.body}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
