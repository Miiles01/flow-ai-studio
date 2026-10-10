import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import brand1 from "@/assets/miiles/brands/brand1.svg";
import brand2 from "@/assets/miiles/brands/brand2.svg";
import brand3 from "@/assets/miiles/brands/brand3.svg";
import brand4 from "@/assets/miiles/brands/brand4.svg";
import brand5 from "@/assets/miiles/brands/brand5.svg";
import brand6 from "@/assets/miiles/brands/brand6.svg";

import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import HeroPrompt from "@/components/landing/HeroPrompt";
import HomeSections from "@/components/landing/HomeSections";
import { usePageSeo } from "@/hooks/usePageSeo";
// Graphic assets copied from Downloads

const brandLogos = [brand1, brand2, brand3, brand4, brand5, brand6];

const swirlImages = [
  "/bonito/1.png",
  "/bonito/2.png",
  "/bonito/3.png",
  "/bonito/4.png",
  "/bonito/5.png",
  "/bonito/6.png",
  "/bonito/7.png",
  "/bonito/8.png",
];


gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase, InertiaPlugin);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const renderWord = (word: string, isItalic = false) => {
  return (
    <span className="word">
      {word.split("").map((char, idx) => (
        <span key={idx} className="letter">
          <span
            style={
              isItalic
                ? { fontFamily: "'Welth Catritz', serif", fontStyle: "italic", textTransform: "none" }
                : undefined
            }
          >
            {char}
          </span>
        </span>
      ))}
    </span>
  );
};

