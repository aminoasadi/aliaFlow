import Image from "next/image";
import { Fragment, type ReactNode } from "react";

function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => <Fragment key={line}>{i > 0 ? <br /> : null}{line}</Fragment>)}</>;
}

function LoopMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#8b8b8b" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <path d="M13 20v-5a2 2 0 0 1 2-2h5" />
      <path d="M35 20v-5a2 2 0 0 0-2-2h-5" />
      <path d="M13 28v5a2 2 0 0 0 2 2h5" />
      <path d="M35 28v5a2 2 0 0 1-2 2h-5" />
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

function ServiceBlock({ number, title, body, mark }: { number: string; title: string; body: string; mark: ReactNode }) {
  return (
    <article className="future-book">
      <div className="future-book-copy">
        <h3><b>{number}</b> {title}</h3>
        <p>{body}</p>
      </div>
      <div className="future-book-mark">{mark}</div>
    </article>
  );
}

function TileGrid({ items, contain = false }: { items: { image: string; label: string; title: string }[]; contain?: boolean }) {
  const lorem =
    "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.";
  return (
    <div className="future-grid">
      {items.map((item) => (
        <article key={item.title} className="future-card">
          <div className={`future-map${contain ? " future-map-contain" : ""}`}>
            <Image src={item.image} alt="" fill sizes="33vw" />
          </div>
          <div className="future-card-copy">
            <small>{item.label}</small>
            <h3>{item.title}</h3>
            <p>{lorem}</p>
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
  service_blocks: { number: string; title: string; body: string }[];
  futures: { title: string; heading: string; tags: string }[];
  loops: { image: string; label: string; title: string }[];
  cultures: { image: string; label: string; title: string }[];
  magazine_heading: string;
  magazine_price: string;
  magazine_image: string;
  jam_heading: string;
  jam_date: string;
  jam_body: string;
  jam_image: string;
};

export function ThrivableBusiness({
  heading,
  question_image,
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
}: ThrivableBusinessData) {
  const marks = [<Image key="cyborg" src="/assets/cyborg.png" alt="" fill sizes="130px" />, <LoopMark key="loop" />, <CultureMark key="culture" />];

  return (
    <section className="thrivable-business" aria-labelledby="thrivable-title">
      <header className="thrivable-heading">
        <span aria-hidden="true" />
        <h2 id="thrivable-title">{heading}</h2>
      </header>

      <section className="thrivable-question" aria-label="Where to play, how to win">
        <Image src={question_image} alt="A leader standing at the intersection of business pathways" fill sizes="100vw" priority />
        <h3><Lines text={question} /></h3>
      </section>

      {service_blocks[0] ? <ServiceBlock number={service_blocks[0].number} title={service_blocks[0].title} body={service_blocks[0].body} mark={marks[0]} /> : null}

      <div className="future-grid">
        {futures.map((future) => (
          <article key={future.title} className="future-card">
            <div className="future-map" aria-hidden="true"><Image src="/assets/pastel-metro-network.png" alt="" fill sizes="33vw" /></div>
            <div className="future-card-title">{future.title.replace(" ", "\n")}</div>
            <div className="future-card-copy">
              <small>Industry Name</small>
              <h3><Lines text={future.heading} /></h3>
              <p><Lines text={future.tags} /></p>
            </div>
          </article>
        ))}
      </div>

      {service_blocks[1] ? <ServiceBlock number={service_blocks[1].number} title={service_blocks[1].title} body={service_blocks[1].body} mark={marks[1]} /> : null}
      <TileGrid items={loops} contain />

      {service_blocks[2] ? <ServiceBlock number={service_blocks[2].number} title={service_blocks[2].title} body={service_blocks[2].body} mark={marks[2]} /> : null}
      <TileGrid items={cultures} />

      <section className="magazine-promo">
        <div className="magazine-copy">
          <h2><Lines text={magazine_heading} /></h2>
          <p className="magazine-price">{magazine_price}</p>
          <button type="button">Buy Magazine</button>
        </div>
        <div className="magazine-art"><Image src={magazine_image} alt="Future of Banking magazine spread" fill sizes="60vw" /></div>
      </section>

      <section className="jam-promo">
        <div className="jam-copy">
          <h2><Lines text={jam_heading} /></h2>
          <p className="jam-date">{jam_date}</p>
          <p>{jam_body}</p>
          <button type="button">Book Now</button>
        </div>
        <div className="jam-art"><Image src={jam_image} alt="Venue for the Banking Thrivability JAM" fill sizes="60vw" /></div>
      </section>
    </section>
  );
}
