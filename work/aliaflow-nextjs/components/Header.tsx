"use client";

import { useState } from "react";

export type HeaderData = {
  wordmark: string;
  links: { label: string }[];
};

export function Header({ wordmark, links }: HeaderData) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label={`${wordmark} home`}><img src="/assets/aliaflow-logo.svg" alt={wordmark} /></a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-nav">Menu</button>
      <nav id="site-nav" className={open ? "nav-list open" : "nav-list"} aria-label="Primary navigation">
        {links.map((link) => (
          <a key={link.label} href={`#${link.label.toLowerCase().replaceAll(" ", "-")}`}>{link.label}</a>
        ))}
      </nav>
    </header>
  );
}
