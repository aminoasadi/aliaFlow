"use client";

import { useState } from "react";
import type { SiteLocale } from "../lib/locales";

export type HeaderData = {
  wordmark: string;
  logo: string;
  logo_alt: string;
  home_href: string;
  menu_label: string;
  links: { label: string; href: string }[];
};

export function Header({ wordmark, logo, logo_alt, home_href, menu_label, links, locale }: HeaderData & { locale: SiteLocale }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="wordmark" href={home_href} aria-label={locale === "fa" ? `خانهٔ ${wordmark}` : `${wordmark} home`}><img src={logo} alt={logo_alt} /></a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-nav">{menu_label}</button>
      <nav id="site-nav" className={open ? "nav-list open" : "nav-list"} aria-label={locale === "fa" ? "پیمایش اصلی" : "Primary navigation"}>
        {links.map((link) => (
          <a key={`${link.label}-${link.href}`} href={link.href}>{link.label}</a>
        ))}
      </nav>
      <a className="language-switch" href={locale === "fa" ? "/" : "/fa"} hrefLang={locale === "fa" ? "en" : "fa"} aria-label={locale === "fa" ? "View English website" : "مشاهدهٔ نسخهٔ فارسی"}>{locale === "fa" ? "EN" : "فا"}</a>
    </header>
  );
}
