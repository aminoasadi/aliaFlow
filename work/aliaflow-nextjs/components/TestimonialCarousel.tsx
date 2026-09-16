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

export function TestimonialCarousel({ slides }: { slides: Testimonial[] }) {
  const railRef = useRef<HTMLDivElement>(null);
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

  const goTo = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: rail.clientWidth * index, behavior: "smooth" });
    setActive(index);
  };

  return (
    <section className="testimonial-carousel" aria-label="Testimonials">
      <div
        ref={railRef}
        className="testimonial-carousel__rail"
        tabIndex={0}
        onScroll={(event) => {
          const rail = event.currentTarget;
          setActive(Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1)));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") goTo(Math.min(active + 1, pageCount - 1));
          if (event.key === "ArrowLeft") goTo(Math.max(active - 1, 0));
        }}
      >
        {displaySlides.map((testimonial, index) => (
          <article className="testimonial-carousel__slide" key={index} aria-label={`Testimonial ${index + 1} of ${cardCount}`}>
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
        ))}
      </div>
      <div className="testimonial-carousel__dots" aria-label="Choose testimonial">
        {Array.from({ length: pageCount }, (_, index) => (
          <button key={index} type="button" aria-label={`Show testimonial ${index + 1}`} aria-current={index === active} onClick={() => goTo(index)} />
        ))}
      </div>
    </section>
  );
}
