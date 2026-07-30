import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import logoImg from "@/assets/logo.webp";
import creadoresHeroImg from "@/assets/creadores-hero.webp";
import { MousePointer, Hand, Square, Type, ListTodo, Image as ImageIcon, SquareDashed, ArrowLeft, Settings2, Share2, Undo2, Redo2, PanelRight, Plus, Minus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase, MorphSVGPlugin);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

/* ─── Checklist Item Helper ────────────────────────────────────────────── */
const ChecklistItem = ({ checked, label, isPlaceholder = false }: { checked: boolean; label: string; isPlaceholder?: boolean }) => (
  <div className="flex items-start gap-1.5 text-[8px] leading-tight">
    {isPlaceholder ? (
      <div className="w-3 h-3 rounded-full border border-dashed border-black/20 flex-shrink-0 mt-0.5" />
    ) : checked ? (
      <div className="w-3 h-3 rounded-full bg-[#4059F1] flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    ) : (
      <div className="w-3 h-3 rounded-full border border-black/15 flex-shrink-0 mt-0.5" />
    )}
    <span className={isPlaceholder ? "text-black/35 font-light" : checked ? "text-black/45 line-through font-light" : "text-black/75 font-light"}>
      {label}
    </span>
  </div>
);

/* ─── Mockup: Tablero con flujo — UI fiel al app real ──────────────────── */
const BoardMockup = () => {
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const [phase, setPhase] = useState<'idle' | 'move_to_input' | 'click_input' | 'expand_input' | 'typing' | 'move_to_submit' | 'click_submit' | 'show_skeleton_1' | 'show_skeleton_2' | 'show_skeleton_3' | 'show_flow' | 'reset'>('idle');
  const [typedText, setTypedText] = useState('');
  const [flowGenerated, setFlowGenerated] = useState(false);

  const isInputActive = ['expand_input', 'typing', 'move_to_submit', 'click_submit'].includes(phase);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (!containerRef.current) return;
      const width = containerRef.current.getBoundingClientRect().width;
      const newScale = Math.min(1, (width - 64) / 960);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pause animation when not in viewport to optimize resources
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isHoveredRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Main linear animation loop orchestrator
  useEffect(() => {
    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    const delay = async (ms: number) => {
      await new Promise<void>(resolve => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });
      // Pause loop if not hovered
      while (active && !isHoveredRef.current) {
        await new Promise<void>(resolve => {
          const t = setTimeout(resolve, 100);
          timers.push(t);
        });
      }
    };

    const runSequence = async () => {
      // Don't start until hovered
      while (active && !isHoveredRef.current) {
        await new Promise<void>(r => { const t = setTimeout(r, 100); timers.push(t); });
      }

      while (active) {
        // 1. Idle
        setPhase('idle');
        setTypedText('');
        await delay(1000);
        if (!active) break;

        // 2. Move to input — hide old flow
        setFlowGenerated(false);
        setPhase('move_to_input');
        await delay(1200);
        if (!active) break;

        // 3. Click input
        setPhase('click_input');
        await delay(300);
        if (!active) break;

        // 4. Expand input
        setPhase('expand_input');
        await delay(600);
        if (!active) break;

        // 5. Typing
        setPhase('typing');
        const promptText = "Diseña un plan para la nueva campaña de skincare";
        for (let i = 1; i <= promptText.length; i++) {
          setTypedText(promptText.slice(0, i));
          await delay(60);
          if (!active) break;
        }
        if (!active) break;
        await delay(500);

        // 6. Move to submit
        setPhase('move_to_submit');
        await delay(800);
        if (!active) break;

        // 7. Click submit
        setPhase('click_submit');
        await delay(300);
        if (!active) break;

        // 8. Stage 1 skeleton
        setPhase('show_skeleton_1');
        await delay(1500);
        if (!active) break;

        // 9. Stage 2 skeleton
        setPhase('show_skeleton_2');
        await delay(1500);
        if (!active) break;

        // 10. Stage 3 skeleton
        setPhase('show_skeleton_3');
        await delay(1500);
        if (!active) break;

        // 11. Show flowchart campaign nodes
        setFlowGenerated(true);
        setPhase('show_flow');
        await delay(6000);
        if (!active) break;

        // 12. Reset
        setPhase('reset');
        await delay(500);
      }
    };

    runSequence();

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  const getCursorPos = () => {
    switch (phase) {
      case 'idle':
      case 'reset':
        // Fuera de pantalla por abajo, opacity siempre 1 (lo oculta el overflow-hidden del canvas)
        return { x: 480, y: 700, opacity: 1, scale: 1 };

      case 'move_to_input':
        // Canvas height = ~568px. bottom-6 = 24px. Botón alto = 52px.
        // Centro Y = 568 - 24 - (52/2) = 518
        return { x: 480, y: 518, opacity: 1, scale: 1 };

      case 'click_input':
        return { x: 480, y: 518, opacity: 1, scale: 0.8 };

      case 'expand_input':
        return { x: 480, y: 518, opacity: 1, scale: 1 };

      case 'typing':
        // Área de texto centrada
        return { x: 430, y: 450, opacity: 1, scale: 1 };

      case 'move_to_submit':
        // Barra expandida: px-6(24px), w-10(40px) submit button a la derecha
        // pb-4(16px). Centro Y = 568 - 24 (bottom-6) - 16 (pb-4) - 20 (h/2) = 508
        // Centro X = 480 + 290 (mitad ancho) - 24 (px-6) - 20 (w/2) = 726
        return { x: 726, y: 508, opacity: 1, scale: 1 };

      case 'click_submit':
        return { x: 726, y: 508, opacity: 1, scale: 0.8 };

      case 'show_skeleton_1':
      case 'show_skeleton_2':
      case 'show_skeleton_3':
      case 'show_flow':
        // Espera quieto donde hizo click, sin opacarse
        return { x: 726, y: 508, opacity: 1, scale: 1 };

      default:
        // 'reset' u otra fase oculta por debajo
        return { x: 480, y: 700, opacity: 1, scale: 1 };
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center p-8" 
      style={{ height: (610 * scale) + 64 }}
    >
      <div
        style={{
          width: 960,
          height: 610,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: "24px",
        }}
      >
        <motion.div
          animate={{
            scale: isMobile && isInputActive ? 1.6 : 1,
            y: 0,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
          style={{ transformOrigin: "bottom center" }}
        >
          <div className="w-full h-full rounded-3xl overflow-hidden border border-black/8 shadow-[0_24px_80px_rgba(0,0,0,0.10)] bg-white flex flex-col">
          {/* window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-black/6 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-black/5 rounded-md px-6 py-1 text-[9px] text-black/30 font-light">miiles.app/boards/1</div>
            </div>
          </div>

          {/* Canvas area (relative to float tools and header) */}
          <div 
            className="relative overflow-hidden bg-white flex-1" 
            style={{ 
              backgroundImage: "radial-gradient(#E5E7EB 1px, transparent 1px)", 
              backgroundSize: "32px 32px" 
            }}
          >
            {/* Header del tablero (floating over canvas) */}
            <div className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-20 pointer-events-none">
              {/* Left: back + name pill + settings + share */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex items-center gap-1 pl-2 pr-4 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white text-black">
                  <button className="p-2 rounded-full transition-colors hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black">
                    <ArrowLeft size={18} strokeWidth={1.5} />
                  </button>
                  <div className="w-[1px] h-5 mx-1 bg-[#E5E7EB]" />
                  <span className="text-[14px] font-normal tracking-tight px-2 py-1 select-none">Lanzamientos</span>
                </div>

                {/* Settings button */}
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors">
                  <Settings2 size={16} strokeWidth={1.5} />
                </button>

                {/* Share button */}
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors">
                  <Share2 size={16} strokeWidth={1.5} />
                </button>
              </div>

              {/* Right: user profile picture + undo/redo/panel */}
              <div className="flex items-center gap-4 pointer-events-auto">
                {/* User profile picture - Ariana */}
                <img
                  src="https://i.pravatar.cc/80?img=47"
                  alt="Ariana"
                  className="w-9 h-9 rounded-full object-cover border border-black/10"
                />

                {/* History controls pill */}
                <div className="flex items-center gap-1 px-1.5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white">
                  <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black transition-colors">
                    <Undo2 size={16} strokeWidth={1.5} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#D1D5DB] cursor-not-allowed">
                    <Redo2 size={16} strokeWidth={1.5} />
                  </button>
                  <div className="w-[1px] h-4 mx-0.5 bg-[#E5E7EB]" />
                  <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black transition-colors">
                    <PanelRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Toolbar Left */}
            <div className="absolute inset-y-0 my-auto h-fit left-6 z-10 flex flex-col items-center gap-1.5 px-2 py-3 rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              {/* Selection cursor — active */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white shadow-md cursor-pointer">
                <MousePointer size={18} strokeWidth={1.5} />
              </div>
              {/* Grab hand */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-black/55 hover:bg-black/5 cursor-pointer">
                <Hand size={18} strokeWidth={1.5} />
              </div>
              
              <div className="w-6 h-[1px] bg-[#E5E7EB] my-1" />
              
              {/* Rectangle shape */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-black/55 hover:bg-black/5 cursor-pointer">
                <Square size={18} strokeWidth={1.5} />
              </div>
              {/* Text tool */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-black/55 hover:bg-black/5 cursor-pointer">
                <Type size={18} strokeWidth={1.5} />
              </div>
              {/* List tool */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-black/55 hover:bg-black/5 cursor-pointer">
                <ListTodo size={18} strokeWidth={1.5} />
              </div>
              {/* Image tool */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-black/55 hover:bg-black/5 cursor-pointer">
                <ImageIcon size={18} strokeWidth={1.5} />
              </div>
              {/* Frame tool */}
              <div className="w-10 h-10 flex items-center justify-center rounded-full text-black/55 hover:bg-black/5 cursor-pointer">
                <SquareDashed size={18} strokeWidth={1.5} />
              </div>
            </div>

            {/* Floating Zoom Controls Left Bottom */}
            <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-1 p-1 bg-white rounded-[10px] shadow-[8px_6px_30px_rgba(24,2,56,0.06)] border border-black/[0.03]">
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center text-black hover:bg-[#EEEFF2] rounded-[6px] transition-colors"
              >
                <Plus size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center text-black hover:bg-[#EEEFF2] rounded-[6px] transition-colors"
              >
                <Minus size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center text-black hover:bg-[#EEEFF2] rounded-[6px] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                </svg>
              </button>
            </div>

            {/* Generated Skincare Campaign Flowchart */}
            <AnimatePresence>
              {(phase === 'show_flow' || flowGenerated) && (
                <>
                  {/* SVG Connecting Paths */}
                  <motion.svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-0" 
                    style={{ overflow: 'visible' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Circle → TodoNode 1 */}
                    <motion.path
                      d="M 275,242 L 310,242"
                      stroke="#D1D5DB" strokeWidth={1.5} fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: "easeInOut" }}
                    />
                    {/* TodoNode 1 → Diamond */}
                    <motion.path
                      d="M 525,242 L 558,242"
                      stroke="#D1D5DB" strokeWidth={1.5} fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.35, ease: "easeInOut" }}
                    />
                    {/* Diamond → Yes (top) */}
                    <motion.path
                      d="M 668,242 C 688,242 688,175 710,175"
                      stroke="#D1D5DB" strokeWidth={1.5} fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.55, ease: "easeInOut" }}
                    />
                    {/* Diamond → No (bottom) */}
                    <motion.path
                      d="M 668,242 C 688,242 688,380 710,380"
                      stroke="#D1D5DB" strokeWidth={1.5} fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.55, ease: "easeInOut" }}
                    />
                    {/* Sí label */}
                    <foreignObject x="676" y="192" width="26" height="16" className="overflow-visible">
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                        className="bg-white text-[#6B7280] rounded-full px-1.5 py-0.5 text-[8px] font-medium text-center select-none border border-[#E5E7EB] shadow-sm leading-none"
                      >Sí</motion.div>
                    </foreignObject>
                    {/* No label */}
                    <foreignObject x="676" y="272" width="26" height="16" className="overflow-visible">
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                        className="bg-white text-[#6B7280] rounded-full px-1.5 py-0.5 text-[8px] font-medium text-center select-none border border-[#E5E7EB] shadow-sm leading-none"
                      >No</motion.div>
                    </foreignObject>
                  </motion.svg>

                  {/* Node 1 — Circle ShapeNode: "Inicio" */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0 }}
                    className="absolute z-10"
                    style={{ left: 160, top: 187, width: 110, height: 110 }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 drop-shadow-md">
                      <ellipse cx="50" cy="50" rx="49" ry="49" vectorEffect="non-scaling-stroke"
                        fill="#4059F1" stroke="#3348d4" strokeWidth="1.5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <span className="text-center text-white font-semibold text-[11px] leading-snug select-none">
                        Inicio{"\n"}Campaña
                      </span>
                    </div>
                  </motion.div>

                  {/* Node 2 — TodoNode: "Fase 1: Preparación" */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    className="absolute z-10"
                    style={{ left: 310, top: 132, width: 215, height: 220 }}
                  >
                    <div className="w-full h-full rounded-2xl flex flex-col p-5 bg-white border border-[#E5E7EB] select-none"
                      style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02)' }}>
                      {/* Header */}
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="font-semibold text-[#1F2937] text-[13px] leading-tight">Fase 1: Preparación</span>
                        <span className="text-[10px] font-light text-[#9CA3AF] leading-tight">Estudio y definición de bases</span>
                      </div>
                      {/* Tasks */}
                      <div className="flex flex-col flex-1 overflow-hidden">
                        {/* completed */}
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center border-[1.5px] shrink-0" style={{ backgroundColor: '#4059F1', borderColor: '#4059F1' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span className="text-[11px] text-[#9CA3AF] line-through font-light leading-tight truncate">Definir público objetivo</span>
                        </div>
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center border-[1.5px] shrink-0" style={{ backgroundColor: '#4059F1', borderColor: '#4059F1' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span className="text-[11px] text-[#9CA3AF] line-through font-light leading-tight truncate">Fijar presupuesto</span>
                        </div>
                        {/* pending */}
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md border-[1.5px] border-black/15 bg-black/[0.03] shrink-0" />
                          <span className="text-[11px] text-[#374151] font-light leading-tight truncate">Diseñar moodboard</span>
                        </div>
                      </div>
                      {/* Add task */}
                      <div className="mt-2 flex items-center gap-1.5 border border-dashed border-[#E5E7EB] rounded-xl px-2 py-1.5 text-[#9CA3AF] text-[10px]">
                        <Plus size={9} />
                        <span>Nueva tarea...</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Node 3 — Diamond ShapeNode: "¿Aprobado?" */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                    className="absolute z-10"
                    style={{ left: 558, top: 187, width: 110, height: 110 }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 drop-shadow-md">
                      <polygon points="50,1 99,50 50,99 1,50" vectorEffect="non-scaling-stroke"
                        fill="#F59E0B" stroke="#d97706" strokeWidth="1.5" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <span className="text-center text-white font-semibold text-[10px] leading-snug select-none whitespace-pre-line">
                        {"¿Presupuesto\nAprobado?"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Node 4 — TodoNode: "Fase 2: Ejecución" (Sí branch) */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
                    className="absolute z-10"
                    style={{ left: 710, top: 65, width: 220, height: 220 }}
                  >
                    <div className="w-full h-full rounded-2xl flex flex-col p-5 bg-white border border-[#E5E7EB] select-none"
                      style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02)' }}>
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="font-semibold text-[#1F2937] text-[13px] leading-tight">Fase 2: Ejecución UGC</span>
                        <span className="text-[10px] font-light text-[#9CA3AF] leading-tight">Creación de contenido y pauta</span>
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center border-[1.5px] shrink-0" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span className="text-[11px] text-[#9CA3AF] line-through font-light leading-tight truncate">Buscar creadores de belleza</span>
                        </div>
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md border-[1.5px] border-black/15 bg-black/[0.03] shrink-0" />
                          <span className="text-[11px] text-[#374151] font-light leading-tight truncate">Enviar muestras de producto</span>
                        </div>
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md border-[1.5px] border-black/15 bg-black/[0.03] shrink-0" />
                          <span className="text-[11px] text-[#374151] font-light leading-tight truncate">Aprobar guiones y videos</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 border border-dashed border-[#E5E7EB] rounded-xl px-2 py-1.5 text-[#9CA3AF] text-[10px]">
                        <Plus size={9} />
                        <span>Nueva tarea...</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Node 5 — TodoNode: "Ajustar Estrategia" (No branch) */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.65 }}
                    className="absolute z-10"
                    style={{ left: 710, top: 295, width: 220, height: 185 }}
                  >
                    <div className="w-full h-full rounded-2xl flex flex-col p-5 bg-white border border-[#E5E7EB] select-none"
                      style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02)' }}>
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="font-semibold text-[#1F2937] text-[13px] leading-tight">Ajustar Estrategia</span>
                        <span className="text-[10px] font-light text-[#9CA3AF] leading-tight">Optimización de costos</span>
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md border-[1.5px] border-black/15 bg-black/[0.03] shrink-0" />
                          <span className="text-[11px] text-[#374151] font-light leading-tight truncate">Buscar nano-influencers</span>
                        </div>
                        <div className="flex items-center gap-3 py-1.5 px-2 rounded-xl">
                          <div className="w-5 h-5 rounded-md border-[1.5px] border-black/15 bg-black/[0.03] shrink-0" />
                          <span className="text-[11px] text-[#374151] font-light leading-tight truncate">Negociar comisión afiliados</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 border border-dashed border-[#E5E7EB] rounded-xl px-2 py-1.5 text-[#9CA3AF] text-[10px]">
                        <Plus size={9} />
                        <span>Nueva tarea...</span>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>


            {/* Skeleton — cuadro con shimmer + texto GENERANDO */}
            <AnimatePresence>
              {['show_skeleton_1', 'show_skeleton_2', 'show_skeleton_3'].includes(phase) && (() => {
                const stage = phase === 'show_skeleton_1' ? 1 : phase === 'show_skeleton_2' ? 2 : 3;
                const width = stage === 1 ? 280 : stage === 2 ? 460 : 700;
                const height = stage === 1 ? 160 : stage === 2 ? 240 : 360;
                return (
                  <div
                    key="skeleton-wrapper"
                    className="absolute z-20"
                    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <motion.div
                      initial={{ opacity: 0, width: 200, height: 120 }}
                      animate={{ opacity: 1, width, height }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                      className="rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 bg-white overflow-hidden relative"
                    >
                      {/* Shimmer */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 animate-pulse opacity-30 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                      </div>
                      {/* Texto centrado */}
                      <motion.span
                        animate={{ color: ['#9CA3AF', '#4059F1', '#9CA3AF'] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative text-[11px] font-semibold uppercase tracking-wider select-none"
                      >
                        Generando...
                      </motion.span>
                    </motion.div>
                  </div>
                );
              })()}
            </AnimatePresence>

            {/* Morphing AI Prompt Bar */}

            <motion.div
              animate={{
                width: ['typing', 'move_to_submit', 'click_submit', 'expand_input'].includes(phase) ? 580 : 52,
                height: ['typing', 'move_to_submit', 'click_submit', 'expand_input'].includes(phase) ? 150 : 52,
                borderRadius: ['typing', 'move_to_submit', 'click_submit', 'expand_input'].includes(phase) ? 40 : 18,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden cursor-pointer"
            >
              <AnimatePresence mode="wait">
                {!['typing', 'move_to_submit', 'click_submit', 'expand_input'].includes(phase) ? (
                  <motion.div
                    key="collapsed-icon"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center justify-center w-full h-full"
                  >
                    <img src={logoImg} alt="AI" className="w-7 h-7 object-contain" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="expanded-bar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col justify-between pt-8 pb-4 px-6 text-white relative font-sans"
                  >
                    {/* Text Area */}
                    <div className="w-full text-center text-[15px] font-light text-white leading-relaxed px-4 pt-1 select-none min-h-[44px]">
                      {typedText}
                      {phase === 'typing' && (
                        <span className="w-[1.5px] h-[15px] bg-white inline-block ml-0.5 animate-pulse" />
                      )}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 bg-white/10 h-10 px-4 rounded-full text-white/70 select-none cursor-pointer hover:bg-white/20 transition-all">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                          <rect x="3" y="3" width="7" height="7" rx="1"/>
                          <rect x="14" y="3" width="7" height="7" rx="1"/>
                          <rect x="14" y="14" width="7" height="7" rx="1"/>
                          <rect x="3" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        <span className="text-[13px] font-light tracking-wider text-white/70">Apps</span>
                      </div>

                      <motion.div
                        animate={{
                          scale: phase === 'click_submit' ? 0.85 : 1,
                        }}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="19" x2="12" y2="5" />
                          <polyline points="5 12 12 5 19 12" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Floating Animated Cursor */}
            <motion.div
              className="absolute pointer-events-none z-30"
              style={{ top: 0, left: 0 }}
              initial={false}
              animate={getCursorPos()}
              transition={{ duration: ['idle', 'reset'].includes(phase) ? 0 : 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                <path d="M0 0L0 20L5.5 14.5L9 22L11.5 21L8 13.5L15 13.5L0 0Z" fill="#111" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </motion.div>

          </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Mockup: Dashboard animado con popup de afiliados ─────────────────── */
const AnimatedDashboardMockup = () => {
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (!containerRef.current) return;
      const width = containerRef.current.getBoundingClientRect().width;
      const newScale = Math.min(1, (width - 64) / 960);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [phase, setPhase] = useState<'idle' | 'enter' | 'hover_sidebar' | 'click_sidebar' | 'open_popup' | 'hover_generate' | 'click_generate' | 'show_link' | 'hover_copy' | 'click_copy' | 'copied'>('idle');

  const isPopupOpen = ['open_popup', 'hover_generate', 'click_generate', 'show_link', 'hover_copy', 'click_copy', 'copied'].includes(phase);
  const isHoveredRef = useRef(false);

  // IntersectionObserver to pause loop off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isHoveredRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    const delay = async (ms: number) => {
      await new Promise<void>(resolve => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });
      // Pause loop if not hovered
      while (active && !isHoveredRef.current) {
        await new Promise<void>(resolve => {
          const t = setTimeout(resolve, 100);
          timers.push(t);
        });
      }
    };

    const runSequence = async () => {
      // Wait for intersection before starting
      while (active && !isHoveredRef.current) {
        await new Promise<void>(r => { const t = setTimeout(r, 100); timers.push(t); });
      }

      while (active) {
        setPhase('idle');
        await delay(1000);
        if (!active) break;
        
        setPhase('enter');
        await delay(1200);
        if (!active) break;
        
        setPhase('hover_sidebar');
        await delay(1000);
        if (!active) break;
        
        setPhase('click_sidebar');
        await delay(300);
        if (!active) break;
        
        setPhase('open_popup');
        await delay(1000);
        if (!active) break;
        
        setPhase('hover_generate');
        await delay(1000);
        if (!active) break;
        
        setPhase('click_generate');
        await delay(300);
        if (!active) break;
        
        setPhase('show_link');
        await delay(200);
        if (!active) break;
        
        setPhase('hover_copy');
        await delay(1000);
        if (!active) break;
        
        setPhase('click_copy');
        await delay(300);
        if (!active) break;
        
        setPhase('copied');
        await delay(2500);
      }
    };
    
    runSequence();
    
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  const getCursorPos = () => {
    switch (phase) {
      case 'idle':
        return { x: 480, y: 560, opacity: 0, scale: 1 };
      case 'enter':
        return { x: 480, y: 280, opacity: 1, scale: 1 };
      case 'hover_sidebar':
        return { x: 115, y: 430, opacity: 1, scale: 1 };
      case 'click_sidebar':
        return { x: 115, y: 430, opacity: 1, scale: 0.82 };
      case 'open_popup':
        return { x: 115, y: 430, opacity: 1, scale: 1 };
      case 'hover_generate':
        return { x: 480, y: 315, opacity: 1, scale: 1 };
      case 'click_generate':
        return { x: 480, y: 315, opacity: 1, scale: 0.82 };
      case 'show_link':
        return { x: 620, y: 296, opacity: 1, scale: 1 };
      case 'hover_copy':
        return { x: 620, y: 296, opacity: 1, scale: 1 };
      case 'click_copy':
        return { x: 620, y: 296, opacity: 1, scale: 0.82 };
      case 'copied':
        return { x: 620, y: 296, opacity: 1, scale: 1 };
      default:
        return { x: 480, y: 560, opacity: 0, scale: 1 };
    }
  };

  return (
    <div ref={containerRef} className="w-full flex justify-center p-8" style={{ height: (610 * scale) + 64 }}>
      {/* Mask that maintains the original size and clips the zoomed content */}
      <div
        style={{
          width: 960,
          height: 610,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: "24px",
        }}
      >
        {/* The zooming camera view */}
        <motion.div
          animate={{
            scale: isMobile && isPopupOpen ? 1.8 : 1,
            y: isMobile && isPopupOpen ? -40 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
          style={{ transformOrigin: "center center" }}
        >
          <div id="animated-dashboard-mockup" className="flex flex-col w-full h-full rounded-3xl overflow-hidden border border-black/8 shadow-[0_24px_80px_rgba(0,0,0,0.10)] relative" style={{ background: '#fff', transform: 'translate3d(0,0,0)', isolation: 'isolate' }}>
    {/* window chrome */}
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-black/6">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="bg-black/5 rounded-md px-6 py-1 text-[9px] text-black/30 font-light">miiles.app/boards</div>
      </div>
    </div>

    <div className="flex flex-1 relative rounded-b-3xl overflow-hidden" style={{ transform: 'translate3d(0,0,0)', isolation: 'isolate' }}>
      {/* sidebar */}
      <div className="p-4 flex-shrink-0 h-full" style={{ width: 230 }}>
        <div className="flex flex-col h-full rounded-[28px] overflow-hidden px-5 py-5 bg-white"
          style={{ background: 'linear-gradient(to bottom, #FDFDFD, #F8F9FD)', height: '100%' }}>

          {/* toggle */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-20 mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
          </svg>

          {/* logo */}
          <div className="flex items-center gap-2 mb-6">
            <img src={logoImg} alt="" className="w-6 h-6" />
            <span className="text-[20px] font-normal text-black tracking-tight">miiles</span>
          </div>

          {/* nuevo tablero */}
          <div className="mb-5">
            <div className="flex items-center justify-center gap-1.5 bg-black text-white rounded-full py-3 text-[11px] font-light cursor-pointer w-full">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v14M5 12h14"/></svg>
              Nuevo tablero
            </div>
          </div>

          {/* nav */}
          <div className="flex flex-col gap-1">
            {[
              { label: 'Inicio', active: false },
              { label: 'Tableros', active: true },
            ].map((item) => (
              <div key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-[22px] text-[13px] cursor-pointer ${
                  item.active
                    ? 'bg-white border border-[#EEEFF2] font-normal text-black shadow-sm'
                    : 'font-light text-black/50'
                }`}>
                {item.label === 'Inicio'
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                }
                {item.label}
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* afiliados card — animada */}
          <motion.div
            className="mb-3 rounded-2xl border shadow-sm p-3 cursor-pointer"
            animate={{
              scale: phase === 'click_sidebar' ? 1.04 : 1,
              borderColor: [
                'hover_sidebar',
                'click_sidebar',
                'open_popup',
                'hover_generate',
                'click_generate',
                'show_link',
                'hover_copy',
                'click_copy',
                'copied'
              ].includes(phase) ? '#4059F1' : 'rgba(0,0,0,0.06)',
              boxShadow: [
                'hover_sidebar',
                'click_sidebar',
                'open_popup',
                'hover_generate',
                'click_generate',
                'show_link',
                'hover_copy',
                'click_copy',
                'copied'
              ].includes(phase)
                ? '0 0 0 3px rgba(64,89,241,0.12)'
                : '0 1px 3px rgba(0,0,0,0.06)',
              backgroundColor: '#fff',
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-normal text-black">Afiliados</div>
                <div className="text-[9px] font-light text-black/40 leading-snug mt-0.5">Comparte tu link y recibe comisiones</div>
              </div>
            </div>
          </motion.div>

          {/* user */}
          <div className="flex items-center gap-2.5 px-1 py-1">
            <img
              src="https://i.pravatar.cc/80?img=47"
              alt="Ariana"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <div className="text-[13px] font-normal text-black">Ariana</div>
              <div className="text-[10px] text-black/40 font-light">Plan Pro</div>
            </div>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 px-8 pb-8 relative" style={{ paddingTop: 72 }}>
        {/* gear — QuickSettings top-right */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-black/6 flex items-center justify-center cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[22px] font-normal text-black">Mis Tableros</h2>
          <div className="flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-[12px] font-light cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Nuevo tablero
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {['Nuevos', 'Campaña Q3', 'UGC Verano', 'Estrategia', 'Lanzamiento', 'Branding'].map((name) => (
            <div key={name}
              className="rounded-[24px] bg-white shadow-md overflow-hidden cursor-pointer flex flex-col justify-end p-5"
              style={{ aspectRatio: '4/3' }}>
              <div className="flex items-center gap-2.5 text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span className="text-[14px] font-normal truncate">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cursor animado ─────────────────────────────────────────── */}
      <motion.div
        className="absolute pointer-events-none z-30"
        style={{ top: 0, left: 0 }}
        initial={false}
        animate={getCursorPos()}
        transition={{ duration: phase === 'idle' ? 0 : 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
          <path d="M0 0L0 20L5.5 14.5L9 22L11.5 21L8 13.5L15 13.5L0 0Z" fill="#111" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      {/* ── Popup: link de afiliado (diseño exacto del dashboard) ── */}
      <AnimatePresence>
        {[
          'open_popup',
          'hover_generate',
          'click_generate',
          'show_link',
          'hover_copy',
          'click_copy',
          'copied'
        ].includes(phase) && (
          <motion.div
            key="popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[28px] shadow-[0_16px_48px_rgba(0,0,0,0.14)] border border-black/6 p-8 text-black relative"
              style={{ width: 380 }}
            >
              {/* Close Button X in top right */}
              <div className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </div>

              {/* Header */}
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-black shrink-0 mt-0.5">
                  <path d="M20 12v10H4V12"/>
                  <path d="M22 7H2v5h20V7z"/>
                  <path d="M12 22V7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
                <div className="text-left">
                  <h3 className="text-[18px] font-medium text-black tracking-tight leading-none">Afiliados</h3>
                  <p className="text-[12px] font-light text-zinc-400 mt-1.5">Comparte tu link y recibe comisiones</p>
                </div>
              </div>

              {/* Conditionally render: Generate Button or Link Input Box */}
              {['open_popup', 'hover_generate', 'click_generate'].includes(phase) ? (
                <div className="mt-6">
                  <motion.button
                    type="button"
                    animate={{
                      scale: phase === 'click_generate' ? 0.95 : 1,
                      opacity: phase === 'click_generate' ? 0.8 : 1,
                    }}
                    transition={{ duration: 0.12 }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-normal bg-black text-white border border-white/10 hover:opacity-90 transition-all shadow-sm cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-1">
                      <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/>
                    </svg>
                    Generar link
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  animate={{
                    scale: phase === 'click_copy' ? 0.98 : 1,
                    backgroundColor: phase === 'copied' ? '#F0FDF4' : '#F4F4F5',
                    borderColor: phase === 'copied' ? '#DCFCE7' : 'transparent',
                  }}
                  transition={{ duration: 0.16 }}
                  className="flex items-center justify-between gap-3 rounded-2xl px-5 py-4 mt-6 mb-4 border border-transparent"
                >
                  <span className="text-[13px] font-normal text-zinc-800 select-none truncate">
                    https://miiles.app/?ref=ariana
                  </span>
                  <motion.button 
                    type="button" 
                    animate={{
                      scale: phase === 'click_copy' ? 0.88 : 1,
                    }}
                    className={`transition-colors shrink-0 p-1 cursor-pointer ${
                      ['hover_copy', 'click_copy'].includes(phase) 
                        ? 'text-zinc-800' 
                        : phase === 'copied' 
                          ? 'text-green-600' 
                          : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {phase === 'copied' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Centered Footer Text */}
              <p className="text-[12px] font-light text-zinc-400 text-center select-none mt-2">
                {phase === 'copied' 
                  ? "¡Link copiado con éxito!" 
                  : ['open_popup', 'hover_generate', 'click_generate'].includes(phase)
                    ? ""
                    : "Compártelo y empieza a ganar"
                }
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Data ──────────────────────────────────────────────────────────────── */
const STEPS = [
  { n: "01", label: "Plan Pro gratis", detail: "Únete como afiliado y accede a todas las herramientas de Miiles sin pagar nada. Tú usas, tú vendes, tú ganas." },
  { n: "02", label: "Link de afiliado", detail: "Ve a la sección Afiliados en tu menú lateral y genera tu enlace único con un solo clic." },
  { n: "03", label: "Gana el 25%", detail: "Compártelo en tus redes, stories o bio. Cada membresía vendida con tu link te da el 25% directo." },
  { n: "04", label: "Comunidad exclusiva", detail: "Acceso a comunidad privada, drops de contenido y eventos que no están abiertos al público." },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */
const Afiliados = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    if (window.location.search.includes("nosmooth")) {
      return;
    }
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#aff-wrapper",
      content: "#aff-content",
      smooth: 1.4,
      effects: true,
    });

    const splits: SplitText[] = [];
    const animated: HTMLElement[] = [];

    const runSplit = () => {
      document.querySelectorAll<HTMLElement>("#aff-content h1, #aff-content h2").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines" });
        splits.push(split);
        gsap.fromTo(split.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 0.5, stagger: 0.04, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onComplete: () => split.lines.forEach(line => {
            if (line.parentElement) line.parentElement.style.overflow = "visible";
          }),
        });
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) fontsReady.then(runSplit); else runSplit();

    // Fade-in optimizado para tarjetas y elementos data-fade
    document.querySelectorAll<HTMLElement>("[data-fade]").forEach((el) => {
      animated.push(el);
      gsap.fromTo(el, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.45, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    });

    // ── E022 WORD TRANSITION CSS ─────────────────────────────────
    const e022Style = document.createElement('style');
    e022Style.id = 'e022-css';
    e022Style.textContent = [
      '.mwg-e022 .e022-pin{height:400vh}',
      '.mwg-e022 .e022-container{height:100vh;background:#fff}',
      '.mwg-e022 .e022-top{display:flex;justify-content:space-between;align-items:center;padding:8vw 8vw 4vw}',
      '.mwg-e022 .e022-top-title{font-size:5vw;line-height:0.9;font-family:"Manrope",sans-serif;font-weight:500;letter-spacing:-0.05em;color:#000}',
      '.mwg-e022 .e022-paragraphs{display:flex;align-items:flex-start;padding:5vw 8vw;column-gap:4vw}',
      '.mwg-e022 .e022-paragraph{font-size:2.3vw;line-height:1.2;font-family:"Manrope",sans-serif;font-weight:500;letter-spacing:-0.03em;color:#000;flex:1}',
      '.mwg-e022 .e022-word{position:relative;overflow:hidden;display:inline-block;margin:-0.14em 0}',
      '.mwg-e022 .e022-word span{display:block;padding:0.14em 0}',
      '.mwg-e022 .e022-paragraph:not(:first-child) .e022-word span{transform:translateY(100%)}',
      '@media(max-width:768px){',
      '  .mwg-e022 .e022-pin{height:auto !important}',
      '  .mwg-e022 .e022-container{height:auto !important;padding:48px 24px !important}',
      '  .mwg-e022 .e022-top{padding:0 0 24px 0 !important}',
      '  .mwg-e022 .e022-top-title{font-size:32px !important;line-height:1.1 !important;letter-spacing:-0.03em !important}',
      '  .mwg-e022 .e022-paragraphs{display:flex !important;flex-direction:column !important;padding:0 !important;gap:24px !important}',
      '  .mwg-e022 .e022-paragraph{font-size:16px !important;line-height:1.4 !important;letter-spacing:-0.01em !important;margin:0 !important}',
      '  .mwg-e022 .e022-paragraph .e022-word span{transform:none !important}',
      '  .mwg-e022 .e022-paragraph:not(:first-child) .e022-word span{transform:none !important}',
      '}',
    ].join('');
    document.head.appendChild(e022Style);

    // ── E022 WORD TRANSITION ANIMATION ───────────────────────────
    const e022Root = document.querySelector<HTMLElement>('.mwg-e022');
    if (e022Root && window.innerWidth >= 768) {
      const pinEl       = e022Root.querySelector<HTMLElement>('.e022-pin');
      const containerEl = e022Root.querySelector<HTMLElement>('.e022-container');
      const paragraphs  = e022Root.querySelectorAll<HTMLElement>('.e022-paragraph');

      const wrapWords = (el: HTMLElement) => {
        const text = el.textContent || '';
        el.innerHTML = text.split(' ')
          .map(w => `<span class="e022-word"><span>${w}</span></span>`)
          .join(' ');
      };
      paragraphs.forEach(p => wrapWords(p));

      ScrollTrigger.create({
        trigger: pinEl,
        start: 'top top',
        end: 'bottom bottom',
        pin: containerEl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });

      paragraphs.forEach((paragraph, index) => {
        if (index === 0) return;
        tl.to(paragraph.querySelectorAll('.e022-word span'), {
          y: '0%', duration: 1, stagger: 0.15, ease: 'power4.out',
        });
      });
    }

    // ── H104 SCROLL TEXT CSS ─────────────────────────────────────
    const h104Style = document.createElement('style');
    h104Style.id = 'h104-css';
    h104Style.textContent = [
      '.mwg-h104 .h104-pin{height:500vh}',
      '.mwg-h104 .h104-container{height:100vh;display:flex;align-items:center;overflow:hidden}',
      '.mwg-h104 svg{display:block;width:120%;height:auto;overflow:visible;margin:8vw 0 0 -10%}',
      '.mwg-h104 text{font-family:"Manrope",sans-serif;font-weight:300}',
    ].join('');
    document.head.appendChild(h104Style);

    // ── H104 SCROLL TEXT ANIMATION ────────────────────────────────
    const h104Root = document.querySelector<HTMLElement>('.mwg-h104');
    if (h104Root) {
      const runH104 = () => {
        const pinEl       = h104Root.querySelector<HTMLElement>('.h104-pin');
        const containerEl = h104Root.querySelector<HTMLElement>('.h104-container');
        const svgLine     = h104Root.querySelector<SVGPathElement>('#h104-line');
        const trackEl     = h104Root.querySelector<SVGGElement>('#h104-track');
        if (!pinEl || !containerEl || !svgLine || !trackEl) return;

        const GAP = 90;
        const IMG_HEIGHT = 300;

        type TextSeg = { type: 'text'; el: SVGElement; textPath: SVGTextPathElement; size: number };
        type ImgSeg  = { type: 'image'; el: SVGImageElement; size: number; width: number; height: number };
        type Seg = TextSeg | ImgSeg;

        let segs: Seg[] = [];
        let totalLen = 0;
        let scrollProg = 0;
        let prevScroll: number | null = null;
        let wheelTimeout: ReturnType<typeof setTimeout>;

        const morphTl = gsap.timeline({ paused: true })
          .to(svgLine, { morphSVG: '#h104-wave', duration: 1, ease: 'none' } as gsap.TweenVars);

        const amplitude = { value: 0 };
        const amplitudeTo = gsap.quickTo(amplitude, 'value', {
          duration: 1, ease: 'power2',
          onUpdate: () => {
            morphTl.progress(gsap.utils.clamp(0, 1, amplitude.value / 50));
            h104Update();
          },
        });

        const measureTw = (el: Element, content: string) => {
          const fs = parseFloat((el as SVGTextElement).getAttribute('font-size') || '350');
          const cv = document.createElement('canvas');
          const ctx = cv.getContext('2d')!;
          ctx.font = `300 ${fs}px Manrope, sans-serif`;
          return ctx.measureText(content).width;
        };

        const sizeImages = () =>
          Promise.all(
            Array.from(trackEl.querySelectorAll<SVGImageElement>('image')).map(imgEl =>
              new Promise<void>(resolve => {
                const probe = new Image();
                const apply = () => {
                  const w = Math.round(IMG_HEIGHT * probe.naturalWidth / probe.naturalHeight);
                  imgEl.setAttribute('width', String(w));
                  imgEl.setAttribute('height', String(IMG_HEIGHT));
                  resolve();
                };
                probe.onload = apply;
                probe.onerror = () => resolve();
                probe.src = imgEl.getAttribute('href') || '';
                if (probe.complete && probe.naturalWidth) apply();
              })
            )
          );

        const measureSegs = () => {
          segs = Array.from(trackEl.children).map(el => {
            if (el.tagName.toLowerCase() === 'image') {
              const w = +(el.getAttribute('width') || '0');
              const h = +(el.getAttribute('height') || '0');
              return { type: 'image' as const, el: el as SVGImageElement, size: w, width: w, height: h };
            }
            const tp = el.querySelector('textPath')!;
            return { type: 'text' as const, el: el as SVGElement, textPath: tp as SVGTextPathElement, size: measureTw(el, tp.textContent || '') };
          });
          totalLen = segs.reduce((s, seg, i) => s + seg.size + (i < segs.length - 1 ? GAP : 0), 0);
        };

        const placeImageOnPath = (el: SVGImageElement, len: number, width: number, height: number) => {
          const pl = svgLine.getTotalLength();
          if (len < -width || len > pl + width) { el.style.opacity = '0'; return; }
          el.style.opacity = '1';
          const clamped = gsap.utils.clamp(0, pl, len);
          const pt   = svgLine.getPointAtLength(clamped);
          const next = svgLine.getPointAtLength(gsap.utils.clamp(0, pl, clamped + 1));
          const angle = Math.atan2(next.y - pt.y, next.x - pt.x) * 180 / Math.PI;
          el.setAttribute('x', String(pt.x - width / 2));
          el.setAttribute('y', String(pt.y - height));
          el.setAttribute('transform', `rotate(${angle} ${pt.x} ${pt.y})`);
        };

        const h104Update = () => {
          const pl = svgLine.getTotalLength();
          let cursor = pl + totalLen - scrollProg * (pl + totalLen);
          for (let i = segs.length - 1; i >= 0; i--) {
            const seg = segs[i];
            cursor -= seg.size;
            if (seg.type === 'image') {
              placeImageOnPath(seg.el, cursor + seg.size / 2, seg.width, seg.height);
            } else {
              seg.textPath.setAttribute('startOffset', `${(cursor / pl) * 100}%`);
              seg.el.style.opacity = (cursor >= pl || cursor + seg.size <= 0) ? '0' : '1';
            }
            cursor -= GAP;
          }
        };

        const bumpAmplitude = (amount: number) => {
          amplitudeTo(Math.abs(amount));
          clearTimeout(wheelTimeout);
          wheelTimeout = setTimeout(() => amplitudeTo(0), 66);
        };

        sizeImages().then(() => {
          measureSegs();
          h104Update();

          ScrollTrigger.create({
            trigger: pinEl,
            start: 'top top',
            end: 'bottom bottom',
            pin: containerEl,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: self => {
              const scroll = self.scroll();
              if (prevScroll != null) bumpAmplitude(scroll - prevScroll);
              prevScroll = scroll;
              scrollProg = self.progress;
              h104Update();
            },
          });

          h104Root.addEventListener('wheel', (e: Event) => bumpAmplitude((e as WheelEvent).deltaY), { passive: true });
          ScrollTrigger.refresh();
        });
      };

      const df = document as Document & { fonts?: { ready: Promise<unknown>; load: (f: string) => Promise<unknown> } };
      if (df.fonts) {
        Promise.all([df.fonts.ready, df.fonts.load('300 350px Manrope')]).then(runH104);
      } else {
        runH104();
      }
    }

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
      gsap.set(animated, { clearProps: "all" });
      document.getElementById('e022-css')?.remove();
      document.getElementById('h104-css')?.remove();
    };
  }, []);

  return (
    <>
      <LandingNavbar />

      <div id="aff-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="aff-content" className="bg-white text-black font-sans overflow-hidden">

          {/* ── HERO ───────────────────────────────────────────────────── */}
          <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-48 md:pt-56 pb-16 relative overflow-hidden">

            <h1 className="text-5xl md:text-7xl lg:text-[90px] font-normal leading-[1.05] tracking-tight mb-8 max-w-4xl mx-auto">
              <span className="block">Afiliados y creadores</span>
            </h1>

            <p data-fade className="text-[17px] md:text-xl font-light text-zinc-600 max-w-xl mx-auto mb-10 leading-relaxed px-2 md:px-0">
              Únete al programa de afiliados de Miiles. Comparte tu link y recibe el <strong className="text-black font-normal">25%</strong> de comisión en suscripciones.
            </p>

            <div data-fade className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="px-8 py-4 rounded-full bg-black text-white text-[15px] font-normal hover:-translate-y-2 transition-transform duration-300 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" /></svg>
                Quiero ser creador
              </Link>
            </div>

            {/* Hero Image */}
            <div data-fade className="mt-16 w-full max-w-[85vw]">
              <div className="rounded-3xl overflow-hidden border border-black/8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] bg-zinc-50 aspect-[16/9] w-full max-w-full">
                <img
                  src={creadoresHeroImg}
                  alt="Creadora utilizando Miiles"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

          </section>

          {/* ── E022 WORD TRANSITIONS ─────────────────────────────────── */}
          <div className="mwg-e022">
            <div className="e022-pin">
              <div className="e022-container">
                <div className="e022-top">
                  <p className="e022-top-title">
                    Quiénes <span style={{ fontFamily: "'Welth Catritz', serif", overflow: 'visible' }} className="pr-1 italic tracking-normal">somos</span>
                  </p>
                </div>
                <div className="e022-paragraphs">
                  <p className="e022-paragraph">Somos Miiles. Creamos herramientas para creativos.</p>
                  <p className="e022-paragraph">Con Miiles, puedes diseñar, estructurar y lanzar modelos de negocio impulsados por IA en minutos.</p>
                  <p className="e022-paragraph">Nuestra misión es ayudar a las personas a crear y crecer sin límites.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOARD MOCKUP ───────────────────────────────────────────── */}
          <section className="py-12 md:py-32 px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <div data-fade>
                <BoardMockup />
              </div>
            </div>
          </section>

          {/* ── CÓMO FUNCIONA + DASHBOARD MOCKUP ───────────────────────── */}
          <section id="como-funciona" className="py-20 md:py-48 px-6 scroll-mt-24">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-6xl font-normal leading-[1.3] tracking-tight pb-2">
                  Empieza desde <span style={{ fontFamily: "'Welth Catritz', serif", overflow: 'visible' }} className="pr-1 italic tracking-normal font-light">cualquier</span> lugar
                </h2>
                <p data-fade className="text-sm font-light text-zinc-600 mt-4 max-w-sm mx-auto">
                  No hay formularios complicados ni procesos de aprobación largos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
                {STEPS.map((s, i) => (
                  <div
                    key={i}
                    data-fade
                    className="flex gap-6 items-start border border-black/8 rounded-3xl p-7 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
                  >
                    <span className="text-[11px] font-normal text-zinc-400 mt-1 shrink-0 w-8">{s.n}</span>
                    <div>
                      <div className="text-xl font-normal mb-2">{s.label}</div>
                      <div className="text-sm font-light text-zinc-600">{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dashboard mockup */}
              <div data-fade>
                <AnimatedDashboardMockup />
              </div>
            </div>
          </section>

          {/* ── H104 HORIZONTAL SCROLL TEXT (DESKTOP) ─────────────────────────── */}
          <div className="mwg-h104 hidden md:block" style={{ background: '#fff' }}>
            <div className="h104-pin">
              <div className="h104-container">
                <svg width="2577" height="391" viewBox="0 0 2577 391" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <clipPath id="h104-round-clip" clipPathUnits="objectBoundingBox">
                      <rect width="1" height="1" rx=".08" ry=".08" />
                    </clipPath>
                  </defs>
                  <path id="h104-line" d="M0 195H644H1288H1932H2576" />
                  <path id="h104-wave" d="M0.21875 190.5C0.21875 190.5 382.004 0.5 644.219 0.5C906.434 0.5 1051.3 78.1239 1288.22 190.5C1531.72 306 1668.87 390.5 1932.22 390.5C2195.57 390.5 2576.22 190.5 2576.22 190.5" style={{ opacity: 0 }} />
                  <g id="h104-track">
                    <image href="/afiliados/arrow.webp" height={300} clipPath="url(#h104-round-clip)" />
                    <text className="h104-seg" fill="black" fontSize={350}>
                      <textPath href="#h104-line" textAnchor="start">Empieza</textPath>
                    </text>
                    <image href="/afiliados/estrella.webp" height={300} clipPath="url(#h104-round-clip)" />
                    <text className="h104-seg" fill="black" fontSize={350}>
                      <textPath href="#h104-line" textAnchor="start">tu camino</textPath>
                    </text>
                    <image href="/afiliados/sonrisa.webp" height={300} clipPath="url(#h104-round-clip)" />
                    <text className="h104-seg" fill="black" fontSize={350}>
                      <textPath href="#h104-line" textAnchor="start">hoy</textPath>
                    </text>
                    <image href="/afiliados/group18.webp" height={300} clipPath="url(#h104-round-clip)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* ── MOBILE CTA SECTION ─────────────────────────── */}
          <div className="block md:hidden py-20 px-6 text-center bg-white border-t border-black/5">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-normal leading-tight tracking-tight mb-8">
                Empieza hoy <span style={{ fontFamily: "'Welth Catritz', serif", overflow: 'visible' }} className="pr-1 italic tracking-normal font-light">mismo</span>
              </h2>
              <Link
                to="/register"
                className="px-8 py-4 rounded-full bg-black text-white text-[15px] font-normal inline-flex items-center justify-center gap-2 hover:-translate-y-1 transition-transform duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                </svg>
                Crear cuenta
              </Link>
            </div>
          </div>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Afiliados;
