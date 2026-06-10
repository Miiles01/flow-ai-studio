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

const brandLogos = [brand1, brand2, brand3, brand4, brand5, brand6];

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase, InertiaPlugin);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const Landing = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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

  // Mouse-trail animation mwg_062 with sticky notes (post-its)
  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;

    const trailCards = [
      {
        type: "todolist",
        header: "Today ▾",
        title: "Stuff I got to get done TODAY",
        items: [
          { text: "Just throw in stickies", checked: true },
          { text: "Can have due dates", checked: false },
          { text: "Floats on top", checked: false },
        ],
        bg: "#FDF2F8", // Soft pink
        textCol: "#1E293B",
        width: "165px",
        height: "175px",
      },
      {
        type: "note",
        header: "A note",
        title: "Longer form notes show up as paper. They can have due dates too.",
        text: "Capture ideas and organize them in a natural way that supercharges your brain. Put notes freely on a two-dimensional board.",
        bg: "#FFFFFF",
        textCol: "#1E293B",
        footer: "On Friday ▾",
        width: "180px",
        height: "220px",
      },
      {
        type: "list",
        header: "Pickup",
        items: [
          { text: "Bread" },
          { text: "Milk" },
          { text: "Ice cream" },
        ],
        bg: "#EFF6FF", // Soft blue
        textCol: "#1E293B",
        width: "150px",
        height: "150px",
      },
      {
        type: "neon", // (acting as a plain text card)
        text: "Loving the vibe of these grainy vintage photos. Let's do more of that",
        bg: "#FDF2F8", // Soft pink
        textCol: "#1E293B",
        width: "145px",
        height: "145px",
      },
      {
        type: "todolist",
        header: "Untitled",
        title: "Spatial organisation for keeping notes, prose and tasks.",
        items: [
          { text: "Create a paper", checked: true },
          { text: "Some level of detail", checked: false },
        ],
        bg: "#FFFFFF",
        textCol: "#1E293B",
        width: "180px",
        height: "190px",
      },
      {
        type: "note",
        header: "Contrasts",
        title: "Some notes want to stand out. Contrast by color helps.",
        text: "Capture ideas and organize them in a natural way that supercharges your brain. Put notes freely on a board.",
        bg: "#1E293B", // Dark slate / Black
        textCol: "#F8FAFC",
        width: "180px",
        height: "210px",
      },
      {
        type: "neon",
        text: "Fleeting notes attached to a bigger note being worked on",
        bg: "#EFF6FF", // Soft blue
        textCol: "#1E293B",
        width: "145px",
        height: "145px",
      },
      {
        type: "todolist",
        header: "Marketing",
        title: "Launch campaign checklist",
        items: [
          { text: "Setup landing page", checked: true },
          { text: "TikTok video script", checked: false },
          { text: "Run beta test", checked: false },
        ],
        bg: "#FFFFFF",
        textCol: "#1E293B",
        width: "165px",
        height: "175px",
      }
    ];

    let isTouch = false;
    const mm = gsap.matchMedia();
    mm.add("(hover: none)", () => {
      isTouch = true;
    });

    let incr = 0;
    let oldIncrX = 0;
    let oldIncrY = 0;
    let resetDist = window.innerWidth / (isTouch ? 3 : 8);
    let indexCard = 0;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const clampX = gsap.utils.clamp(0, W);
    const clampY = gsap.utils.clamp(0, H);

    function applyMove(clientX: number, clientY: number) {
      if (window.scrollY > 250) return; // Only spawn notes when scroll is near the top

      const rect = root.getBoundingClientRect();
      const valX = clientX - rect.left;
      const valY = clientY - rect.top;

      incr += Math.abs(clientX - oldIncrX) + Math.abs(clientY - oldIncrY);

      if (incr > resetDist) {
        incr = 0;
        createMedia(valX, valY, clientX - oldIncrX, clientY - oldIncrY);
      }

      oldIncrX = clientX;
      oldIncrY = clientY;
    }

    function handleMouseMove(e: MouseEvent) {
      applyMove(e.clientX, e.clientY);
    }
    function handleTouchMove(e: TouchEvent) {
      if (!e.touches || !e.touches[0]) return;
      applyMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    const initPointer = (clientX: number, clientY: number) => {
      oldIncrX = clientX;
      oldIncrY = clientY;
    };

    const handleMouseMoveOnce = (e: MouseEvent) => {
      initPointer(e.clientX, e.clientY);
    };
    const handleTouchStartOnce = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return;
      initPointer(e.touches[0].clientX, e.touches[0].clientY);
    };

    root.addEventListener("mousemove", handleMouseMoveOnce, { once: true });
    root.addEventListener("touchstart", handleTouchStartOnce, { once: true, passive: true });

    root.addEventListener("mousemove", handleMouseMove);
    root.addEventListener("touchmove", handleTouchMove, { passive: true });

    function createMedia(x: number, y: number, deltaX: number, deltaY: number) {
      const card = document.createElement("div");
      const currentCard = trailCards[indexCard];
      
      let innerHTML = "";

      if (currentCard.type === "todolist") {
        innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; text-align: left; font-family: 'Poppins', sans-serif;">
            <div style="font-size: 9px; font-weight: 500; opacity: 0.5; margin-bottom: 6px; color: ${currentCard.textCol};">
              ${currentCard.header}
            </div>
            <div style="font-size: 11px; font-weight: 600; line-height: 1.35; margin-bottom: 10px; color: ${currentCard.textCol};">
              ${currentCard.title}
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px; flex-grow: 1;">
              ${currentCard.items ? currentCard.items.map(item => `
                <div style="display: flex; align-items: center; font-size: 10px; color: ${currentCard.textCol}; opacity: ${item.checked ? 0.45 : 0.8}; text-decoration: ${item.checked ? 'line-through' : 'none'}; font-family: 'Poppins', sans-serif;">
                  ${item.checked 
                    ? `<span style="width: 11px; height: 11px; border-radius: 50%; background-color: ${currentCard.textCol}; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 7px; color: ${currentCard.bg === '#FFFFFF' ? '#FFF' : (currentCard.bg === '#1E293B' ? '#1E293B' : '#FFF')}; font-weight: bold; shrink: 0; font-family: 'Poppins', sans-serif;">✓</span>`
                    : `<span style="width: 11px; height: 11px; border-radius: 50%; border: 1px solid ${currentCard.textCol}40; display: inline-block; margin-right: 6px; shrink: 0;"></span>`
                  }
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.text}</span>
                </div>
              `).join('') : ''}
            </div>
          </div>
        `;
      } else if (currentCard.type === "list") {
        innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; text-align: left; font-family: 'Poppins', sans-serif;">
            <div style="font-size: 9px; font-weight: 500; opacity: 0.5; margin-bottom: 6px; color: ${currentCard.textCol};">
              ${currentCard.header}
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px; flex-grow: 1; justify-content: center;">
              ${currentCard.items ? currentCard.items.map(item => `
                <div style="font-size: 10.5px; font-weight: 500; color: ${currentCard.textCol}; opacity: 0.85; padding-left: 2px; font-family: 'Poppins', sans-serif;">
                  • ${item.text}
                </div>
              `).join('') : ''}
            </div>
          </div>
        `;
      } else if (currentCard.type === "note") {
        innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; text-align: left; font-family: 'Poppins', sans-serif;">
            <div style="font-size: 9px; font-weight: 500; opacity: 0.5; margin-bottom: 6px; color: ${currentCard.textCol};">
              ${currentCard.header}
            </div>
            <div style="font-size: 11px; font-weight: 600; line-height: 1.35; margin-bottom: 8px; color: ${currentCard.textCol};">
              ${currentCard.title}
            </div>
            <div style="font-size: 9.5px; font-weight: 300; line-height: 1.4; opacity: 0.6; flex-grow: 1; color: ${currentCard.textCol}; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-family: 'Poppins', sans-serif;">
              ${currentCard.text}
            </div>
            ${currentCard.footer ? `
              <div style="font-size: 8px; font-weight: 500; opacity: 0.5; text-align: right; margin-top: auto; padding-top: 6px; color: ${currentCard.textCol}; font-family: 'Poppins', sans-serif;">
                ${currentCard.footer}
              </div>
            ` : ''}
          </div>
        `;
      } else if (currentCard.type === "neon") {
        innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; justify-content: center; text-align: left; font-family: 'Poppins', sans-serif; padding: 2px;">
            <div style="font-size: 12px; font-weight: 600; line-height: 1.4; color: ${currentCard.textCol}; font-family: 'Poppins', sans-serif;">
              ${currentCard.text}
            </div>
          </div>
        `;
      }

      card.innerHTML = innerHTML;

      card.style.position = "absolute";
      card.style.width = window.innerWidth <= 768 ? "120px" : currentCard.width;
      card.style.height = window.innerWidth <= 768 ? "120px" : currentCard.height;
      card.style.backgroundColor = currentCard.bg;
      card.style.border = "none";
      card.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)";
      card.style.borderRadius = "16px";
      card.style.padding = "14px";
      card.style.zIndex = "20"; // elevated above z-10 text/buttons
      card.style.pointerEvents = "none";
      card.style.left = "0px";
      card.style.top = "0px";
      card.style.overflow = "hidden";

      root.appendChild(card);

      const tl = gsap.timeline({
        onComplete: () => {
          if (root.contains(card)) {
            root.removeChild(card);
          }
          tl && tl.kill();
        },
      });

      tl.fromTo(
        card,
        {
          xPercent: -50 + (Math.random() - 0.5) * 80,
          yPercent: -50 + (Math.random() - 0.5) * 10,
          scaleX: 1.3,
          scaleY: 1.3,
        },
        {
          scaleX: 1,
          scaleY: 1,
          ease: "elastic.out(2, 0.6)",
          duration: 0.6,
        }
      );

      tl.fromTo(
        card,
        {
          x,
          y,
          rotation: (Math.random() - 0.5) * 30,
        },
        {
          rotation: (Math.random() - 0.5) * 30,
          inertia: {
            x: {
              velocity: deltaX * 40,
              end: x,
            },
            y: {
              velocity: deltaY * 40,
              end: y,
            },
          },
        },
        "<"
      );

      tl.to(card, {
        duration: 0.3,
        scale: 0.5,
        delay: 0.2,
        ease: "back.in(1.5)",
      });

      indexCard = (indexCard + 1) % trailCards.length;
    }

    return () => {
      mm.revert();
      root.removeEventListener("mousemove", handleMouseMoveOnce);
      root.removeEventListener("touchstart", handleTouchStartOnce);
      root.removeEventListener("mousemove", handleMouseMove);
      root.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <>
      <LandingNavbar />

      <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content" className="bg-white text-black font-sans overflow-hidden">

          {/* HERO */}
          <section ref={heroRef} className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-10 relative">
            <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
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
                className="no-split text-6xl md:text-8xl lg:text-[95px] font-normal leading-[1.1] tracking-tight mb-10 text-center"
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
          </section>

          {/* BRAND CAROUSEL (Relocated) */}
          <section className="py-16 overflow-hidden">
            <h4 className="text-center text-xs font-light text-gray-400 mb-8 tracking-widest">
              Elegido por
            </h4>
            <div className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
              <div className="flex w-max animate-marquee gap-20 items-center">
                {[...brandLogos, ...brandLogos].map((logo, i) => (
                  <img key={i} src={logo} alt="" className="h-6 md:h-7 w-auto opacity-70 shrink-0" />
                ))}
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
