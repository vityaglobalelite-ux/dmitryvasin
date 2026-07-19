import { CountdownSection } from "@/components/landing/CountdownSection";
import { DirectionsSection } from "@/components/landing/DirectionsSection";
import { FigCanvas } from "@/components/landing/FigCanvas";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { LessonsSection } from "@/components/landing/LessonsSection";
import { MyViewSection } from "@/components/landing/MyViewSection";
import { NoticedSection } from "@/components/landing/NoticedSection";
import { PaymentSection } from "@/components/landing/PaymentSection";
import { ProgramSection } from "@/components/landing/ProgramSection";
import { QuoteVideoSection } from "@/components/landing/QuoteVideoSection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { TariffsSection } from "@/components/landing/TariffsSection";
import { TelegramSection } from "@/components/landing/TelegramSection";
import { ProgramTail } from "@/lib/program-tail";

export default function Home() {
  return (
    <FigCanvas>
      <HeroSection />
      <NoticedSection />
      <QuoteVideoSection />
      <MyViewSection />
      <DirectionsSection />
      <ProgramSection />
      <ProgramTail>
        <LessonsSection />
        <TelegramSection />
        <TariffsSection />
        <CountdownSection />
        <PaymentSection />
        <ReviewsSection />
        <Footer />
      </ProgramTail>
    </FigCanvas>
  );
}
