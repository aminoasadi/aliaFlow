"use client";

import { useRef, useState, type KeyboardEvent } from "react";

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

  return (
    <section className={`image-carousel${dark ? " image-carousel-dark" : ""}${dragging ? " is-dragging" : ""}${className ? ` ${className}` : ""}`} aria-label={label}>
      <div
        ref={rail}
        className="image-carousel-rail"
        tabIndex={0}
        aria-label={`${label}. Use the left and right arrow keys to browse.`}
        onKeyDown={handleRailKeys}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { startX: event.clientX, startScroll: event.currentTarget.scrollLeft }; setDragging(true); }}
        onPointerMove={(event) => { if (dragging && rail.current) rail.current.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {items.map((item, index) => <CarouselSlide className="image-carousel-slide" item={item} index={index} key={`${item.src ?? "empty"}-${index}`} />)}
      </div>
    </section>
  );
}

export function FutureImageCarousel({ items }: { items: FutureImage[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);

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
        onPointerDown={(event) => {
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
    </section>
  );
}
