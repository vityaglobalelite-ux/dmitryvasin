import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";

const benefits = [
  "Убрать зажимы и дискомфорт",
  "Почувствовать связь с телом",
  "Улучшить координацию движений",
  "Выстроить осанку без напряжения",
  "Танцевать уверенно и с лёгкостью",
  "Стоять устойчивее на своих ногах",
  "Управлять лучше скоростью",
];

export function CourseSection() {
  return (
    <section id="uroki" className="relative overflow-hidden bg-[#090808] py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 md:grid-cols-2 md:px-6">
        <div className="relative min-h-[320px]">
          <Image
            src={assets.courseMask}
            alt="Курс по осанке в танго"
            fill
            className="object-contain object-left"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div>
          <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
            практический Курс{" "}
            <span className="text-[#eb0b0b]">
              «Как танцевать танго без боли и зажимов?»
            </span>{" "}
            <span className="text-[#16c60c]">поможет:</span>
          </h2>

          <ul className="mt-6 space-y-2 text-base text-white md:text-lg">
            {benefits.map((item) => (
              <li key={item}>✅ {item}</li>
            ))}
          </ul>

          <Link
            href="https://dmitryvasin.com/osanka_kurs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-[65px] min-w-[280px] items-center justify-center rounded-full bg-gradient-to-r from-[#15780f] to-[#16c60c] px-8 text-base font-semibold uppercase text-white transition hover:brightness-110"
          >
            подробнее о курсе
          </Link>
        </div>
      </div>
    </section>
  );
}
