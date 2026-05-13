import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, LayoutGrid, Mic, ArrowUp, Loader2 } from "lucide-react";

type AIPromptBarProps = {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
};

const AIPromptBar = ({ onGenerate, isGenerating }: AIPromptBarProps) => {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-12 inset-x-0 mx-auto z-10 w-full max-w-3xl px-6"
    >
      <div className="bg-black rounded-[40px] pt-8 pb-4 px-6 shadow-2xl transition-all duration-300">
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe tu flujo o idea..."
          className="w-full bg-transparent text-white font-light text-[15px] placeholder:text-white/40 outline-none resize-none overflow-hidden min-h-[44px] leading-relaxed text-center placeholder:text-center"
          disabled={isGenerating}
        />
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
            >
              <Plus size={18} strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-2 bg-white/10 h-10 px-4 rounded-full cursor-pointer hover:bg-white/20 transition-all group">
              <LayoutGrid size={15} strokeWidth={1.5} className="text-white/70 group-hover:text-white transition-colors" />
              <span className="text-[13px] font-light text-white/70 group-hover:text-white transition-colors tracking-wider">Apps</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
            >
              <Mic size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isGenerating}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 transition-all duration-300 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:transform-none"
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowUp size={18} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIPromptBar;
