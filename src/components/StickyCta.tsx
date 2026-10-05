import { useEffect, useRef } from "react";
import SlideArrowButton from "@/components/SlideArrowButton";

// Botón fijo abajo que sigue el scroll; al llegar al footer sube con él y se desvanece.
// Debe renderizarse fuera del wrapper de ScrollSmoother para que quede fijo.
const StickyCta = ({ label, onClick }: { label: string; onClick: () => void }) => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const cta = ctaRef.current;
      if (cta) {
        const dockedTop = window.innerHeight - cta.offsetHeight - 24;
        const footerTop = document.querySelector("footer")?.getBoundingClientRect().top ?? Infinity;
        const y = Math.min(dockedTop, footerTop - cta.offsetHeight - 24);
        cta.style.transform = `translate3d(0, ${y}px, 0)`;
        const o = Math.max(0, Math.min(1, y / 120));
        cta.style.opacity = String(o);
        cta.style.visibility = o < 0.02 ? "hidden" : "visible";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ctaRef}
      className="fixed top-0 inset-x-0 z-[100] flex justify-center px-6 pointer-events-none will-change-transform"
    >
      <div className="pointer-events-auto">
        <SlideArrowButton onClick={onClick}>{label}</SlideArrowButton>
      </div>
    </div>
  );
};

export default StickyCta;
