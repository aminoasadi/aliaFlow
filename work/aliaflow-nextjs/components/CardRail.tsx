"use client";

import { Children, useRef, useState, type ReactNode } from "react";

/**
 * A row of cards on desktop; a one-card-per-swipe rail on mobile (the layout
 * switch lives in the stylesheets). The dots are the only cue that the row
 * continues, because no neighbouring card is ever left half-visible.
 */
export function CardRail({ className, children }: { className: string; children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const step = () => {
    const element = rail.current;
    const first = element?.firstElementChild as HTMLElement | null;
    return first?.offsetWidth || element?.clientWidth || 1;
  };

  return (
    <>
      <div
        ref={rail}
        className={className}
        onScroll={() => setActive(Math.round((rail.current?.scrollLeft ?? 0) / step()))}
      >
        {children}
      </div>
      {count > 1 ? (
        <div className="carousel-dots" aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              tabIndex={-1}
              aria-current={index === active}
              onClick={() => rail.current?.scrollTo({ left: step() * index, behavior: "smooth" })}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
