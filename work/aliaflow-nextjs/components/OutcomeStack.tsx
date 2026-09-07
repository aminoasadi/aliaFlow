"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OutcomePanel, type Outcome } from "./OutcomePanel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function OutcomeStack({ outcomes }: { outcomes: Outcome[] }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray<HTMLElement>(".fig-outcome", scope.current);

    panels.forEach((panel, index) => {
      const screen = panel.querySelector<HTMLElement>(".fig-outcome-screen");
      if (!screen) return;

      const circles = panel.querySelectorAll<HTMLElement>(".circle-field i");
      const placeholder = panel.querySelector<HTMLElement>(".detail-placeholder");
      const nextPanel = panels[index + 1] as HTMLElement | undefined;

      if (index > 0) {
        gsap.fromTo(
          screen,
          { y: () => window.innerHeight },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top bottom",
              end: "top top",
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      // Pin the panel AND reveal the circles (finally the white placeholder) using a
      // single ScrollTrigger for the panel's pin duration. Using one shared trigger
      // (rather than a separate pin + a separate scrub timeline on the same element)
      // avoids the two fighting over the panel's position/measurements.
      if (nextPanel) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top top",
            endTrigger: nextPanel,
            end: "top top",
            scrub: 0.5,
            pin: panel,
            pinSpacing: false,
            invalidateOnRefresh: true,
          },
        });

        if (circles.length) {
          tl.fromTo(
            circles,
            { autoAlpha: 0, scale: 0.25 },
            { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.6, stagger: 0.06 },
            0,
          );
        }

        if (placeholder) {
          const circlesEnd = circles.length ? (circles.length - 1) * 0.06 + 0.6 : 0;
          tl.fromTo(
            placeholder,
            { autoAlpha: 0, scale: 0.6 },
            { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.6 },
            circlesEnd + 0.3,
          );
        }

        // Pad the timeline so the reveal finishes with room to spare before the pin
        // releases — the white circle should sit fully visible for a while before the
        // next section is allowed to slide in over it.
        tl.to({}, { duration: Math.max(tl.duration(), 0.1) * 0.6 });
      }
    });

    ScrollTrigger.refresh();
  }, { scope });

  return (
    <div ref={scope} className="outcome-list outcome-stack">
      <article className="fig-outcome outcome-0">
        <div className="fig-outcome-screen outcomes-intro"><h2>YOUR BUSINESS<br />IS...</h2></div>
      </article>
      {outcomes.map((outcome, index) => <OutcomePanel key={outcome.emphasis} outcome={outcome} index={index} />)}
      <article className="fig-outcome outcome-manifesto">
        <div className="fig-outcome-screen">
          <div className="manifesto-heading"><h2>YOUR THRIVABLE<br />BUSINESS IS</h2></div>
          <div className="manifesto-content">
            <svg className="fig-shape" viewBox="0 0 200 190" aria-hidden>
              <path d="M77.5,52.4 Q100,10 122.5,52.4 L167.5,137.6 Q190,180 142,180 L58,180 Q10,180 32.5,137.6 Z" fill="#d5d5d5" />
            </svg>
            <p>DIFFERENT<br />COMPETITIVE<br />SCALABLE</p>
          </div>
        </div>
      </article>
    </div>
  );
}
