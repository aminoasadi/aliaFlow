"use client";

import { Fragment, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OutcomePanel, type Outcome } from "./OutcomePanel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// A mobile browser resizes the viewport when its address bar collapses. Without
// this, every pinned outcome screen would be re-measured mid-scroll and jump.
ScrollTrigger.config({ ignoreMobileResize: true });

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={line}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export function OutcomeStack({
  introHeading,
  outcomes,
  manifestoHeading,
  manifestoWords,
  manifestoShape,
  titlePrefix,
  titleSuffix,
  detailPrefix,
  detailConnector,
}: {
  introHeading: string;
  outcomes: Outcome[];
  manifestoHeading: string;
  manifestoWords: string;
  manifestoShape: string;
  titlePrefix: string;
  titleSuffix: string;
  detailPrefix: string;
  detailConnector: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  // `ignoreMobileResize` also suppresses the refresh a real rotation needs, so
  // re-measure whenever the width actually changes and stay quiet when only the
  // height does (that is the address bar collapsing, mid-scroll).
  useEffect(() => {
    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

        tl.to({}, { duration: Math.max(tl.duration(), 0.1) * 0.6 });
      }
    });

    ScrollTrigger.refresh();
  }, { scope });

  return (
    <div ref={scope} className="outcome-list outcome-stack">
      <article className="fig-outcome outcome-0">
        <div className="fig-outcome-screen outcomes-intro"><h2><Lines text={introHeading} /></h2></div>
      </article>
      {outcomes.map((outcome, index) => <OutcomePanel key={outcome.emphasis} outcome={outcome} index={index} titlePrefix={titlePrefix} titleSuffix={titleSuffix} detailPrefix={detailPrefix} detailConnector={detailConnector} />)}
      <article className="fig-outcome outcome-manifesto">
        <div className="fig-outcome-screen">
          <div className="manifesto-heading"><h2><Lines text={manifestoHeading} /></h2></div>
        </div>
      </article>
      <article className="fig-outcome outcome-manifesto-values">
        <div className="fig-outcome-screen manifesto-values-screen">
          <div className="manifesto-content">
            {manifestoShape ? <img className="fig-shape" src={manifestoShape} alt="" aria-hidden /> : null}
            <p><Lines text={manifestoWords} /></p>
          </div>
        </div>
      </article>
    </div>
  );
}
