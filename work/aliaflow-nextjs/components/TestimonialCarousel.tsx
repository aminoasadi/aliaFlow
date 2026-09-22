"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = {
  name: string;
  role: string;
  title: string;
  body: string;
  image?: string;
  image_alt?: string;
};

export function TestimonialCarousel({ slides, locale = "en" }: { slides: Testimonial[]; locale?: "en" | "fa" }) {
  const railRef = useRef<HTMLDivElement>(null);
  const correctingRef = useRef(false);
  const [active, setActive] = useState(0);
  const fallbackSlide: Testimonial = {
    name: "Mr Ansari",
    role: "Cisco Manager",
    title: "Supporting after Sales",
    body: "",
    image: "/assets/testimonial-ansari.png",
  };
  const sourceSlides = slides.length ? slides : [fallbackSlide];
  const displaySlides = [...sourceSlides];

  // Pad out to four cards so the rail always has a second page to travel to.
  while (displaySlides.length < 4) {
    displaySlides.push(sourceSlides[displaySlides.length % sourceSlides.length]);
  }

  const cardCount = displaySlides.length;
  const infinite = cardCount > 1;
  const loopedSlides = infinite ? [...displaySlides, ...displaySlides, ...displaySlides] : displaySlides;
  // How many cards fit in the rail is a CSS decision (two on desktop, one on a
  // phone), so measure it rather than duplicating the breakpoint here.
  const [perView, setPerView] = useState(2);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => {
      const slide = rail.firstElementChild as HTMLElement | null;
      if (!slide?.offsetWidth) return;
      setPerView(Math.max(1, Math.round(rail.clientWidth / slide.offsetWidth)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  const pageCount = Math.max(1, Math.ceil(cardCount / perView));

  useEffect(() => {
    if (!infinite) return;
    const frame = requestAnimationFrame(() => {
      const rail = railRef.current;
      if (rail) rail.scrollLeft = rail.scrollWidth / 3;
    });
    return () => cancelAnimationFrame(frame);
  }, [cardCount, infinite]);

  const keepLooping = (rail: HTMLDivElement) => {
    if (!infinite || correctingRef.current) return;
    const cycleWidth = rail.scrollWidth / 3;
    if (!Number.isFinite(cycleWidth) || cycleWidth <= 0) return;
    if (rail.scrollLeft < cycleWidth * 0.45 || rail.scrollLeft > cycleWidth * 1.55) {
      correctingRef.current = true;
      rail.scrollLeft += rail.scrollLeft < cycleWidth * 0.45 ? cycleWidth : -cycleWidth;
      requestAnimationFrame(() => { correctingRef.current = false; });
    }
  };

  const goTo = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const cycleWidth = infinite ? rail.scrollWidth / 3 : 0;
    rail.scrollTo({ left: cycleWidth + rail.clientWidth * index, behavior: "smooth" });
    setActive(index);
  };

  return (
    <section className="testimonial-carousel" aria-label={locale === "fa" ? "دیدگاه مشتریان" : "Testimonials"}>
      <div
        ref={railRef}
        className="testimonial-carousel__rail"
        tabIndex={0}
        onScroll={(event) => {
          const rail = event.currentTarget;
          keepLooping(rail);
          setActive(Math.round((rail.scrollLeft / Math.max(rail.clientWidth, 1)) % pageCount) % pageCount);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); goTo((active + 1) % pageCount); }
          if (event.key === "ArrowLeft") { event.preventDefault(); goTo((active - 1 + pageCount) % pageCount); }
        }}
      >
        {loopedSlides.map((testimonial, index) => {
          const clone = infinite && (index < cardCount || index >= cardCount * 2);
          const itemIndex = index % cardCount;
          return (
          <article className="testimonial-carousel__slide" key={index} aria-hidden={clone || undefined} aria-label={locale === "fa" ? `دیدگاه ${itemIndex + 1} از ${cardCount}` : `Testimonial ${itemIndex + 1} of ${cardCount}`}>
            {testimonial.image ? (
              <img src={testimonial.image} alt={testimonial.image_alt || `Testimonial from ${testimonial.name}, ${testimonial.role}`} draggable={false} />
            ) : (
              <div className="testimonial-carousel__slide-fallback">
                <p>{testimonial.title}</p>
                <span>&ldquo;{testimonial.body}&rdquo;</span>
                <b>{testimonial.name}</b>
                <small>{testimonial.role}</small>
              </div>
            )}
          </article>
          );
        })}
      </div>
      <div className="testimonial-carousel__dots" aria-label={locale === "fa" ? "انتخاب دیدگاه" : "Choose testimonial"}>
        {Array.from({ length: pageCount }, (_, index) => (
          <button key={index} type="button" aria-label={locale === "fa" ? `نمایش دیدگاه ${index + 1}` : `Show testimonial ${index + 1}`} aria-current={index === active} onClick={() => goTo(index)} />
        ))}
      </div>
    </section>
  );
}
