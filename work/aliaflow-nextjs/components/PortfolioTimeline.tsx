"use client";

import { useEffect, useRef, useState } from "react";

type TimelineEntry = { year: string; label: string; body: string };

export function PortfolioTimeline({ heading, timeline }: { heading: string; timeline: TimelineEntry[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, scroll: 0 });
  const entries = [timeline[0], ...timeline, timeline[timeline.length - 1]].filter((entry): entry is TimelineEntry => Boolean(entry));
  const [active, setActive] = useState(Math.min(2, entries.length - 1));
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
    const initial = container.querySelectorAll<HTMLElement>("[data-timeline-card]")[Math.min(2, entries.length - 1)];
    if (initial) container.scrollLeft = initial.offsetLeft - (container.clientWidth - initial.offsetWidth) / 2;
    setNearest();
  }, [entries.length]);

  return (
    <section className={`portfolio-timeline${dragging ? " is-dragging" : ""}`} aria-label={/[\u0600-\u06ff]/.test(heading) ? "خط زمانی پروژه‌ها" : "Portfolio timeline"}>
      <h2>{heading}</h2>
      <div
        ref={rail}
        className="portfolio-timeline-rail"
        onScroll={setNearest}
        onPointerDown={(event) => { if (event.pointerType !== "mouse") return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft }; setDragging(true); }}
        onPointerMove={(event) => { if (dragging && rail.current) rail.current.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {entries.map((entry, index) => <article data-timeline-card className={index === active ? "is-active" : ""} key={`${entry.year}-${index}`}>
          <h3>{entry.year}</h3><strong>{entry.label}</strong>
          <p>{entry.body}</p>
        </article>)}
      </div>
    </section>
  );
}
