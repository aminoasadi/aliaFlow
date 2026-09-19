import Image from "next/image";
import { Fragment } from "react";
import { BookOpen, Gamepad2, House } from "lucide-react";
import { CardRail } from "./CardRail";
import { EventBookingModal } from "./EventBookingModal";
import { cardSlug } from "../lib/card-pages";
import { ImageCarousel, type FutureImage } from "./FutureImageCarousel";
import { PortfolioTimeline } from "./PortfolioTimeline";
import { TestimonialCarousel } from "./TestimonialCarousel";

export type Item = { title: string; image?: string; text?: string; heading?: string; slug?: string };

function BusinessGameMark() {
  return <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M30 19h36l4 29c-4 14-12 22-22 22s-18-8-22-22z" />
    <path d="M30 26H17c0 16 6 24 18 25M66 26h13c0 16-6 24-18 25" />
    <path d="M48 70v10M34 84h28" />
    <path d="m48 31 4 8 9 1-6 6 2 9-9-5-9 5 2-9-6-6 9-1z" />
  </svg>;
}

export function DepartmentHeading({ title, businessLeadership = false }: { title: string; businessLeadership?: boolean }) {
  return <section className={`department-heading${businessLeadership ? " department-heading--business-leadership" : ""}`}><h2>{title}</h2></section>;
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

type StatementVariant = "business-game" | "strategic-roles" | "leadership-model" | "risk-setting" | "change-solving" | "performance-testing";
export function ServiceStatement({ number, title, body, dark = false, variant }: { number: string; title: string; body: string; dark?: boolean; variant?: StatementVariant }) {
  const isBusinessGame = variant === "business-game";
  const isChangeSolving = variant === "change-solving";
  const isRiskSetting = variant === "risk-setting";
  const isPerformanceTesting = variant === "performance-testing";
  const hasLeadershipDivider = variant === "business-game" || variant === "strategic-roles" || variant === "leadership-model";
  return <section className={`service-statement ${dark ? "statement-dark" : ""}${isBusinessGame ? " service-statement--business-game" : ""}${isChangeSolving ? " service-statement--change-solving" : ""}${isRiskSetting ? " service-statement--risk-setting" : ""}${isPerformanceTesting ? " service-statement--performance-testing" : ""}${hasLeadershipDivider ? " service-statement--leadership-divider" : ""}`}><div><h2>{number} {title}</h2><p>{body}</p></div><div className="statement-mark" aria-hidden="true">{isBusinessGame ? <BusinessGameMark /> : isChangeSolving ? <img src="/assets/change-solving-icon.png" alt="" /> : isRiskSetting ? <img src="/assets/risk-setting-icon.svg" alt="" /> : isPerformanceTesting ? <img src="/assets/performance-testing-icon.svg" alt="" /> : <span>{number}</span>}</div></section>;
}

export function ThreeCards({ items, dark = false, segment, realCount, variant }: { items: Item[]; dark?: boolean; segment?: string; realCount?: number; variant?: StatementVariant }) {
  const slides: FutureImage[] = items.map((item, index) => ({
    src: item.image?.trim() || undefined,
    alt: item.title,
    href: segment ? `/services/${segment}/${cardSlug(item)}` : undefined,
    duplicate: realCount !== undefined && index >= realCount,
  }));
  const isBusinessGame = variant === "business-game";
  const isChangeSolving = variant === "change-solving";
  const isRiskSetting = variant === "risk-setting";
  const isPerformanceTesting = variant === "performance-testing";
  const isPersian = items.some((item) => /[\u0600-\u06ff]/.test(item.title));
  return <ImageCarousel items={slides} dark={dark} label={isPersian ? "نمونه‌های سرویس" : "Service examples"} className={isBusinessGame ? "business-game-carousel" : isChangeSolving ? "change-solving-carousel" : isRiskSetting ? "risk-setting-carousel" : isPerformanceTesting ? "performance-testing-carousel" : undefined} />;
}

export function EventPromo({ title, image, imageAlt, kicker, body, ctaLabel, ctaHref, dark = false, variant }: { title: string; image: string; imageAlt: string; kicker: string; body: string; ctaLabel: string; ctaHref: string; dark?: boolean; variant?: "future-leadership" | "technocratic-leadership" }) {
  const isFutureLeadershipJam = variant === "future-leadership";
  const isTechnocraticLeadershipJam = variant === "technocratic-leadership";
  return <section className={`event-promo ${dark ? "event-promo-dark" : ""}${isFutureLeadershipJam ? " event-promo--future-leadership" : ""}${isTechnocraticLeadershipJam ? " event-promo--technocratic-leadership" : ""}`}><div className="event-copy"><h2>{title}</h2><p>{kicker}</p><p>{body}</p><EventBookingModal eventName={title} eventDate={kicker} triggerLabel={ctaLabel} triggerClassName="event-cta" /></div><div className="event-image"><Image src={image} alt={imageAlt} fill sizes="60vw" /></div></section>;
}

/* Statement title -> route segment. A statement with no entry keeps its cards
   unlinked and unpadded, which is what an unrecognised statement should do. */
const LEADERSHIP_SEGMENTS: Record<string, string | undefined> = {
  "business game": "business-game",
  "strategic roles": "strategic-roles",
  "leadership model": "leadership-model",
};

const DESIGN_SEGMENTS: Record<string, string | undefined> = {
  "risk setting": "risk-setting",
  "change solving": "change-solving",
  "performance testing": "performance-testing",
};

type StatementWithCards = { number: string; title: string; body: string; cards: { title: string; image?: string; heading?: string; slug?: string }[] };

export function BusinessLeadership({
  department_heading,
  question_image,
  question_image_alt,
  question,
  statements,
  holocratic_line,
  holocratic_heading,
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
  holocratic_heading: string;
  event_title: string;
  event_image: string;
  event_image_alt: string;
  event_kicker: string;
  event_body: string;
  event_cta_label: string;
  event_cta_href: string;
}) {
  return <>
    <DepartmentHeading title={department_heading} businessLeadership />
    <QuestionHero title={department_heading} question={question} image={question_image} imageAlt={question_image_alt} />
    {statements.map((statement, index) => {
      const normalized = statement.title.trim().toLowerCase();
      const segment = LEADERSHIP_SEGMENTS[normalized];
      const variants: StatementVariant[] = ["business-game", "strategic-roles", "leadership-model"];
      const variant = variants[index];
      const cards = segment ? [...statement.cards, ...statement.cards.slice(0, 2)] : statement.cards;
      return <Fragment key={statement.number}>
        <ServiceStatement dark variant={variant} number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards dark segment={segment} realCount={statement.cards.length} variant={variant} items={cards} />
      </Fragment>;
    })}
    <section className="holocratic"><h2><Lines text={holocratic_heading} /></h2><p>{holocratic_line}</p></section>
    <EventPromo dark variant="future-leadership" title={event_title} image={event_image} imageAlt={event_image_alt} kicker={event_kicker} body={event_body} ctaLabel={event_cta_label} ctaHref={event_cta_href} />
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
    {statements.map((statement, index) => {
      const normalized = statement.title.trim().toLowerCase();
      const segment = DESIGN_SEGMENTS[normalized];
      const variants: StatementVariant[] = ["risk-setting", "change-solving", "performance-testing"];
      const variant = variants[index];
      const cards = segment ? [...statement.cards, ...statement.cards.slice(0, 2)] : statement.cards;
      return <Fragment key={statement.number}>
        <ServiceStatement variant={variant} number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards segment={segment} realCount={statement.cards.length} variant={variant} items={cards} />
      </Fragment>;
    })}
    <EventPromo variant="technocratic-leadership" title={event_title} image={event_image} imageAlt={event_image_alt} kicker={event_kicker} body={event_body} ctaLabel={event_cta_label} ctaHref={event_cta_href} />
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
}: {
  eyebrow: string;
  heading: string;
}) {
  return <section className="why-us">
    <span className="why-us-side-tab why-us-side-tab--left" aria-hidden="true" />
    <span className="why-us-side-tab why-us-side-tab--right" aria-hidden="true" />
    <p>{eyebrow}</p>
    <h2><Lines text={heading} /></h2>
    <div className="why-us-cards-frame">
      <img className="why-us-cards" src="/assets/why-choose-us.svg" alt={/[\u0600-\u06ff]/.test(heading) ? "شکوفایی کسب‌وکار: متمایز، رقابت‌پذیر و مقیاس‌پذیر" : "Business Thrivability: different, competitive, and scalable — reason to believe."} />
    </div>
  </section>;
}

