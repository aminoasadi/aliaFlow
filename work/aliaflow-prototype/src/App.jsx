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

function percent(value, total) {
  return `${(value / total) * 100}%`;
}

export function App() {
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
    </main>
  );
}
