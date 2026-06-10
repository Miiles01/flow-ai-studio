import { useEffect, useRef, useState } from "react";
import videoHome from "@/assets/miiles/videohome.mp4";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import logoImg from "@/assets/logo.png";
import brand1 from "@/assets/miiles/brands/brand1.svg";
import brand2 from "@/assets/miiles/brands/brand2.svg";
import brand3 from "@/assets/miiles/brands/brand3.svg";
import brand4 from "@/assets/miiles/brands/brand4.svg";
import brand5 from "@/assets/miiles/brands/brand5.svg";
import brand6 from "@/assets/miiles/brands/brand6.svg";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

// Graphic assets copied from Downloads
import estrellaImg from "@/assets/miiles/Estrella.png";
import flechaImg from "@/assets/miiles/Flecha.png";
import florImg from "@/assets/miiles/Flor.svg";
import miilesImg from "@/assets/miiles/Miiles.svg";
import sonrisaImg from "@/assets/miiles/Sonrisa.svg";

const brandLogos = [brand1, brand2, brand3, brand4, brand5, brand6];

const heroCardsData = [
  {
    type: "todolist",
    header: "Validación ▾",
    title: "Validar ideas de negocio",
    items: [
      { text: "Crear landing page mínima", checked: true },
      { text: "Ejecutar anuncios de prueba", checked: false },
      { text: "Entrevistar 10 clientes", checked: false },
    ],
    bg: "#FFFBEB", // Yellow
    textCol: "#D97706",
    width: "175px",
    height: "175px",
  },
  {
    type: "image",
    src: estrellaImg,
    bg: "transparent",
    width: "70px",
    height: "70px",
  },
  {
    type: "note",
    header: "SaaS B2B",
    title: "Herramienta de automatización de ventas con IA",
    text: "Permite a fundadores delegar su prospección de clientes usando agentes de IA entrenados en su modelo.",
    bg: "#EFF6FF", // Blue
    textCol: "#2563EB",
    footer: "Lanzamiento Q3 ▾",
    width: "220px",
    height: "220px",
  },
  {
    type: "image",
    src: flechaImg,
    bg: "transparent",
    width: "80px",
    height: "80px",
  },
  {
    type: "list",
    header: "Modelos",
    items: [
      { text: "Suscripción mensual" },
      { text: "Comisión por venta" },
      { text: "Licencia perpetua" },
    ],
    bg: "#FAF5FF", // Purple
    textCol: "#7C3AED",
    width: "155px",
    height: "155px",
  },
  {
    type: "image",
    src: florImg,
    bg: "transparent",
    width: "75px",
    height: "75px",
  },
  {
    type: "neon",
    text: "Idea SaaS: Canvas visual para creadores digitales y diseñadores independientes.",
    bg: "#ECFDF5", // Green
    textCol: "#059669",
    width: "150px",
    height: "150px",
  },
  {
    type: "todolist",
    header: "Marketing ▾",
    title: "Estrategia de lanzamiento",
    items: [
      { text: "Guion de video para TikTok", checked: true },
      { text: "Publicar en Product Hunt", checked: false },
      { text: "Campaña con afiliados", checked: false },
    ],
    bg: "#FFF7ED", // Orange
    textCol: "#EA580C",
    width: "185px",
    height: "185px",
  },
  {
    type: "image",
    src: miilesImg,
    bg: "transparent",
    width: "70px",
    height: "70px",
  },
  {
    type: "note",
    header: "Fintech Latam",
    title: "Plataforma de cobros para freelancers",
    text: "Permite cobrar en dólares y retirar en moneda local de manera instantánea con comisiones mínimas.",
    bg: "#F0F9FF", // Light Blue
    textCol: "#0284C7",
    width: "210px",
    height: "210px",
  },
  {
    type: "image",
    src: sonrisaImg,
    bg: "transparent",
    width: "65px",
    height: "65px",
  },
  {
    type: "todolist",
    header: "Operaciones ▾",
    title: "Tareas previas a lanzar",
    items: [
      { text: "Configurar pasarela Stripe", checked: true },
      { text: "Registrar dominio .app", checked: false },
      { text: "Subir video de demo", checked: false },
    ],
    bg: "#F0FDF4", // Light Green
    textCol: "#16A34A",
    width: "175px",
    height: "175px",
  }
];


gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase, InertiaPlugin);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const Landing = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollTextSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.4,
      effects: true,
    });

    // Video expand on scroll
    if (videoWrapRef.current) {
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

    // Animación del título principal sin SplitText para evitar cortes
    gsap.fromTo(
      ".no-split",
      { opacity: 0, y: 45 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".no-split",
          start: "top 90%",
          once: true,
        },
      }
    );

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
      ScrollTrigger.getAll().forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
      gsap.set(animated, { clearProps: "all" });
    };
  }, []);

  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Drifting Notes Hero Animation (mwg_effect094)
  useEffect(() => {
    const root = heroRef.current;
    const cardsContainer = cardsContainerRef.current;
    if (!root || !cardsContainer) return;

    const cards = cardsContainer.querySelectorAll(".mwg-card");
    if (cards.length === 0) return;

    let scrollTween: gsap.core.Tween | null = null;
    const individualTweens: gsap.core.Tween[] = [];

    const initHeroAnimation = () => {
      const distance = cardsContainer.clientWidth - window.innerWidth;
      const isPortrait = window.innerWidth < window.innerHeight;

      // Reset any existing transformations
      gsap.set(cardsContainer, { clearProps: "x" });
      gsap.set(cards, { clearProps: "all" });

      scrollTween = gsap.to(cardsContainer, {
        x: () => -(cardsContainer.clientWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          pin: true,
          pinType: "transform",
          scrub: true,
          start: "top top",
          end: () => "+=" + (cardsContainer.clientWidth - window.innerWidth),
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        const sign = i % 2 === 0 ? 1 : -1;
        const rotation = (Math.random() - 0.5) * 6;
        const amplitude = isPortrait ? 0.32 : 0.38;

        const driftTween = gsap.fromTo(
          card,
          { rotation: rotation },
          {
            rotation: -rotation,
            y: () => sign * -amplitude * window.innerHeight,
            yPercent: () => sign * 35,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween!,
              start: "left 95%",
              end: "right 5%",
              scrub: true,
            },
          }
        );
        individualTweens.push(driftTween);

        const scaleTween = gsap.to(card, {
          scale: 1.25,
          yoyo: true,
          repeat: 1,
          ease: "back.inOut(2.5)",
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween!,
            start: "left 95%",
            end: "right 5%",
            scrub: true,
          },
        });
        individualTweens.push(scaleTween);
      });

      ScrollTrigger.refresh();
    };

    const timer = setTimeout(initHeroAnimation, 100);

    return () => {
      clearTimeout(timer);
      if (scrollTween) {
        if (scrollTween.scrollTrigger) scrollTween.scrollTrigger.kill();
        scrollTween.kill();
      }
      individualTweens.forEach((t) => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
    };
  }, []);

  // 3D Scroll Perspective Text Animation (mwg_effect053)
  useEffect(() => {
    const root = scrollTextSectionRef.current;
    if (!root) return;

    const pinHeight = root.querySelector(".pin-height") as HTMLElement;
    const container = root.querySelector(".container") as HTMLElement;
    const paragraphs = root.querySelectorAll(".paragraphs");

    if (!pinHeight || !container || paragraphs.length === 0) return;

    let splits: SplitText[] = [];
    let pinTrigger: ScrollTrigger | null = null;
    let tl: gsap.core.Timeline | null = null;

    const initAnimation = () => {
      // Create SplitText lines
      splits = Array.from(paragraphs).map((p) => {
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
      pinTrigger = ScrollTrigger.create({
        trigger: pinHeight,
        start: "top top",
        end: "bottom bottom",
        pin: container,
        pinType: "transform",
      });

      // Create rotation timeline
      tl = gsap.timeline({
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

          tl!.to(currentLines, {
            rotationY: -90,
            stagger: 0.07,
            duration: 1,
            ease: "back.inOut(1.5)",
          });

          tl!.to(
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
    };

    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) {
      fontsReady.then(initAnimation);
    } else {
      const timer = setTimeout(initAnimation, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      splits.forEach((s) => s.revert());
      if (pinTrigger) pinTrigger.kill();
      if (tl) {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      }
    };
  }, []);

  return (
    <>
      <LandingNavbar />

      <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content" className="bg-white text-black font-sans overflow-hidden">

          {/* HERO (mwg_effect094 - Drifting Notes Horizontal Scroll) */}
          <section ref={heroRef} className="mwg_effect094 bg-white text-black relative">
            <div className="container relative">
              
              {/* HERO Content in Center */}
              <div className="hero-center-content max-w-4xl mx-auto flex flex-col items-center absolute pointer-events-none">
                <div className="pointer-events-auto flex flex-col items-center">
                  <img 
                    data-anim-heading 
                    src={logoImg} 
                    alt="Miiles Logo" 
                    className="w-14 h-14 mx-auto mb-3" 
                  />
                  <span data-anim-heading className="text-[22px] font-normal mb-8 tracking-tight">
                    Miiles
                  </span>
                  
                  <h1
                    className="no-split text-4xl sm:text-5xl md:text-8xl lg:text-[95px] font-normal leading-[1.1] tracking-tight mb-10 text-center"
                  >
                    <span className="block">¿Muchas <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>ideas</span></span>
                    <span className="block">de negocio?</span>
                  </h1>

                  <div data-anim-heading className="flex items-center justify-center gap-4 flex-wrap">
                    <Link
                      to="/login"
                      className="px-8 py-4 rounded-full bg-black text-white text-[15px] font-normal hover:-translate-y-2 transition-transform duration-300 flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                      </svg>
                      Unirse ahora
                    </Link>
                  </div>
                </div>
              </div>

              {/* Horizontal Scroll Cards Track */}
              <div className="cards-wrapper absolute inset-0 flex items-center pointer-events-none z-20">
                <div ref={cardsContainerRef} className="cards flex gap-20 items-center">
                  {[...heroCardsData, ...heroCardsData].map((card, idx) => (
                    <div
                      key={idx}
                      className="mwg-card"
                      style={{
                        backgroundColor: card.bg,
                        color: card.textCol,
                        width: card.width,
                        height: card.height,
                        minWidth: card.width,
                        minHeight: card.height,
                        maxWidth: card.width,
                        maxHeight: card.height,
                        padding: card.type === "image" ? "0px" : undefined,
                        boxShadow: card.type === "image" ? "none" : undefined,
                        borderRadius: card.type === "image" ? "0px" : undefined,
                        whiteSpace: "normal",
                      }}
                    >
                      {card.type === "todolist" && (
                        <div style={{ display: "flex", flexDirection: "column", height: "100%", textAlign: "left", fontFamily: "'Poppins', sans-serif" }}>
                          <div style={{ fontSize: "9px", fontWeight: 500, opacity: 0.5, marginBottom: "6px" }}>
                            {card.header}
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: 600, lineHeight: 1.35, marginBottom: "10px" }}>
                            {card.title}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px", flexGrow: 1 }}>
                            {card.items?.map((item, itemIdx) => (
                              <div key={itemIdx} style={{ display: "flex", alignItems: "center", fontSize: "10px", opacity: item.checked ? 0.45 : 0.8, textDecoration: item.checked ? "line-through" : "none" }}>
                                {item.checked ? (
                                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: card.textCol, display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: "6px", fontSize: "7px", color: card.bg === "#FFFFFF" ? "#FFF" : (card.bg === "#1E293B" ? "#1E293B" : "#FFF"), fontWeight: "bold" }}>✓</span>
                                ) : (
                                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", border: `1px solid ${card.textCol}40`, display: "inline-block", marginRight: "6px" }}></span>
                                )}
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.type === "list" && (
                        <div style={{ display: "flex", flexDirection: "column", height: "100%", textAlign: "left", fontFamily: "'Poppins', sans-serif" }}>
                          <div style={{ fontSize: "9px", fontWeight: 500, opacity: 0.5, marginBottom: "6px" }}>
                            {card.header}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px", flexGrow: 1, justifyContent: "center" }}>
                            {card.items?.map((item, itemIdx) => (
                              <div key={itemIdx} style={{ fontSize: "10.5px", fontWeight: 500, opacity: 0.85, paddingLeft: "2px" }}>
                                • {item.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.type === "note" && (
                        <div style={{ display: "flex", flexDirection: "column", height: "100%", textAlign: "left", fontFamily: "'Poppins', sans-serif" }}>
                          <div style={{ fontSize: "9px", fontWeight: 500, opacity: 0.5, marginBottom: "6px" }}>
                            {card.header}
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: 600, lineHeight: 1.35, marginBottom: "8px" }}>
                            {card.title}
                          </div>
                          <div style={{ fontSize: "9.5px", fontWeight: 300, lineHeight: 1.4, opacity: 0.6, flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {card.text}
                          </div>
                          {card.footer && (
                            <div style={{ fontSize: "8px", fontWeight: 500, opacity: 0.5, textAlign: "right", marginTop: "auto", paddingTop: "6px" }}>
                              {card.footer}
                            </div>
                          )}
                        </div>
                      )}

                      {card.type === "neon" && (
                        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", textAlign: "left", fontFamily: "'Poppins', sans-serif", padding: "2px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, lineHeight: 1.4 }}>
                            {card.text}
                          </div>
                        </div>
                      )}

                      {card.type === "image" && "src" in card && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                          <img 
                            src={(card as any).src} 
                            alt="miiles graphic decal" 
                            style={{ 
                              maxWidth: "100%", 
                              maxHeight: "100%", 
                              objectFit: "contain" 
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* BRAND CAROUSEL (Relocated) */}
          <section className="py-16 overflow-hidden">
            <h4 className="text-center text-xs font-light text-gray-400 mb-8 tracking-widest">
              Elegido por
            </h4>
            <div className="px-[10%] md:px-[20%]">
              <div className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                <div className="flex w-max animate-marquee gap-20 items-center">
                  {[...brandLogos, ...brandLogos].map((logo, i) => (
                    <img key={i} src={logo} alt="" className="h-6 md:h-7 w-auto opacity-70 shrink-0" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3D SCROLL TEXT PERSPECTIVE (mwg_effect053) */}
          <section ref={scrollTextSectionRef} className="mwg_effect053 bg-white text-black relative z-10">
            <div className="pin-height">
              <div className="container">
                <p className="paragraphs">
                  Unifica tus ideas<br />
                  en un solo lugar<br />
                  y empieza a crear.
                </p>
                <p className="paragraphs">
                  Un espacio para conectar,<br />
                  colaborar con talento<br />
                  y co-crear sin límites.
                </p>
              </div>
            </div>
          </section>

          {/* VIDEO */}
          <section className="py-24 flex justify-center items-center overflow-hidden">
            <div
              ref={videoWrapRef}
              style={{ width: "65%" }}
              className="rounded-2xl overflow-hidden"
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
                <span className="block">Un sistema.</span>
                <span className="block">
                  Más&nbsp;<span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>ganancias.</span>
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
                    Encuentra colaboraciones
                  </h3>
                  <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                    En Miiles encontrarás oportunidades únicas para impulsar tu marca.
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
                    Haz que tu idea suene con fuerza de ventas
                  </h3>
                  <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                    Si tu marca vende servicios o productos, haz que otros vendedores en todo el mundo también los ofrezcan.
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
                Luce realmente asombroso
              </h2>
              <img 
                src="https://wearemiiles.com/wp-content/uploads/2025/03/Frame-2085662063.png" 
                alt="Karol Wegner" 
                className="h-14 w-auto object-contain mb-4"
              />
              <div className="flex flex-col items-center">
                <span className="text-sm font-normal text-black">Karol Wegner</span>
                <span className="text-[10px] text-gray-400 font-light mt-1">CEO de BeeSpeaker</span>
              </div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section className="py-32 px-6 bg-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight mb-12">
                Vamos a construir tu nuevo negocio <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>automatizado</span>
              </h2>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-black text-white text-base font-light hover:-translate-y-2 transition-transform duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                </svg>
                Prueba Miiles gratis
              </Link>
            </div>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Landing;
