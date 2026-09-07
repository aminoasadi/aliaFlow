import Image from "next/image";

const team = [
  ["/assets/ehteshamzadeh.png", "S. Ehteshamzadeh", "Strategic Design"],
  ["/assets/daem.png", "V. Daem", "Business Leadership"],
  ["/assets/mohit.png", "N. Mohit", "Experience Innovation"],
  ["/assets/tavakoli.png", "N. Tavakoli", "Transformation"],
];

export function TrustSection() {
  return <section id="about-us" className="trust section-light">
    <div className="section-heading"><p className="eyebrow">WHY CHOOSE US?</p><h2>Enabling business thrivability through technocratic innovation</h2></div>
    <div className="trust-grid"><article><span>01</span><h3>DIFFERENT</h3><p>We recognize the needs that are about to matter.</p></article><article><span>02</span><h3>COMPETITIVE</h3><p>We translate strategic intent into operating advantage.</p></article><article><span>03</span><h3>SCALABLE</h3><p>We design change to live beyond the launch.</p></article></div>
    <div className="team-heading"><p className="eyebrow">THE PEOPLE BEHIND ALIAFLOW</p><h2>One team.<br />Many perspectives.</h2></div>
    <div className="team-list">{team.map(([image, name, role]) => <article className="team-member" key={name}><div><Image src={image} alt={name} fill sizes="(max-width: 780px) 45vw, 25vw" /></div><h3>{name}</h3><p>{role}</p></article>)}</div>
  </section>;
}
