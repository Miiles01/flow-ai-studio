import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import onboardingHero from "@/assets/onboarding-hero.png";
import onboardingDone from "@/assets/onboarding-done.png";

const TOTAL_STEPS = 6;

function getVideoEmbedUrl(url: string): string | null {
  if (!url.trim()) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // TikTok
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
  // Instagram Reel
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;
  return null;
}

function VideoPreview({ url }: { url: string }) {
  const embedUrl = getVideoEmbedUrl(url);
  if (!embedUrl) {
    if (!url.trim()) return null;
    return (
      <div className="rounded-xl bg-muted/40 h-48 flex items-center justify-center text-sm text-muted-foreground">
        Pega un link de YouTube, TikTok o Instagram
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden shadow-sm aspect-video">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video preview"
      />
    </div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0, scale: 0.96 }),
};

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState([
    { platform: "Instagram", url: "" },
    { platform: "TikTok", url: "" },
    { platform: "YouTube", url: "" },
  ]);
  const [videoUrl1, setVideoUrl1] = useState("");
  const [videoUrl2, setVideoUrl2] = useState("");
  const [videoUrl3, setVideoUrl3] = useState("");
  const [phone, setPhone] = useState("");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  const hasAtLeastOneLink = socialLinks.some((l) => l.url.trim() !== "");
  const next = () => {
    if (step === 2 && !hasAtLeastOneLink) {
      toast.error("Agrega al menos un link de red social");
      return;
    }
    setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };
  const prev = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)); };

  const saveProfile = async () => {
    if (!user) return false;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        bio,
        instagram_handle: socialLinks.find(l => l.platform === "Instagram")?.url || null,
        tiktok_handle: socialLinks.find(l => l.platform === "TikTok")?.url || null,
        youtube_handle: socialLinks.find(l => l.platform === "YouTube")?.url || null,
        twitter_handle: socialLinks.find(l => l.platform === "X (Twitter)")?.url || null,
        video_url_1: videoUrl1 || null,
        video_url_2: videoUrl2 || null,
        video_url_3: videoUrl3 || null,
        phone,
        onboarding_completed: true,
      } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Error al guardar tu perfil");
      return false;
    }
    return true;
  };

  const handleNextFromContact = async () => {
    const ok = await saveProfile();
    if (ok) {
      setDir(1);
      setStep(5);
    }
  };

  const handleFinish = () => {
    navigate("/", { replace: true });
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div
          className="h-full bg-foreground"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center space-y-6">
                  <img
                    src={onboardingHero}
                    alt="Miiles"
                    className="mx-auto w-full max-w-sm rounded-2xl"
                  />
                  <h1 className="text-3xl font-semibold">
                    ¡Hola {displayName}!
                  </h1>
                  <p className="text-muted-foreground font-light text-base max-w-xs mx-auto">
                    Presentamos Miiles: una nueva forma para crear colaboraciones.
                  </p>
                  <div className="pt-2">
                    <Button onClick={next} className="px-10 rounded-full">
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 1: Bio */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-light">Sobre ti</h1>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      ¿A qué te dedicas? Cuéntanos brevemente.
                    </p>
                  </div>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Soy creador de contenido de fitness y bienestar con 3 años de experiencia..."
                    className="min-h-[120px] font-light shadow-sm border-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                </div>
              )}

              {/* Step 2: Social */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-light">Redes sociales</h1>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      Agrega tus perfiles para que las marcas te conozcan.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {socialLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs text-muted-foreground font-light">{link.platform}</label>
                          <Input
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...socialLinks];
                              updated[i] = { ...updated[i], url: e.target.value };
                              setSocialLinks(updated);
                            }}
                            placeholder={`https://${link.platform.toLowerCase().replace(/\s|\(|\)/g, "")}.com/tuusuario`}
                            className="shadow-sm border-none"
                          />
                        </div>
                        {i >= 3 && (
                          <button
                            type="button"
                            onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                            className="mt-5 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSocialLinks([...socialLinks, { platform: `Otro`, url: "" }])}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                    >
                      <Plus size={14} /> Agregar otra red
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Portafolio */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-light">Portafolio</h1>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      Agrega hasta 3 videos que representen tu mejor trabajo.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: videoUrl1, set: setVideoUrl1 },
                      { val: videoUrl2, set: setVideoUrl2 },
                      { val: videoUrl3, set: setVideoUrl3 },
                    ].map(({ val, set }, i) => {
                      const embedUrl = getVideoEmbedUrl(val);
                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-sm bg-muted/40 relative group">
                            {embedUrl ? (
                              <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={`Video ${i + 1}`}
                              />
                            ) : (
                              <label className="flex flex-col items-center justify-center h-full cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                <Plus size={20} />
                                <span className="text-[10px] font-light mt-1">Video {i + 1}</span>
                              </label>
                            )}
                          </div>
                          <Input
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            placeholder="Pega el link..."
                            className="shadow-sm border-none text-xs h-8"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-light mx-auto"
                  >
                    <SkipForward size={14} /> No soy creador de contenido
                  </button>
                </div>
              )}

              {/* Step 4: Phone */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-light">Contacto</h1>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      ¿Cómo pueden contactarte las marcas?
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-light">Teléfono / WhatsApp</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 1234 5678" className="shadow-sm border-none" type="tel" />
                  </div>
                </div>
              )}

              {/* Step 5: Done */}
              {step === 5 && (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-28 h-28">
                    <img src={onboardingDone} alt="Listo" className="w-full h-full object-contain" />
                  </div>
                  <h1 className="text-3xl font-semibold">¡Todo listo!</h1>
                  <p className="text-muted-foreground font-light text-base max-w-xs mx-auto">
                    Es hora de descubrir oportunidades y pasar al siguiente nivel.
                  </p>
                  <div className="pt-2">
                    <Button onClick={handleFinish} className="px-10 rounded-full">
                      Empezar a descubrir
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <AnimatePresence mode="wait">
            {step > 0 && step < 5 && (
              <motion.div
                key={`nav-${step}`}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 180, damping: 22, delay: 0.2 }}
                className="flex gap-3 mt-10"
              >
                <Button variant="outline" onClick={prev} className="flex-1 shadow-sm border-none bg-muted/50">
                  <ArrowLeft size={16} className="mr-2" /> Atrás
                </Button>
                {step < 4 ? (
                  <Button onClick={next} className="flex-1">
                    Siguiente <ArrowRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleNextFromContact} className="flex-1" disabled={saving}>
                    {saving && <Loader2 size={16} className="animate-spin mr-2" />}
                    Finalizar
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicator dots */}
          {step < 5 && (
          <motion.div
            key={`dots-${step}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 180, damping: 22, delay: 0.35 }}
            className="flex justify-center gap-1.5 mt-8"
          >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
