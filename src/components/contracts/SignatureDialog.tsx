/**
 * Pop-up de firma: dibujar o escribir, repetir, borrar y aceptar.
 * Se usa igual en el widget del canvas y en la página pública del documento.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  label?: string;
  defaultName?: string;
  onClose: () => void;
  onConfirm: (payload: { name: string; email: string | null; dataUrl: string }) => Promise<void> | void;
};

const SignatureDialog = ({ open, label, defaultName, onClose, onConfirm }: Props) => {
  const [mode, setMode] = useState<"Dibujar" | "Escribir">("Dibujar");
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState("");
  const [typed, setTyped] = useState("");
  const [sending, setSending] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    if (!open) {
      setTyped("");
      setHasStroke(false);
      setSending(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 640,
      y: ((e.clientY - rect.top) / rect.height) * 180,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    setHasStroke(true);
    const { x, y } = pos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#18181b";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    setTyped("");
  };

  /** Convierte la firma escrita en imagen para guardarla igual que la dibujada. */
  const typedToDataUrl = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#18181b";
    ctx.font = "italic 56px 'Welth Catritz', cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(typed.trim(), 24, 96);
    return canvas.toDataURL("image/png");
  };

  const canSign = name.trim().length > 1 && (mode === "Dibujar" ? hasStroke : typed.trim().length > 1);

  const confirm = async () => {
    if (!canSign || sending) return;
    setSending(true);
    const dataUrl = mode === "Escribir" ? typedToDataUrl() : canvasRef.current?.toDataURL("image/png") ?? "";
    try {
      await onConfirm({ name: name.trim(), email: email.trim() || null, dataUrl });
      onClose();
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/25 p-4"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-[560px] rounded-[28px] bg-white p-7 shadow-xl">
        <p className="text-[15px] font-normal text-neutral-900">{label?.trim() || "Firma del documento"}</p>
        <p className="mt-1 text-[12px] font-light text-neutral-400">
          Dibuja o escribe tu firma. Puedes repetirla las veces que quieras antes de aceptar.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className="h-11 rounded-full bg-neutral-50 px-4 text-[13px] font-light text-neutral-900 outline-none placeholder:text-neutral-300"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo (opcional)"
            className="h-11 rounded-full bg-neutral-50 px-4 text-[13px] font-light text-neutral-900 outline-none placeholder:text-neutral-300"
          />
        </div>

        <div className="mt-4 flex w-fit items-center gap-1 rounded-full bg-neutral-50 p-1">
          {(["Dibujar", "Escribir"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMode(t)}
              className={`rounded-full px-4 py-1.5 text-[12px] font-light transition-colors ${
                mode === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {mode === "Dibujar" ? (
          <canvas
            ref={canvasRef}
            width={640}
            height={180}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="mt-3 h-[180px] w-full touch-none rounded-2xl bg-neutral-50"
          />
        ) : (
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Escribe tu nombre"
            style={{ fontFamily: "'Welth Catritz', cursive" }}
            className="mt-3 h-[180px] w-full rounded-2xl bg-neutral-50 px-6 text-[34px] italic text-neutral-900 outline-none placeholder:text-[16px] placeholder:not-italic placeholder:text-neutral-300"
          />
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={confirm}
            disabled={!canSign || sending}
            className="rounded-full bg-black px-5 py-2.5 text-[13px] font-normal text-white transition-colors hover:bg-neutral-800 disabled:opacity-40"
          >
            {sending ? "Guardando…" : "Aceptar"}
          </button>
          <button
            onClick={clear}
            className="rounded-full bg-neutral-100 px-5 py-2.5 text-[13px] font-normal text-neutral-600 transition-colors hover:bg-neutral-200"
          >
            Repetir
          </button>
          <button
            onClick={onClose}
            className="ml-auto rounded-full px-4 py-2.5 text-[13px] font-light text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SignatureDialog;
