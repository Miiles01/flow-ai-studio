import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";

/* Apertura como en el portafolio (manuel-herrera, PortfolioHeader): la píldora se
   ensancha y su cuerpo crece de 0 a su alto real (0.5s, cubic-bezier(.4,0,.2,1));
   cada opción sube desde el borde recortado con dos desplazamientos encadenados
   (30px + 50px, 0.6s, cubic-bezier(.65,0,0,1)) escalonados cada 40ms, sin fades.
   Las curvas viven en index.css (.ease-nav-morph, .nav-item-rise). */
const ITEM_STAGGER_MS = 40;
const OPEN_MAX_WIDTH = 1024;
const MOBILE_BREAKPOINT = 768;

function MenuItem({ open, index, children }: { open: boolean; index: number; children: React.ReactNode }) {
  const delay = { transitionDelay: open ? `${index * ITEM_STAGGER_MS}ms` : "0ms" };
  const move = "nav-item-rise";
  return (
    <div className={`${move} ${open ? "translate-y-0" : "translate-y-[30px]"}`} style={delay}>
      <div className={`${move} ${open ? "translate-y-0" : "translate-y-[50px]"}`} style={delay}>
        {children}
      </div>
    </div>
  );
}

interface MorphNavbarProps {
  /** Hero claro debajo: la píldora cerrada usa vidrio oscuro y texto blanco. */
  isLanding?: boolean;
}

