/**
 * Pop-up para enviar una sugerencia a los administradores desde la
 * Arquitectura Algorítmica. Solo requiere estar dentro de la cuenta.
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { Lightbulb, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX = 1000;

type Props = {
  open: boolean;
  network?: string | null;
  context?: string;
  onClose: () => void;
};

const SuggestionDialog = ({ open, network, context, onClose }: Props) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const text = message.trim();
  const valid = text.length >= 5 && text.length <= MAX;

  const send = async () => {
    if (!valid || sending) return;
    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setSending(false);
      toast.error("Inicia sesión para enviar tu sugerencia");
      return;
    }
    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id,
      message: text,
      network: network ?? null,
      context: context ?? "Arquitectura Algorítmica",
    });
    setSending(false);
    if (error) {
      toast.error("No se pudo enviar tu sugerencia");
      return;
    }
    toast.success("¡Gracias! Recibimos tu sugerencia");
    setMessage("");
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#17171a]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[15px] font-normal text-gray-900 dark:text-white">
              <Lightbulb size={16} /> Sugerir una mejora
            </p>
            <p className="mt-1 text-[12px] font-light text-gray-500 dark:text-white/50">
              Cuéntanos tu idea o aprendizaje para mejorar la arquitectura algorítmica
              {network ? ` de ${network}` : ""}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <textarea
          autoFocus
          value={message}
          maxLength={MAX}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe aquí tu sugerencia, idea o aprendizaje…"
          className="mt-5 h-40 w-full resize-none rounded-2xl bg-gray-50 p-4 text-[13.5px] font-light leading-relaxed text-gray-900 outline-none placeholder:text-gray-300 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25"
        />
        <p className="mt-1 text-right text-[11px] font-light text-gray-300 dark:text-white/30">
          {text.length}/{MAX}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={send}
            disabled={!valid || sending}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[13px] font-normal text-white transition-colors hover:bg-neutral-800 disabled:opacity-40 dark:border dark:border-white/10 dark:hover:bg-zinc-900"
          >
            {sending && <Loader2 size={13} className="animate-spin" />}
            Enviar sugerencia
          </button>
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-[13px] font-light text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SuggestionDialog;
