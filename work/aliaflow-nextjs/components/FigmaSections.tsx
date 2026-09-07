import Image from "next/image";

type Item = { title: string; image?: string; text?: string };

const lorem = "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit";

export function DepartmentHeading({ title }: { title: string }) {
  return <section className="department-heading"><h2>{title}</h2></section>;
}

const catalogueTabs = [
  { number: "1", label: "Thrivable Business" },
  { number: "2", label: "Business Leadership" },
  { number: "3", label: "Technocratic Design" },
  { number: "4", label: "Execution Management" },
];

export function ServiceCatalogueNav() {
  return <section className="catalogue-nav">
    <h2>OUR SERVICE CATALOGUE</h2>
    <ul>
      {catalogueTabs.map((tab) => <li key={tab.number}><span>{tab.number}</span>{tab.label}</li>)}
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

export function BusinessLeadership() {
  return <>
    <DepartmentHeading title="BUSINESS LEADERSHIP" />
    <QuestionHero title="BUSINESS LEADERSHIP" question={"WHAT TO PLAY?\nHOW TO LEAD?"} />
    <ServiceStatement dark number="4" title="Business Game" body="Through our proprietary Business Loop Game methodology, we help your organization move beyond a reactive mode and become a driver of change—where every decision contributes to creating a new game, rather than merely continuing the existing one." />
    <ThreeCards dark items={[
      { title: "Business Game 1", image: "/assets/alialab-loop.png" },
      { title: "Business Game 2", image: "/assets/aliapay-loop.png" },
      { title: "Business Game 3", image: "/assets/aliasys-loop.png" },
    ]} />
    <ServiceStatement dark number="5" title="Strategic Roles" body="Implementing Brand City is not merely a creative project; it is an organizational transformation that requires leadership, role definition, and clear strategies to guide the future." />
    <ThreeCards dark items={[
      { title: "Strategic Role 1", image: "/assets/cyborg.png" },
      { title: "Strategic Role 2", image: "/assets/cyborg.png" },
      { title: "Strategic Role 3", image: "/assets/cyborg.png" },
    ]} />
    <ServiceStatement dark number="6" title="Leadership Model" body="The strategic roles designed for your Brand City are entirely unique; they are a direct reflection of your brand's DNA and the future architecture of your business." />
    <ThreeCards dark items={[{ title: "Leadership model 1" }, { title: "Leadership model 2" }, { title: "Leadership model 3" }]} />
    <section className="holocratic"><p>Mentoring, Leading, Training, Coaching, Managing</p></section>
    <EventPromo dark title="Future Leadership JAM" image="/assets/leadership-team.png" />
  </>;
}

export function TechnocraticDesign() {
  return <>
    <DepartmentHeading title="TECHNOCRATIC DESIGN" />
    <QuestionHero title="TECHNOCRATIC DESIGN" question={"WHEN TO DESIGN?\nHOW TO CHANGE?"} />
    <section className="design-pillars"><span><i className="mini-icon" /><b>Business Telling</b></span><span><i className="mini-icon" /><b>Business Living</b></span><span><i className="mini-icon" /><b>Business Playing</b></span></section>
    <ServiceStatement number="7" title="Risk Setting" body="Many businesses work on the wrong problems, wasting time and resources. We help your organization become part of the minority that identifies the right problem and solves it the right way." />
    <ThreeCards items={[
      { title: "Risk Setting 1", image: "/assets/people-feedback.png" },
      { title: "Risk Setting 2", image: "/assets/people-care.png" },
      { title: "Risk Setting 3", image: "/assets/workshop.png" },
    ]} />
    <ServiceStatement number="8" title="Change Solving" body="Based on the real needs and challenges identified in the previous stages, our team researches, analyzes, and designs solutions that are fully aligned with your organization's DNA." />
    <ThreeCards items={[{ title: "Change Solving 1" }, { title: "Change Solving 2" }, { title: "Change Solving 3" }]} />
    <ServiceStatement number="9" title="Performance Testing" body="The implementation of solutions is carried out in close collaboration with the organization’s units and experts through a fully participatory process." />
    <ThreeCards items={[{ title: "Performance Testing 1" }, { title: "Performance Testing 2" }, { title: "Performance Testing 3" }]} />
    <EventPromo title="Technocratic Design For Leadership JAM" image="/assets/design-event.png" />
  </>;
}

export function ExecutionManagement() {
  return <section className="execution-management"><h2>EXECUTION MANAGEMENT</h2><div className="execution-orbits"><span>ADORE<br />REBRANDING</span><span>DOGHAZAL<br />EXPERIENCE</span><strong>ALIASYS<br />EXHIBITION</strong><span>FOMENTO<br />BRANDING</span><span>ARVA<br />CAMPAIGN</span></div><p>By leveraging advanced information and communication technologies, we support businesses in creating a more optimized, efficient, and successful version of themselves.</p></section>;
}

export function WhyChooseUs() {
  return <section className="why-us"><p>Why choose us?</p><h2>Enabling Business<br />Thrivability through<br />Technocratic<br />Innovation</h2><div className="business-ring">BUSINESS<br />THRIVABILITY</div><div className="why-list">{["Different", "Competitive", "Scalable"].map((label, i) => <article key={label}><b>0{i + 1}</b><div><h3>{label}</h3><p>Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.</p></div></article>)}</div></section>;
}

export function PortfolioAndPeople() {
  const people = [
    ["Vahid Daem", "Business Manager", "/assets/daem.png"], ["Nasim Tavakkoli", "Automation & AI Specialist", "/assets/tavakoli.png"], ["Saman Ehteshamzade", "Marketing Manager", "/assets/ehteshamzadeh.png"], ["Narges Mohit", "Space Designer", "/assets/mohit.png"],
  ];
  return <section className="portfolio"><h2>PORTFOLIO</h2><div className="portfolio-years"><span>1389<br /><i>Timeline Machine</i></span><strong>1390<br /><i>Time Machine</i></strong><span>1395<br /><i>Timeline Machine</i></span></div><h2>PEOPLE</h2><div className="people-grid">{people.map(([name, role, image]) => <article key={name}><h3>{name}</h3><p>{role}</p><Image src={image} alt="" width={220} height={290} /></article>)}</div><h2>DESIGN TOOLKITS</h2><div className="toolkits">{[1, 2, 3, 4].map((n) => <article key={n}><h3>Toolkit {n}</h3><p>Lorem ipsum dolot sit amet</p></article>)}</div></section>;
}

export function TestimonialsAndFooter() {
  return <><section className="trust-banner"><h2>WHY <b>TRUST</b> US</h2><p>R E A S O N &nbsp; T O &nbsp; B E L I E V E</p></section><section className="partners"><h2>PARTNERS</h2><div>{["Amin Advisor", "Atolie", "Tehran University", "Raad Architect", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"].map((name) => <span key={name}><i />{name}</span>)}</div><h2>TESTIMONIAL</h2><div className="testimonials"><article><b>Mr Ansari</b><small>Cisco Manager</small><h3>Supporting after Sales</h3><p>{lorem}</p></article><article><b>Mr Bahadori</b><small>Cisco Manager</small><h3>Supporting after Sales</h3><p>{lorem}</p></article></div></section><section className="what-if"><h2>WHAT<br />IF...</h2><p>You Could Change Your<br />Successful Business to A<br />Thrivable Business</p></section></>;
}
