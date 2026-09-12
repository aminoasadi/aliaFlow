import Image from "next/image";
import { Fragment } from "react";
import { ImageCarousel, type FutureImage } from "./FutureImageCarousel";

type Item = { title: string; image?: string; text?: string };

export function DepartmentHeading({ title }: { title: string }) {
  return <section className="department-heading"><h2>{title}</h2></section>;
}

export function ServiceCatalogueNav({ heading, tabs }: { heading: string; tabs: { number: string; label: string }[] }) {
  return <section className="catalogue-nav">
    <h2>{heading}</h2>
    <ul>
      {tabs.map((tab) => <li key={tab.number}><span>{tab.number}</span>{tab.label}</li>)}
    </ul>
  </section>;
}

export function QuestionHero({ title, question, image, imageAlt }: { title: string; question: string; image: string; imageAlt: string }) {
  return <section className="question-hero"><Image src={image} alt={imageAlt} fill sizes="100vw" /><div><h2>{title}</h2><h3>{question}</h3></div></section>;
}

export function ServiceStatement({ number, title, body, dark = false }: { number: string; title: string; body: string; dark?: boolean }) {
  return <section className={`service-statement ${dark ? "statement-dark" : ""}`}><div><h2>{number} {title}</h2><p>{body}</p></div><div className="statement-mark" aria-hidden="true"><span>{number}</span></div></section>;
}

export function ThreeCards({ items, dark = false }: { items: Item[]; dark?: boolean }) {
  const slides: FutureImage[] = items.map((item) => ({
    src: item.image?.trim() || undefined,
    alt: item.title,
  }));
  return <ImageCarousel items={slides} dark={dark} label="Service examples" />;
}

export function EventPromo({ title, image, imageAlt, kicker, body, ctaLabel, ctaHref, dark = false }: { title: string; image: string; imageAlt: string; kicker: string; body: string; ctaLabel: string; ctaHref: string; dark?: boolean }) {
  return <section className={`event-promo ${dark ? "event-promo-dark" : ""}`}><div className="event-copy"><h2>{title}</h2><p>{kicker}</p><p>{body}</p><a className="event-cta" href={ctaHref}>{ctaLabel}</a></div><div className="event-image"><Image src={image} alt={imageAlt} fill sizes="60vw" /></div></section>;
}

type StatementWithCards = { number: string; title: string; body: string; cards: { title: string; image?: string }[] };

export function BusinessLeadership({
  department_heading,
  question_image,
  question_image_alt,
  question,
  statements,
  holocratic_line,
  event_title,
  event_image,
  event_image_alt,
  event_kicker,
  event_body,
  event_cta_label,
  event_cta_href,
}: {
  department_heading: string;
  question_image: string;
  question_image_alt: string;
  question: string;
  statements: StatementWithCards[];
  holocratic_line: string;
  event_title: string;
  event_image: string;
  event_image_alt: string;
  event_kicker: string;
  event_body: string;
  event_cta_label: string;
  event_cta_href: string;
}) {
  return <>
    <DepartmentHeading title={department_heading} />
    <QuestionHero title={department_heading} question={question} image={question_image} imageAlt={question_image_alt} />
    {statements.map((statement) => (
      <Fragment key={statement.number}>
        <ServiceStatement dark number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards dark items={statement.cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>
    ))}
    <section className="holocratic"><p>{holocratic_line}</p></section>
    <EventPromo dark title={event_title} image={event_image} imageAlt={event_image_alt} kicker={event_kicker} body={event_body} ctaLabel={event_cta_label} ctaHref={event_cta_href} />
  </>;
}

export function TechnocraticDesign({
  department_heading,
  question_image,
  question_image_alt,
  question,
  pillars,
  statements,
  event_title,
  event_image,
  event_image_alt,
  event_kicker,
  event_body,
  event_cta_label,
  event_cta_href,
}: {
  department_heading: string;
  question_image: string;
  question_image_alt: string;
  question: string;
  pillars: { label: string }[];
  statements: StatementWithCards[];
  event_title: string;
  event_image: string;
  event_image_alt: string;
  event_kicker: string;
  event_body: string;
  event_cta_label: string;
  event_cta_href: string;
}) {
  return <>
    <DepartmentHeading title={department_heading} />
    <QuestionHero title={department_heading} question={question} image={question_image} imageAlt={question_image_alt} />
    <section className="design-pillars">{pillars.map((pillar) => <span key={pillar.label}><i className="mini-icon" /><b>{pillar.label}</b></span>)}</section>
    {statements.map((statement) => (
      <Fragment key={statement.number}>
        <ServiceStatement number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards items={statement.cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>
    ))}
    <EventPromo title={event_title} image={event_image} imageAlt={event_image_alt} kicker={event_kicker} body={event_body} ctaLabel={event_cta_label} ctaHref={event_cta_href} />
  </>;
}

function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => <Fragment key={line}>{i > 0 ? <br /> : null}{line}</Fragment>)}</>;
}