const MorphNavbar = ({ isLanding }: MorphNavbarProps) => {
  const { t, i18n } = useTranslation();
  const localePath = useLocalePath();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [viewport, setViewport] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  const [closedWidth, setClosedWidth] = useState<number | null>(null);
  const barContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  // Ancho natural de la píldora cerrada (logo + Menú + Unirse); el ancho no se
  // puede animar desde "auto", así que se mide y se anima entre números.
  useLayoutEffect(() => {
    const el = barContentRef.current;
    if (!el) return;
    // Suma solo las piezas de la barra: el contenedor también envuelve el menú
    // oculto, que inflaría cualquier medida del contenedor. +2 por el borde de 1px.
    const measure = () => {
      const cs = getComputedStyle(el);
      const pieces = Array.from(el.children).reduce((sum, child) => sum + (child as HTMLElement).offsetWidth, 0);
      const gaps = parseFloat(cs.columnGap || "0") * Math.max(el.children.length - 1, 0);
      setClosedWidth(Math.ceil(pieces + gaps + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)) + 2);
    };
    measure();
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    fonts?.ready.then(measure);
  }, [i18n.language]);

  const close = useCallback(() => {
    setOpen(false);
    setLangOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const changeLanguage = (lng: string) => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments[0] === "es" || segments[0] === "en") segments.shift();
    i18n.changeLanguage(lng);
    navigate(`/${lng}/${segments.join("/")}`);
    close();
  };

  const menuItems = [
    { label: t("navbar.home"), href: localePath("/") },
    { label: t("navbar.about"), href: localePath("/acerca-de") },
    { label: t("navbar.functions"), href: localePath("/funciones") },
    { label: t("navbar.pricing"), href: localePath("/precios") },
  ];
  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/miiles.studio/" },
    { label: "Tiktok", href: "https://www.tiktok.com/@miiles.studio" },
    { label: "Youtube", href: "https://www.youtube.com/@MiilesAI/shorts" },
  ];
  const legalLinks = [
    { label: t("navbar.affiliates"), href: "/afiliados" },
    { label: t("navbar.terms"), href: "/terminos" },
    { label: t("navbar.privacy"), href: "/privacidad" },
  ];

  const isMobile = viewport < MOBILE_BREAKPOINT;
  const openWidth = Math.min(viewport * (isMobile ? 0.95 : 0.85), OPEN_MAX_WIDTH);
  const width = isMobile ? viewport * 0.95 : open ? openWidth : closedWidth ?? undefined;

  // Abierto siempre es oscuro; cerrado sobre el hero es vidrio oscuro, al bajar es vidrio claro.
  const dark = open || (isLanding && !scrolled && !isMobile);
  const ink = dark ? "text-white" : "text-black";

  const morph = "duration-500 ease-nav-morph";

  // Cualquier clic en el navbar fuera de un botón o enlace equivale a Menú / Cerrar
  const handleSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if (open) close();
    else setOpen(true);
  };

  return (
    <>
      <header className="fixed top-6 inset-x-0 z-[100] flex justify-center pointer-events-none">
        <div
          onClick={handleSurfaceClick}
          className={`pointer-events-auto cursor-pointer overflow-hidden backdrop-blur-2xl border transition-[width,border-radius,background-color,border-color,box-shadow] ${morph} ${
            open
              ? "rounded-[32px] md:rounded-[40px] bg-black/75 border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
              : dark
              ? "rounded-[28px] bg-black/20 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              : "rounded-[28px] bg-white/80 border-neutral-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
          style={{ width }}
        >
          {/* Barra: siempre visible, es la parte superior del menú abierto */}
          <div
            ref={barContentRef}
            className={`flex items-center justify-between gap-4 md:gap-16 px-6 md:px-8 py-2.5 ${isMobile ? "w-full" : "w-full min-w-max"}`}
          >
            <Link to={localePath("/")} onClick={close} className="flex items-center shrink-0" aria-label="Miiles">
              <img
                src="/logotipo.svg"
                alt="Miiles"
                className={`h-5 w-auto transition-[filter] ${morph} ${dark ? "brightness-0 invert" : ""}`}
              />
            </Link>

            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              <button
                type="button"
                onClick={() => (open ? close() : setOpen(true))}
                aria-expanded={open}
                aria-controls="miiles-menu"
                className={`text-sm font-normal tracking-tight hover:opacity-50 transition-[color,opacity] ${morph} ${ink}`}
              >
                {open ? t("navbar.close") : t("navbar.menu")}
              </button>
              <Link
                to="/login"
                onClick={close}
                className={`text-xs font-normal px-5 py-2.5 rounded-full transition-[background-color,color,transform] ${morph} hover:scale-105 ${
                  dark ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                {t("navbar.join")}
              </Link>
            </div>
          </div>

          {/* Cuerpo: crece de 0 a su alto real (grid 0fr → 1fr) */}
          <div
            id="miiles-menu"
            className={`grid transition-[grid-template-rows] ${morph} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            // React 18 no reconoce `inert` como booleano: string vacío lo activa
            {...(!open ? { inert: "" as unknown as boolean } : {})}
          >
            <div className="min-h-0 overflow-hidden">
              {/* Ancho final fijo y centrado: la caja crece y lo va descubriendo, pero el
                  contenido no se reacomoda; las opciones solo suben, como en el portafolio. */}
              <nav
                aria-label={t("navbar.menu")}
                style={{ width: openWidth }}
                className="relative left-1/2 -translate-x-1/2 flex flex-col md:flex-row gap-10 md:gap-0 px-8 md:px-16 pt-8 md:pt-12 pb-10 md:pb-14 max-h-[calc(100vh-140px)] overflow-y-auto"
              >
                {/* Principal: enlaces grandes */}
                <ul className="flex flex-col gap-3 md:gap-4 md:w-2/3 md:order-2 md:pl-16 md:border-l border-white/10">
                  {menuItems.map((item, i) => (
                    <li key={item.href}>
                      <MenuItem open={open} index={i}>
                        <Link
                          to={item.href}
                          onClick={close}
                          className="block text-4xl md:text-5xl lg:text-[50px] font-medium leading-[1.15] tracking-tight text-white hover:opacity-50 transition-opacity duration-300"
                          style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                          {item.label}
                        </Link>
                      </MenuItem>
                    </li>
                  ))}
                  <li className="relative mt-4 md:mt-6">
                    <MenuItem open={open} index={menuItems.length}>
                      <button
                        type="button"
                        onClick={() => setLangOpen((v) => !v)}
                        aria-expanded={langOpen}
                        className="text-4xl md:text-5xl lg:text-[50px] font-medium leading-[1.15] tracking-tight text-white hover:opacity-50 transition-opacity duration-300 text-left"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        {t("navbar.language")}
                      </button>
                    </MenuItem>
                    <AnimatePresence>
                      {langOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 md:mt-0 md:absolute md:bottom-0 md:left-64 bg-white rounded-3xl p-3 w-max min-w-[220px] shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-10 flex flex-col gap-2"
                        >
                          {[
                            { code: "es", label: "Español", active: i18n.language === "es" },
                            { code: "en", label: "English", active: i18n.language?.startsWith("en") },
                          ].map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => changeLanguage(lang.code)}
                              className={`text-left px-5 py-4 rounded-2xl text-xl font-medium transition-colors ${
                                lang.active ? "bg-black text-white" : "text-black hover:bg-gray-100"
                              }`}
                            >
                              {lang.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                </ul>

                {/* Secundario: redes y legales */}
                <div className="flex flex-col justify-between gap-10 md:w-1/3 md:order-1">
                  <ul className="flex flex-col gap-4">
                    {socialLinks.map((link, i) => (
                      <li key={link.href}>
                        <MenuItem open={open} index={i + 1}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-lg font-light text-white/80 hover:text-white transition-colors"
                          >
                            {link.label}
                          </a>
                        </MenuItem>
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-col gap-1.5">
                    {legalLinks.map((link, i) => (
                      <li key={link.href}>
                        <MenuItem open={open} index={socialLinks.length + i + 1}>
                          <Link to={link.href} onClick={close} className="text-xs font-light text-white/50 hover:text-white/80 transition-colors">
                            {link.label}
                          </Link>
                        </MenuItem>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Clic afuera cierra */}
      {open && <div aria-hidden onClick={close} className="fixed inset-0 z-[90] cursor-pointer" />}
    </>
  );
};

export default MorphNavbar;
