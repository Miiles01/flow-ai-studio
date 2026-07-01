import { useEffect, useRef } from "react";
import videoHome from "@/assets/miiles/videohome.mp4";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import logoImg from "@/assets/logo.webp";
import brand1 from "@/assets/miiles/brands/brand1.svg";
import brand2 from "@/assets/miiles/brands/brand2.svg";
import brand3 from "@/assets/miiles/brands/brand3.svg";
import brand4 from "@/assets/miiles/brands/brand4.svg";
import brand5 from "@/assets/miiles/brands/brand5.svg";
import brand6 from "@/assets/miiles/brands/brand6.svg";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
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
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const scrollTextSectionRef = useRef<HTMLDivElement>(null);
  const section059Ref = useRef<HTMLElement>(null);
  const orbitSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.4,
      effects: true,
    });

    // Video expand on scroll
    if (videoWrapRef.current) {
      let mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          videoWrapRef.current,
          { width: "65%" },
          {
            width: "80%",
            ease: "none",
            scrollTrigger: {
              trigger: videoWrapRef.current,
              start: "top 80%",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      });
      // mm will be reverted in the main cleanup? Since we are adding it inside a useEffect, 
      // we don't have a variable to revert it globally, but wait! We can just define `let mainMm = gsap.matchMedia()` at the top of useEffect,
      // and revert it in cleanup.
    }

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
      document.querySelectorAll<HTMLElement>("#smooth-content h1:not(.no-split), #smooth-content h2, #smooth-content h3").forEach((el) => {
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

  // 3D Scroll Perspective Text Animation (mwg_effect053)
  useEffect(() => {
    const root = scrollTextSectionRef.current;
    if (!root) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const pinHeight = root.querySelector(".pin-height") as HTMLElement;
      const container = root.querySelector(".container") as HTMLElement;
      const paragraphs = root.querySelectorAll(".paragraphs");

      if (!pinHeight || !container || paragraphs.length === 0) return;

      // Create SplitText lines
      const splits = Array.from(paragraphs).map((p) => {
        const split = SplitText.create(p as HTMLElement, { type: "lines", linesClass: "line" });
        split.lines.forEach((line) => {
          line.innerHTML = `<div class="line-inner">${line.innerHTML}</div>`;
        });
        return split;
      });

      // Initial state: hide paragraphs after the first one
      splits.forEach((split, i) => {
        if (i > 0) {
          gsap.set(split.lines, { rotationY: 90 });
        }
      });

      // Pin the container
      ScrollTrigger.create({
        trigger: pinHeight,
        start: "top top",
        end: "bottom bottom",
        pin: container,
        pinType: "transform",
      });

      // Create rotation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinHeight,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      splits.forEach((split, i) => {
        if (splits[i + 1]) {
          const currentLines = split.lines;
          const nextLines = splits[i + 1].lines;

          tl.to(currentLines, {
            rotationY: -90,
            stagger: 0.07,
            duration: 1,
            ease: "back.inOut(1.5)",
          });

          tl.to(
            nextLines,
            {
              rotationY: 0,
              stagger: 0.07,
              duration: 1,
              ease: "back.inOut(1.5)",
            },
            "<"
          );
        }
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  // Curve Text Animation (mwg_effect059)
  useEffect(() => {
    const root = section059Ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      let scrollTriggerInstance: ScrollTrigger | null = null;

      const initAnimation = () => {
        const pinHeight = root.querySelector(".pin-height") as HTMLElement;
        const container = root.querySelector(".mwg-container") as HTMLElement;
        const svg = root.querySelector("#mysvg") as SVGSVGElement;
        const path = root.querySelector("#mypath") as SVGPathElement;
        const tp = root.querySelector("#textpath") as SVGTextPathElement;

        if (!pinHeight || !container || !svg || !path || !tp) return;

        const vbW = 3898;
        const vbH = 891;
        svg.style.aspectRatio = `${vbW} / ${vbH}`;

        const position = { x: 0, y: 0 };
        const updateViewBox = () => {
          svg.setAttribute('viewBox', `${position.x} ${position.y} ${vbW} ${vbH}`);
        };

        const tweenOpts = { duration: 0.2, ease: 'power1', onUpdate: updateViewBox };
        const xTo = gsap.quickTo(position, "x", tweenOpts);
        const yTo = gsap.quickTo(position, "y", tweenOpts);

        const str = tp.getAttribute('data-text')?.trim() || "Es horaaaaaa de crearrrrrrrrr";
        const chars = str.split('');
        const totalChars = chars.length;

        tp.textContent = str;
        const textLen = tp.getComputedTextLength() || 1500;
        tp.textContent = '';

        const stepCount = 1000;
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < stepCount; i++) {
          const u = i / (stepCount - 1);
          const len = u * textLen;
          const p = path.getPointAtLength(len);
          points.push({ x: p.x, y: p.y });
        }

        // Initial placement to avoid jumping
        if (points.length > 0) {
          const rect = container.getBoundingClientRect();
          const svgRect = svg.getBoundingClientRect();
          const scaleFactor = svgRect.width > 0 ? rect.width / svgRect.width : 0.33;
          const p0 = points[0];
          if (p0) {
            position.x = p0.x - (vbW * scaleFactor) / 2;
            position.y = p0.y - vbH / 2 - 60;
            updateViewBox();
          }
        }

        scrollTriggerInstance = ScrollTrigger.create({
          trigger: pinHeight,
          start: 'top top',
          end: 'bottom bottom',
          pin: container,
          scrub: true,
          onUpdate: self => {
            const rect = container.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();
            const scaleFactor = svgRect.width > 0 ? rect.width / svgRect.width : 0.33;

            const idx = Math.floor(self.progress * (points.length - 1));
            const p = points[idx];
            if (p) {
              xTo(p.x - (vbW * scaleFactor) / 2);
              yTo(p.y - vbH / 2 - 60);
            }

            const next = chars.slice(0, Math.floor(self.progress * totalChars)).join('');
            if (tp.textContent !== next) {
              tp.textContent = next;
            }
          }
        });
      };

      const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
      if (fontsReady) {
        fontsReady.then(initAnimation);
      } else {
        const timer = setTimeout(initAnimation, 100);
        return () => clearTimeout(timer);
      }

      return () => {
        if (scrollTriggerInstance) scrollTriggerInstance.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

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
          <LandingNavbar isLanding={true} />

      <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content" className="bg-white text-black font-sans overflow-hidden">

          {/* HERO */}
          <section className="min-h-[85vh] md:min-h-screen bg-white md:bg-transparent flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 md:pb-32 relative z-10 overflow-hidden">
            {/* Desktop Banner Background */}
            <motion.div 
              className="hidden md:block absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <img src="/banner-miiles.png" alt="Hero Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>

            <div className="relative z-10 w-full flex flex-col items-center justify-center">
              <img 
                data-anim-heading 
                src={logoImg} 
                alt="Miiles Logo" 
                className="w-14 h-14 mx-auto mb-3 logo-spin" 
              />
              <span data-anim-heading className="text-[22px] font-normal mb-8 tracking-tight text-black md:text-white">
                {t("landing.hero_badge")}
              </span>
              
              <h1
                data-anim-heading
                className="text-[42px] sm:text-6xl md:text-8xl lg:text-[95px] font-normal leading-[1.1] tracking-tight mb-6 text-black md:text-white"
              >
                <span className="block md:inline">
                  {t("landing.hero_title_hoy")} {t("landing.hero_title_es")}{" "}
                </span>
                <span className="block md:inline">
                  {t("landing.hero_title_un")} {t("landing.hero_title_buen")} {t("landing.hero_title_dia")}{" "}
                </span>
                <span className="block">
                  {t("landing.hero_title_para")}{" "}
                  <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic", textTransform: "none" }}>
                    {t("landing.hero_title_crear")}
                  </span>
                </span>
              </h1>

              <p 
                data-anim-heading 
                className="text-base sm:text-lg md:text-xl font-light text-gray-500 md:text-white/80 mb-10 tracking-wide"
              >
                {t("landing.hero_subtitle")}
              </p>

              <div data-anim-heading className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-full bg-black md:bg-white text-white md:text-black text-[15px] font-normal hover:-translate-y-2 transition-transform duration-300 flex items-center gap-2 shadow-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                  </svg>
                  {t("landing.hero_cta")}
                </Link>
              </div>

              {/* BRAND CAROUSEL (Moved into Hero) */}
              <div className="w-full pt-8 md:pt-10 pb-6 mt-2 md:mt-4">
                <h4 className="text-center text-xs font-light text-gray-400 md:text-white/80 mb-8 tracking-widest transition-colors duration-300">
                  {t("landing.trusted_by")}
                </h4>
                <div className="px-[10%] md:px-[20%]">
                  <div className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                    <div className="flex w-max animate-marquee gap-20 items-center">
                      {[...brandLogos, ...brandLogos].map((logo, i) => (
                        <img key={i} src={logo} alt="" className="h-6 md:h-7 w-auto opacity-70 md:opacity-100 md:brightness-0 md:invert shrink-0 transition-all duration-300" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SWIRLING IMAGES (mwg_effect016) */}
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


          {/* 3D SCROLL TEXT PERSPECTIVE (mwg_effect053) - DESKTOP ONLY */}
          <section ref={scrollTextSectionRef} className="mwg_effect053 bg-white text-black relative z-10 hidden md:block">
            <div className="pin-height">
              <div className="container">
                <p className="paragraphs">
                  {t("landing.scroll_text_1_1")}<br />
                  {t("landing.scroll_text_1_2")}<br />
                  {t("landing.scroll_text_1_3")}
                </p>
                <p className="paragraphs">
                  {t("landing.scroll_text_2_1")}<br />
                  {t("landing.scroll_text_2_2")}<br />
                  {t("landing.scroll_text_2_3")}
                </p>
              </div>
            </div>
          </section>

          {/* SIMPLE TITLE TEXT - MOBILE ONLY */}
          <section className="bg-white text-black relative z-10 block md:hidden pt-20 pb-4 px-6 text-center">
            <h2 className="text-5xl font-normal leading-tight tracking-tight text-black">
              <span className="block">{t("landing.mobile_title_1")}</span>
              <span className="block">
                {t("landing.mobile_title_2")} <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>{t("landing.mobile_title_3")}</span>
              </span>
            </h2>
          </section>

          {/* VIDEO */}
          <section className="pt-0 pb-24 md:py-24 flex justify-center items-center overflow-hidden">
            <div
              ref={videoWrapRef}
              className="w-full md:w-[65%] rounded-2xl overflow-hidden"
            >
              <video
                src={videoHome}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </section>

          {/* VALUE PROP + 2 COLUMNS (FUNCIONES) */}
          <section className="py-32 px-6 scroll-mt-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight text-center mb-20">
                <span className="block">{t("landing.system_title_1")}</span>
                <span className="block">
                  {t("landing.system_title_2")}&nbsp;<span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>{t("landing.system_title_3")}</span>
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COL 1 — Encuentra colaboraciones */}
                <div data-anim-heading className="flex flex-col bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group">
                  <div className="rounded-2xl overflow-hidden bg-[#F5F5F8] mb-8">
                    <img
                      src="https://wearemiiles.com/wp-content/uploads/2026/01/3232-932x1024.png"
                      alt="Encuentra colaboraciones"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                    {t("landing.colab_title")}
                  </h3>
                  <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                    {t("landing.colab_desc")}
                  </p>
                </div>

                {/* COL 2 — Haz que tu idea suene */}
                <div data-anim-heading className="flex flex-col bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group">
                  <div className="rounded-2xl overflow-hidden bg-[#F5F5F8] mb-8">
                    <img
                      src="https://wearemiiles.com/wp-content/uploads/2026/01/new233-933x1024.png"
                      alt="Haz que tu idea suene"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                    {t("landing.sales_title")}
                  </h3>
                  <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                    {t("landing.sales_desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* TESTIMONIO */}
          <section className="py-40 px-6">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <span className="text-6xl md:text-8xl font-serif leading-none mb-4 text-black">“</span>
              <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight mb-12">
                {t("landing.testim_quote")}
              </h2>
              <img 
                src="https://wearemiiles.com/wp-content/uploads/2025/03/Frame-2085662063.png" 
                alt="Karol Wegner" 
                className="h-14 w-auto object-contain mb-4"
              />
              <div className="flex flex-col items-center">
                <span className="text-sm font-normal text-black">{t("landing.testim_name")}</span>
                <span className="text-[10px] text-gray-400 font-light mt-1">{t("landing.testim_role")}</span>
              </div>
            </div>
          </section>

          <section ref={section059Ref} className="mwg_effect059 bg-white">
            <div className="pin-height">
              <div className="mwg-container">
                <svg id="mysvg" fill="none" width="3898" height="891" viewBox="0 0 3898 891" xmlns="http://www.w3.org/2000/svg">
                  <path id="mypath" d="M0.398438 611.016C175.398 377.517 857.398 -285.484 1461.4 139.638C1911.53 456.46 2114.4 805.516 2679.4 611.016C3088.4 470.219 3704.54 -33.3124 4354.9 781.516C4700.9 1215.02 5305.6 1466.52 6108.4 328.516" />
                  <text id="text">
                    <textPath id="textpath" href="#mypath" textAnchor="start" fontSize="260" data-text={t("landing.curve_text")}>
                      {t("landing.curve_text")}
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </section>

          {/* MOBILE CTA */}
          <section className="block md:hidden py-24 px-6 bg-white text-center">
            <h2 className="text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-8 text-black">
              {t("landing.cta_title")}
            </h2>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-black text-white text-base font-light hover:-translate-y-2 transition-transform duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
              </svg>
              {t("landing.cta_button")}
            </Link>
          </section>

          {/* DESKTOP CTA */}
          <section className="hidden md:flex pb-32 px-6 bg-white flex-col items-center justify-center pt-8">
            <p className="text-gray-500 mb-6 font-light">{t("landing.cta_subtitle")}</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-black text-white text-base font-light hover:-translate-y-2 transition-transform duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
              </svg>
              {t("landing.cta_button")}
            </Link>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Landing;
