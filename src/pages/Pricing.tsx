import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import PricingTable from "@/components/PricingTable";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePageSeo } from "@/hooks/usePageSeo";
import { useHeadTags } from "@/hooks/useHeadTags";

// Registro de plugins de GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const Pricing = () => {
  const { t, i18n } = useTranslation();
  // SEO propio de la página de precios (antes heredaba el título de otra página)
  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const pageUrl = `https://miiles.app/${lang}/precios`;
  usePageSeo({ title: t("pricing.seoTitle"), description: t("pricing.seoDescription"), robots: "index, follow" });
  const planesSeo = t("pricing.plans", { returnObjects: true }) as { id: string; name: string; description: string; prices?: Record<"MXN" | "USD", { monthly: string; annual: string }> }[];
  const monedaSeo = lang === "en" ? "USD" : "MXN";
  useHeadTags({
    canonical: pageUrl,
    alternates: [
      { hreflang: "es", href: "https://miiles.app/es/precios" },
      { hreflang: "en", href: "https://miiles.app/en/precios" },
      { hreflang: "x-default", href: "https://miiles.app/es/precios" },
    ],
    meta: [
      { attr: "property", key: "og:url", content: pageUrl },
      { attr: "property", key: "og:locale", content: lang === "en" ? "en_US" : "es_MX" },
    ],
    // Planes con precio (Gratis y Pro, mensual y anual) para que Google entienda la página
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Miiles",
      url: "https://miiles.app",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: t("pricing.seoDescription"),
      inLanguage: lang === "en" ? "en-US" : "es-MX",
      offers: planesSeo.filter((p) => p.prices).flatMap((p) => {
        const pr = p.prices![monedaSeo];
        const base = { "@type": "Offer", priceCurrency: monedaSeo, url: pageUrl, description: p.description };
        return pr.monthly === "0"
          ? [{ ...base, name: p.name, price: "0" }]
          : [
              { ...base, name: `${p.name} · ${t("pricing.monthly")}`, price: pr.monthly.replace(/\D/g, "") },
              { ...base, name: `${p.name} · ${t("pricing.annually")}`, price: pr.annual.replace(/\D/g, "") },
            ];
      }),
    },
  }, [lang]);
  const localePath = useLocalePath();
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-pricing",
      content: "#smooth-content-pricing",
      smooth: 1.4,
      effects: true,
    });

    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-pricing h1").forEach((el) => {
        gsap.fromTo(el, { yPercent: 20, autoAlpha: 0 }, {
          yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    };
    run();

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handlePlanSelect = (planName: string, cycle: "monthly" | "annually") => {
    if (planName === "Gratis") {
      navigate(user ? "/dashboard" : "/login");
    } else if (planName === "Pro") {
      if (user) {
        navigate(`/profile?upgrade=true&cycle=${cycle}`);
      } else {
        navigate(`/login?next=${encodeURIComponent(`/dashboard?upgrade=true&cycle=${cycle}`)}`);
      }
    } else if (planName === "Negocios") {
      navigate(localePath("/precios/negocios"));
    }
  };

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-pricing" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-pricing" className="bg-white text-black font-sans pb-0">
          
          <section className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-12">
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">{t("pricing.copy.text1")} <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>{t("pricing.copy.text2")}</span>
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl mb-12">{t("pricing.copy.text3")}</p>
          </section>

          {/* Componente del selector de ciclo y tarjetas de planes */}
          <PricingTable onPlanSelect={handlePlanSelect} />

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Pricing;
