import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const About = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-about",
      content: "#smooth-content-about",
      smooth: 1.4,
      effects: true,
    });

    const splits: SplitText[] = [];
    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-about h1, #smooth-content-about h2, #smooth-content-about h3").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        splits.push(split);
        gsap.fromTo(split.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 0.9, stagger: 0.08, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    };
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) fontsReady.then(run); else run();

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-about" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-about" className="bg-white text-black font-sans">
          <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">
              Acerca de <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>Miiles</span>
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl">
              Somos una plataforma diseñada para mentes creativas que quieren impulsar su marca y conectar con vendedores en todo el mundo.
            </p>
          </section>

          <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight mb-10">
                Nuestra <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>misión</span>
              </h2>
              <p className="text-base font-light text-gray-600 leading-relaxed">
                En Miiles creemos que el trabajo inteligente abre puertas. Construimos herramientas para que tu marca crezca sin límites, conectándote con las personas correctas en el momento correcto.
              </p>
            </div>
          </section>

          <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight mb-10">
                Nuestra <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>visión</span>
              </h2>
              <p className="text-base font-light text-gray-600 leading-relaxed">
                Un mundo donde cada idea creativa tenga la oportunidad de escalar globalmente.
              </p>
            </div>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default About;
