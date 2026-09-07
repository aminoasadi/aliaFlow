import Image from "next/image";
import { Fragment } from "react";

type Item = { title: string; image?: string; text?: string };

const lorem = "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit";

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

export function QuestionHero({ title, question, image = "/assets/metro-boardroom.png" }: { title: string; question: string; image?: string }) {
  return <section className="question-hero"><Image src={image} alt="" fill sizes="100vw" /><div><h2>{title}</h2><h3>{question}</h3></div></section>;
}

export function ServiceStatement({ number, title, body, dark = false }: { number: string; title: string; body: string; dark?: boolean }) {
  return <section className={`service-statement ${dark ? "statement-dark" : ""}`}><div><h2>{number} {title}</h2><p>{body}</p></div><div className="statement-mark" aria-hidden="true"><span>{number}</span></div></section>;
}

export function ThreeCards({ items, dark = false }: { items: Item[]; dark?: boolean }) {
  return <section className={`three-cards ${dark ? "three-cards-dark" : ""}`}>
    {items.map((item, index) => <article key={item.title}>
      <div className="card-image">{item.image ? <Image src={item.image} alt="" fill sizes="33vw" /> : <span className="abstract-node">{index + 1}</span>}</div>
      <div className="card-copy"><small>Industry Name</small><h3>{item.title}</h3><p>{item.text ?? lorem}</p></div>
    </article>)}
  </section>;
}

export function EventPromo({ title, image, dark = false }: { title: string; image: string; dark?: boolean }) {
  return <section className={`event-promo ${dark ? "event-promo-dark" : ""}`}><div className="event-copy"><h2>{title}</h2><p>More workshops to come</p><p>{lorem}</p><button>Book Event</button></div><div className="event-image"><Image src={image} alt="" fill sizes="60vw" /></div></section>;
}

type StatementWithCards = { number: string; title: string; body: string; cards: { title: string; image?: string }[] };

export function BusinessLeadership({
  question,
  statements,
  holocratic_line,
  event_title,
  event_image,
}: {
  question: string;
  statements: StatementWithCards[];
  holocratic_line: string;
  event_title: string;
  event_image: string;
}) {
  return <>
    <DepartmentHeading title="BUSINESS LEADERSHIP" />
    <QuestionHero title="BUSINESS LEADERSHIP" question={question} />
    {statements.map((statement) => (
      <Fragment key={statement.number}>
        <ServiceStatement dark number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards dark items={statement.cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>
    ))}
    <section className="holocratic"><p>{holocratic_line}</p></section>
    <EventPromo dark title={event_title} image={event_image} />
  </>;
}

export function TechnocraticDesign({
  question,
  pillars,
  statements,
  event_title,
  event_image,
}: {
  question: string;
  pillars: { label: string }[];
  statements: StatementWithCards[];
  event_title: string;
  event_image: string;
}) {
  return <>
    <DepartmentHeading title="TECHNOCRATIC DESIGN" />
    <QuestionHero title="TECHNOCRATIC DESIGN" question={question} />
    <section className="design-pillars">{pillars.map((pillar) => <span key={pillar.label}><i className="mini-icon" /><b>{pillar.label}</b></span>)}</section>
    {statements.map((statement) => (
      <Fragment key={statement.number}>
        <ServiceStatement number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards items={statement.cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>
    ))}
    <EventPromo title={event_title} image={event_image} />
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
  points,
}: {
  eyebrow: string;
  heading: string;
  points: { label: string; body: string }[];
}) {
  return <section className="why-us">
    <p>{eyebrow}</p>
    <h2><Lines text={heading} /></h2>
    <div className="business-ring">BUSINESS<br />THRIVABILITY</div>
    <div className="why-list">
      {points.map((point, i) => <article key={point.label}><b>0{i + 1}</b><div><h3>{point.label}</h3><p>{point.body}</p></div></article>)}
    </div>
  </section>;
}

export function PortfolioAndPeople({
  timeline,
  people,
  toolkits,
}: {
  timeline: { year: string; label: string }[];
  people: { name: string; role: string; image: string }[];
  toolkits: { title: string; body: string }[];
}) {
  return <section className="portfolio">
    <h2>PORTFOLIO</h2>
    <div className="portfolio-years">
      {timeline.map((entry, i) => (
        i === 1
          ? <strong key={`${entry.year}-${i}`}>{entry.year}<br /><i>{entry.label}</i></strong>
          : <span key={`${entry.year}-${i}`}>{entry.year}<br /><i>{entry.label}</i></span>
      ))}
    </div>
    <h2>PEOPLE</h2>
    <div className="people-grid">
      {people.map((person) => <article key={person.name}><h3>{person.name}</h3><p>{person.role}</p><Image src={person.image} alt="" width={220} height={290} /></article>)}
    </div>
    <h2>DESIGN TOOLKITS</h2>
    <div className="toolkits">
      {toolkits.map((toolkit) => <article key={toolkit.title}><h3>{toolkit.title}</h3><p>{toolkit.body}</p></article>)}
    </div>
  </section>;
}

export function TestimonialsAndFooter({
  trust_heading,
  trust_subheading,
  partners,
  testimonials,
  closing_heading,
  closing_body,
}: {
  trust_heading: string;
  trust_subheading: string;
  partners: { name: string }[];
  testimonials: { name: string; role: string; title: string; body: string }[];
  closing_heading: string;
  closing_body: string;
}) {
  return <>
    <section className="trust-banner"><h2>{trust_heading}</h2><p>{trust_subheading}</p></section>
    <section className="partners">
      <h2>PARTNERS</h2>
      <div>{partners.map((partner, i) => <span key={`${partner.name}-${i}`}><i />{partner.name}</span>)}</div>
      <h2>TESTIMONIAL</h2>
      <div className="testimonials">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name}><b>{testimonial.name}</b><small>{testimonial.role}</small><h3>{testimonial.title}</h3><p>{testimonial.body}</p></article>
        ))}
      </div>
    </section>
    <section className="what-if"><h2><Lines text={closing_heading} /></h2><p><Lines text={closing_body} /></p></section>
  </>;
}
