import type { Metadata } from "next";
import "./globals.css";
import "./figma-overrides.css";
import "./dafic.css";

export const metadata: Metadata = {
  title: "Aliaflow — Your Trusted Leadership Partner",
  description: "A componentized reconstruction of the Aliaflow experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
