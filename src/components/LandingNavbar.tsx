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
        <nav className="w-full flex items-center justify-between gap-4 md:gap-16 px-6 md:px-8 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <Link to="/" className="flex items-center shrink-0">
            <img 
              src="/logotipo.svg" 
              alt="Miiles" 
              className="h-5 w-auto" 
            />
          </Link>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button 
              onClick={toggleMenu}
              className="text-sm font-normal hover:opacity-50 transition-colors duration-500 tracking-tight text-black"
            >
              {isMenuOpen ? "Cerrar" : "Menú"}
            </button>
            <Link
              to="/login"
              className="text-xs font-normal px-5 py-2.5 rounded-full bg-black text-white transition-all duration-500 hover:scale-105"
            >
              Unirse
            </Link>
          </div>
        </nav>
      </div>

      {/* MEGA MENU DESPLEGABLE — Contenedor flotante centralizado al top-28 */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div 
            key={menuKey}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-28 left-1/2 -translate-x-1/2 w-[90vw] md:w-[85vw] max-w-5xl z-40 rounded-[32px] md:rounded-[40px] shadow-[0_24px_70px_rgba(0,0,0,0.15)] border border-white/10 bg-[#7E7E7E]"
          >
            <div className="w-full flex flex-col md:flex-row py-12 px-10 md:py-16 md:px-20 gap-8 md:gap-0">
              
              {/* Left Column: Socials & Legal */}
              <div className="flex flex-col justify-between w-full md:w-1/3 order-2 md:order-1 mt-6 md:mt-0">
                <div className="flex flex-col gap-4">
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
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 + i * 0.05 }}
                      >
                        <a 
                          href={link.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-lg font-light text-white/80 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      </motion.div>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden mt-12" style={{ lineHeight: 1.4 }}>
                  <motion.div 
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="flex flex-col gap-1.5 text-xs font-light text-white/50"
                  >
                    <Link to="/terminos" className="hover:text-white/80 transition-colors">Términos y condiciones</Link>
                    <Link to="/privacidad" className="hover:text-white/80 transition-colors">Política de privacidad</Link>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Main Navigation Links */}
              <div className="flex flex-col justify-center w-full md:w-2/3 gap-4 md:gap-5 pl-0 md:pl-16 order-1 md:order-2 border-b md:border-b-0 md:border-l border-white/10 pb-6 md:pb-0">
                {menuItems.map((item, i) => (
                  <div 
                    key={item.label} 
                    className="overflow-hidden"
                    style={{ lineHeight: 1.15, paddingBottom: '0.05em' }}
                  >
                    <motion.div 
                      initial={{ y: "110%" }} 
                      animate={{ y: "0%" }} 
                      exit={{ y: "110%" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 + i * 0.05 }}
                    >
                      <Link 
                        to={item.href}
                        onClick={() => handleLinkClick(item.href)}
                        className="block text-4xl md:text-5xl lg:text-[50px] font-medium text-white hover:opacity-50 transition-opacity duration-300 tracking-tight"
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

      {/* Overlay translúcido para cerrar al hacer clic afuera */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/15 backdrop-blur-[3px] cursor-pointer"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
