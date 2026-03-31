import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, LayoutGrid, Mic, ArrowUp, Loader2 } from "lucide-react";

type AIPromptBarProps = {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  isInitial?: boolean;
};

const AIPromptBar = ({ onGenerate, isGenerating, isInitial }: AIPromptBarProps) => {
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
      layout
      initial={{ y: 40, opacity: 0 }}
      animate={{ 
        y: isInitial ? -20 : 0, 
        top: isInitial ? "50%" : "auto",
        bottom: isInitial ? "auto" : "48px",
        opacity: 1 
      }}
      className="absolute left-1/2 -translate-x-1/2 z-10 w-full max-w-3xl px-6 transition-all duration-500"
    >
      <div className="bg-black rounded-xl p-5 shadow-sm transition-all duration-300">
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe tu flujo o idea..."
          className="w-full bg-transparent text-white font-light text-[15px] placeholder:text-miiles-gray-600 outline-none resize-none overflow-hidden min-h-[44px] leading-relaxed text-center placeholder:text-center"
          disabled={isGenerating}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-miiles-gray-400 hover:bg-white/20 hover:text-white transition-all"
            >
              <Plus size={16} />
            </button>
            <div className="flex items-center gap-2 bg-white/10 h-8 px-3 rounded-full cursor-pointer hover:bg-white/15 transition-all group">
              <LayoutGrid size={14} className="text-miiles-gray-400 group-hover:text-white" />
              <span className="text-[11px] font-light text-miiles-gray-400 group-hover:text-white tracking-wider">Apps</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-miiles-gray-400 hover:bg-white/20 hover:text-white transition-all"
            >
              <Mic size={16} />
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isGenerating}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black transition-all duration-300 hover:bg-miiles-pink-light hover:text-miiles-pink hover:-translate-y-1 disabled:opacity-10 disabled:transform-none"
            >
              {isGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUp size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIPromptBar;
