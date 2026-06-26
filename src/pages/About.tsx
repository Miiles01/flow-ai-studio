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

    const runMwgEffect = () => {
      let mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const root = document.querySelector('.mwg_effect098');
        if (!root) return;
        const pinHeight = root.querySelector('.pin-height');
        const container = root.querySelector('.container');
        const placeholderEl = root.querySelector('.placeholder');
        const pathsContainer = root.querySelector('.paths');
        
        if (!pathsContainer || !placeholderEl) return;
        
        pathsContainer.querySelectorAll('.circle').forEach(c => c.remove());
        let svgTemplate = pathsContainer.querySelector('svg.template') as SVGSVGElement;
        if (!svgTemplate) {
           svgTemplate = pathsContainer.querySelector('svg') as SVGSVGElement;
           if (svgTemplate) svgTemplate.classList.add('template');
        }
        if (!svgTemplate) return;
        
        svgTemplate.style.display = 'none';
        
        const fullText = placeholderEl.textContent?.trim() || "";
        let svgIndex = 0;

        function scaleForIndex(index: number) {
            return Math.max(0.1, 1 - 0.1 * (index - 1));
        }

        function getArcCenter(path: SVGPathElement) {
            const len = path.getTotalLength();
            const p1 = path.getPointAtLength(0);
            const p2 = path.getPointAtLength(len / 2);
            const p3 = path.getPointAtLength(len);
            const [{ x: ax, y: ay }, { x: bx, y: by }, { x: cx, y: cy }] = [p1, p2, p3];
            const a2 = ax * ax + ay * ay;
            const b2 = bx * bx + by * by;
            const c2 = cx * cx + cy * cy;
            const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
            if (d === 0) return {x: 0, y: 0};
            return {
                x: (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d,
                y: (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d,
            }
        }

        function applyArcTransformOrigin(circle: HTMLElement, path: SVGPathElement, scale: number) {
            const svg = circle.querySelector('svg');
            if (!svg) return;
            const vb = svg.viewBox.baseVal;
            const center = getArcCenter(path);
            const cxNorm = (center.x - vb.x) / vb.width;
            const cyNorm = (center.y - vb.y) / vb.width;
            const cxPct = (1 - scale) * 50 + cxNorm * scale * 100;
            const cyPct = cyNorm * scale * 100;
            circle.style.transformOrigin = `${cxPct}% ${cyPct}%`;
        }

        function createArc() {
            svgIndex += 1;
            const svg = svgTemplate!.cloneNode(true) as SVGSVGElement;
            svg.style.display = 'block';
            svg.classList.remove('template');
            const path = svg.querySelector('path');
            if (!path) return { path: null, textPath: null };
            
            const pathId = `path_mwg_${svgIndex}`;
            path.id = pathId;

            const textPath = svg.querySelector('textPath');
            if (textPath) {
               textPath.setAttribute('href', `#${pathId}`);
               textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${pathId}`);
            }

            const scale = scaleForIndex(svgIndex);
            const textEl = svg.querySelector('text');
            if (textEl) {
               textEl.setAttribute('font-size', String(Math.round(65 / scale)));
            }

            const circle = document.createElement('div');
            circle.className = 'circle';
            circle.appendChild(svg);
            pathsContainer!.appendChild(circle);

            applyArcTransformOrigin(circle, path, scale);

            return { path, textPath };
        }

        function measureTextLength(textPath: SVGTextPathElement, content: string) {
            textPath.textContent = content;
            let length = 0;
            if (typeof textPath.getComputedTextLength === 'function') {
                length = textPath.getComputedTextLength();
            }
            if (!length) {
                try {
                    const bbox = textPath.getBBox();
                    length = bbox ? bbox.width : 0;
                } catch (e) {
                    length = 0;
                }
            }
            return length;
        }

        function splitTextAcrossSvgs(text: string) {
            const words = text.split(/\s+/).filter(Boolean);
            let wordIndex = 0;

            while (wordIndex < words.length) {
                const { path, textPath } = createArc();
                if (!path || !textPath) break;
                
                const pathLength = path.getTotalLength() * 0.98;

                let current = '';
                let lastGood = '';

                while (wordIndex < words.length) {
                    const nextWord = words[wordIndex];
                    const candidate = current ? current + ' ' + nextWord : nextWord;
                    const textLength = measureTextLength(textPath as SVGTextPathElement, candidate);

                    if (textLength <= pathLength) {
                        current = candidate;
                        lastGood = candidate;
                        wordIndex += 1;
                    } else {
                        if (!current) {
                            let fit = '';
                            let charIdx = 0;
                            while (charIdx < nextWord.length) {
                                const tryFit = fit + nextWord[charIdx];
                                if (measureTextLength(textPath as SVGTextPathElement, tryFit) <= pathLength) {
                                    fit = tryFit;
                                    charIdx += 1;
                                } else break;
                            }
                            if (fit) {
                                current = fit;
                                const remaining = nextWord.slice(fit.length);
                                if (remaining) words[wordIndex] = remaining;
                                else wordIndex += 1;
                            }
                        }
                        break;
                    }
                }

                textPath.textContent = current || lastGood;
            }
        }
        
        splitTextAcrossSvgs(fullText);

        const master = gsap.timeline({
            scrollTrigger: {
                trigger: pinHeight,
                start: 'top top',
                end: 'bottom bottom',
                pin: container,
                scrub: 1
            }
        });

        const circles = root.querySelectorAll('.circle');
        const texts: string[] = [];

        circles.forEach(circle => {
            const textPath = circle.querySelector('textPath');
            if (textPath) {
               texts.push(textPath.textContent || "");
               textPath.textContent = '';
            }
        });

        circles.forEach((circle, i) => {
            const textPath = circle.querySelector('textPath');
            const text = texts[i];

            master.add(gsap.to(circle, {
                rotate: 0,
                ease: 'power2.inOut',
                duration: 2,
                onUpdate() {
                    const count = Math.floor(this.progress() * text.length);
                    if (textPath) textPath.textContent = text.substring(0, count);
                }
            }), i * (1 / circles.length));
        });
      });
    };

    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) {
      fontsReady.then(() => {
        runSplit();
        runMwgEffect();
      });
    } else {
      runSplit();
      runMwgEffect();
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
              
              <span className="fade-up text-lg md:text-xl font-normal text-gray-400 mb-6">
                Sobre nosotros
              </span>
              
              <p className="fade-up text-lg md:text-xl font-light text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Somos una empresa dedicada al desarrollo de procesos creativos con inteligencia artificial.
              </p>
            </div>
          </section>

          {/* NUESTRA MISIÓN (MOBILE - TEXTO NORMAL) */}
          <section className="pt-32 pb-20 px-6 block md:hidden">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-normal tracking-tighter mb-12">Nuestra misión</h2>
              <div className="fade-up space-y-4 text-xl font-light text-gray-500">
                <p>Nuestra misión es construir sistemas de productividad con inteligencia artificial para que recuperes el control de tu tiempo.</p>
              </div>
            </div>
          </section>

          {/* NUESTRA MISIÓN (DESKTOP/TABLET - ARC ANIMATION) */}
          <section className="mwg_effect098 relative w-full bg-black text-white rounded-[4rem] hidden md:block">
            <div className="pin-height">
              <div className="container">
                <p className="placeholder">Nuestra misión es construir sistemas de productividad con inteligencia artificial para que recuperes el control de tu tiempo.</p>
                <div className="paths" aria-hidden="true">
                  <svg viewBox="0 0 845 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 74.5322C135.056 25.4113 278.148 0 422.938 0C567.414 0 710.2 25.3004 845 74.2129"/>
                    <text xmlSpace="preserve" textAnchor="middle" fontSize="60">
                      <textPath startOffset="50%"></textPath>
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* QUÉ HACEMOS */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-7xl font-normal tracking-tighter mb-12">Qué hacemos</h2>
              <div className="fade-up space-y-4 text-xl md:text-2xl font-light text-gray-500">
                <p>Creamos las herramientas que hacen más simple arrancar y operar un negocio.</p>
              </div>
            </div>
          </section>

          {/* HISTORIA (STORY) */}
          <section className="py-32 px-6 bg-white">
            <div className="max-w-5xl mx-auto flex flex-col gap-16 items-center">
              <div className="w-full aspect-video rounded-[2rem] overflow-hidden fade-up shadow-2xl">
                <img 
                  src="/miiles-jacket.jpg" 
                  alt="Equipo Miiles" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col max-w-3xl">
                <div className="fade-up space-y-6 text-lg font-light text-gray-600 leading-normal text-center md:text-left">
                  <p>
                    <span className="text-black font-normal">Miiles nació en 2019 como Miiles Creative Studio</span>, un pequeño estudio en la Ciudad de México fundado por Miiles Horton con una idea clara: ayudar a negocios locales a construir marcas que compitieran en serio. Imagen, diseño, posicionamiento. Nada más, nada menos.
                  </p>
                  <p>
                    El portafolio fue creciendo. ERPxtender, TikTok, BeeSpeaker, Naabi Kanabi. Cada cliente sumó perspectiva sobre cómo los negocios realmente operan y dónde se atascan.
                  </p>
                  <p>
                    En 2024 Miiles lanzó Auto-flex, una apuesta por negocios automatizados y flexibles, y con eso pisó por primera vez el territorio de la IA. No fue un pivot de marketing. Fue el inicio de una transformación que meses después daría forma a Miiles AI.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="py-40 px-6">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <h2 className="pt-2 text-5xl md:text-8xl font-normal tracking-tighter mb-12 leading-[1.2] md:leading-[1.2]">
                Únete al <span className="pr-2 md:pr-4" style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>cambio</span>
              </h2>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-black text-white text-base font-light hover:-translate-y-2 transition-transform duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                </svg>
                Prueba Miiles
              </Link>
            </div>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default About;
