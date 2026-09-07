import Image from "next/image";
import { projects } from "../data/site";

export function ProjectLoop() {
  return <section id="projects" className="project-loop section-dark">
    <div className="section-heading inverse"><p className="eyebrow">OUR ECOSYSTEM</p><h2>WE MAKE<br />IDEAS REAL.</h2><p>Distinct ventures, one shared belief: businesses thrive when value is desirable, feasible and viable.</p></div>
    <div className="project-list">{projects.map((project) => <article className="project-card" key={project.name}><Image src={project.image} alt={`${project.name} strategic loop`} width={380} height={390} /><div><h3>{project.name}</h3><p>{project.subtitle}</p><a href="#contact-us">View project ↗</a></div></article>)}</div>
  </section>;
}
