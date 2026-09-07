import { Footer, type FooterData } from "../components/Footer";
import { Header, type HeaderData } from "../components/Header";
import { Hero, type HeroData } from "../components/Hero";
import { OutcomeStack } from "../components/OutcomeStack";
import type { Outcome } from "../components/OutcomePanel";
import {
  BusinessLeadership,
  ExecutionManagement,
  PortfolioAndPeople,
  ServiceCatalogueNav,
  TechnocraticDesign,
  TestimonialsAndFooter,
  WhyChooseUs,
} from "../components/FigmaSections";
import { ThrivableBusiness, type ThrivableBusinessData } from "../components/ThrivableBusiness";
import { getSection } from "../lib/sections";

async function requireSection<T>(key: string): Promise<T> {
  const data = await getSection(key);
  if (!data) throw new Error(`Section "${key}" is not seeded. Run \`npm run seed\`.`);
  return data as T;
}

export default async function Home() {
  const [
    header,
    hero,
    outcomes,
    serviceCatalogueNav,
    thrivableBusiness,
    businessLeadership,
    technocraticDesign,
    executionManagement,
    whyChooseUs,
    portfolioPeople,
    testimonialsFooter,
    footer,
  ] = await Promise.all([
    requireSection<HeaderData>("header"),
    requireSection<HeroData>("hero"),
    requireSection<{ intro_heading: string; items: Outcome[]; manifesto_heading: string; manifesto_words: string }>("outcomes"),
    requireSection<{ heading: string; tabs: { number: string; label: string }[] }>("service-catalogue-nav"),
    requireSection<ThrivableBusinessData>("thrivable-business"),
    requireSection<Parameters<typeof BusinessLeadership>[0]>("business-leadership"),
    requireSection<Parameters<typeof TechnocraticDesign>[0]>("technocratic-design"),
    requireSection<Parameters<typeof ExecutionManagement>[0]>("execution-management"),
    requireSection<Parameters<typeof WhyChooseUs>[0]>("why-choose-us"),
    requireSection<Parameters<typeof PortfolioAndPeople>[0]>("portfolio-people"),
    requireSection<Parameters<typeof TestimonialsAndFooter>[0]>("testimonials-footer"),
    requireSection<FooterData>("footer"),
  ]);

  return (
    <main>
      <Header {...header} />
      <Hero {...hero} />
      <OutcomeStack
        introHeading={outcomes.intro_heading}
        outcomes={outcomes.items}
        manifestoHeading={outcomes.manifesto_heading}
        manifestoWords={outcomes.manifesto_words}
      />
      <ServiceCatalogueNav {...serviceCatalogueNav} />
      <ThrivableBusiness {...thrivableBusiness} />
      <BusinessLeadership {...businessLeadership} />
      <TechnocraticDesign {...technocraticDesign} />
      <ExecutionManagement {...executionManagement} />
      <WhyChooseUs {...whyChooseUs} />
      <PortfolioAndPeople {...portfolioPeople} />
      <TestimonialsAndFooter {...testimonialsFooter} />
      <Footer {...footer} />
    </main>
  );
}
