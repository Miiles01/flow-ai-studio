import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import { usePageSeo } from "@/hooks/usePageSeo";
import { useHeadTags } from "@/hooks/useHeadTags";
import { langOf, LOCALE_OF } from "@/i18n";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const About = () => {
  const { t, i18n } = useTranslation();
  const localePath = useLocalePath();
  const lang = langOf(i18n.language);
  const pageUrl = `https://miiles.app/${lang}/acerca-de`;
  usePageSeo({ title: t("about.seoTitle"), description: t("about.seoDescription"), robots: "index, follow" });
  useHeadTags({
    canonical: pageUrl,
    alternates: [
      { hreflang: "es", href: "https://miiles.app/es/acerca-de" },
      { hreflang: "en", href: "https://miiles.app/en/acerca-de" },
      { hreflang: "pt", href: "https://miiles.app/pt/acerca-de" },
      { hreflang: "fr", href: "https://miiles.app/fr/acerca-de" },
      { hreflang: "x-default", href: "https://miiles.app/es/acerca-de" },
    ],
    meta: [
      { attr: "property", key: "og:url", content: pageUrl },
      { attr: "property", key: "og:locale", content: LOCALE_OF[lang].replace("-", "_") },
    ],
  }, [lang]);
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    // Inicializar ScrollSmoother
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-about",
      content: "#smooth-content-about",
      smooth: 1.4,
      effects: true,
    });

    // Animación de revelación de líneas (SplitText)
    const runSplit = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-about h1, #smooth-content-about h2, #smooth-content-about h3, #smooth-content-about .reveal-text").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        gsap.fromTo(split.lines, { yPercent: 110 }, {
          yPercent: 0, 
          duration: 1.1, 
          stagger: 0.1, 
          ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    };

    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) {
      fontsReady.then(() => {
        runSplit();
      });
    } else {
      runSplit();
    }

    // Animación de bloques de imagen/tarjetas
    gsap.fromTo(".fade-up", 
      { opacity: 0, y: 40 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.2, 
        ease: "power3.out",
        scrollTrigger: { trigger: ".fade-up", start: "top 85%", once: true }
      }
    );

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      
      <div id="smooth-wrapper-about" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-about" className="bg-white text-black font-sans pb-0">
          
          {/* HERO SECTION */}
          <section className="min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
            <div className="max-w-7xl mx-auto flex flex-col items-center w-full">
              <div className="fade-up w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-12">
                <video 
                  src="https://wearemiiles.com/wp-content/uploads/2026/01/11-4.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              <span className="fade-up text-lg md:text-xl font-normal text-gray-400 mb-6">{t("about.copy.text1")}</span>
              
              <p className="fade-up text-lg md:text-xl font-light text-gray-500 max-w-2xl mx-auto leading-relaxed">{t("about.copy.text2")}</p>
            </div>
          </section>

          {/* NUESTRA MISIÓN */}
          <section className="pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-4xl font-normal tracking-tighter mb-12">{t("about.copy.text3")}</h2>
              <div className="fade-up space-y-4 text-3xl md:text-5xl font-light text-gray-500 leading-snug md:leading-snug">
                <p>{t("about.copy.text4")}</p>
              </div>
            </div>
          </section>



          {/* HISTORIA (STORY) */}
          <section className="py-32 px-6 bg-white">
            <div className="max-w-5xl mx-auto flex flex-col gap-16 items-center">
              <div className="w-full aspect-video rounded-[2rem] overflow-hidden fade-up shadow-2xl">
                <img 
                  src="/miiles-jacket.jpg" 
                  alt={t("about.copy.text5")} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col max-w-3xl">
                <div className="fade-up space-y-6 text-lg font-light text-gray-600 leading-normal text-center md:text-left">
                  <p>
                    <span className="text-black font-normal">{t("about.copy.text6")}</span>{t("about.copy.text7")}</p>
                  <p>{t("about.copy.text8")}</p>
                  <p>{t("about.copy.text9")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="py-40 px-6">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <h2 className="pt-2 text-5xl md:text-8xl font-normal tracking-tighter mb-12 leading-[1.2] md:leading-[1.2]">{t("about.copy.text10")} <span className="pr-2 md:pr-4" style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>{t("about.copy.text11")}</span>
              </h2>
              <Link
                to={localePath("/register")}
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-black text-white text-base font-light hover:-translate-y-2 transition-transform duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                </svg>{t("about.copy.text12")}</Link>
            </div>
          </section>

          <LandingFooter />

          {/* Distintivo de directorio — discreto, al final de la página */}
          <div className="bg-white pb-10 flex justify-center">
            <a
              href="https://affylist.com/products/miiles"
              title="Listed on AffyList"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block opacity-45 hover:opacity-100 transition-opacity duration-300"
            >
              <img
                src="https://affylist.com/badge/affylist-v1-light.svg"
                alt="Listed on AffyList"
                width={140}
                height={38}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).closest("a")?.setAttribute("hidden", "");
                }}
                className="h-auto w-[140px] max-w-full block"
              />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
