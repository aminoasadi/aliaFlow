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
    const screens = panels.map((panel) => panel.querySelector<HTMLElement>(".fig-outcome-screen"))
      .filter((screen): screen is HTMLElement => Boolean(screen));

    if (screens.length < 2) return;

    // One pinned stack owns the entire transition. Multiple overlapping pins
    // fight over scroll position on touch devices, while this single timeline
    // lets every next screen slide in over the preceding screen smoothly.
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: scope.current,
        start: "top top",
        end: () => `+=${window.innerHeight * (screens.length - 1)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: "labels",
          delay: 0.08,
          duration: { min: 0.18, max: 0.48 },
          ease: "power2.out",
          inertia: false,
        },
      },
    });

    screens.slice(1).forEach((screen, index) => {
      const step = index;
      const panel = panels[index + 1];
      const circles = panel.querySelectorAll<HTMLElement>(".circle-field i");
      const placeholder = panel.querySelector<HTMLElement>(".detail-placeholder");

      timeline.addLabel(`slide-${index + 1}`, step);
      timeline.to(screen, { "--outcome-slide-y": "0%", duration: 1, ease: "none" }, step);

      if (circles.length) {
        timeline.to(circles, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.28,
          ease: "power1.out",
          stagger: 0.012,
        }, step + 0.56);
      }

      if (placeholder) {
        timeline.to(placeholder, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.22,
          ease: "power1.out",
        }, step + 0.7);
      }
    });
    timeline.addLabel("slide-final", screens.length - 1);

    ScrollTrigger.refresh();
  }, { scope });

  return (
    <div ref={scope} className="outcome-list outcome-stack outcome-stack--animated">
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
