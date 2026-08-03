import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const MobileProjectHint = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("en") ? "en" : "es") as "es" | "en";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reveal after 1 second
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Stay for 20 seconds, then slide down and hide
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 21000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 70, scale: 0.94 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 inset-x-4 z-50 max-w-sm mx-auto pointer-events-auto"
          >
            <div className="bg-neutral-950/95 text-white backdrop-blur-xl border border-neutral-800 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xs font-normal text-neutral-200 leading-snug">
                  {lang === "es"
                    ? "Toca cualquier imagen para ver el detalle del proyecto."
                    : "Tap any image to view the project details."}
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-neutral-400 hover:text-white p-1 -mr-1 transition-colors shrink-0"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileProjectHint;
