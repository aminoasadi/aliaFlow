import Image from "next/image";
import type { ReactNode } from "react";

const lorem =
  "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.";

const futures = [
  {
    title: "Future of BANKING",
    heading: "Future of Banking in\na Technocratic world",
    tags: "#Digital Banking #FinTech Innovation\n#Automated & AI",
  },
  {
    title: "Future of GOVERNANCE",
    heading: "Future of Governance in\na Technocratic World",
    tags: "#Digital Governance #Smart Policy Systems\n#Futuristic Administration",
  },
  {
    title: "Future of EDUCATION",
    heading: "Future of Education in\na Technocratic World",
    tags: "#EdTech #Digital Learning\n#Future Classrooms",
  },
];

const loops = [
  { image: "/assets/aliasys-loop.png", label: "ICT Infrastructure", title: "Aliasys Business Loop" },
  { image: "/assets/aliapay-loop.png", label: "Banking and Fintech", title: "Aliapay Business Loop" },
  { image: "/assets/alialab-loop.png", label: "Education", title: "AliaLab Business Loop" },
];

const cultures = [
  { image: "/assets/workshop.png", label: "ICT Infrastructure", title: "Technocratic Culture" },
  { image: "/assets/design-event.png", label: "Innovation & Design", title: "Design Thinking Culture" },
  { image: "/assets/meeting-halftone.png", label: "Leadership & Management", title: "Collaborative Agile Culture" },
];

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

export function ThrivableBusiness() {
  return (
    <section className="thrivable-business" aria-labelledby="thrivable-title">
      <header className="thrivable-heading">
        <span aria-hidden="true" />
        <h2 id="thrivable-title">THRIVABLE BUSINESS</h2>
      </header>

      <section className="thrivable-question" aria-label="Where to play, how to win">
        <Image src="/assets/metro-paths.png" alt="A leader standing at the intersection of business pathways" fill sizes="100vw" priority />
        <h3>WHERE TO PLAY?<br />HOW TO WIN?</h3>
      </section>

      <ServiceBlock
        number="1"
        title="Future of X Book"
        body="Many companies lack the time, resources, and expertise required to continuously monitor the future of their industry, emerging technologies and new business models suitable for growth. At AliaFlow, by analyzing weak signals and emerging trends, we produce fully customized, periodic reports on future of industries in a technocratic world where new market and technologies emerge and disrupt the old model of doing business."
        mark={<Image src="/assets/cyborg.png" alt="" fill sizes="130px" />}
      />

      <div className="future-grid">
        {futures.map((future) => (
          <article key={future.title} className="future-card">
            <div className="future-map" aria-hidden="true"><Image src="/assets/pastel-metro-network.png" alt="" fill sizes="33vw" /></div>
            <div className="future-card-title">{future.title.replace(" ", "\n")}</div>
            <div className="future-card-copy">
              <small>Industry Name</small>
              <h3>{future.heading}</h3>
              <p>{future.tags}</p>
            </div>
          </article>
        ))}
      </div>

      <ServiceBlock
        number="2"
        title="Critical Business Loop"
        body="Based on the desired future, we consider the most value creating loops, aligned with your current capabilities and portfolio, into a practical business model with its most critical services. This critical business model provides a starting framework for developing a short-term and long-term strategies, helping leaders and decision makers align their planning and decisions around a shared goal."
        mark={<LoopMark />}
      />
      <TileGrid items={loops} contain />

      <ServiceBlock
        number="3"
        title="Brand Culture & XP"
        body="We shape the designed business model, we build a Brand City — a conceptual collaborative inner space that brings your brand's future to life in all its dimensions. From brand identity and culture, to the daily behaviors, and communication systems that make it real. The right open systems and ways of working will remove some of its stakeholders."
        mark={<CultureMark />}
      />
      <TileGrid items={cultures} />

      <section className="magazine-promo">
        <div className="magazine-copy">
          <h2>THE FUTURE OF BANKING<br />IN A TECHNOCRATIC WORLD<br />MAGAZINE</h2>
          <p className="magazine-price">$900</p>
          <button type="button">Buy Magazine</button>
        </div>
        <div className="magazine-art"><Image src="/assets/magazine.png" alt="Future of Banking magazine spread" fill sizes="60vw" /></div>
      </section>

      <section className="jam-promo">
        <div className="jam-copy">
          <h2>Banking<br />Thrivability JAM</h2>
          <p className="jam-date">Mon, Oct 13, 2025 - Oct 17, 2025</p>
          <p>{lorem}</p>
          <button type="button">Book Now</button>
        </div>
        <div className="jam-art"><Image src="/assets/banking-event.png" alt="Venue for the Banking Thrivability JAM" fill sizes="60vw" /></div>
      </section>
    </section>
  );
}
