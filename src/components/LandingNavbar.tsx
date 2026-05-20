import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface LandingNavbarProps {
  onMenuAction?: (id: string) => void;
}

const AnimatedTextLink = ({ text }: { text: string }) => (
  <span className="nav-link-anim" data-text={text}>
    <span className="nav-link-anim-inner">{text}</span>
  </span>
);

const LandingNavbar = ({ onMenuAction }: LandingNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Acerca de", href: "/acerca-de" },
    { label: "Funciones", href: "/funciones" },
    { label: "Precios", href: "/precios" },
  ];

  const handleLinkClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      if (onMenuAction) {
        onMenuAction(id);
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <div 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled && !isMenuOpen ? "bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0 z-50">
            <img src="/logotipo.svg" alt="Miiles" className={`h-6 w-auto transition-transform duration-500 ${isMenuOpen ? "brightness-0 invert" : ""}`} />
          </Link>

          <div className={`flex items-center gap-6 md:gap-8 shrink-0 z-50 transition-colors duration-500 ${isMenuOpen ? "text-white" : "text-black"}`}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[15px] font-medium tracking-tight overflow-hidden"
            >
              {isMenuOpen ? (
                <AnimatedTextLink text="Cerrar" />
              ) : (
                <AnimatedTextLink text="Menú" />
              )}
            </button>
            <Link
              to="/login"
              className={`text-[13px] font-medium px-6 py-3 rounded-full transition-all duration-500 ${
                isMenuOpen 
                  ? "bg-white text-black hover:bg-gray-100" 
                  : "bg-black text-white hover:scale-105 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              }`}
            >
              <AnimatedTextLink text="Unirse" />
            </Link>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MEGA MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "-10%" }}
            transition={{ duration: 0.7, ease: [0.625, 0.05, 0, 1] }}
            className="fixed inset-0 z-40 bg-[#111111] flex flex-col justify-center px-6 md:px-20 lg:px-40"
          >
            <div className="max-w-7xl w-full mx-auto flex flex-col gap-8 md:gap-12">
              {menuItems.map((item, i) => (
                <div key={item.label} className="overflow-hidden">
                  <motion.div 
                    initial={{ y: "110%" }} 
                    animate={{ y: "0%" }} 
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.8, ease: [0.625, 0.05, 0, 1], delay: 0.1 + i * 0.08 }}
                  >
                    <Link 
                      to={item.href}
                      onClick={() => handleLinkClick(item.href)}
                      className="inline-block text-5xl md:text-7xl lg:text-[100px] font-normal text-white hover:text-gray-400 transition-colors tracking-tight leading-none"
                      style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}
                    >
                      <AnimatedTextLink text={item.label} />
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
            
            {/* Footer links in menu */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute bottom-10 left-6 md:left-20 lg:left-40 max-w-7xl w-full flex gap-8 text-gray-400 text-sm font-light"
            >
              <Link to="/privacidad" className="hover:text-white transition-colors"><AnimatedTextLink text="Privacidad" /></Link>
              <Link to="/terminos" className="hover:text-white transition-colors"><AnimatedTextLink text="Términos" /></Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
