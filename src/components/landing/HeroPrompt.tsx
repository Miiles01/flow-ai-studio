import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AIPromptBar from "@/components/AIPromptBar";
import { useAuth } from "@/contexts/AuthContext";
import { savePendingHomePrompt } from "@/lib/homePrompt";

type Example = { label: string; prompt: string };

const TYPE_SPEED = 38;
const DELETE_SPEED = 18;
const HOLD_MS = 1800;

/**
 * Input del hero del home: la misma barra del canvas (AIPromptBar en modo inline).
 * Guarda la idea y lleva al usuario a crear su tablero, donde se genera sola.
 */
const HeroPrompt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const examples = t("landing.hero_examples", { returnObjects: true }) as Example[];

  const [activeIdx, setActiveIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [seed, setSeed] = useState<{ text: string; key: number } | null>(null);

  // Placeholder que se escribe solo, recorriendo los ejemplos
  useEffect(() => {
    if (!examples.length) return;
    const full = examples[activeIdx % examples.length].prompt;
    if (reduceMotion) {
      setTyped(full);
      return;
    }
    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (!deleting) {
        i++;
        setTyped(full.slice(0, i));
        if (i >= full.length) {
          deleting = true;
          timer = setTimeout(tick, HOLD_MS);
          return;
        }
        timer = setTimeout(tick, TYPE_SPEED);
      } else {
        i--;
        setTyped(full.slice(0, i));
        if (i <= 0) {
          setActiveIdx((n) => (n + 1) % examples.length);
          return;
        }
        timer = setTimeout(tick, DELETE_SPEED);
      }
    };
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [activeIdx, reduceMotion, examples.length]);

  const handleGenerate = (idea: string) => {
    savePendingHomePrompt(idea);
    navigate(user ? "/boards" : "/register?next=/boards");
  };

  const pickExample = (idx: number) => {
    setActiveIdx(idx);
    setSeed({ text: examples[idx].prompt, key: Date.now() });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AIPromptBar inline onGenerate={handleGenerate} isGenerating={false} placeholder={typed} seedPrompt={seed} />

      {/* Ejemplos: el activo se resalta mientras el placeholder lo escribe */}
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-7 text-[15px] md:text-base font-light">
        {examples.map((ex, i) => (
          <li key={ex.label} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden className="w-1 h-1 rounded-full bg-black/25" />}
            <button
              type="button"
              onClick={() => pickExample(i)}
              className={`py-2 transition-colors duration-200 ${
                i === activeIdx % examples.length ? "text-black" : "text-black/40 hover:text-black/70"
              }`}
            >
              {ex.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeroPrompt;
