"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export type FutureImage = {
  /** CMS-provided URL for a fully designed card image. */
  src?: string;
  alt: string;
};

function handleRailKeys(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  const direction = event.key === "ArrowRight" ? 1 : -1;
  event.currentTarget.scrollBy({ left: direction * event.currentTarget.clientWidth * 0.8, behavior: "smooth" });
}

/* Touch devices get the browser's own inertial scrolling and snap; the
   pointer drag exists only so a mouse can pull the rail on desktop. */
function isMouseDrag(event: PointerEvent<HTMLDivElement>) {
  return event.pointerType === "mouse";
}

/** One dot per card. Shown on mobile only, where a swipe moves a whole card
    and no neighbouring card peeks in to say the rail continues. */
function CarouselDots({ count, active, onSelect }: { count: number; active: number; onSelect: (index: number) => void }) {
  if (count < 2) return null;
  return (
    <div className="carousel-dots" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <button key={index} type="button" tabIndex={-1} aria-current={index === active} onClick={() => onSelect(index)} />
      ))}
    </div>
  );
}

function trackActiveSlide(rail: HTMLDivElement | null, setActive: (index: number) => void) {
  if (!rail) return;
  const slide = rail.firstElementChild as HTMLElement | null;
  const step = slide?.offsetWidth ?? rail.clientWidth;
  setActive(step > 0 ? Math.round(rail.scrollLeft / step) : 0);
}

function scrollToSlide(rail: HTMLDivElement | null, index: number) {
  if (!rail) return;
  const slide = rail.firstElementChild as HTMLElement | null;
  const step = slide?.offsetWidth ?? rail.clientWidth;
  rail.scrollTo({ left: step * index, behavior: "smooth" });
}

function CarouselSlide({ item, index, className }: { item: FutureImage; index: number; className: string }) {
  return (
    <article className={className}>
      {item.src ? (
        <img src={item.src} alt={item.alt} draggable={false} />
      ) : (
        <div className="image-carousel-placeholder" role="img" aria-label={`${item.alt || "Image card"} has no image`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item.alt || "Image not added"}</strong>
        </div>
      )}
    </article>
  );
}

export function ImageCarousel({ items, dark = false, label = "Image carousel", className = "" }: { items: FutureImage[]; dark?: boolean; label?: string; className?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(0);

  return (
    <section className={`image-carousel${dark ? " image-carousel-dark" : ""}${dragging ? " is-dragging" : ""}${className ? ` ${className}` : ""}`} aria-label={label}>
      <div
        ref={rail}
        className="image-carousel-rail"
        tabIndex={0}
        aria-label={`${label}. Use the left and right arrow keys to browse.`}
        onKeyDown={handleRailKeys}
        onScroll={() => trackActiveSlide(rail.current, setActive)}
        onPointerDown={(event) => { if (!isMouseDrag(event)) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { startX: event.clientX, startScroll: event.currentTarget.scrollLeft }; setDragging(true); }}
        onPointerMove={(event) => { if (dragging && rail.current) rail.current.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {items.map((item, index) => <CarouselSlide className="image-carousel-slide" item={item} index={index} key={`${item.src ?? "empty"}-${index}`} />)}
      </div>
      <CarouselDots count={items.length} active={active} onSelect={(index) => scrollToSlide(rail.current, index)} />
    </section>
  );
}

export function FutureImageCarousel({ items }: { items: FutureImage[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(0);

  const beginDrag = (clientX: number) => {
    const element = rail.current;
    if (!element) return;
    drag.current = { startX: clientX, startScroll: element.scrollLeft, moved: false };
    setDragging(true);
  };

  const moveDrag = (clientX: number) => {
    const element = rail.current;
    if (!element || !dragging) return;
    const distance = clientX - drag.current.startX;
    if (Math.abs(distance) > 4) drag.current.moved = true;
    element.scrollLeft = drag.current.startScroll - distance;
  };

  const endDrag = () => setDragging(false);

  return (
    <section className={`future-image-carousel${items.length === 1 ? " future-image-carousel-single" : ""}${dragging ? " is-dragging" : ""}`} aria-label="Future of X image cards">
      <div
        ref={rail}
        className="future-image-carousel-rail"
        tabIndex={0}
        aria-label="Future of X image cards. Use the left and right arrow keys to browse."
        onKeyDown={handleRailKeys}
        onScroll={() => trackActiveSlide(rail.current, setActive)}
        onPointerDown={(event) => {
          if (!isMouseDrag(event)) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          beginDrag(event.clientX);
        }}
        onPointerMove={(event) => moveDrag(event.clientX)}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {items.map((item, index) => (
          <CarouselSlide className="future-image-slide" item={item} index={index} key={`${item.src ?? "empty"}-${index}`} />
        ))}
      </div>
      <CarouselDots count={items.length} active={active} onSelect={(index) => scrollToSlide(rail.current, index)} />
    </section>
  );
}
