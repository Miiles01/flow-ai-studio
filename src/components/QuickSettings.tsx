import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Sun, Moon, User, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlan } from "@/hooks/usePlan";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export function QuickSettings({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  const { plan } = usePlan();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
        {children}
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
                  navigate("/profile");
                }}
                className={`
                  flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all hover:scale-[1.03]
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
                <ArrowRight size={10} />
              </button>
            </div>
          </div>

          <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-gray-100"}`} />

          {/* Quick Actions List */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider opacity-50 mb-1">Ajustes</h4>
            
            {/* Dark Mode toggle row */}
            <div 
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200
                ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}
              `}
            >
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Moon size={16} strokeWidth={1.5} className="text-violet-400" />
                ) : (
                  <Sun size={16} strokeWidth={1.5} className="text-amber-500" />
                )}
                <span className="text-[13px] font-light">Modo oscuro</span>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
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
              <ArrowRight size={12} className="opacity-40" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
