import Image from "next/image";

export function Pillar({ number, title, question, words, image, reverse = false }: { number: string; title: string; question: string; words: string[]; image: string; reverse?: boolean }) {
  return <section className={reverse ? "pillar reverse" : "pillar"}>
    <div className="pillar-image"><Image src={image} alt="" fill sizes="(max-width: 780px) 100vw, 48vw" /></div>
    <div className="pillar-copy"><span className="section-number">{number}</span><p className="eyebrow">{title}</p><h2>{question}</h2><div className="word-stack">{words.map((word) => <span key={word}>{word}</span>)}</div><p>We combine business-led insight with creative experimentation to make change understandable, actionable and measurable.</p></div>
  </section>;
}
