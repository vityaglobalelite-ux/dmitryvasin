import { ContactSection } from "@/components/landing/ContactSection";
import { CourseSection } from "@/components/landing/CourseSection";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { LifehacksSection } from "@/components/landing/LifehacksSection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { ServicesSection } from "@/components/landing/ServicesSection";

export default function Home() {
  return (
    <div className="page-enter min-h-full bg-[#090808]">
      <Header />
      <main>
        <HeroSection />
        <LifehacksSection />
        <CourseSection />
        <ServicesSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
