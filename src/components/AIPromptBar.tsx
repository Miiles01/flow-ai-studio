import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";

type AIPromptBarProps = {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
};

const AIPromptBar = ({ onGenerate, isGenerating }: AIPromptBarProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
    setPrompt("");
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4"
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/40"
      >
        <div className="shrink-0">
          <Sparkles size={18} className="text-primary animate-pulse" />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe tu flujo... ej: 'Proceso de registro de usuario con validación'"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          disabled={isGenerating}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="shrink-0 p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
      <p className="text-center text-[10px] text-muted-foreground mt-2 opacity-60">
        Usa IA para generar diagramas automáticamente
      </p>
    </motion.div>
  );
};

export default AIPromptBar;
