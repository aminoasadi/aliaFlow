"use client";

import { useRef, useState } from "react";

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

  // Keep two cards on each page and provide a second page for carousel testing.
  while (displaySlides.length < 4) {
    displaySlides.push(sourceSlides[displaySlides.length % sourceSlides.length]);
  }

  const cardCount = displaySlides.length;
  const pageCount = Math.ceil(cardCount / 2);

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
        {Array.from({ length: pageCount }, (_, pageIndex) => (
          <div className="testimonial-carousel__page" key={pageIndex}>
            {Array.from({ length: 2 }, (_, cardIndex) => {
              const index = pageIndex * 2 + cardIndex;
              const testimonial = displaySlides[index];
              return testimonial ? <article className="testimonial-carousel__slide" key={index} aria-label={`Testimonial ${index + 1} of ${cardCount}`}>
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
              </article> : null;
            })}
          </div>
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
