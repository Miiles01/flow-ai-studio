import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";

type BuildCard = { title: string; desc: string; cta: string; image: string; alt: string; href: string };
type Plan = { name: string; price: string; unit: string; note?: string; intro: string; features: string[]; cta: string };
type Faq = { q: string; a: string[] };

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.3 2.3 4.7-5" />
  </svg>
);

const CircleArrow = ({ open }: { open: boolean }) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 7v10M7.5 12.5L12 17l4.5-4.5" />
  </svg>
);

/** Secciones del home debajo del hero: qué puedes crear, planes y preguntas frecuentes.
 *  `beforeFaq` se muestra entre los planes y las preguntas. */
const HomeSections = ({ beforeFaq }: { beforeFaq?: ReactNode }) => {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const [openFaq, setOpenFaq] = useState(0);

  const cards = t("landing.build_cards", { returnObjects: true }) as BuildCard[];
  const plans = t("landing.plans", { returnObjects: true }) as Plan[];
  const faqs = t("landing.faq_items", { returnObjects: true }) as Faq[];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.join(" ") },
    })),
  };

  return (
    <>
      {/* ¿QUÉ VAS A CREAR? */}
      <section aria-labelledby="build-title" className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <h2 id="build-title" className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] text-black">
            {t("landing.build_title")}
          </h2>
          <p data-anim-heading className="mt-5 text-lg md:text-xl font-light text-black/70 max-w-2xl">
            {t("landing.build_subtitle")}
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <article
                key={card.title}
                data-anim-heading
                className="flex flex-col rounded-[24px] bg-[#F7F7F8] overflow-hidden"
              >
                <div className="px-7 pt-7">
                  <h3 className="text-3xl md:text-[34px] font-normal tracking-tight leading-tight text-black">{card.title}</h3>
                </div>
                <div className="flex-1 flex items-center justify-center px-7 py-6">
                  <img
                    src={card.image}
                    alt={card.alt}
                    loading="lazy"
                    width={1324}
                    height={1664}
                    className="w-full max-w-[260px] h-auto object-contain"
                  />
                </div>
                <div className="px-7 pb-7">
                  <p className="text-[15px] font-light leading-relaxed text-black/75">{card.desc}</p>
                  <Link
                    to={card.href}
                    className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-black text-white text-sm font-normal hover:bg-miiles-pink hover:text-black transition-colors duration-300"
                  >
                    {card.cta}
                  </Link>
                </div>
                <div aria-hidden className="h-1.5 bg-miiles-blue" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ELIGE TU PLAN */}
      <section aria-labelledby="plans-title" className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-12 lg:gap-16 items-start">
          <div>
            <h2 id="plans-title" className="text-6xl md:text-8xl font-normal tracking-tight leading-[0.95] text-black">
              {t("landing.plans_title")}
            </h2>
            <p data-anim-heading className="mt-8 text-xl md:text-2xl font-light text-black/75 leading-snug max-w-sm">
              {t("landing.plans_subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {plans.map((plan, i) => {
              const featured = i === 1;
              return (
                <article
                  key={plan.name}
                  data-anim-heading
                  className={`rounded-[24px] p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 ${
                    featured ? "bg-miiles-blue text-white" : "bg-white text-black shadow-[0_20px_60px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
                  }`}
                >
                  <div className="flex flex-col">
                    <h3 className="text-2xl md:text-3xl font-normal tracking-tight">{plan.name}</h3>
                    <p className="mt-3 flex items-baseline gap-2">
                      <span className="text-6xl md:text-7xl font-normal tracking-tight leading-none">{plan.price}</span>
                      <span className={`text-lg font-light ${featured ? "text-white/80" : "text-black/60"}`}>{plan.unit}</span>
                    </p>
                    {plan.note && (
                      <p className={`mt-3 text-sm font-light ${featured ? "text-white/80" : "text-black/60"}`}>{plan.note}</p>
                    )}
                    <Link
                      to={i === 0 ? "/register?next=/boards" : localePath("/precios")}
                      className={`mt-8 self-start inline-flex items-center px-6 py-3 rounded-full text-sm font-normal transition-colors duration-300 ${
                        featured ? "bg-black text-white hover:bg-white hover:text-black" : "bg-black text-white hover:bg-miiles-pink hover:text-black"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                  <div>
                    <p className={`text-[15px] font-light ${featured ? "text-white/90" : "text-black/70"}`}>{plan.intro}</p>
                    <ul className="mt-5 flex flex-col gap-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-[15px] font-light">
                          <CheckIcon />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {beforeFaq}

      {/* PREGUNTAS FRECUENTES */}
      <section aria-labelledby="faq-title" className="px-6 py-24 md:py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-12 lg:gap-16 items-start">
          <h2 id="faq-title" className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.02] text-black">
            {t("landing.faq_title")}
          </h2>

          <div className="border-t border-solid border-black">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              const panelId = `faq-panel-${i}`;
              return (
                <div key={faq.q} className="border-b border-solid border-black">
                  <h3 className="no-split">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between gap-6 py-7 text-left text-2xl md:text-[28px] font-normal tracking-tight text-black"
                    >
                      {faq.q}
                      <CircleArrow open={open} />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-500 ease-nav-morph ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="pb-8 pr-12 flex flex-col gap-5">
                        {faq.a.map((p) => (
                          <p key={p} className="text-base md:text-[17px] font-light leading-relaxed text-black/80">
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </section>
    </>
  );
};

export default HomeSections;
