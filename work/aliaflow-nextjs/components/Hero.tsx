import Image from "next/image";
import { Fragment } from "react";

export type HeroData = {
  eyebrow: string;
  heading: string;
  image: string;
};

export function Hero({ eyebrow, heading, image }: HeroData) {
  const headingLines = heading.split("\n");
  return (
    <section id="home" className="hero section-dark">
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {headingLines.map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </h1>
      </div>
      <div className="hero-art">
        <Image src={image} alt="Leadership team around a strategic table" fill priority sizes="(max-width: 780px) 100vw, 58vw" />
      </div>
    </section>
  );
}
