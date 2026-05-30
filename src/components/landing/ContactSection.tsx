import Image from "next/image";
import { assets } from "@/lib/assets";

export function ContactSection() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#090808] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <Image
          src={assets.contactPhoto}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 md:px-6">
        <h2 className="text-center text-4xl font-black uppercase text-white md:text-6xl">
          Обратная связь
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-white/80 md:text-xl">
          *задать вопрос/отправить предложение по улучшению сайта
        </p>

        <form
          className="mx-auto mt-10 max-w-[340px] space-y-6"
          action="#"
          method="post"
        >
          <label className="block">
            <span className="sr-only">Email</span>
            <input
              type="email"
              name="email"
              required
              placeholder="Эл.почта"
              className="w-full rounded-full border border-[#824141] bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-[#eb0b0b]"
            />
          </label>
          <label className="block">
            <span className="sr-only">Имя</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Имя"
              className="w-full rounded-full border border-[#824141] bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-[#eb0b0b]"
            />
          </label>
          <label className="block">
            <span className="sr-only">Комментарий</span>
            <input
              type="text"
              name="comment"
              placeholder="Комментарий"
              className="w-full rounded-full border border-[#824141] bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-[#eb0b0b]"
            />
          </label>
          <label className="flex items-start gap-3 text-xs text-white">
            <input
              type="checkbox"
              name="privacy"
              required
              className="mt-1 accent-[#eb0b0b]"
            />
            <span>
              Я согласен/согласна с{" "}
              <a href="/politika" className="underline">
                политикой конфиденциальности
              </a>{" "}
              и{" "}
              <a href="/oferta" className="underline">
                договором оферты
              </a>
            </span>
          </label>
          <button
            type="submit"
            className="btn-primary flex min-h-[70px] w-full items-center justify-center rounded-full text-base font-semibold uppercase"
          >
            Отправить
          </button>
        </form>
      </div>
    </section>
  );
}
