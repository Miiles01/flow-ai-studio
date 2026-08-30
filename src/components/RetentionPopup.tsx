import React, { useState } from "react";
import { LineChart, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RETENTION_PATTERNS = [
  {
    id: 1,
    badge: "Patrón 1",
    title: "Mal hook",
    desc: "Caída fuerte en los primeros 1–3 segundos y luego la línea se aplana.",
    meaning: "Los que sobrevivieron al inicio ya están enganchados y no se van.",
    cause: "Gancho débil, introducción larga, o título confuso.",
    action: "Corta la intro. Entra directo a la acción en el primer segundo.",
    color: "text-red-500",
    bgBadge: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400",
    svg: (
      <svg viewBox="0 0 300 172" className="w-full h-full text-gray-400">
        <line x1="40" y1="10" x2="40" y2="140" stroke="currentColor" strokeWidth="1"/>
        <line x1="40" y1="140" x2="280" y2="140" stroke="currentColor" strokeWidth="1"/>
        <path d="M42,15 Q45,65 62,75" stroke="#ec4899" strokeWidth="3" fill="none"/>
        <path d="M62,75 Q100,85 280,87" stroke="currentColor" strokeWidth="2" strokeDasharray="4" fill="none"/>
      </svg>
    )
  },
  {
    id: 2,
    badge: "Patrón 2",
    title: "Mal hook + mala estructura",
    desc: "Caída fuerte al inicio y la línea sigue bajando después, sin aplanarse.",
    meaning: "Además del gancho débil, el contenido tampoco logra sostener a quienes sí se quedaron.",
    cause: "Ritmo lento, tangentes, falta de 'ganchos' intermedios.",
    action: "Corrige primero la apertura y luego reestructura el cuerpo.",
    color: "text-red-500",
    bgBadge: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400",
    svg: (
      <svg viewBox="0 0 300 172" className="w-full h-full text-gray-400">
        <line x1="40" y1="10" x2="40" y2="140" stroke="currentColor" strokeWidth="1"/>
        <line x1="40" y1="140" x2="280" y2="140" stroke="currentColor" strokeWidth="1"/>
        <path d="M42,15 C45,80 80,100 120,105 S200,120 280,125" stroke="#ec4899" strokeWidth="3" fill="none"/>
      </svg>
    )
  },
  {
    id: 3,
    badge: "Patrón 3",
    title: "Mal final",
    desc: "Retención estable durante casi todo el video, pero se desploma al terminar.",
    meaning: "El contenido funciona bien hasta cierto punto, pero el cierre decepciona.",
    cause: "CTA genérico, resumen aburrido, o un remate flojo.",
    action: "Prueba cierres con un gancho hacia el siguiente contenido.",
    color: "text-orange-500",
    bgBadge: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400",
    svg: (
      <svg viewBox="0 0 300 172" className="w-full h-full text-gray-400">
        <line x1="40" y1="10" x2="40" y2="140" stroke="currentColor" strokeWidth="1"/>
        <line x1="40" y1="140" x2="280" y2="140" stroke="currentColor" strokeWidth="1"/>
        <path d="M42,20 Q150,40 210,52" stroke="currentColor" strokeWidth="2" strokeDasharray="4" fill="none"/>
        <path d="M210,52 Q260,60 280,130" stroke="#ec4899" strokeWidth="3" fill="none"/>
      </svg>
    )
  },
  {
    id: 4,
    badge: "Patrón 4",
    title: "No cumples expectativas",
    desc: "Declive parejo y constante durante todo el video, sin un tramo plano claro.",
    meaning: "El gancho prometió algo que el resto del contenido no sostiene al mismo nivel.",
    cause: "Brecha entre la expectativa creada por el hook y el valor real.",
    action: "Alinea el hook con lo que realmente vas a entregar.",
    color: "text-orange-500",
    bgBadge: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400",
    svg: (
      <svg viewBox="0 0 300 172" className="w-full h-full text-gray-400">
        <line x1="40" y1="10" x2="40" y2="140" stroke="currentColor" strokeWidth="1"/>
        <line x1="40" y1="140" x2="280" y2="140" stroke="currentColor" strokeWidth="1"/>
        <path d="M42,20 C100,30 200,110 280,128" stroke="#ec4899" strokeWidth="3" fill="none"/>
      </svg>
    )
  },
  {
    id: 5,
    badge: "Patrón 5",
    title: "Buen video",
    desc: "Caída pequeña al inicio y una línea casi plana durante el resto del video.",
    meaning: "El gancho funcionó y el contenido mantiene el interés de principio a fin.",
    cause: "Promesa clara desde el segundo uno + ritmo y valor consistentes.",
    action: "Identifica exactamente qué hiciste bien y repite la fórmula.",
    color: "text-green-500",
    bgBadge: "bg-[#E8ECFE] dark:bg-[#4059F1]/20 text-[#4059F1] dark:text-[#9DA9F9]",
    svg: (
      <svg viewBox="0 0 300 172" className="w-full h-full text-gray-400">
        <line x1="40" y1="10" x2="40" y2="140" stroke="currentColor" strokeWidth="1"/>
        <line x1="40" y1="140" x2="280" y2="140" stroke="currentColor" strokeWidth="1"/>
        <path d="M42,18 Q50,35 100,38 T280,45" stroke="#4059F1" strokeWidth="3" fill="none"/>
      </svg>
    )
  }
];

export function RetentionPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedPattern = selectedId ? RETENTION_PATTERNS.find(p => p.id === selectedId) : null;

  return (
    <div className="absolute bottom-8 left-8 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 rounded-full transition-all hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-black dark:text-white bg-white dark:bg-[#1a1a1a] shadow-sm border border-slate-200 dark:border-[#333] font-medium text-sm cursor-pointer flex items-center gap-2"
          >
            <LineChart size={16} strokeWidth={2.5} />
            Retención
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] md:w-[420px] bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="px-5 py-4  flex items-center justify-between ">
              <div className="flex items-center gap-3">
                {selectedPattern ? (
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-1.5 -ml-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <ArrowLeft size={18} className="text-gray-600 dark:text-gray-300" />
                  </button>
                ) : (
                  <LineChart size={20} className="text-gray-900 dark:text-white" />
                )}
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {selectedPattern ? selectedPattern.title : "Diagnóstico de Retención"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => setSelectedId(null), 300);
                }}
                className="p-1.5 -mr-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cerrar</span>
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-2">
              {!selectedPattern ? (
                <div className="flex flex-col gap-1">
                  <p className="px-3 pt-2 pb-3 text-sm text-gray-500 dark:text-gray-400">
                    Selecciona un patrón de gráfica para diagnosticar por qué tu video está perdiendo audiencia.
                  </p>
                  {RETENTION_PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className="text-left w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex gap-4 items-center group"
                    >
                      <div className="w-16 h-10 shrink-0 bg-gray-100 dark:bg-black/20 rounded-md overflow-hidden flex items-center justify-center p-1">
                        {p.svg}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase ${p.bgBadge}`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {p.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-5">
                  <div className="w-full h-32 bg-gray-50 dark:bg-[#111] rounded-xl p-2 border border-slate-100 dark:border-[#222]">
                    {selectedPattern.svg}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedPattern.desc}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Qué significa</h4>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPattern.meaning}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Causa Típica</h4>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedPattern.cause}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg ">
                      <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Qué hacer</h4>
                      <p className="text-sm text-blue-900 dark:text-blue-100">{selectedPattern.action}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
