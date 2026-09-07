import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("/Users/mac/Documents/Codex/2026-09-05/hdk-x20");
const sourceDir = resolve(root, "work/reference-crops");
const outputDir = resolve(root, "outputs");
const sliceNames = [
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

const slices = sliceNames
  .map((name, index) => {
    const data = readFileSync(resolve(sourceDir, name)).toString("base64");
    const alt = index === 0 ? ' alt="AliaFlow - Your trusted leadership partner"' : ' alt="" aria-hidden="true"';
    return `<img class="page-slice" src="data:image/webp;base64,${data}"${alt}>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AliaFlow - Your trusted leadership partner">
  <title>AliaFlow</title>
  <style>
    :root{color-scheme:light;background:#1d1d1d;font-family:Arial,Helvetica,sans-serif;scroll-behavior:smooth}
    *{box-sizing:border-box}
    html,body{margin:0;min-width:320px;min-height:100%}
    body{background:#1d1d1d;-webkit-font-smoothing:antialiased}
    .page-shell{width:100%;overflow-x:clip}
    .figma-page{position:relative;width:min(100%,1440px);margin-inline:auto;line-height:0;background:#fff}
    .page-slice{display:block;width:100%;height:auto;margin:0;border:0}
    .scroll-anchor{position:absolute;left:0;width:1px;height:1px;pointer-events:none}
    .nav-hotspots,.catalogue-hotspots{position:absolute;left:0;width:100%;pointer-events:none}
    .nav-hotspots{top:0;height:.226%}
    .catalogue-hotspots{top:23.16%;height:.22%}
    .hotspot{position:absolute;top:0;height:100%;display:block;pointer-events:auto;border-radius:2px}
    .hotspot:focus-visible{outline:3px solid #fff;outline-offset:-4px;box-shadow:0 0 0 6px #202020}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    @media(prefers-reduced-motion:reduce){:root{scroll-behavior:auto}}
  </style>
</head>
<body>
  <main class="page-shell" aria-label="AliaFlow website">
    <h1 class="sr-only">AliaFlow - Your trusted leadership partner</h1>
    <div class="figma-page">
      ${slices}
      <span class="scroll-anchor" id="home" style="top:0"></span>
      <span class="scroll-anchor" id="products" style="top:22.55%"></span>
      <span class="scroll-anchor" id="packages" style="top:36.06%"></span>
      <span class="scroll-anchor" id="thrivable-business" style="top:23.74%"></span>
      <span class="scroll-anchor" id="business-leadership" style="top:41.61%"></span>
      <span class="scroll-anchor" id="technocratic-design" style="top:59.89%"></span>
      <span class="scroll-anchor" id="projects" style="top:76.62%"></span>
      <span class="scroll-anchor" id="execution-management" style="top:76.62%"></span>
      <span class="scroll-anchor" id="about" style="top:79.47%"></span>
      <span class="scroll-anchor" id="contact" style="top:98.88%"></span>
      <nav class="nav-hotspots" aria-label="Primary navigation">
        <a class="hotspot" href="#home" aria-label="Home" title="Home" style="left:51.736%;width:5.417%"></a>
        <a class="hotspot" href="#products" aria-label="Products" title="Products" style="left:57.778%;width:7.222%"></a>
        <a class="hotspot" href="#packages" aria-label="Packages" title="Packages" style="left:65.556%;width:7.5%"></a>
        <a class="hotspot" href="#projects" aria-label="Projects" title="Projects" style="left:73.819%;width:7.083%"></a>
        <a class="hotspot" href="#about" aria-label="About us" title="About us" style="left:81.319%;width:7.5%"></a>
        <a class="hotspot" href="#contact" aria-label="Contact us" title="Contact us" style="left:89.167%;width:8.611%"></a>
      </nav>
      <nav class="catalogue-hotspots" aria-label="Service catalogue">
        <a class="hotspot" href="#thrivable-business" aria-label="Thrivable Business" title="Thrivable Business" style="left:5.556%;width:19.861%"></a>
        <a class="hotspot" href="#business-leadership" aria-label="Business Leadership" title="Business Leadership" style="left:27.014%;width:20.833%"></a>
        <a class="hotspot" href="#technocratic-design" aria-label="Technocratic Design" title="Technocratic Design" style="left:49.514%;width:20.278%"></a>
        <a class="hotspot" href="#execution-management" aria-label="Execution Management" title="Execution Management" style="left:71.389%;width:22.778%"></a>
      </nav>
    </div>
  </main>
</body>
</html>`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "aliaflow-figma-exact.html"), html);
