import { useEffect, useRef, useState } from "react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const Privacy = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("recoleccion");

  const sections = [
    { id: "recoleccion", title: "1. Recopilación de Información" },
    { id: "uso", title: "2. Uso de la Información" },
    { id: "compartir", title: "3. Cómo Compartimos la Información" },
    { id: "seguridad", title: "4. Seguridad de tus Datos" },
    { id: "derechos", title: "5. Tus Derechos de Privacidad" },
    { id: "contacto", title: "6. Información de Contacto" },
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
              <span className="text-xs font-semibold tracking-wider text-miiles-blue mb-3 block">
                Privacidad y Seguridad
              </span>
              <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-neutral-900 mb-6">
                Política de privacidad
              </h1>
              <p className="text-md font-light text-gray-500 max-w-xl mx-auto leading-relaxed">
                Última actualización: 10 de junio de 2026. Tu privacidad es de vital importancia para nosotros. Entérate de cómo recopilamos y tratamos tus datos personales.
              </p>
            </div>
          </section>

          {/* Content area: Sidebar + Main Text */}
          <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
            <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-16">
              
              {/* Sidebar container grid cell */}
              <div className="hidden lg:block w-[250px]">
                {/* Sticky Sidebar Index */}
                <aside ref={sidebarRef} className="bg-neutral-50/50 backdrop-blur-md border border-neutral-100 p-5 rounded-[24px] w-[250px]">
                  <h3 className="text-xs font-semibold tracking-wider text-neutral-400 mb-4 px-2">
                    Índice
                  </h3>
                  <nav className="flex flex-col gap-1.5">
                    {sections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleScrollTo(section.id)}
                          className={`text-left text-sm py-2 px-3 rounded-xl transition-all duration-300 flex items-center gap-2.5 ${
                            isActive
                              ? "font-medium text-miiles-blue bg-[#E8ECFE]/50 translate-x-1"
                              : "font-light text-neutral-500 hover:text-neutral-900 hover:bg-white/70 hover:translate-x-1"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? "bg-miiles-blue scale-100" : "bg-transparent scale-0"}`} />
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
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    1. Recopilación de Información
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Recopilamos información personal cuando la proporcionas directamente al registrarte en Miiles, como tu nombre, dirección de correo electrónico, y datos de perfil profesional o comercial.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    También recopilamos información de manera automática a través del uso de la Plataforma. Esto incluye datos técnicos de tu dispositivo, tu dirección IP, el tipo de navegador que utilizas, e información detallada de tu interacción con el lienzo y nuestras herramientas interactivas de IA.
                  </p>
                </div>

                <div id="uso" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    2. Uso de la Información
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Utilizamos tu información personal para operar, mantener y mejorar las herramientas del Servicio. Esto incluye la personalización de tu lienzo digital, la sincronización de colaboración en tiempo real con avatares de tu equipo y el procesamiento de tus solicitudes con nuestros modelos de Inteligencia Artificial.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Asimismo, utilizamos tu correo electrónico para enviarte notificaciones técnicas importantes, avisos de facturación, o información relevante de la plataforma sobre oportunidades de colaboración con marcas. Puedes optar por no recibir correos promocionales en cualquier momento.
                  </p>
                </div>

                <div id="compartir" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    3. Cómo Compartimos la Información
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Miiles no vende tus datos personales a terceros bajo ninguna circunstancia. Compartimos información con proveedores de servicios de confianza que nos ayudan a operar la plataforma (como bases de datos e integradores de autenticación y pasarelas de pago), siempre bajo estrictos términos de confidencialidad.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Adicionalmente, si decides participar de forma voluntaria en campañas de colaboración con marcas o portafolios públicos, la información que decidas compartir en dicho perfil será visible para las marcas registradas asociadas en Miiles.
                  </p>
                </div>

                <div id="seguridad" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    4. Seguridad de tus Datos
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    La seguridad de tu información es de suma importancia. Implementamos medidas técnicas y organizativas robustas, como protocolos de encriptación de datos SSL/TLS durante la transmisión y almacenamiento seguro en servidores, para proteger tu información contra acceso no autorizado, alteración o destrucción.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    A pesar de nuestros esfuerzos, te recordamos que ningún método de transmisión a través de Internet o almacenamiento electrónico es 100% infalible, por lo que te sugerimos proteger siempre tus contraseñas y accesos.
                  </p>
                </div>

                <div id="derechos" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    5. Tus Derechos de Privacidad
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Dependiendo de tu ubicación geográfica, puedes contar con ciertos derechos sobre tus datos personales conforme a normativas de protección de datos (como el RGPD o leyes equivalentes). Estos derechos incluyen solicitar acceso a tus datos personales, la corrección de errores, o la eliminación total de tus registros en nuestra base de datos.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Si deseas ejercitar cualquiera de tus derechos o solicitar la baja de tu cuenta y la remoción completa de tus datos personales, puedes gestionarlo directamente en la sección de perfil de tu cuenta o contactarnos mediante nuestro correo de soporte legal.
                  </p>
                </div>

                <div id="contacto" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    6. Información de Contacto
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-blue mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Si tienes dudas, sugerencias o comentarios acerca de esta Política de Privacidad o la forma en que tratamos tus datos personales en la plataforma, no dudes en escribirnos a nuestro correo de contacto o soporte:
                  </p>
                  <p className="text-md font-normal text-neutral-800 leading-relaxed">
                    Soporte legal: legal@miiles.app
                  </p>
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
