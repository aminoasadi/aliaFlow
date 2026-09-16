import Image from "next/image";
import Link from "next/link";
import type { CardPageSection } from "../../lib/card-pages";

export function ArticleHeader({
  section,
  label,
  title,
  heroImage,
  heroAlt,
}: {
  section: CardPageSection;
  label: string;
  title: string;
  heroImage: string;
  heroAlt: string;
}) {
  return (
    <header className="card-article-header">
      <nav className="card-article-crumbs" aria-label="Breadcrumb">
        <Link href="/">Aliaflow</Link>
        <span aria-hidden="true">/</span>
        <Link href={section.anchor}>{section.label}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>
      <div className="card-article-title-band">
        {label ? <p className="card-article-label">{label}</p> : null}
        <h1>{title}</h1>
      </div>
      {heroImage ? (
        <div className="card-article-hero">
          <Image src={heroImage} alt={heroAlt} fill sizes="100vw" priority />
        </div>
      ) : null}
    </header>
  );
}
