"use client";

import { useRef, useState } from "react";

export type FutureImage = {
  /** CMS-provided URL for a fully designed card image. */
  src: string;
  alt: string;
};

export function ImageCarousel({ items, dark = false, label = "Image carousel" }: { items: FutureImage[]; dark?: boolean; label?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0 });
  const [dragging, setDragging] = useState(false);

  return (
    <section className={`image-carousel${dark ? " image-carousel-dark" : ""}${dragging ? " is-dragging" : ""}`} aria-label={label}>
      <div
        ref={rail}
        className="image-carousel-rail"
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { startX: event.clientX, startScroll: event.currentTarget.scrollLeft }; setDragging(true); }}
        onPointerMove={(event) => { if (dragging && rail.current) rail.current.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {items.map((item, index) => <article className="image-carousel-slide" key={`${item.src}-${index}`}><img src={item.src} alt={item.alt} draggable={false} /></article>)}
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
    <section className={`future-image-carousel${dragging ? " is-dragging" : ""}`} aria-label="Future of X image cards">
      <div
        ref={rail}
        className="future-image-carousel-rail"
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
          <article className="future-image-slide" key={`${item.src}-${index}`}>
            <img src={item.src} alt={item.alt} draggable={false} />
          </article>
        ))}
      </div>
    </section>
  );
}
