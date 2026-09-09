"use client";

import { useEffect, useRef, useState } from "react";

const entries = [1385, 1389, 1390, 1395, 1398];

export function PortfolioTimeline() {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, scroll: 0 });
  const [active, setActive] = useState(2);
  const [dragging, setDragging] = useState(false);

  const setNearest = () => {
    const container = rail.current;
    if (!container) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-timeline-card]"));
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const nextDistance = Math.abs(cardCenter - center);
      if (nextDistance < distance) { distance = nextDistance; nearest = index; }
    });
    setActive(nearest);
  };

  useEffect(() => {
    const container = rail.current;
    if (!container) return;
    const initial = container.querySelectorAll<HTMLElement>("[data-timeline-card]")[2];
    if (initial) container.scrollLeft = initial.offsetLeft - (container.clientWidth - initial.offsetWidth) / 2;
    setNearest();
  }, []);

  return (
    <section className={`portfolio-timeline${dragging ? " is-dragging" : ""}`} aria-label="Portfolio timeline">
      <div
        ref={rail}
        className="portfolio-timeline-rail"
        onScroll={setNearest}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft }; setDragging(true); }}
        onPointerMove={(event) => { if (dragging && rail.current) rail.current.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {entries.map((year, index) => <article data-timeline-card className={index === active ? "is-active" : ""} key={year}>
          <h3>{year}</h3><strong>{index === 2 ? "Time Machine" : "Timeline Machine"}</strong>
          <p>Lorem ipsum dolor sit amet, consevbi adipiscing, sed do eiusmod sevbi hgseif adipiscing elit. Lorem ipsum dolor sit amet, consevbi hgseif adipiscing, sed do eiusmod sevbi hgseif adipiscing elit.</p>
        </article>)}
      </div>
    </section>
  );
}
