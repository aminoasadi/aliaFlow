export type FooterData = {
  logo: string;
  logo_alt: string;
  home_href: string;
  eyebrow: string;
  heading_line1: string;
  heading_emphasis: string;
  email: string;
  description: string;
  social_links: { label: string; href: string }[];
  copyright: string;
};

export function Footer({ logo, logo_alt, home_href, eyebrow, heading_line1, heading_emphasis, email, description, social_links, copyright, locale = "en" }: FooterData & { locale?: "en" | "fa" }) {
  return (
    <footer id="contact-us" className="footer section-dark">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{heading_line1}<br /><em>{heading_emphasis}</em></h2>
        <a href={`mailto:${email}`} className="cta" dir="ltr">{email} <span>&#8599;</span></a>
      </div>
      <div className="footer-meta">
        <a className="wordmark" href={home_href} aria-label={locale === "fa" ? `خانهٔ ${logo_alt}` : `${logo_alt} home`}><img src={logo} alt={logo_alt} /></a>
        <p>{description}</p>
        <div>
          {social_links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
        </div>
        <small>{copyright}</small>
      </div>
    </footer>
  );
}
