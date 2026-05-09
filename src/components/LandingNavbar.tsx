import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logotipoSvg from "@/assets/miiles/logotipo.svg";

interface LandingNavbarProps {
  onMenuAction?: (id: string) => void;
}

const LandingNavbar = ({ onMenuAction }: LandingNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Acerca de", href: "/#acerca-de" },
    { label: "Funciones", href: "/#funciones" },
    { label: "Precios", href: "/#precios" },
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
        <nav className="w-full flex items-center justify-between gap-4 md:gap-16 px-6 md:px-8 py-2.5 bg-white/40 backdrop-blur-2xl border border-white/20 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logotipoSvg} alt="Miiles" className="h-5 w-auto" />
          </Link>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-sm font-normal hover:opacity-50 transition-opacity tracking-tight"
            >
              {isMenuOpen ? "Cerrar" : "Menu"}
            </button>
            <Link
              to="/login"
              className="text-xs font-normal px-5 py-2.5 rounded-full bg-black text-white hover:scale-105 transition-transform duration-300"
            >
              Unirse
            </Link>
          </div>
        </nav>

        {/* MENU DESPLEGABLE — estilo glass negro */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="flex flex-col gap-6 text-left">
                {menuItems.map((item, i) => (
                  <div key={item.label} className="overflow-hidden">
                    <motion.div 
                      initial={{ y: "110%" }} 
                      animate={{ y: "0%" }} 
                      transition={{ duration: 0.9, ease: [0.625, 0.05, 0, 1], delay: i * 0.08 }}
                    >
                      <a 
                        href={item.href}
                        onClick={(e) => {
                          if (item.href.startsWith("/#")) {
                            e.preventDefault();
                            handleLinkClick(item.href);
                          } else {
                            setIsMenuOpen(false);
                          }
                        }}
                        className="block text-3xl md:text-4xl font-normal text-white hover:opacity-50 transition-opacity tracking-tight"
                      >
                        {item.label}
                      </a>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay para cerrar al hacer clic fuera */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/5"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
