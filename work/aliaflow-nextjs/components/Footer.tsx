export type FooterData = {
  eyebrow: string;
  heading_line1: string;
  heading_emphasis: string;
  email: string;
  description: string;
  social_links: { label: string; href: string }[];
  copyright: string;
};

export function Footer({ eyebrow, heading_line1, heading_emphasis, email, description, social_links, copyright }: FooterData) {
  return (
    <footer id="contact-us" className="footer section-dark">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{heading_line1}<br /><em>{heading_emphasis}</em></h2>
        <a href={`mailto:${email}`} className="cta">{email} <span>&#8599;</span></a>
      </div>
      <div className="footer-meta">
        <a className="wordmark" href="#home">ALIAFLOW</a>
        <p>{description}</p>
        <div>
          {social_links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
        </div>
        <small>{copyright}</small>
      </div>
    </footer>
  );
}
