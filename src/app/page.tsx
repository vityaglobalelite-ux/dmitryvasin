import { CountdownSection } from "@/components/landing/CountdownSection";
import { DirectionsSection } from "@/components/landing/DirectionsSection";
import { FigCanvas } from "@/components/landing/FigCanvas";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { LessonsSection } from "@/components/landing/LessonsSection";
import { MobileYShift } from "@/components/landing/MobileYShift";
import { MyViewSection } from "@/components/landing/MyViewSection";
import { NoticedSection } from "@/components/landing/NoticedSection";
import { PaymentSection } from "@/components/landing/PaymentSection";
import { ProgramSection } from "@/components/landing/ProgramSection";
import { QuoteVideoSection } from "@/components/landing/QuoteVideoSection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { TariffsSection } from "@/components/landing/TariffsSection";
import { TelegramSection } from "@/components/landing/TelegramSection";
import { MOBILE_GAP_SHIFT } from "@/lib/mobile-section-gaps";
import { ProgramTail } from "@/lib/program-tail";

export default function Home() {
  return (
    <FigCanvas>
      <HeroSection />
      <NoticedSection />

      {/* Air between Noticed gray band and Quote rounded block */}
      <MobileYShift y={MOBILE_GAP_SHIFT.quote}>
        <QuoteVideoSection />
      </MobileYShift>

      <MobileYShift y={MOBILE_GAP_SHIFT.myViewAndDirections}>
        <MyViewSection />
        <DirectionsSection />
      </MobileYShift>

      <MobileYShift y={MOBILE_GAP_SHIFT.programAndLessons}>
        <ProgramSection />
      </MobileYShift>

      <ProgramTail>
        <MobileYShift y={MOBILE_GAP_SHIFT.programAndLessons}>
          <LessonsSection />
        </MobileYShift>
        <MobileYShift y={MOBILE_GAP_SHIFT.telegram}>
          <TelegramSection />
        </MobileYShift>
        <MobileYShift y={MOBILE_GAP_SHIFT.tariffsAndCountdown}>
          <TariffsSection />
          <CountdownSection />
        </MobileYShift>
        <MobileYShift y={MOBILE_GAP_SHIFT.payment}>
          <PaymentSection />
        </MobileYShift>
        <MobileYShift y={MOBILE_GAP_SHIFT.reviews}>
          <ReviewsSection />
        </MobileYShift>
        <MobileYShift y={MOBILE_GAP_SHIFT.footer}>
          <Footer />
        </MobileYShift>
      </ProgramTail>
    </FigCanvas>
  );
}
