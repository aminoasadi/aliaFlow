import type { Metadata } from "next";
import { prisma } from "../lib/db";
import "./globals.css";
import "./figma-overrides.css";
import "./dafic.css";
import "./manifesto-full-page.css";
import "./outcome-one-circles.css";
import "./catalogue-transition.css";
import "./critical-business-loop.css";
import "./brand-culture.css";
import "./future-image-carousel.css";
import "./why-choose-us.css";
import "./portfolio-timeline.css";

export async function generateMetadata(): Promise<Metadata> {
  const rows = await prisma.setting.findMany();
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title = settings.seoTitle || settings.siteName || "Aliaflow";
  const description = settings.seoDescription || "";
  const image = settings.seoImage || "/icon.svg";
  const imageAlt = settings.seoImageAlt || settings.siteName || "";

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
    openGraph: { title, description, images: [{ url: image, alt: imageAlt }] },
    twitter: { card: "summary", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
