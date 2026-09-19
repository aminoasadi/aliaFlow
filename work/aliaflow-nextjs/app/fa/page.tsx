import type { Metadata } from "next";
import { SitePage } from "../../components/SitePage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الیافلو — شریک قابل اعتماد شما در رهبری کسب‌وکار",
  description: "شریک رهبری برای ساختن کسب‌وکارهای خواستنی، رقابت‌پذیر و مقیاس‌پذیر.",
  alternates: { canonical: "/fa", languages: { en: "/", fa: "/fa" } },
};

export default function PersianHome() {
  return <SitePage locale="fa" />;
}
