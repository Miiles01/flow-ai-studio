/**
 * Pop-up para enviar una sugerencia a los administradores desde la
 * Arquitectura Algorítmica. Solo requiere estar dentro de la cuenta.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
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
  const { t } = useTranslation();
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
      toast.error(t("architecture.ui.signInSuggestion"));
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
      toast.error(t("architecture.ui.suggestionError"));
      return;
    }
    toast.success(t("architecture.ui.suggestionSuccess"));
    setMessage("");
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-[999] flex items-center justify-center bg-black/40 p-4"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#17171a]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[15px] font-normal text-gray-900 dark:text-white">
              <Lightbulb size={16} /> {t("architecture.ui.suggest")}
            </p>
            <p className="mt-1 text-[12px] font-light text-gray-500 dark:text-white/50">
              {t(network ? "architecture.ui.suggestionDescriptionNetwork" : "architecture.ui.suggestionDescription", { network })}
            </p>
          </div>
          <Button variant="ghost" size="icon"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("architecture.ui.close")}
          >
            <X size={16} />
          </Button>
        </div>

        <textarea
          autoFocus
          value={message}
          maxLength={MAX}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("architecture.ui.suggestionPlaceholder")}
          className="mt-5 h-40 w-full resize-none rounded-2xl bg-gray-50 p-4 text-[13.5px] font-light leading-relaxed text-gray-900 outline-none placeholder:text-gray-300 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25"
        />
        <p className="mt-1 text-right text-[11px] font-light text-gray-300 dark:text-white/30">
          {text.length}/{MAX}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={send}
            disabled={!valid || sending}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-normal"
          >
            {sending && <Loader2 size={13} className="animate-spin" />}
            {t("architecture.ui.sendSuggestion")}
          </Button>
          <Button variant="ghost"
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-[13px] font-light text-muted-foreground hover:text-foreground"
          >
            {t("architecture.ui.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDialog;
