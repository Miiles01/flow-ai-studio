import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface LandingNavbarProps {
  onMenuAction?: (id: string) => void;
}

const LandingNavbar = ({ onMenuAction }: LandingNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuKey, setMenuKey] = useState(0);

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setMenuKey(k => k + 1);
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Acerca de", href: "/acerca-de" },
    { label: "Funciones", href: "/funciones" },
    { label: "Precios", href: "/precios" },
  ];

  const socialLinks = [
    { label: "Instagram", href: "https://instagram.com/wearemiiles" },
    { label: "Tiktok", href: "https://tiktok.com/@wearemiiles" },
    { label: "Youtube", href: "https://youtube.com" },
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
              onClick={toggleMenu}
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
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div 
            key={menuKey}
            initial={{ opacity: 0, y: "-10%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "-10%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 w-full h-screen md:h-[70vh] z-40 overflow-hidden shadow-2xl" style={{ backgroundColor: 'rgba(6,5,5,0.5)', backdropFilter: 'blur(80px)' }}
          >
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col md:flex-row pt-40 md:pt-32 pb-16 px-8 md:px-12">
              
              {/* Left Column: Socials & Legal */}
              <div className="flex flex-col justify-between w-full md:w-1/3 h-auto md:h-full order-2 md:order-1 mt-8 md:mt-0">
                <div className="flex flex-col gap-5 mt-0 md:mt-12">
                  {socialLinks.map((link, i) => (
                    <div 
                      key={link.label} 
                      className="overflow-hidden"
                      style={{ lineHeight: 1.2 }}
                    >
                      <motion.div
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "110%" }}
                        transition={{ duration: 0.8, ease: [0.625, 0.05, 0, 1], delay: 0.15 + i * 0.08 }}
                      >
                        <a 
                          href={link.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-base font-light text-white/80 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      </motion.div>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden" style={{ lineHeight: 1.4 }}>
                  <motion.div 
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.8, ease: [0.625, 0.05, 0, 1], delay: 0.5 }}
                    className="flex flex-col gap-1 text-[11px] font-light text-white/50"
                  >
                    <Link to="/terminos" className="hover:text-white/80 transition-colors">Términos y condiciones</Link>
                    <Link to="/privacidad" className="hover:text-white/80 transition-colors">Política de privacidad</Link>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Main Navigation Links — Osmo masked reveal */}
              <div className="flex flex-col justify-start md:justify-center w-full md:w-2/3 h-auto md:h-full gap-3 md:gap-4 pl-0 md:pl-20 order-1 md:order-2">
                {menuItems.map((item, i) => (
                  <div 
                    key={item.label} 
                    className="overflow-hidden"
                    style={{ lineHeight: 1.15, paddingBottom: '0.15em' }}
                  >
                    <motion.div 
                      initial={{ y: "110%" }} 
                      animate={{ y: "0%" }} 
                      exit={{ y: "110%" }}
                      transition={{ duration: 0.8, ease: [0.625, 0.05, 0, 1], delay: 0.1 + i * 0.08 }}
                    >
                      <Link 
                        to={item.href}
                        onClick={() => handleLinkClick(item.href)}
                        className="block text-5xl md:text-7xl font-medium text-white hover:text-white/50 transition-colors duration-300 tracking-tight"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
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
            className="fixed inset-0 z-30 bg-transparent cursor-pointer"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
