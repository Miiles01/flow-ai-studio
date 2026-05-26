import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import PricingTable from "@/components/PricingTable";

// Registro de plugins de GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const Pricing = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-pricing",
      content: "#smooth-content-pricing",
      smooth: 1.4,
      effects: true,
    });

    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-pricing h1").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        gsap.fromTo(split.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 0.9, stagger: 0.08, ease: "osmo-ease",
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

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-pricing" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-pricing" className="bg-white text-black font-sans pb-0">
          
          <section className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-12">
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">
              Todo un ecosistema de IA. <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>Un solo pago.</span>
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl mb-12">
              Potencia tu marca con la flexibilidad que necesitas. Sin letras pequeñas, solo el impulso que mereces.
            </p>
          </section>

          {/* Componente del selector de ciclo y tarjetas de planes */}
          <PricingTable />

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Pricing;