export function WhyTrustUs({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) {
  const trustMatch = /trust/i.test(heading);
  const [beforeTrust = heading, afterTrust = ""] = heading.split(/trust/i);

  return <section className="why-trust-us" aria-labelledby="why-trust-us-heading">
    <div className="why-trust-us__top-cutout" aria-hidden="true" />
    <div className="why-trust-us__content">
      <h2 id="why-trust-us-heading">{trustMatch ? <>{beforeTrust}<strong>TRUST</strong>{afterTrust}</> : heading}</h2>
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
  timeline: { year: string; label: string; body: string }[];
  people: { name: string; role: string; image: string; image_alt: string }[];
  toolkits: { title: string; body: string; image: string; image_alt: string }[];
}) {
  return <>
    <PortfolioTimeline heading={portfolio_heading} timeline={timeline} />
    <section className="portfolio">
    <h2>{people_heading}</h2>
    <CardRail className="people-grid">
      {people.map((person) => <article key={person.name}><h3>{person.name}</h3><p>{person.role}</p><Image src={person.image} alt={person.image_alt} width={220} height={290} /></article>)}
    </CardRail>
    <h2 className="toolkits-heading">{toolkits_heading}</h2>
    <CardRail className="toolkits">
      {toolkits.map((toolkit) => <article key={toolkit.title}>{toolkit.image ? <Image src={toolkit.image} alt={toolkit.image_alt || toolkit.title} fill sizes="(max-width: 780px) 100vw, 25vw" /> : null}</article>)}
    </CardRail>
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
      <TestimonialCarousel slides={testimonials} locale={/[\u0600-\u06ff]/.test(testimonials_heading) ? "fa" : "en"} />
    </section>
    <section className="what-if"><h2><Lines text={displayClosingHeading} /></h2><p><Lines text={closing_body} /></p></section>
  </>;
}
