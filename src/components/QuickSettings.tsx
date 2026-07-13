import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Sun, Moon, Laptop, User, ArrowRight, Download } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlan } from "@/hooks/usePlan";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function QuickSettings({ children }: { children?: React.ReactNode }) {
  const { theme, setTheme, isDark } = useTheme();
  const { plan } = usePlan();
  const { canInstall, isIOS, isStandalone, promptInstall } = useInstallPrompt();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const showInstall = !isStandalone && (canInstall || isIOS);

  const handleInstall = async () => {
    if (isIOS) {
      toast("Instala Miiles", {
        description: "Toca Compartir y luego “Agregar a inicio”.",
      });
      return;
    }
    const ok = await promptInstall();
    if (ok) setIsOpen(false);
  };


  const planNames: Record<string, string> = {
    free: "Plan Gratis",
    pro: "Plan Pro",
    business: "Plan Negocios",
    negocios: "Plan Negocios",
  };
  
  const displayPlan = planNames[plan?.toLowerCase() || "free"] || `Plan ${plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Gratis"}`;
  const isPremium = plan?.toLowerCase() !== "free";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children || (
          <button
            title="Ajustes rápidos"
            className={`
              relative flex items-center justify-center
              w-9 h-9 rounded-full
              border transition-all duration-300 outline-none
              ${isDark
                ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
                : "border-black/10 bg-white hover:bg-gray-50 text-black shadow-sm"
              }
            `}
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              whileHover={{ rotate: 45 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center"
            >
              <Settings size={16} strokeWidth={1.5} />
            </motion.div>
          </button>
        )}
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className={`
          w-72 rounded-[24px] p-4 border shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-md transition-colors duration-300
          ${isDark
            ? "bg-zinc-950/90 border-white/10 text-white"
            : "bg-white/95 border-[#F3F4F6] text-black"
          }
        `}
      >
        <div className="space-y-4">
          {/* Header & Plan Info */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider opacity-50">Membresía</h4>
            <div 
              className={`
                p-3 rounded-2xl flex items-center justify-between border transition-all duration-300
                ${isDark
                  ? "bg-white/5 border-white/5 text-white"
                  : "bg-black border-zinc-900 text-white"
                }
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] font-medium truncate">
                  {displayPlan}
                </span>
              </div>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/profile#plan");
                }}
                className={`
                  flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full transition-all hover:scale-[1.03]
                  ${isPremium
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    : (isDark
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-sm"
                        : "bg-white hover:bg-gray-100 text-black shadow-sm"
                      )
                  }
                `}
              >
                {isPremium ? "Gestionar" : "Mejorar"}
              </button>
            </div>
          </div>

          <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-gray-100"}`} />

          {/* Quick Actions List */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider opacity-50 mb-1">Ajustes</h4>
            
            {/* Theme Selector Row */}
            <div 
              className="flex items-center justify-between px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                {theme === "light" ? (
                  <Sun size={16} strokeWidth={1.5} className="text-amber-500" />
                ) : theme === "dark" ? (
                  <Moon size={16} strokeWidth={1.5} className="text-violet-400" />
                ) : (
                  <Laptop size={16} strokeWidth={1.5} className="opacity-70" />
                )}
                <span className="text-[13px] font-light">Tema</span>
              </div>
              
              <div className={`flex items-center gap-1 p-0.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                {/* Light Theme Button */}
                <button
                  type="button"
                  title="Tema claro"
                  onClick={() => setTheme("light")}
                  className={`
                    p-1.5 rounded-full transition-all duration-200 hover:scale-105
                    ${theme === "light" 
                      ? (isDark ? "bg-white text-black" : "bg-black text-white shadow-sm") 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Sun size={14} strokeWidth={2} />
                </button>

                {/* Dark Theme Button */}
                <button
                  type="button"
                  title="Tema oscuro"
                  onClick={() => setTheme("dark")}
                  className={`
                    p-1.5 rounded-full transition-all duration-200 hover:scale-105
                    ${theme === "dark" 
                      ? (isDark ? "bg-white text-black" : "bg-black text-white shadow-sm") 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Moon size={14} strokeWidth={2} />
                </button>

                {/* System Theme Button */}
                <button
                  type="button"
                  title="Automático (Dispositivo)"
                  onClick={() => setTheme("system")}
                  className={`
                    p-1.5 rounded-full transition-all duration-200 hover:scale-105
                    ${theme === "system" 
                      ? (isDark ? "bg-white text-black" : "bg-black text-white shadow-sm") 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Laptop size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Profile Settings row */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/profile");
              }}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 text-left
                ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}
              `}
            >
              <div className="flex items-center gap-2.5">
                <User size={16} strokeWidth={1.5} className="opacity-70" />
                <span className="text-[13px] font-light">Ajustes del perfil</span>
              </div>
            </button>

            {/* Install app row */}
            {showInstall && (
              <button
                onClick={handleInstall}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 text-left
                  ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Download size={16} strokeWidth={1.5} className="opacity-70" />
                  <span className="text-[13px] font-light">Abrir en aplicación</span>
                </div>
                <ArrowRight size={14} strokeWidth={1.5} className="opacity-40" />
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
