export function ArticleBody({
  lead,
  sections,
  keyPoints,
}: {
  lead: string;
  sections: { heading: string; body: string }[];
  keyPoints: { title: string; body: string }[];
}) {
  return (
    <>
      {lead ? <p className="card-article-lead">{lead}</p> : null}
      {sections.length > 0 ? (
        <div className="card-article-body">
          {sections.map((entry) => (
            <section key={entry.heading || entry.body.slice(0, 32)}>
              {entry.heading ? <h2>{entry.heading}</h2> : null}
              <p>{entry.body}</p>
            </section>
          ))}
        </div>
      ) : null}
      {keyPoints.length > 0 ? (
        <div className="card-article-points">
          {keyPoints.map((point, index) => (
            <article key={point.title || index}>
              <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
