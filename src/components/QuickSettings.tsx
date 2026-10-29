import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Sun, Moon, Laptop, User, ArrowRight, Download, Languages } from "lucide-react";
import { LanguageToggle } from "@/components/LanguagePicker";
import { useTheme } from "@/contexts/ThemeContext";
import { usePlan } from "@/hooks/usePlan";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function QuickSettings({ children }: { children?: React.ReactNode }) {
  useTranslation();
  const { theme, setTheme, isDark } = useTheme();
  const { plan } = usePlan();
  const { canInstall, isIOS, isStandalone, promptInstall } = useInstallPrompt();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const showInstall = !isStandalone;

  const handleInstall = async () => {
    if (canInstall) {
      const ok = await promptInstall();
      if (ok) setIsOpen(false);
      return;
    }
    if (isIOS) {
      toast(dt("dashboard.text188"), {
        description: dt("dashboard.text189"),
      });
      return;
    }
    toast(dt("dashboard.text190"), {
      description:
        dt("dashboard.text191"),
    });
  };



  const planNames: Record<string, string> = {
    free: dt("dashboard.text142"),
    pro: dt("dashboard.text140"),
    business: dt("dashboard.text141"),
    negocios: dt("dashboard.text141"),
  };
  
  const displayPlan = planNames[plan?.toLowerCase() || "free"] || `Plan ${plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : dt("dashboard.text183")}`;
  const isPremium = plan?.toLowerCase() !== "free";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children || (
          <button
            title={dt("dashboard.text192")}
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
          w-72 rounded-[24px] p-4 border shadow-[0_24px_70px_rgba(0,0,0,0.15)] transition-colors duration-300
          border-white/10 text-white
          ${isDark
            ? "bg-[#1C1C1E]"
            : "bg-black/70 backdrop-blur-2xl"
          }
        `}
      >
        <div className="space-y-4">
          {/* Header & Plan Info */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider opacity-50">{dt("dashboard.text193")}</h4>
            <div 
              className="p-3 rounded-2xl flex items-center justify-between border transition-all duration-300 bg-white/5 border-white/5 text-white"
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
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-sm"
                  }
                `}
              >
                {isPremium ? dt("dashboard.label8") : dt("dashboard.label9")}
              </button>
            </div>
          </div>

          <div className="h-[1px] w-full bg-white/10" />

          {/* Quick Actions List */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider opacity-50 mb-1">{dt("dashboard.text194")}</h4>
            
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
                <span className="text-[13px] font-light">{dt("dashboard.text195")}</span>
              </div>
              
              <div className="flex items-center gap-1 p-0.5 rounded-full border bg-white/5 border-white/10">
                {/* Light Theme Button */}
                <button
                  type="button"
                  title={dt("dashboard.text196")}
                  onClick={() => setTheme("light")}
                  className={`
                    p-1.5 rounded-full transition-all duration-200 hover:scale-105
                    ${theme === "light" 
                      ? "bg-white text-black shadow-sm" 
                      : "text-white/60 hover:text-white"
                    }
                  `}
                >
                  <Sun size={14} strokeWidth={2} />
                </button>

                {/* Dark Theme Button */}
                <button
                  type="button"
                  title={dt("dashboard.text197")}
                  onClick={() => setTheme("dark")}
                  className={`
                    p-1.5 rounded-full transition-all duration-200 hover:scale-105
                    ${theme === "dark" 
                      ? "bg-white text-black shadow-sm" 
                      : "text-white/60 hover:text-white"
                    }
                  `}
                >
                  <Moon size={14} strokeWidth={2} />
                </button>

                {/* System Theme Button */}
                <button
                  type="button"
                  title={dt("dashboard.text198")}
                  onClick={() => setTheme("system")}
                  className={`
                    p-1.5 rounded-full transition-all duration-200 hover:scale-105
                    ${theme === "system" 
                      ? "bg-white text-black shadow-sm" 
                      : "text-white/60 hover:text-white"
                    }
                  `}
                >
                  <Laptop size={14} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Language Selector Row */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2.5">
                <Languages size={16} strokeWidth={1.5} className="opacity-70" />
                <span className="text-[13px] font-light">{dt("dashboard.language")}</span>
              </div>
              <LanguageToggle label={dt("dashboard.language")} />
            </div>

            {/* Profile Settings row */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/profile");
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group hover:bg-white/5"
            >
              <div className="flex items-center gap-2.5">
                <User size={16} strokeWidth={1.5} className="opacity-70" />
                <span className="text-[13px] font-light">{dt("dashboard.text199")}</span>
              </div>
            </button>

            {/* Install app row (temporarily hidden per user request) */}
            {/*
            {showInstall && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group hover:bg-white/5"
              >
                <Download size={16} strokeWidth={1.5} className="opacity-70" />
                <span className="text-[13px] font-light">Abrir en aplicación</span>
              </button>
            )}
            */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
