import { useEffect, useRef, useState } from "react";
import LandingFooter from "@/components/LandingFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const Terms = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("aceptacion");

  const sections = [
    { id: "aceptacion", title: "1. Aceptación de los Términos" },
    { id: "descripcion", title: "2. Descripción del Servicio" },
    { id: "cuentas", title: "3. Registro y Cuentas de Usuario" },
    { id: "propiedad", title: "4. Propiedad Intelectual" },
    { id: "limitacion", title: "5. Limitación de Responsabilidad" },
    { id: "modificaciones", title: "6. Modificaciones del Servicio y Términos" },
  ];

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-terms",
      content: "#smooth-content-terms",
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

      <div id="smooth-wrapper-terms" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-terms" className="bg-white text-black font-sans pb-0">
          
          {/* Header section with brand gradient background */}
          <section className="pt-40 pb-20 px-6 relative overflow-hidden bg-gradient-to-b from-[#FEEDED]/40 via-white to-white">
            {/* Soft background glow */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FEEDED] via-[#E8ECFE]/40 to-transparent blur-3xl opacity-60 pointer-events-none" />
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <span className="text-xs font-semibold tracking-wider text-miiles-blue mb-3 block">
                Información Legal
              </span>
              <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-neutral-900 mb-6">
                Términos y condiciones
              </h1>
              <p className="text-md font-light text-gray-500 max-w-xl mx-auto leading-relaxed">
                Última actualización: 10 de junio de 2026. Por favor, lee atentamente estos términos antes de utilizar nuestra plataforma.
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
                
                <div id="aceptacion" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    1. Aceptación de los Términos
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-pink mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Al acceder, registrarte o utilizar la plataforma de Miiles (en adelante, "el Servicio" o "la Plataforma"), aceptas quedar vinculado por los presentes Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder ni utilizar nuestros servicios.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Estos términos constituyen un acuerdo legal vinculante entre tú como usuario y Miiles. Nos reservamos el derecho de actualizar estos términos en cualquier momento, lo cual será debidamente notificado a través de la plataforma.
                  </p>
                </div>

                <div id="descripcion" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    2. Descripción del Servicio
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-pink mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Miiles es una plataforma interactiva de networking, diseño de flujos de trabajo e inteligencia artificial dirigida a emprendedores, profesionales independientes y marcas. El servicio permite modelar ideas de negocios en lienzos interactivos, organizar listas de tareas colaborativas y conectar con socios de negocio estratégicos o marcas líderes.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Ciertos componentes y características adicionales del servicio están sujetos a planes de pago detallados en nuestra sección de precios. El acceso a estas características requiere un registro activo y el pago oportuno de las tarifas correspondientes.
                  </p>
                </div>

                <div id="cuentas" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    3. Registro y Cuentas de Usuario
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-pink mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Para hacer uso de la mayoría de las herramientas de Miiles, debes registrarte y crear una cuenta proporcionando una dirección de correo electrónico válida y otra información requerida. Eres responsable de mantener la seguridad y confidencialidad de tus credenciales de acceso.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Cualquier actividad realizada bajo tu cuenta será de tu entera responsabilidad. Te comprometes a notificarnos inmediatamente cualquier uso no autorizado de tu cuenta o cualquier otra violación de seguridad.
                  </p>
                </div>

                <div id="propiedad" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    4. Propiedad Intelectual
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-pink mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    El diseño de la Plataforma, el código de programación, los logotipos de la marca, las ilustraciones y las herramientas creadas por Miiles son propiedad exclusiva de Miiles y están protegidos por leyes de propiedad intelectual internacionales.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Los flujos de trabajo, modelos de negocio y diagramas creados por los usuarios en sus respectivos lienzos interactivos son de exclusiva propiedad del creador. Miiles no reclama ningún derecho de propiedad intelectual sobre tu contenido, a menos que se acuerde de manera explícita.
                  </p>
                </div>

                <div id="limitacion" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    5. Limitación de Responsabilidad
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-pink mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    En la medida máxima permitida por la ley aplicable, Miiles no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo, sin limitación, la pérdida de beneficios, datos, uso o reputación comercial que resulten del uso o la imposibilidad de uso del Servicio.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    No garantizamos que el servicio sea ininterrumpido, seguro o libre de errores, aunque nos esforzamos al máximo por mantener un nivel de estabilidad y seguridad óptimo.
                  </p>
                </div>

                <div id="modificaciones" className="scroll-mt-32 space-y-4">
                  <h2 className="text-2xl font-normal text-neutral-900 tracking-tight">
                    6. Modificaciones del Servicio y Términos
                  </h2>
                  <div className="h-[1px] w-12 bg-miiles-pink mb-4" />
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Nos reservamos el derecho de modificar o suspender temporal o permanentemente el Servicio (o cualquier parte del mismo) en cualquier momento y con o sin previo aviso.
                  </p>
                  <p className="text-md font-light text-neutral-600 leading-relaxed">
                    Asimismo, podemos modificar estos términos en el futuro. Te recomendamos revisar esta página de manera regular para estar al tanto de cualquier actualización o cambio.
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

export default Terms;
