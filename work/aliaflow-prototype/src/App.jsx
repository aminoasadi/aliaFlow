import { useRef } from "react";

const pageSlices = [
  "reference-01-00000-02400.webp",
  "reference-02-02400-04800.webp",
  "reference-03-04800-07200.webp",
  "reference-04-07200-09600.webp",
  "reference-05-09600-12000.webp",
  "reference-06-12000-14400.webp",
  "reference-07-14400-16800.webp",
  "reference-08-16800-19200.webp",
  "reference-09-19200-21600.webp",
  "reference-10-21600-24000.webp",
  "reference-11-24000-26400.webp",
  "reference-12-26400-28800.webp",
  "reference-13-28800-31200.webp",
  "reference-14-31200-33600.webp",
  "reference-15-33600-33697.webp",
];

const navigation = [
  { label: "Home", href: "#home", x: 745, width: 78 },
  { label: "Products", href: "#products", x: 832, width: 104 },
  { label: "Packages", href: "#packages", x: 944, width: 108 },
  { label: "Projects", href: "#projects", x: 1063, width: 102 },
  { label: "About us", href: "#about", x: 1171, width: 108 },
  { label: "Contact us", href: "#contact", x: 1284, width: 124 },
];

const catalogueLinks = [
  { label: "Thrivable Business", href: "#thrivable-business", x: 80, width: 286 },
  { label: "Business Leadership", href: "#business-leadership", x: 389, width: 300 },
  { label: "Technocratic Design", href: "#technocratic-design", x: 713, width: 292 },
  { label: "Execution Management", href: "#execution-management", x: 1028, width: 328 },
];

const anchors = [
  { id: "home", top: 0 },
  { id: "products", top: 7600 },
  { id: "packages", top: 12150 },
  { id: "thrivable-business", top: 8000 },
  { id: "business-leadership", top: 14020 },
  { id: "technocratic-design", top: 20180 },
  { id: "projects", top: 25820 },
  { id: "execution-management", top: 25820 },
  { id: "about", top: 26780 },
  { id: "contact", top: 33320 },
];

const riskCards = [
  "Risk Setting 1",
  "Risk Setting 2",
  "Risk Setting 3",
  "Risk Setting 4",
  "Risk Setting 5",
];

function percent(value, total) {
  return `${(value / total) * 100}%`;
}

export function App() {
  const railRef = useRef(null);

  function moveRiskRail(direction) {
    railRef.current?.scrollBy({
      left: direction * Math.min(420, railRef.current.clientWidth * 0.82),
      behavior: "smooth",
    });
  }

  return (
    <main className="page-shell" aria-label="AliaFlow website">
      <div className="figma-page">
        {pageSlices.map((slice, index) => (
          <img
            className="page-slice"
            src={`/assets/${slice}`}
            alt={index === 0 ? "AliaFlow - Your trusted leadership partner" : ""}
            aria-hidden={index === 0 ? undefined : true}
            decoding={index < 2 ? "sync" : "async"}
            fetchPriority={index === 0 ? "high" : "auto"}
            key={slice}
          />
        ))}

        {anchors.map((anchor) => (
          <span
            className="scroll-anchor"
            id={anchor.id}
            style={{ top: percent(anchor.top, 33697) }}
            key={anchor.id}
          />
        ))}

        <nav className="nav-hotspots" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              className="hotspot"
              href={item.href}
              aria-label={item.label}
              title={item.label}
              style={{
                left: percent(item.x, 1440),
                width: percent(item.width, 1440),
              }}
              key={item.label}
            />
          ))}
        </nav>

        <nav className="catalogue-hotspots" aria-label="Service catalogue">
          {catalogueLinks.map((item) => (
            <a
              className="hotspot"
              href={item.href}
              aria-label={item.label}
              title={item.label}
              style={{
                left: percent(item.x, 1440),
                width: percent(item.width, 1440),
              }}
              key={item.label}
            />
          ))}
        </nav>
      </div>

      <section className="risk-setting" id="risk-setting" aria-labelledby="risk-setting-title">
        <div className="risk-setting__cap" aria-hidden="true" />
        <header className="risk-setting__header">
          <div className="risk-setting__intro">
            <p className="risk-setting__eyebrow">7</p>
            <h2 id="risk-setting-title">Risk Setting</h2>
            <p className="risk-setting__copy">
              Many businesses work on the wrong problems, wasting time and resources. We help your organization become part
              of the minority that identifies the right problem and solves it the right way.
            </p>
          </div>
          <img className="risk-setting__icon" src="/assets/risk-setting-icon.png" alt="Risk-setting strategy" />
        </header>

        <div className="risk-setting__rail-wrap">
          <div
            className="risk-setting__rail"
            ref={railRef}
            tabIndex="0"
            aria-label="Risk-setting services"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") moveRiskRail(1);
              if (event.key === "ArrowLeft") moveRiskRail(-1);
            }}
          >
            {riskCards.map((title, index) => (
              <article className="risk-card" key={title}>
                <div className="risk-card__image-frame">
                  <img
                    className="risk-card__image"
                    src="/assets/risk-setting-team.png"
                    alt="Team collaborating with speech bubbles"
                    loading={index > 1 ? "lazy" : "eager"}
                  />
                </div>
                <div className="risk-card__body">
                  <p className="risk-card__industry">Industry Name</p>
                  <h3>{title}</h3>
                  <p>
                    Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet,
                    consevbi adis elit.
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="risk-setting__controls" aria-label="Carousel controls">
            <button type="button" aria-label="Previous risk-setting card" onClick={() => moveRiskRail(-1)}>
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" aria-label="Next risk-setting card" onClick={() => moveRiskRail(1)}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
