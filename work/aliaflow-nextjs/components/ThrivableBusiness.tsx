import Image from "next/image";
import { Fragment, type ReactNode } from "react";

function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => <Fragment key={line}>{i > 0 ? <br /> : null}{line}</Fragment>)}</>;
}

function LoopMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#8b8b8b" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <path d="M13 20v-5a2 2 0 0 1 2-2h5" /><path d="M35 20v-5a2 2 0 0 0-2-2h-5" />
      <path d="M13 28v5a2 2 0 0 0 2 2h5" /><path d="M35 28v5a2 2 0 0 1-2 2h-5" />
      <path d="M24 17v14M18 24h12" />
    </svg>
  );
}

function CultureMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#8b8b8b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M24 11l11 4v9c0 7-4.6 11.4-11 13-6.4-1.6-11-6-11-13v-9z" />
      <circle cx="24" cy="23" r="3.4" />
      <path d="M18.5 32c1.3-2.6 3.3-3.9 5.5-3.9s4.2 1.3 5.5 3.9" />
    </svg>
  );
}

function ServiceBlock({
  number,
  title,
  body,
  image,
  imageAlt,
  mark,
}: {
  number: string;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  mark: ReactNode;
}) {
  return (
    <article className="future-book">
      <div className="future-book-copy">
        <h3><b>{number}</b> {title}</h3>
        <p>{body}</p>
      </div>
      <div className="future-book-mark">
        {image ? <Image src={image} alt={imageAlt ?? ""} fill sizes="130px" /> : mark}
      </div>
    </article>
  );
}

export function TileGrid({ items, contain = false }: { items: { image: string; label: string; title: string; body: string; image_alt: string }[]; contain?: boolean }) {
  return (
    <div className="future-grid">
      {items.map((item) => (
        <article key={item.title} className="future-card">
          <div className={`future-map${contain ? " future-map-contain" : ""}`}>
            <Image src={item.image} alt={item.image_alt} fill sizes="33vw" />
          </div>
          <div className="future-card-copy">
            <small>{item.label}</small>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export type ThrivableBusinessData = {
  heading: string;
  question_image: string;
  question: string;
  question_image_alt: string;
  question_section_label: string;
  service_blocks: { number: string; title: string; body: string; image?: string; image_alt?: string }[];
  futures: { image: string; label: string; title: string; body: string; image_alt: string }[];
  loops: { image: string; label: string; title: string; body: string; image_alt: string }[];
  cultures: { image: string; label: string; title: string; body: string; image_alt: string }[];
  magazine_heading: string;
  magazine_price: string;
  magazine_image: string;
  magazine_image_alt: string;
  magazine_cta_label: string;
  magazine_cta_href: string;
  jam_heading: string;
  jam_date: string;
  jam_body: string;
  jam_image: string;
  jam_image_alt: string;
  jam_cta_label: string;
  jam_cta_href: string;
};

export function ThrivableBusiness({
  heading,
  question_image,
  question_image_alt,
  question_section_label,
  question,
  service_blocks,
  futures,
  loops,
  cultures,
  magazine_heading,
  magazine_price,
  magazine_image,
  jam_heading,
  jam_date,
  jam_body,
  jam_image,
  magazine_image_alt,
  magazine_cta_label,
  magazine_cta_href,
  jam_image_alt,
  jam_cta_label,
  jam_cta_href,
}: ThrivableBusinessData) {
  const marks = [<Image key="cyborg" src="/assets/cyborg.png" alt="" fill sizes="130px" />, <LoopMark key="loop" />, <CultureMark key="culture" />];

  return (
    <section className="thrivable-business" aria-labelledby="thrivable-title">
      <header className="thrivable-heading">
        <span aria-hidden="true" />
        <h2 id="thrivable-title">{heading}</h2>
      </header>

      <section className="thrivable-question" aria-label={question_section_label}>
        <Image src={question_image} alt={question_image_alt} fill sizes="100vw" priority />
        <h3><Lines text={question} /></h3>
      </section>

      {service_blocks[0] ? <section className="future-book-experience" aria-label="Future of X Book">
        <ServiceBlock {...service_blocks[0]} imageAlt={service_blocks[0].image_alt} mark={marks[0]} />
        <TileGrid items={futures} contain />
      </section> : null}

      <section className="critical-business-loop-experience" aria-label="Critical Business Loop">
        {service_blocks[1] ? <ServiceBlock {...service_blocks[1]} imageAlt={service_blocks[1].image_alt} mark={marks[1]} /> : null}
        <TileGrid items={loops} contain />
      </section>

      <section className="brand-culture-experience" aria-label="Brand Culture and XP">
        {service_blocks[2] ? <ServiceBlock {...service_blocks[2]} imageAlt={service_blocks[2].image_alt} mark={marks[2]} /> : null}
        <TileGrid items={cultures} />
      </section>

      <section className="magazine-promo">
        <div className="magazine-copy">
          <h2><Lines text={magazine_heading} /></h2>
          <p className="magazine-price">{magazine_price}</p>
          <a className="magazine-buy-button" href={magazine_cta_href}>{magazine_cta_label}</a>
        </div>
        <div className="magazine-art"><Image src={magazine_image} alt={magazine_image_alt} fill sizes="60vw" /></div>
      </section>

      <section className="jam-promo">
        <div className="jam-copy">
          <h2><Lines text={jam_heading} /></h2>
          <p className="jam-date">{jam_date}</p>
          <p>{jam_body}</p>
          <a className="magazine-buy-button" href={jam_cta_href}>{jam_cta_label}</a>
        </div>
        <div className="jam-art"><Image src={jam_image} alt={jam_image_alt} fill sizes="60vw" /></div>
      </section>
    </section>
  );
}
