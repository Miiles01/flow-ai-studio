import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const PAGES = ["", "acerca-de", "funciones", "afiliados"];
const COLOR = "#4059F1";
const FOLLOW = 0.33;

const isLandingPath = (path: string) => {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length === 0) return true;
  if (parts.length === 1) return PAGES.includes(parts[0]) || /^(es|en)$/.test(parts[0]);
  if (parts.length === 2) return /^(es|en)$/.test(parts[0]) && PAGES.includes(parts[1]);
  return false;
};

const LandingCursor = () => {
  const { pathname } = useLocation();
  const [canShow, setCanShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = canShow && isLandingPath(pathname);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setCanShow(fine.matches && !reduce.matches);
    check();
    fine.addEventListener("change", check);
    reduce.addEventListener("change", check);
    return () => {
      fine.removeEventListener("change", check);
      reduce.removeEventListener("change", check);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    document.documentElement.classList.add("landing-cursor");
    let tx = -100, ty = -100, x = -100, y = -100, raf = 0, visible = false;
    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (!visible) { x = tx; y = ty; visible = true; el.style.opacity = "1"; }
    };
    const leave = () => { visible = false; el.style.opacity = "0"; };
    const loop = () => {
      x += (tx - x) * FOLLOW;
      y += (ty - y) * FOLLOW;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("landing-cursor");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[2147483647] opacity-0 transition-opacity duration-150"
      style={{ willChange: "transform" }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.25))" }}>
        <path d="M1 1 L1 19 L6 14.5 L9.5 21 L12.5 19.5 L9 13 L16 13 Z" fill={COLOR} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span
        className="absolute left-[16px] top-[18px] whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-normal leading-none"
        style={{ background: COLOR, color: "#fff" }}
      >
        Invitado
      </span>
    </div>
  );
};

export default LandingCursor;
