import { Footer, type FooterData } from "./Footer";
import { BriefForm } from "./BriefForm";
import { Header, type HeaderData } from "./Header";
import { Hero, type HeroData } from "./Hero";
import { OutcomeStack } from "./OutcomeStack";
import type { Outcome } from "./OutcomePanel";
import {
  BusinessLeadership, ExecutionManagement, PortfolioAndPeople, ServiceCatalogueNav,
  TechnocraticDesign, TestimonialsAndFooter, WhyChooseUs, WhyTrustUs,
} from "./FigmaSections";
import { ThrivableBusiness, type ThrivableBusinessData } from "./ThrivableBusiness";
import { BusinessSystemServices, type BusinessSystemServicesData } from "./BusinessSystemServices";
import { getSection } from "../lib/sections";
import type { SiteLocale } from "../lib/locales";

async function requireSection<T>(key: string, locale: SiteLocale): Promise<T> {
  const data = await getSection(key, locale);
  if (!data) throw new Error(`Section "${key}" is not seeded. Run \`npm run seed\`.`);
  return data as T;
}

type OutcomesData = {
  intro_heading: string; title_eyebrow: string; items: Outcome[]; manifesto_heading: string;
  manifesto_words: string; manifesto_shape: string; title_prefix: string; title_suffix: string;
  detail_prefix: string; detail_connector: string;
};

export async function SitePage({ locale }: { locale: SiteLocale }) {
  const [header, hero, outcomes, serviceCatalogueNav, businessSystemServices, thrivableBusiness, businessLeadership,
    technocraticDesign, executionManagement, whyChooseUs, portfolioPeople, testimonialsFooter, footer] = await Promise.all([
    requireSection<HeaderData>("header", locale), requireSection<HeroData>("hero", locale), requireSection<OutcomesData>("outcomes", locale),
    requireSection<{ heading: string; tabs: { number: string; label: string }[] }>("service-catalogue-nav", locale),
    requireSection<BusinessSystemServicesData>("business-system-services", locale), requireSection<ThrivableBusinessData>("thrivable-business", locale),
    requireSection<Parameters<typeof BusinessLeadership>[0]>("business-leadership", locale),
    requireSection<Parameters<typeof TechnocraticDesign>[0]>("technocratic-design", locale),
    requireSection<Parameters<typeof ExecutionManagement>[0]>("execution-management", locale),
    requireSection<Parameters<typeof WhyChooseUs>[0]>("why-choose-us", locale),
    requireSection<Parameters<typeof PortfolioAndPeople>[0]>("portfolio-people", locale),
    requireSection<Parameters<typeof TestimonialsAndFooter>[0] & { trust_heading: string; trust_subheading: string }>("testimonials-footer", locale),
    requireSection<FooterData>("footer", locale),
  ]);

  return <main className={locale === "fa" ? "site-shell site-shell--fa" : "site-shell"} lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
    <Header {...header} locale={locale} />
    <Hero {...hero} />
    <OutcomeStack
      introHeading={outcomes.intro_heading} titleEyebrow={outcomes.title_eyebrow} outcomes={outcomes.items}
      manifestoHeading={outcomes.manifesto_heading} manifestoWords={outcomes.manifesto_words}
      manifestoShape={outcomes.manifesto_shape} titlePrefix={outcomes.title_prefix} titleSuffix={outcomes.title_suffix}
      detailPrefix={outcomes.detail_prefix} detailConnector={outcomes.detail_connector}
    />
    <ServiceCatalogueNav {...serviceCatalogueNav} />
    <BusinessSystemServices {...businessSystemServices} />
    <ThrivableBusiness {...thrivableBusiness} />
    <BusinessLeadership {...businessLeadership} />
    <TechnocraticDesign {...technocraticDesign} />
    <ExecutionManagement {...executionManagement} />
    <WhyChooseUs {...whyChooseUs} />
    <WhyTrustUs heading={testimonialsFooter.trust_heading} subheading={testimonialsFooter.trust_subheading} />
    <PortfolioAndPeople {...portfolioPeople} />
    <TestimonialsAndFooter {...testimonialsFooter} />
    <BriefForm locale={locale} />
    <Footer {...footer} locale={locale} />
  </main>;
}
