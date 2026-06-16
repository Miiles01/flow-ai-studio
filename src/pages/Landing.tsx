import { useEffect, useRef } from "react";
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

const brandLogos = [brand1, brand2, brand3, brand4, brand5, brand6];

// Orbiting words (what an entrepreneur does) + notes
const orbitWords = [
  "Investigación",
  "Pitch",
  "Canvas",
  "IA",
  "Validación",
  "Branding",
  "Finanzas",
  "Estrategia",
  "Ventas",
  "Prototipo",
];

const orbitNotes = [
  {
    tag: "Idea",
    title: "Mapa de oportunidad",
    bg: "#FEEDED",
    type: "text",
    content: "Resolver fricción en B2B SaaS. Integrar APIs automatizadas.",
  },
  {
    tag: "Mercado",
    title: "Tamaño de mercado",
    bg: "#E8ECFE",
    type: "text",
    content: "TAM: $15B global. SOM: $120M en LATAM año 1-3.",
  },
  {
    tag: "Cliente",
    title: "Perfil de usuario",
    bg: "#FFFFFF",
    type: "todo",
    todos: [
      { text: "Entrevistar founders", checked: true },
      { text: "Definir Buyer Persona", checked: true },
      { text: "Validar dolor principal", checked: false },
    ],
  },
  {
    tag: "Modelo",
    title: "Fuentes de ingreso",
    bg: "#FEF9C3",
    type: "todo",
    todos: [
      { text: "Suscripción B2B", checked: true },
      { text: "Fee transaccional 2%", checked: false },
      { text: "Licencias Enterprise", checked: false },
    ],
  },
  {
    tag: "Roadmap",
    title: "Plan a 90 días",
    bg: "#DCFCE7",
    type: "todo",
    todos: [
      { text: "Lanzar MVP beta", checked: true },
      { text: "Primeros 100 usuarios", checked: true },
      { text: "Validar retención", checked: false },
    ],
  },
  {
    tag: "Equipo",
    title: "Roles clave",
    bg: "#FFFFFF",
    type: "todo",
    todos: [
      { text: "Contratar CTO técnico", checked: true },
      { text: "Lead AI Engineer", checked: false },
      { text: "Growth Marketer", checked: false },
    ],
  },
  {
    tag: "Métricas",
    title: "KPIs de tracción",
    bg: "#E8ECFE",
    type: "text",
    content: "LTV/CAC > 3x. Churn < 2%. MRR inicial target: $10k.",
  },
  {
    tag: "Pitch",
    title: "Deck inversión",
    bg: "#FCE7F3",
    type: "todo",
    todos: [
      { text: "Narrativa del dolor", checked: true },
      { text: "Tamaño del mercado", checked: true },
      { text: "Unidad económica", checked: false },
    ],
  },
  {
    tag: "Growth",
    title: "Adquisición",
    bg: "#FEEDED",
    type: "todo",
    todos: [
      { text: "SEO orgánico", checked: true },
      { text: "Outbound AI automatizado", checked: true },
      { text: "Pauta performance", checked: false },
    ],
  },
  {
    tag: "Producto",
    title: "MVP listo",
    bg: "#FFFFFF",
    type: "todo",
    todos: [
      { text: "Editor de prompts", checked: true },
      { text: "Integración LLM API", checked: true },
      { text: "Exportar reportes", checked: false },
    ],
  },
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
      ScrollTrigger.getAll().forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
      gsap.set(animated, { clearProps: "all" });
    };
  }, []);

  // Hero Title Entrance Animation (mwg_effect046 style)
  useEffect(() => {
    const letters = document.querySelectorAll('.hero-title .letter > span');
    if (letters.length === 0) return;

    const shuffleArray = (array: Element[]) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const shuffled = shuffleArray(Array.from(letters));

    gsap.from(shuffled, {
      y: '130%',
      ease: 'power4.out',
      duration: 1.0,
      stagger: 0.03,
      delay: 0.3
    });
  }, []);

  // Removed Drifting Notes Hero Animation logic

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

        const str = tp.textContent?.trim() || "Es horaaaaaa de crearrrrrrrrr";
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

  // Orbiting words + notes animation (mwg_effect040)
  useEffect(() => {
    const root = orbitSectionRef.current;
    if (!root) return;

    const pinHeight = root.querySelector(".pin-height") as HTMLElement;
    const container = root.querySelector(".container") as HTMLElement;
    const leftCircle = root.querySelector(".parent-circle-left") as HTMLElement;
    const rightCircle = root.querySelector(".parent-circle-right") as HTMLElement;
    if (!pinHeight || !container || !leftCircle || !rightCircle) return;

    const angle = 14;
    const ctx = gsap.context(() => {
      const leftItems = leftCircle.querySelectorAll(".circle");
      const rightItems = rightCircle.querySelectorAll(".circle");

      leftItems.forEach((el, index) => {
        gsap.set(el, { rotation: index * angle });
        gsap.set(el.querySelector("p"), { rotation: -index * angle });
      });
      rightItems.forEach((el, index) => {
        gsap.set(el, { rotation: index * angle });
        gsap.set(el.querySelector(".note"), { rotation: -index * angle });
      });

      const total = 180 + angle * leftItems.length;

      gsap.to(".scroll", {
        autoAlpha: 0,
        duration: 0.2,
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "top top-=1",
          toggleActions: "play none reverse none",
        },
      });

      const st = {
        trigger: pinHeight,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      } as const;

      ScrollTrigger.create({
        trigger: pinHeight,
        pin: container,
        pinType: "transform",
        start: "top top",
        end: "bottom bottom",
      });

      gsap.to(leftCircle, { rotation: -total, ease: "none", scrollTrigger: st });
      gsap.to(leftCircle.querySelectorAll("p"), { rotation: "+=" + total, ease: "none", scrollTrigger: st });
      gsap.to(rightCircle, { rotation: -total, ease: "none", scrollTrigger: st });
      gsap.to(rightCircle.querySelectorAll(".note"), { rotation: "+=" + total, ease: "none", scrollTrigger: st });
    }, root);

    return () => ctx.revert();
  }, []);
  return (
    <>
          <LandingNavbar />

      <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content" className="bg-white text-black font-sans overflow-hidden">

          {/* HERO */}
          <section className="min-h-screen bg-white text-black flex flex-col items-center justify-center text-center px-6 py-24 relative">
            <img 
              data-anim-heading 
              src={logoImg} 
              alt="Miiles Logo" 
              className="w-14 h-14 mx-auto mb-3 logo-spin" 
            />
            <span data-anim-heading className="text-[22px] font-normal mb-8 tracking-tight">
              Miiles
            </span>
            
            <h1
              className="hero-title no-split text-[42px] sm:text-6xl md:text-8xl lg:text-[95px] font-normal leading-[1.1] tracking-tight mb-10"
            >
              <span className="block md:inline">
                {renderWord("Hoy")} {renderWord("es")}{" "}
              </span>
              <span className="block md:inline">
                {renderWord("un")} {renderWord("buen")} {renderWord("día")}{" "}
              </span>
              <span className="block">
                {renderWord("para")} {renderWord("crear")}
              </span>
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
          </section>

          {/* BRAND CAROUSEL (Relocated) */}
          <section className="pt-4 pb-6 overflow-hidden">
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

          {/* ORBITING WORDS + NOTES (mwg_effect040) */}
          <section ref={orbitSectionRef} className="mwg_effect040">
            <p className="scroll">Scroll</p>
            <div className="pin-height">
              <div className="container">
                <div className="parent-circle parent-circle-left">
                  {orbitWords.map((word) => (
                    <div className="circle" key={word}>
                      <p className="label">{word}</p>
                    </div>
                  ))}
                </div>
                <div className="parent-circle parent-circle-right">
                  {orbitNotes.map((note) => (
                    <div className="circle" key={note.title}>
                      <div className="note" style={{ background: note.bg }}>
                        <span className="note-tag">{note.tag}</span>
                        <h4 className="note-title">{note.title}</h4>
                        {note.type === "todo" && note.todos ? (
                          <div className="note-todos flex flex-col gap-1.5 overflow-hidden mt-1.5 w-full">
                            {note.todos.map((todo, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[0.8vw] text-neutral-800 leading-tight">
                                <span className={`w-[0.9vw] h-[0.9vw] min-w-[0.9vw] min-h-[0.9vw] border border-neutral-400 rounded-sm flex items-center justify-center shrink-0 ${todo.checked ? 'bg-neutral-800 border-neutral-800' : 'bg-transparent'}`}>
                                  {todo.checked && (
                                    <svg viewBox="0 0 24 24" fill="none" className="w-[0.6vw] h-[0.6vw] stroke-white stroke-[3]">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </span>
                                <span className={`truncate ${todo.checked ? 'line-through opacity-45 text-neutral-500' : 'text-neutral-800 font-normal'}`}>
                                  {todo.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="note-content text-[0.85vw] font-light text-neutral-700 leading-relaxed mt-1.5 italic">
                            "{note.content}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* 3D SCROLL TEXT PERSPECTIVE (mwg_effect053) */}
          <section ref={scrollTextSectionRef} className="mwg_effect053 bg-[#4059F1] text-white relative z-10">
            <div className="pin-height">
              <div className="container">
                <p className="paragraphs">
                  Unifica tus ideas<br />
                  en un solo lugar<br />
                  y empieza a crear.
                </p>
                <p className="paragraphs">
                  Un espacio para<br />
                  conectar y co-crear<br />
                  sin límites.
                </p>
              </div>
            </div>
          </section>

          {/* VIDEO */}
          <section className="py-24 flex justify-center items-center overflow-hidden bg-white">
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
          <section className="py-32 px-6 scroll-mt-24 bg-black text-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight text-center mb-20">
                <span className="block">Un sistema.</span>
                <span className="block">
                  Más&nbsp;<span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>ganancias.</span>
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COL 1 — Encuentra colaboraciones */}
                <div data-anim-heading className="flex flex-col bg-zinc-950 border border-zinc-900 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(255,255,255,0.05)] group">
                  <div className="rounded-2xl overflow-hidden bg-zinc-900/50 mb-8">
                    <img
                      src="https://wearemiiles.com/wp-content/uploads/2026/01/3232-932x1024.png"
                      alt="Encuentra colaboraciones"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                    Encuentra colaboraciones
                  </h3>
                  <p data-split className="text-sm font-light text-zinc-400 text-center leading-relaxed max-w-sm mx-auto">
                    En Miiles encontrarás oportunidades únicas para impulsar tu marca.
                  </p>
                </div>

                {/* COL 2 — Haz que tu idea suene */}
                <div data-anim-heading className="flex flex-col bg-zinc-950 border border-zinc-900 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(255,255,255,0.05)] group">
                  <div className="rounded-2xl overflow-hidden bg-zinc-900/50 mb-8">
                    <img
                      src="https://wearemiiles.com/wp-content/uploads/2026/01/new233-933x1024.png"
                      alt="Haz que tu idea suene"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                    Haz que tu idea suene con fuerza de ventas
                  </h3>
                  <p data-split className="text-sm font-light text-zinc-400 text-center leading-relaxed max-w-sm mx-auto">
                    Si tu marca vende servicios o productos, haz que otros vendedores en todo el mundo también los ofrezcan.
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* TESTIMONIO */}
          <section className="py-40 px-6 bg-[#FCB5B9] text-black">
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
                <span className="text-[10px] text-neutral-700 font-light mt-1">CEO de BeeSpeaker</span>
              </div>
            </div>
          </section>

          <section ref={section059Ref} className="mwg_effect059 bg-[#4059F1]">
            <div className="pin-height">
              <div className="mwg-container">
                <svg id="mysvg" fill="none" width="3898" height="891" viewBox="0 0 3898 891" xmlns="http://www.w3.org/2000/svg">
                  <path id="mypath" d="M0.398438 611.016C175.398 377.517 857.398 -285.484 1461.4 139.638C1911.53 456.46 2114.4 805.516 2679.4 611.016C3088.4 470.219 3704.54 -33.3124 4354.9 781.516C4700.9 1215.02 5305.6 1466.52 6108.4 328.516" />
                  <text id="text">
                    <textPath id="textpath" href="#mypath" textAnchor="start" fontSize="260">
                      Es horaaaaaa de crearrrrrrrrr
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </section>

          {/* MOBILE CTA */}
          <section className="block md:hidden py-24 px-6 bg-white text-center">
            <h2 className="text-4xl sm:text-5xl font-normal leading-tight tracking-tight mb-8 text-black">
              Es hora de crear
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
          </section>

          {/* DESKTOP CTA */}
          <section className="hidden md:flex pb-32 px-6 bg-white flex-col items-center justify-center pt-8">
            <p className="text-gray-500 mb-6 font-light">crea tu cuenta hoy mismo</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-black text-white text-base font-light hover:-translate-y-2 transition-transform duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
              </svg>
              Prueba Miiles gratis
            </Link>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Landing;
