import LandingNavbar from "@/components/LandingNavbar";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const Contact = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-contact",
      content: "#smooth-content-contact",
      smooth: 1.4,
    });

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-contact" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-contact" className="bg-white text-black min-h-screen pt-40 px-6 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-6 block">Contacto</span>
            <h1 className="text-5xl md:text-7xl font-normal tracking-tight mb-16">
              Hablemos de tu <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>proyecto</span>
            </h1>
            
            <div className="bg-[#F5F5F8] rounded-[3rem] p-12 text-left">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-light text-gray-400 uppercase tracking-widest">Nombre</label>
                    <input type="text" className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-black transition-colors font-light" placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-light text-gray-400 uppercase tracking-widest">Email</label>
                    <input type="email" className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-black transition-colors font-light" placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-light text-gray-400 uppercase tracking-widest">Mensaje</label>
                  <textarea className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-black transition-colors font-light min-h-[150px]" placeholder="¿En qué podemos ayudarte?" />
                </div>
                <button type="submit" className="px-10 py-4 rounded-full bg-black text-white text-sm font-light hover:-translate-y-1 transition-transform">
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
