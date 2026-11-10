import { ApplicationsSection } from "@/components/gypsos/applications-section";
import { BenefitsSection } from "@/components/gypsos/benefits-section";
import { BrandIntro } from "@/components/gypsos/brand-intro";
import { ContactSection } from "@/components/gypsos/contact-section";
import { CoreValues } from "@/components/gypsos/core-values";
import { CostCalculator } from "@/components/gypsos/cost-calculator";
import { DirectorsSection } from "@/components/gypsos/directors-section";
import { FloatingNav } from "@/components/gypsos/floating-nav";
import { GypsumHistory } from "@/components/gypsos/gypsum-history";
import { MetricsSection } from "@/components/gypsos/metrics-section";
import { ProductSection } from "@/components/gypsos/product-section";
import { VisionMission } from "@/components/gypsos/vision-mission";
import { WhyGypsos } from "@/components/gypsos/why-gypsos";
import { PyramidHero } from "@/components/hero/pyramid-hero";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <FloatingNav />
      <main>
        <PyramidHero />
        <CostCalculator />
        <BrandIntro />
        <MetricsSection />
        <WhyGypsos />
        <GypsumHistory />
        <ProductSection />
        <BenefitsSection />
        <ApplicationsSection />
        <DirectorsSection />
        <VisionMission />
        <CoreValues />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