const Landing = () => {
  const { t } = useTranslation();
  usePageSeo({
    title: t("landing.seo_title"),
    description: t("landing.seo_description"),
    robots: "index, follow",
  });
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const orbitSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.4,
      effects: true,
    });

    // Animaciones para descripciones (no headings)
    const animated: HTMLElement[] = [];
    const animate = (selector: string, y: number, duration: number) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        animated.push(el);
        gsap.fromTo(el, { opacity: 0, y }, {
          opacity: 1, y: 0, duration, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    };

    // Desvanecimiento ligero para cada sección
    animate("#smooth-content section", 25, 1.2);

    animate("[data-anim-heading]", 40, 0.8);
    animate("[data-split]", 15, 0.5);

    // Removed main heading animation as per user request

    // SplitText line reveal en h1/h2/h3
    const splits: SplitText[] = [];
    const runSplit = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content h1:not(.no-split), #smooth-content h2:not(.no-split), #smooth-content h3:not(.no-split)").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        splits.push(split);
        gsap.fromTo(
          split.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "osmo-ease",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
    };
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) fontsReady.then(runSplit);
    else runSplit();

    return () => {
      smootherRef.current?.kill();
      splits.forEach((s) => s.revert());
      gsap.set(animated, { clearProps: "all" });
      // GSAP automatically cleans up matchMedia added globally, but usually you return a revert.
      // We will let context/matchMedia handle it or the page unmount handle it since it's a small component.
    };
  }, []);

  // Removed Hero Title Entrance Animation (mwg_effect046 style) since we are using a simple fade now

  // Removed Drifting Notes Hero Animation logic

  // Swirling Images Animation (mwg_effect016 exact)
  useEffect(() => {
    const root = orbitSectionRef.current;
    if (!root) return;

    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const pinHeight = root.querySelector('.pin-height') as HTMLElement;
      const container = root.querySelector('.container') as HTMLElement;
      
      ScrollTrigger.create({
          trigger: pinHeight, // Listens to pin-height
          start: 'top top',
          end: 'bottom bottom',
          pin: container // The pinned section
      });

      const mediaWrappers = root.querySelectorAll('.media-wrapper');
      const mediasLength = mediaWrappers.length;
      const angle = 360 / mediasLength;
      const medias = root.querySelectorAll('.media');
      
      mediaWrappers.forEach((wrapper, index) => {
          // Assign the angle to each wrapper
          gsap.set(wrapper, {rotation: -angle * index});
          // Assign the opposite angle to the child of the wrapper
          gsap.set(medias[index], {rotation: angle * index});
      });
      
      const tl = gsap.timeline({
          scrollTrigger: {
              trigger: pinHeight, // Listens to pin-height
              start: 'top top',
              end: 'bottom bottom',
              scrub: true // Progresses with the scroll
          }
      });
      
      tl.to(mediaWrappers, {
          rotation: '+=180', // += adds 180 from the current angle
          stagger: 0.04, // Animation delay between each element 
          ease: 'power1.out', // Non-linear
      });
      tl.to(medias, { 
          x: 0, // Re-centers the child
          rotation: '-=180', // -= subtracts 180 from the current angle
          ease: 'power1.out', 
          stagger: 0.04, // Animation delay between each element
      }, '<'); // Means the animation starts at the start of the previous tween
      
      tl.from(medias, { 
          autoAlpha: 0, // The element is initially invisible and hidden
          duration: 0.03, // Plays quickly
          stagger: 0.04, // Animation delay between each element
      }, '<'); // Means the animation starts at the start of the previous tween
    });

    return () => {
      mm.revert();
    };
  }, []);
  return (
    <>
          <LandingNavbar isLanding />

      <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content" className="split-safe bg-white text-black font-sans">

          <section className="min-h-[85vh] md:min-h-screen bg-white flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 md:pb-32 relative z-10">
            {/* Dotted Radial Gradient Background */}
            <div 
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
                maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                maskSize: "16px 16px",
                WebkitMaskSize: "16px 16px",
              }}
            />
            
            <div className="relative z-10 w-full max-w-6xl flex flex-col items-center justify-center">

              <h1 className="hero-title text-[44px] leading-[1.08] sm:text-6xl md:text-7xl lg:text-[84px] font-normal tracking-[-0.035em] text-black max-w-6xl [text-wrap:balance]">
                {t("landing.hero_h1_before")}{" "}
                <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic", letterSpacing: "-0.01em" }}>
                  {t("landing.hero_h1_accent")}
                </span>{" "}
                {t("landing.hero_h1_after")}
              </h1>

              <p
                data-anim-heading
                className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl font-light text-black/70 leading-relaxed max-w-2xl [text-wrap:balance]"
              >
                {t("landing.hero_desc")}
              </p>

              <div data-anim-heading className="w-full mt-10 md:mt-12">
                <HeroPrompt />
              </div>

              {/* BRAND CAROUSEL (Moved into Hero) */}
              <div className="w-full pt-12 md:pt-16 pb-6">
                <p className="text-center text-xs font-light text-black/60 mb-8 tracking-widest transition-colors duration-300">
                  {t("landing.trusted_by")}
                </p>
                <div className="px-[10%] md:px-[20%]">
                  <div className="relative w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                    <div className="flex w-max animate-marquee gap-20 items-center">
                      {[...brandLogos, ...brandLogos].map((logo, i) => (
                        <img key={i} src={logo} alt="" className="h-6 md:h-7 w-auto shrink-0 transition-all duration-300" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* QUÉ VAS A CREAR · PLANES · PREGUNTAS FRECUENTES */}
          <HomeSections
            beforeFaq={
              /* DESCUBRE CONEXIONES (mwg_effect016) */
              <section ref={orbitSectionRef} className="mwg_effect016 relative z-10 w-full hidden md:block">
                <div className="pin-height">
                  <div className="container">
                    <h2 className="scroll-text text-black text-4xl md:text-7xl lg:text-[90px] font-normal tracking-tight">
                      {t("landing.orbit_title_1")}<br />{t("landing.orbit_title_2")}
                    </h2>
                    {swirlImages.slice(0, 8).map((src, idx) => (
                      <div 
                        key={idx} 
                        className="media-wrapper"
                        style={{ zIndex: idx === 0 ? 10 : 1 }}
                      >
                        <img src={src} alt="" className="media" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            }
          />

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Landing;
