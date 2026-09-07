"use client";

import Image from "next/image";
import { useState } from "react";

type Service = { number: string; title: string; body: string; image: string };

export function ServiceCatalogue({ id, kicker, title, intro, cards }: { id: string; kicker: string; title: string; intro: string; cards: Service[] }) {
  const [active, setActive] = useState(0);
  return (
    <section id={id} className="catalogue section-light">
      <div className="section-heading"><p className="eyebrow">{kicker}</p><h2>{title}</h2><p>{intro}</p></div>
      <div className="catalogue-tabs" role="tablist" aria-label={`${title} services`}>
        {cards.map((card, index) => <button key={card.number} role="tab" aria-selected={active === index} onClick={() => setActive(index)}><span>{card.number}</span>{card.title}</button>)}
      </div>
      <article className="service-feature" key={cards[active].number}>
        <div className="service-copy"><h3>{cards[active].number} {cards[active].title}</h3><p>{cards[active].body}</p></div>
        <div className="service-media"><Image src={cards[active].image} alt="" fill sizes="(max-width: 780px) 100vw, 50vw" /></div>
      </article>
    </section>
  );
}
