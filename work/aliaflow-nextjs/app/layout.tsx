import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Aliaflow — Your Trusted Leadership Partner",
  description: "A componentized reconstruction of the Aliaflow experience.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Aliaflow — Your Trusted Leadership Partner",
    description: "Leadership partner for desirable, competitive and scalable businesses.",
    images: [{ url: "/assets/aliaflow-logo.svg", width: 139, height: 114, alt: "Aliaflow" }],
  },
  twitter: {
    card: "summary",
    images: ["/assets/aliaflow-logo.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
