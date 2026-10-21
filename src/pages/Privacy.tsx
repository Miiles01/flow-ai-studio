import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const Privacy = () => {
  const { t } = useTranslation();
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("recoleccion");

  const sections = [
    { id: "recoleccion", title: t("legal.privacy.text1") },
    { id: "uso", title: t("legal.privacy.text2") },
    { id: "compartir", title: t("legal.privacy.text3") },
    { id: "seguridad", title: t("legal.privacy.text4") },
    { id: "derechos", title: t("legal.privacy.text5") },
    { id: "contacto", title: t("legal.privacy.text6") },
  ];

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-privacy",
      content: "#smooth-content-privacy",
      smooth: 1.4,
      effects: true,
    });

    // Simple fade-in animation for headers and sections
    gsap.fromTo(
      ".fade-in-legal",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".fade-in-legal",
          start: "top 90%",
          once: true,
        },
      }
    );

    // Setup ScrollTrigger pinning for sticky sidebar
    let pinTrigger: ScrollTrigger | null = null;
    if (sidebarRef.current && containerRef.current) {
      pinTrigger = ScrollTrigger.create({
        trigger: sidebarRef.current,
        start: "top 112px", // 112px is equivalent to top-28
        endTrigger: containerRef.current,
        end: () => `bottom top+=${sidebarRef.current ? sidebarRef.current.offsetHeight + 112 : 500}`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    }

    // Setup intersection observer for scrollspy
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // triggers when section is in upper-mid viewport
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      smootherRef.current?.kill();
      pinTrigger?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      observer.disconnect();
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      smootherRef.current?.scrollTo(element, true, "top 100");
      setActiveSection(id);
    }
  };

  return (
    <>
      <LandingNavbar />

      <div id="smooth-wrapper-privacy" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-privacy" className="bg-white text-black font-sans pb-0">
          
          {/* Header section with brand gradient background */}
          <section className="pt-40 pb-20 px-6 relative overflow-hidden bg-gradient-to-b from-[#E8ECFE]/40 via-white to-white">
            {/* Soft background glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#E8ECFE] via-[#FEEDED]/40 to-transparent blur-3xl opacity-60 pointer-events-none" />
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <span className="text-xs font-semibold tracking-wider text-miiles-blue mb-3 block">{t("legal.privacy.text7")}</span>
              <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-neutral-900 mb-6">{t("legal.privacy.text8")}</h1>
              <p className="text-md font-light text-gray-500 max-w-xl mx-auto leading-relaxed">{t("legal.privacy.text9")}</p>
            </div>
          </section>

          {/* Content area: Sidebar + Main Text */}
          <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
            <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-16">
              
              {/* Sidebar container grid cell */}
              <div className="hidden lg:block w-[250px]">
                {/* Sticky Sidebar Index */}
                <aside ref={sidebarRef} className="bg-neutral-50/50 backdrop-blur-md border border-neutral-100 p-5 rounded-[24px] w-[250px]">
                  <h3 className="text-xs font-semibold tracking-wider text-neutral-400 mb-4 px-2">{t("legal.privacy.text10")}</h3>
                  <nav className="flex flex-col gap-1.5">
                    {sections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleScrollTo(section.id)}
                          className={`text-left text-sm py-2 px-3 rounded-xl transition-all duration-300 flex items-center ${
                            isActive
                              ? "font-medium text-miiles-blue bg-[#E8ECFE]/50 translate-x-1"
                              : "font-light text-neutral-500 hover:text-neutral-900 hover:bg-white/70 hover:translate-x-1"
                          }`}
                        >
                          <span className="truncate">{section.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </aside>
              </div>

              {/* Main content document */}
              <article className="fade-in-legal space-y-12 text-left">
                
                <div id="recoleccion" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">{t("legal.privacy.text1")}</h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text11")}</p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text12")}</p>
                </div>

                <div id="uso" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">{t("legal.privacy.text2")}</h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text13")}</p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text14")}</p>
                </div>

                <div id="compartir" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">{t("legal.privacy.text3")}</h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text15")}</p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text16")}</p>
                </div>

                <div id="seguridad" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">{t("legal.privacy.text4")}</h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text17")}</p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text18")}</p>
                </div>

                <div id="derechos" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">{t("legal.privacy.text5")}</h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text19")}</p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text20")}</p>
                </div>

                <div id="contacto" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">{t("legal.privacy.text6")}</h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">{t("legal.privacy.text21")}</p>
                  <p className="text-md font-normal text-neutral-800 leading-relaxed">{t("legal.privacy.text22")}</p>
                </div>

              </article>
            </div>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Privacy;
