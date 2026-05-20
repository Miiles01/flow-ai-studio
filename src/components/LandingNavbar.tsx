import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface LandingNavbarProps {
  onMenuAction?: (id: string) => void;
}

const LandingNavbar = ({ onMenuAction }: LandingNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Acerca de", href: "/acerca-de" },
    { label: "Funciones", href: "/funciones" },
    { label: "Precios", href: "/precios" },
  ];

  const socialLinks = [
    { label: "Instagram", href: "#" },
    { label: "Tiktok", href: "#" },
    { label: "Youtube", href: "#" },
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
      {/* WRAPPER PARA NAV Y MENÚ */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95vw] md:w-max z-50 flex flex-col gap-2">
        {/* NAV — flotante estilo glass */}
        <nav className={`w-full flex items-center justify-between gap-4 md:gap-16 px-6 md:px-8 py-2.5 rounded-full transition-colors duration-500 ${isMenuOpen ? "bg-transparent border-transparent" : "bg-white/10 backdrop-blur-2xl border border-white/20"}`}>
          <Link to="/" className="flex items-center shrink-0">
            <img 
              src="/logotipo.svg" 
              alt="Miiles" 
              className={`h-5 w-auto transition-all duration-500 ${isMenuOpen ? "brightness-0 invert" : ""}`} 
            />
          </Link>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`text-sm font-normal hover:opacity-50 transition-colors duration-500 tracking-tight ${isMenuOpen ? "text-white" : "text-black"}`}
            >
              {isMenuOpen ? "Cerrar" : "Menú"}
            </button>
            <Link
              to="/login"
              className={`text-xs font-normal px-5 py-2.5 rounded-full transition-all duration-500 hover:scale-105 ${
                isMenuOpen ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              Unirse
            </Link>
          </div>
        </nav>
      </div>

      {/* MEGA MENU DESPLEGABLE — Altura 75vh, anclado al top */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "-10%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "-10%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 w-full h-[75vh] z-40 bg-[#0F172A]/80 backdrop-blur-3xl overflow-hidden rounded-b-[40px] shadow-2xl"
          >
            <div className="max-w-6xl mx-auto w-full h-full flex pt-32 pb-16 px-8 md:px-12">
              
              {/* Left Column: Socials & Legal */}
              <div className="flex flex-col justify-between w-1/3 h-full">
                <div className="flex flex-col gap-3 mt-12">
                  {socialLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                    >
                      <a href={link.href} className="text-base font-light text-white/80 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex flex-col gap-1 text-[11px] font-light text-white/50"
                >
                  <Link to="/terminos" className="hover:text-white/80 transition-colors">Términos y condiciones</Link>
                  <Link to="/privacidad" className="hover:text-white/80 transition-colors">Política de privacidad</Link>
                </motion.div>
              </div>

              {/* Right Column: Main Navigation Links */}
              <div className="flex flex-col justify-center w-2/3 h-full gap-4 md:gap-6 pl-10 md:pl-20">
                {menuItems.map((item, i) => (
                  <div key={item.label} className="overflow-hidden">
                    <motion.div 
                      initial={{ y: "110%" }} 
                      animate={{ y: "0%" }} 
                      exit={{ y: "110%", opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.625, 0.05, 0, 1], delay: 0.1 + i * 0.08 }}
                    >
                      <Link 
                        to={item.href}
                        onClick={() => handleLinkClick(item.href)}
                        className="block text-5xl md:text-7xl font-medium text-white hover:text-white/50 transition-colors tracking-tight font-sans"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay translúcido para cerrar al hacer clic en la parte inferior */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/10 cursor-pointer"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
