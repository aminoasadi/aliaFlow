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
  titleEyebrow,
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
  titleEyebrow: string;
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

    panels.forEach((panel) => {
      const screen = panel.querySelector<HTMLElement>(".fig-outcome-screen");
      if (!screen) return;

      const circles = panel.querySelectorAll<HTMLElement>(".circle-field i");
      const placeholder = panel.querySelector<HTMLElement>(".detail-placeholder");
      if (!circles.length && !placeholder) return;

      // Keep visual entrances independent from document scrolling. Pinning a
      // panel while CSS snap is resolving a touch fling creates competing
      // scroll positions, which is especially visible on iOS.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top 72%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });

      if (circles.length) {
        tl.to(circles, {
          autoAlpha: 1,
          scale: 1,
          ease: "power2.out",
          duration: 0.45,
          stagger: 0.025,
        }, 0);
      }

      if (placeholder) {
        tl.to(placeholder, {
          autoAlpha: 1,
          scale: 1,
          ease: "power2.out",
          duration: 0.42,
        }, circles.length ? 0.22 : 0);
      }
    });

    ScrollTrigger.refresh();
  }, { scope });

  return (
    <div ref={scope} className="outcome-list outcome-stack">
      <article className="fig-outcome outcome-0">
        <div className="fig-outcome-screen outcomes-intro"><h2><Lines text={introHeading} /></h2></div>
      </article>
      {outcomes.map((outcome, index) => <OutcomePanel key={outcome.emphasis} outcome={outcome} index={index} titleEyebrow={titleEyebrow} titlePrefix={titlePrefix} titleSuffix={titleSuffix} detailPrefix={detailPrefix} detailConnector={detailConnector} />)}
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
