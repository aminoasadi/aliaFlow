"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";

export type FutureImage = {
  /** CMS-provided URL for a fully designed card image. */
  src?: string;
  alt: string;
  /** Article this slide links to. Slides without one stay unlinked. */
  href?: string;
  /** Padding slides repeat an earlier card; hidden from assistive tech. */
  duplicate?: boolean;
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

function trackActiveSlide(rail: HTMLDivElement | null, setActive: (index: number) => void, count?: number) {
  if (!rail) return;
  const slide = rail.firstElementChild as HTMLElement | null;
  const step = slide?.offsetWidth ?? rail.clientWidth;
  const index = step > 0 ? Math.round(rail.scrollLeft / step) : 0;
  setActive(count && count > 0 ? ((index % count) + count) % count : index);
}

function scrollToSlide(rail: HTMLDivElement | null, index: number, count?: number) {
  if (!rail) return;
  const slide = rail.firstElementChild as HTMLElement | null;
  const step = slide?.offsetWidth ?? rail.clientWidth;
  // A loop starts in its middle copy, so dot navigation never lands at a seam.
  rail.scrollTo({ left: step * (index + (count && count > 1 ? count : 0)), behavior: "smooth" });
}

function CarouselSlide({ item, index, className, cloned = false }: { item: FutureImage; index: number; className: string; cloned?: boolean }) {
  const body = item.src ? (
    /* Inside a link the alt is empty: the link's aria-label already carries the
       name, and both would otherwise be announced one after the other. */
    <img src={item.src} alt={item.href ? "" : item.alt} draggable={false} />
  ) : (
    <div className="image-carousel-placeholder" role="img" aria-label={`${item.alt || "Image card"} has no image`}>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <strong>{item.alt || "Image not added"}</strong>
    </div>
  );

  if (item.duplicate || cloned) {
    return <article className={className} aria-hidden="true">{body}</article>;
  }
  if (item.href) {
    return (
      <article className={className}>
        <Link href={item.href} aria-label={item.alt}>{body}</Link>
      </article>
    );
  }
  return <article className={className}>{body}</article>;
}

/**
 * Re-centres an infinite rail before the visitor can reach either visual
 * edge. The cards are triplicated, so the adjustment lands on an identical
 * card and remains imperceptible during drag, swipe, and inertial scroll.
 */
function useInfiniteRail(rail: RefObject<HTMLDivElement | null>, enabled: boolean, itemCount: number) {
  const correcting = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const frame = requestAnimationFrame(() => {
      const element = rail.current;
      if (element) element.scrollLeft = element.scrollWidth / 3;
    });
    return () => cancelAnimationFrame(frame);
  }, [enabled, itemCount, rail]);

  return () => {
    const element = rail.current;
    if (!enabled || !element || correcting.current) return;
    const cycleWidth = element.scrollWidth / 3;
    if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) return;

    if (element.scrollLeft < cycleWidth * 0.45 || element.scrollLeft > cycleWidth * 1.55) {
      correcting.current = true;
      element.scrollLeft += element.scrollLeft < cycleWidth * 0.45 ? cycleWidth : -cycleWidth;
      requestAnimationFrame(() => { correcting.current = false; });
    }
  };
}

function loopedItems(items: FutureImage[]) {
  return items.length > 1 ? [...items, ...items, ...items] : items;
}

export function ImageCarousel({ items, dark = false, label = "Image carousel", className = "" }: { items: FutureImage[]; dark?: boolean; label?: string; className?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(0);
  const infinite = items.length > 1;
  const displayedItems = loopedItems(items);
  const keepLooping = useInfiniteRail(rail, infinite, items.length);
  const browseHint = /[\u0600-\u06ff]/.test(label) ? "برای مرور از کلیدهای جهت‌نمای چپ و راست استفاده کنید." : "Use the left and right arrow keys to browse.";

  return (
    <section className={`image-carousel${dark ? " image-carousel-dark" : ""}${dragging ? " is-dragging" : ""}${className ? ` ${className}` : ""}`} aria-label={label}>
      <div
        ref={rail}
        className="image-carousel-rail"
        tabIndex={0}
        aria-label={`${label}. ${browseHint}`}
        onKeyDown={handleRailKeys}
        onScroll={() => { keepLooping(); trackActiveSlide(rail.current, setActive, items.length); }}
        onPointerDown={(event) => { if (!isMouseDrag(event)) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { startX: event.clientX, startScroll: event.currentTarget.scrollLeft }; setDragging(true); }}
        onPointerMove={(event) => { if (dragging && rail.current) rail.current.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {displayedItems.map((item, index) => <CarouselSlide className="image-carousel-slide" item={item} index={index % items.length} cloned={infinite && (index < items.length || index >= items.length * 2)} key={`${item.src ?? "empty"}-${index}`} />)}
      </div>
      <CarouselDots count={items.length} active={active} onSelect={(index) => scrollToSlide(rail.current, index, items.length)} />
    </section>
  );
}

export function FutureImageCarousel({ items }: { items: FutureImage[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(0);
  const infinite = items.length > 1;
  const displayedItems = loopedItems(items);
  const keepLooping = useInfiniteRail(rail, infinite, items.length);

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
        onScroll={() => { keepLooping(); trackActiveSlide(rail.current, setActive, items.length); }}
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
        {displayedItems.map((item, index) => (
          <CarouselSlide className="future-image-slide" item={item} index={index % items.length} cloned={infinite && (index < items.length || index >= items.length * 2)} key={`${item.src ?? "empty"}-${index}`} />
        ))}
      </div>
      <CarouselDots count={items.length} active={active} onSelect={(index) => scrollToSlide(rail.current, index, items.length)} />
    </section>
  );
}
