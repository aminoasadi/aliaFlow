export type Outcome = {
  label: string;
  emphasis: string;
  copy: string;
  image: string;
  stats: { value: string }[];
};

export function OutcomePanel({ outcome, index }: { outcome: Outcome; index: number }) {
  const short = outcome.label.replace("is ", "");

  return (
    <>
      <article className={`fig-outcome outcome-title-${index + 1}`}>
        <div className="fig-outcome-screen fig-outcome-title"><p>is<br />{short}<br />but we make it</p><h3>{outcome.emphasis}</h3></div>
      </article>
      <article className={`fig-outcome outcome-${index + 1}`}>
        <div className="fig-outcome-screen fig-outcome-detail">
          <div className="circle-field" aria-hidden>{Array.from({ length: 60 }).map((_, dot) => <i key={dot} />)}</div>
          <div className="detail-placeholder"><img src={outcome.image} alt="" /></div>
          <div className="outcome-detail">
            <p className="outcome-label">Not only</p>
            <h4>{short.toUpperCase()},</h4>
            <p className="outcome-label">but also</p>
            <h4>{outcome.emphasis}</h4>
            <p className="outcome-copy">{outcome.copy}</p>
          </div>
        </div>
      </article>
    </>
  );
}
