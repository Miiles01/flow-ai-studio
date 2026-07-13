import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import appIcon from "/app-icon-192.png";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const DISMISS_KEY = "miiles_install_dismissed";

export function InstallAppBanner() {
  const { canInstall, isIOS, isStandalone, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    if (isStandalone) return;
    if (canInstall || isIOS) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [canInstall, isIOS, isStandalone]);

  const handleInstall = async () => {
    const ok = await promptInstall();
    if (ok) setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] sm:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="rounded-2xl bg-black text-white shadow-2xl ring-1 ring-white/10 p-4">
        <div className="flex items-start gap-3">
          <img
            src={appIcon}
            alt="Miiles"
            width={44}
            height={44}
            className="w-11 h-11 rounded-xl flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-normal leading-tight">Instala Miiles</p>
            <p className="text-xs font-light text-white/70 leading-snug mt-1">
              {isIOS
                ? "Toca Compartir y luego “Agregar a inicio” para abrirla como una app."
                : "Ábrela como una aplicación en tu computador, sin abrir el navegador."}
            </p>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white text-black text-sm font-normal px-4 py-1.5 hover:bg-white/90 transition-colors"
              >
                <Download size={15} strokeWidth={1.9} />
                Instalar
              </button>
            )}
          </div>
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="flex-shrink-0 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
