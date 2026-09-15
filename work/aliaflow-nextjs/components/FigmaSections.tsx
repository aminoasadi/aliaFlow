import Image from "next/image";
import { Fragment } from "react";
import { BookOpen, Gamepad2, House } from "lucide-react";
import { ImageCarousel, type FutureImage } from "./FutureImageCarousel";
import { PortfolioTimeline } from "./PortfolioTimeline";
import { TestimonialCarousel } from "./TestimonialCarousel";
import { TileGrid } from "./ThrivableBusiness";

type Item = { title: string; image?: string; text?: string };

function BusinessGameMark() {
  return <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M30 19h36l4 29c-4 14-12 22-22 22s-18-8-22-22z" />
    <path d="M30 26H17c0 16 6 24 18 25M66 26h13c0 16-6 24-18 25" />
    <path d="M48 70v10M34 84h28" />
    <path d="m48 31 4 8 9 1-6 6 2 9-9-5-9 5 2-9-6-6 9-1z" />
  </svg>;
}

export function DepartmentHeading({ title }: { title: string }) {
  const isBusinessLeadership = title.trim().toLowerCase() === "business leadership";
  return <section className={`department-heading${isBusinessLeadership ? " department-heading--business-leadership" : ""}`}><h2>{title}</h2></section>;
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
  const normalizedTitle = title.trim().toLowerCase();
  const isBusinessGame = normalizedTitle === "business game";
  const isChangeSolving = normalizedTitle === "change solving";
  const isRiskSetting = normalizedTitle === "risk setting";
  const isPerformanceTesting = normalizedTitle === "performance testing";
  const hasLeadershipDivider = ["business game", "strategic roles", "leadership model"].includes(normalizedTitle);
  return <section className={`service-statement ${dark ? "statement-dark" : ""}${isBusinessGame ? " service-statement--business-game" : ""}${isChangeSolving ? " service-statement--change-solving" : ""}${isRiskSetting ? " service-statement--risk-setting" : ""}${isPerformanceTesting ? " service-statement--performance-testing" : ""}${hasLeadershipDivider ? " service-statement--leadership-divider" : ""}`}><div><h2>{number} {title}</h2><p>{body}</p></div><div className="statement-mark" aria-hidden="true">{isBusinessGame ? <BusinessGameMark /> : isChangeSolving ? <img src="/assets/change-solving-icon.png" alt="" /> : isRiskSetting ? <img src="/assets/risk-setting-icon.svg" alt="" /> : isPerformanceTesting ? <img src="/assets/performance-testing-icon.svg" alt="" /> : <span>{number}</span>}</div></section>;
}

export function ThreeCards({ items, dark = false }: { items: Item[]; dark?: boolean }) {
  const slides: FutureImage[] = items.map((item) => ({
    src: item.image?.trim() || undefined,
    alt: item.title,
  }));
  const isBusinessGame = items.every((item) => item.title.trim().toLowerCase().startsWith("business game"));
  const isChangeSolving = items.every((item) => item.title.trim().toLowerCase().startsWith("change solving"));
  const isRiskSetting = items.every((item) => item.title.trim().toLowerCase().startsWith("risk setting"));
  const isPerformanceTesting = items.every((item) => item.title.trim().toLowerCase().startsWith("performance testing"));
  return <ImageCarousel items={slides} dark={dark} label="Service examples" className={isBusinessGame ? "business-game-carousel" : isChangeSolving ? "change-solving-carousel" : isRiskSetting ? "risk-setting-carousel" : isPerformanceTesting ? "performance-testing-carousel" : undefined} />;
}

