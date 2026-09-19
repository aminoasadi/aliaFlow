export type Outcome = {
  label: string;
  emphasis: string;
  copy: string;
  image: string;
  image_alt: string;
  stats: { value: string }[];
};

export function OutcomePanel({ outcome, index, titleEyebrow, titlePrefix, titleSuffix, detailPrefix, detailConnector }: { outcome: Outcome; index: number; titleEyebrow: string; titlePrefix: string; titleSuffix: string; detailPrefix: string; detailConnector: string }) {
  const short = outcome.label.toLowerCase().startsWith(`${titlePrefix.toLowerCase()} `)
    ? outcome.label.slice(titlePrefix.length).trim()
    : outcome.label;
  const comma = /[\u0600-\u06ff]/.test(short) ? "،" : ",";

  return (
    <>
      <article className={`fig-outcome outcome-title-${index + 1}`}>
        <div className="fig-outcome-screen fig-outcome-title">
          <p className="fig-outcome-title__eyebrow">{titleEyebrow}</p>
          <p>{titlePrefix}<br />{short}<br />{titleSuffix}</p>
          <h3>{outcome.emphasis}</h3>
        </div>
      </article>
      <article className={`fig-outcome outcome-${index + 1}`}>
        <div className="fig-outcome-screen fig-outcome-detail">
          <div className="circle-field" aria-hidden>{Array.from({ length: 60 }).map((_, dot) => <i key={dot} />)}</div>
          <div className="detail-placeholder"><img src={outcome.image} alt={outcome.image_alt} /></div>
          <div className="outcome-detail">
            <p className="outcome-label">{detailPrefix}</p>
            <h4>{short.toLocaleUpperCase()}{comma}</h4>
            <p className="outcome-label">{detailConnector}</p>
            <h4>{outcome.emphasis}</h4>
            <p className="outcome-copy">{outcome.copy}</p>
          </div>
        </div>
      </article>
    </>
  );
}
