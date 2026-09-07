import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { OutcomeStack } from "../components/OutcomeStack";
import { ServiceCatalogue } from "../components/ServiceCatalogue";
import {
  BusinessLeadership,
  ExecutionManagement,
  PortfolioAndPeople,
  ServiceCatalogueNav,
  TechnocraticDesign,
  TestimonialsAndFooter,
  WhyChooseUs,
} from "../components/FigmaSections";
import { ThrivableBusiness } from "../components/ThrivableBusiness";
import { outcomes } from "../data/site";

export default function Home() {
  return <main>
    <Header />
    <Hero />
    <OutcomeStack outcomes={outcomes} />
    <ServiceCatalogueNav />
    <ThrivableBusiness />
    <BusinessLeadership />
    <TechnocraticDesign />
    <ExecutionManagement />
    <WhyChooseUs />
    <PortfolioAndPeople />
    <TestimonialsAndFooter />
    <Footer />
  </main>;
}
