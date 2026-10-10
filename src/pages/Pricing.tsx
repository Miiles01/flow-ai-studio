import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Registro de plugins de GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const Pricing = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-pricing",
      content: "#smooth-content-pricing",
      smooth: 1.4,
      effects: true,
    });

    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-pricing h1").forEach((el) => {
        gsap.fromTo(el, { yPercent: 20, autoAlpha: 0 }, {
          yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    };
    run();

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handlePlanSelect = (planName: string, cycle: "monthly" | "annually") => {
    if (planName === "Gratis") {
      navigate(user ? "/dashboard" : "/login");
    } else if (planName === "Pro") {
      if (user) {
        navigate(`/profile?upgrade=true&cycle=${cycle}`);
      } else {
        navigate(`/login?next=${encodeURIComponent(`/dashboard?upgrade=true&cycle=${cycle}`)}`);
      }
    } else if (planName === "Negocios") {
      navigate("/precios/negocios");
    }
  };

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-pricing" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-pricing" className="bg-white text-black font-sans pb-0">
          
          <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 pt-40 pb-32">
            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-8 items-start">
              
              {/* Left Column: Heading */}
              <div className="w-full lg:w-1/3 flex flex-col pt-8">
                <h1 className="text-7xl lg:text-[88px] font-normal leading-[1.05] tracking-tight mb-6 text-black">
                  Elige tu<br />plan
                </h1>
                <p className="text-xl font-light text-gray-500 max-w-sm leading-relaxed">
                  Hecho para donde estás y hacia donde vas.
                </p>
              </div>

              {/* Right Column: Cards */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6">
                
                {/* Gratis Card */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-10 flex flex-col md:flex-row gap-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-500 hover:-translate-y-1">
                  
                  <div className="flex-1 flex flex-col items-start">
                    <h3 className="text-2xl font-normal text-black mb-2">Empieza gratis</h3>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-[56px] leading-none tracking-tight text-black font-normal">$0</span>
                      <span className="text-gray-400 font-light text-sm">MXN/mes</span>
                    </div>
                    <button 
                      onClick={() => handlePlanSelect("Gratis", "monthly")}
                      className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-normal hover:bg-black/80 transition-colors mt-auto"
                    >
                      Empezar gratis
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm font-light text-gray-500 mb-6">Incluye:</p>
                    <ul className="flex flex-col gap-4">
                      {["1 proyecto", "Hasta 10 colaboraciones", "Soporte por email"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-light text-black">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="1.5"/>
                            <path d="M8 12.5L10.5 15L16 9" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Pro Card */}
                <div className="bg-black text-white rounded-[32px] p-10 flex flex-col md:flex-row gap-10 shadow-2xl transition-transform duration-500 hover:-translate-y-1">
                  
                  <div className="flex-1 flex flex-col items-start">
                    <h3 className="text-2xl font-light text-white mb-2">Plan Pro desde</h3>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[56px] leading-none tracking-tight text-white font-normal">$309</span>
                      <span className="text-gray-400 font-light text-sm">MXN/mes</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-light mb-8">*Facturado anualmente (MXN 3,712 al año)</p>
                    <button 
                      onClick={() => handlePlanSelect("Pro", "annually")}
                      className="bg-white text-black px-8 py-3.5 rounded-full text-sm font-normal hover:bg-gray-100 transition-colors mt-auto"
                    >
                      Ver todos los planes
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm font-light text-gray-400 mb-6 leading-relaxed">
                      Crece sin límites, con más funciones y más soporte.
                    </p>
                    <ul className="flex flex-col gap-4">
                      {["Proyectos ilimitados", "Colaboraciones ilimitadas", "Analítica avanzada", "Soporte prioritario"].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-light text-white">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
                            <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>
            </div>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Pricing;
