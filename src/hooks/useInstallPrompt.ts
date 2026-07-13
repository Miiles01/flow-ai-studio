import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Module-level cache so the event (which fires once) is shared across components
let cachedPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    cachedPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event("miiles:installready"));
  });
  window.addEventListener("appinstalled", () => {
    cachedPrompt = null;
    window.dispatchEvent(new Event("miiles:installdone"));
  });
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(!!cachedPrompt);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua) && !(window as any).MSStream);

    const onReady = () => setCanInstall(true);
    const onDone = () => setCanInstall(false);
    window.addEventListener("miiles:installready", onReady);
    window.addEventListener("miiles:installdone", onDone);
    return () => {
      window.removeEventListener("miiles:installready", onReady);
      window.removeEventListener("miiles:installdone", onDone);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!cachedPrompt) return false;
    await cachedPrompt.prompt();
    const { outcome } = await cachedPrompt.userChoice;
    if (outcome === "accepted") {
      cachedPrompt = null;
      setCanInstall(false);
      return true;
    }
    return false;
  }, []);

  return { canInstall, isIOS, isStandalone, promptInstall };
}