export function EventPromo({ title, image, imageAlt, kicker, body, ctaLabel, ctaHref, dark = false }: { title: string; image: string; imageAlt: string; kicker: string; body: string; ctaLabel: string; ctaHref: string; dark?: boolean }) {
  const isFutureLeadershipJam = title.trim().toLowerCase() === "future leadership jam";
  const isTechnocraticLeadershipJam = title.trim().toLowerCase() === "technocratic design for leadership jam";
  return <section className={`event-promo ${dark ? "event-promo-dark" : ""}${isFutureLeadershipJam ? " event-promo--future-leadership" : ""}${isTechnocraticLeadershipJam ? " event-promo--technocratic-leadership" : ""}`}><div className="event-copy"><h2>{title}</h2><p>{kicker}</p><p>{body}</p><a className="event-cta" href={ctaHref}>{ctaLabel}</a></div><div className="event-image"><Image src={image} alt={imageAlt} fill sizes="60vw" /></div></section>;
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
    {statements.map((statement) => {
      const isBusinessGame = statement.title.trim().toLowerCase() === "business game";
      const isStrategicRoles = statement.title.trim().toLowerCase() === "strategic roles";
      const isLeadershipModel = statement.title.trim().toLowerCase() === "leadership model";
      const cards = isBusinessGame || isStrategicRoles || isLeadershipModel ? [...statement.cards, ...statement.cards.slice(0, 2)] : statement.cards;
      return <Fragment key={statement.number}>
        <ServiceStatement dark number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards dark items={cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>;
    })}
    <section className="holocratic"><h2>HOLOCRATIC<br />MANAGEMENT</h2><p>{holocratic_line}</p></section>
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
  const pillarIcons = [BookOpen, House, Gamepad2];

  return <>
    <section className="technocratic-intro" aria-labelledby="technocratic-design-heading">
      <div className="technocratic-intro__cap" aria-hidden="true" />
      <header className="technocratic-intro__heading">
        <h2 id="technocratic-design-heading">{department_heading}</h2>
      </header>
      <div className="technocratic-intro__hero">
        <Image src={question_image} alt={question_image_alt} fill sizes="100vw" priority />
        <h3>{question}</h3>
      </div>
      <div className="technocratic-intro__pillars">
        {pillars.map((pillar, index) => {
          const Icon = pillarIcons[index] ?? BookOpen;
          return <div className="technocratic-intro__pillar" key={pillar.label}>
            <Icon aria-hidden="true" strokeWidth={1.8} />
            <b>{pillar.label}</b>
          </div>;
        })}
      </div>
    </section>
    {statements.map((statement) => {
      const isChangeSolving = statement.title.trim().toLowerCase() === "change solving";
      const isRiskSetting = statement.title.trim().toLowerCase() === "risk setting";
      const isPerformanceTesting = statement.title.trim().toLowerCase() === "performance testing";
      const cards = isChangeSolving || isRiskSetting || isPerformanceTesting ? [...statement.cards, ...statement.cards.slice(0, 2)] : statement.cards;
      return <Fragment key={statement.number}>
        <ServiceStatement number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards items={cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>;
    })}
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
  points,
}: {
  eyebrow: string;
  heading: string;
  ring_center_label: string;
  points: { label: string; title: string; body: string; image: string; image_alt: string }[];
}) {
  return <section className="why-us">
    <span className="why-us-side-tab why-us-side-tab--left" aria-hidden="true" />
    <span className="why-us-side-tab why-us-side-tab--right" aria-hidden="true" />
    <p>{eyebrow}</p>
    <h2><Lines text={heading} /></h2>
    <TileGrid items={points} contain />
  </section>;
}

export function WhyTrustUs({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) {
  const [beforeTrust = heading, afterTrust = ""] = heading.split(/trust/i);

  return <section className="why-trust-us" aria-labelledby="why-trust-us-heading">
    <div className="why-trust-us__top-cutout" aria-hidden="true" />
    <div className="why-trust-us__content">
      <h2 id="why-trust-us-heading">{beforeTrust}<strong>TRUST</strong>{afterTrust}</h2>
      <p>{subheading}</p>
    </div>
    <div className="why-trust-us__bottom-cutout" aria-hidden="true" />
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
  toolkits: { title: string; body: string; image: string; image_alt: string }[];
}) {
  return <>
    <PortfolioTimeline heading={portfolio_heading} timeline={timeline} />
    <section className="portfolio">
    <h2>{people_heading}</h2>
    <div className="people-grid">
      {people.map((person) => <article key={person.name}><h3>{person.name}</h3><p>{person.role}</p><Image src={person.image} alt={person.image_alt} width={220} height={290} /></article>)}
    </div>
    <h2 className="toolkits-heading">{toolkits_heading}</h2>
    <div className="toolkits">
      {toolkits.map((toolkit) => <article key={toolkit.title}>{toolkit.image ? <Image src={toolkit.image} alt={toolkit.image_alt || toolkit.title} fill sizes="(max-width: 780px) 100vw, 25vw" /> : null}</article>)}
    </div>
    </section>
  </>;
}

export function TestimonialsAndFooter({
  partners_heading,
  testimonials_heading,
  partners,
  testimonials,
  closing_heading,
  closing_body,
}: {
  partners_heading: string;
  testimonials_heading: string;
  partners: { name: string; logo?: string; logo_alt?: string }[];
  testimonials: { name: string; role: string; title: string; body: string; image?: string; image_alt?: string }[];
  closing_heading: string;
  closing_body: string;
}) {
  const displayClosingHeading = closing_heading.trim().toUpperCase() === "WHAT IF..." ? "WHAT\nIF..." : closing_heading;

  return <>
    <section className="partners">
      <h2>{partners_heading}</h2>
      <div>{partners.map((partner, i) => {
        const logo = partner.logo?.trim();
        return <span className={logo ? "partner-card--art" : undefined} key={`${partner.name}-${i}`}>{logo ? <Image src={logo} alt={partner.logo_alt || partner.name} fill sizes="(max-width: 780px) 50vw, 12.5vw" /> : <><i />{partner.name}</>}</span>;
      })}</div>
      <h2>{testimonials_heading}</h2>
      <TestimonialCarousel slides={testimonials} />
    </section>
    <section className="what-if"><h2><Lines text={displayClosingHeading} /></h2><p><Lines text={closing_body} /></p></section>
  </>;
}