export function ExecutionManagement({
  heading,
  orbit_labels,
  emphasized_label,
  body,
}: {
  heading: string;
  orbit_labels: { label: string }[];
  emphasized_label: string;
  body: string;
}) {
  return <section className="execution-management">
    <h2>{heading}</h2>
    <div className="execution-orbits">
      {orbit_labels.slice(0, 2).map((item) => <span key={item.label}><Lines text={item.label} /></span>)}
      <strong><Lines text={emphasized_label} /></strong>
      {orbit_labels.slice(2).map((item) => <span key={item.label}><Lines text={item.label} /></span>)}
    </div>
    <p>{body}</p>
  </section>;
}

export function WhyChooseUs({
  eyebrow,
  heading,
  ring_center_label,
  points,
}: {
  eyebrow: string;
  heading: string;
  ring_center_label: string;
  points: { label: string; body: string; image: string; image_alt: string }[];
}) {
  return <section className="why-us">
    <p>{eyebrow}</p>
    <h2><Lines text={heading} /></h2>
    <div className="business-ring">{points.slice(0, 3).map((point, index) => <span key={point.label} className={`ring-word ring-word-${index + 1}`}>{point.label}</span>)}<strong><Lines text={ring_center_label} /></strong></div>
    <div className="why-list">
      {points.map((point) => <article key={point.label}><img src={point.image} alt={point.image_alt} /><div><h3>{point.label}</h3><p>{point.body}</p></div></article>)}
    </div>
  </section>;
}

export function PortfolioAndPeople({
  portfolio_heading,
  people_heading,
  toolkits_heading,
  timeline,
  people,
  toolkits,
}: {
  portfolio_heading: string;
  people_heading: string;
  toolkits_heading: string;
  timeline: { year: string; label: string }[];
  people: { name: string; role: string; image: string; image_alt: string }[];
  toolkits: { title: string; body: string }[];
}) {
  return <section className="portfolio">
    <h2>{portfolio_heading}</h2>
    <div className="portfolio-years">
      {timeline.map((entry, i) => (
        i === 1
          ? <strong key={`${entry.year}-${i}`}>{entry.year}<br /><i>{entry.label}</i></strong>
          : <span key={`${entry.year}-${i}`}>{entry.year}<br /><i>{entry.label}</i></span>
      ))}
    </div>
    <h2>{people_heading}</h2>
    <div className="people-grid">
      {people.map((person) => <article key={person.name}><h3>{person.name}</h3><p>{person.role}</p><Image src={person.image} alt={person.image_alt} width={220} height={290} /></article>)}
    </div>
    <h2>{toolkits_heading}</h2>
    <div className="toolkits">
      {toolkits.map((toolkit) => <article key={toolkit.title}><h3>{toolkit.title}</h3><p>{toolkit.body}</p></article>)}
    </div>
  </section>;
}

export function TestimonialsAndFooter({
  trust_heading,
  trust_subheading,
  partners_heading,
  testimonials_heading,
  partners,
  testimonials,
  closing_heading,
  closing_body,
}: {
  trust_heading: string;
  trust_subheading: string;
  partners_heading: string;
  testimonials_heading: string;
  partners: { name: string }[];
  testimonials: { name: string; role: string; title: string; body: string }[];
  closing_heading: string;
  closing_body: string;
}) {
  return <>
    <section className="trust-banner"><h2>{trust_heading}</h2><p>{trust_subheading}</p></section>
    <section className="partners">
      <h2>{partners_heading}</h2>
      <div>{partners.map((partner, i) => <span key={`${partner.name}-${i}`}><i />{partner.name}</span>)}</div>
      <h2>{testimonials_heading}</h2>
      <div className="testimonials">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name}><b>{testimonial.name}</b><small>{testimonial.role}</small><h3>{testimonial.title}</h3><p>{testimonial.body}</p></article>
        ))}
      </div>
    </section>
    <section className="what-if"><h2><Lines text={closing_heading} /></h2><p><Lines text={closing_body} /></p></section>
  </>;
}
