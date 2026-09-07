"use client";

import { useState } from "react";

const links = ["Home", "Products", "Packages", "Projects", "About us", "Contact us"];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Aliaflow home">ALIAFLOW</a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-nav">Menu</button>
      <nav id="site-nav" className={open ? "nav-list open" : "nav-list"} aria-label="Primary navigation">
        {links.map((link) => <a key={link} href={`#${link.toLowerCase().replaceAll(" ", "-")}`}>{link}</a>)}
      </nav>
    </header>
  );
}
