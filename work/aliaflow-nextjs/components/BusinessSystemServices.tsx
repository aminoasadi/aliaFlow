type Service = {
  number: string;
  title: string;
  body: string;
  detail: string;
};

export type BusinessSystemServicesData = {
  eyebrow: string;
  heading: string;
  intro: string;
  services: Service[];
};

export function BusinessSystemServices({ eyebrow, heading, intro, services }: BusinessSystemServicesData) {
  return (
    <section className="business-system-services" aria-labelledby="business-system-services-title">
      <div className="business-system-services__cap" aria-hidden="true" />
      <header className="business-system-services__intro">
        <p>{eyebrow}</p>
        <h2 id="business-system-services-title">{heading}</h2>
        <span>{intro}</span>
      </header>
      <div className="business-system-services__grid">
        {services.map((service) => (
          <article className="business-system-service" key={service.number}>
            <div className="business-system-service__topline"><span>{service.number}</span><i aria-hidden="true" /></div>
            <div className="business-system-service__copy">
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </div>
            <small>{service.detail}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
