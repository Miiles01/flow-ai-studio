import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

// BeforeInstallPromptEvent isn't in the standard TS lib
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "miiles_install_dismissed";

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    // Already installed / running standalone
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    if (ios) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-black text-white">
      <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-2.5 md:px-8">
        <Download size={18} strokeWidth={1.8} className="flex-shrink-0" />
        <p className="text-sm font-light flex-1 min-w-0">
          {isIOS ? (
            <>Instala Miiles: toca <span className="font-normal">Compartir</span> y luego <span className="font-normal">Agregar a inicio</span>.</>
          ) : (
            <>Descarga la aplicación de Miiles y ábrela como en tu computador.</>
          )}
        </p>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="flex-shrink-0 rounded-full bg-white text-black text-sm font-normal px-4 py-1.5 hover:bg-white/90 transition-colors"
          >
            Descargar
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
