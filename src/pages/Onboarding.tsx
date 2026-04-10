import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, X, Instagram, Youtube, Globe, SkipForward, ArrowRight, ArrowLeft, Loader2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import onboardingHero from "@/assets/onboarding-hero.png";
import onboardingDone from "@/assets/onboarding-done.png";

const TOTAL_STEPS = 6;

function getVideoEmbedUrl(url: string): string | null {
  if (!url.trim()) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;
  return null;
}

/* TikTok & X icons (not in lucide) */
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/* LinkedIn icon (2024 style) */
const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "tiktok", label: "TikTok", icon: TikTokIcon },
  { key: "portfolio", label: "Portafolio", icon: Globe },
  { key: "linkedin", label: "LinkedIn", icon: LinkedInIcon },
  { key: "twitter", label: "X", icon: XIcon },
  { key: "youtube", label: "YouTube", icon: Youtube },
] as const;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0, scale: 0.96 }),
};

/* Floating input for adding/editing a video link */
function VideoLinkPopover({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute inset-x-0 bottom-0 z-10 p-3 rounded-xl bg-foreground"
    >
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Pega el link del video..."
        className="bg-background/10 border-none shadow-none text-background placeholder:text-background/50 text-xs h-8 mb-2"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="flex-1 text-xs py-1.5 rounded-lg bg-background text-foreground font-normal"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs py-1.5 px-3 rounded-lg text-background/70 hover:text-background"
        >
          Cancelar
        </button>
      </div>
    </motion.div>
  );
}

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState<Record<string, string>>({
    instagram: "",
    tiktok: "",
    portfolio: "",
    linkedin: "",
    twitter: "",
    youtube: "",
  });
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [socialDraft, setSocialDraft] = useState("");

  const [videoUrl1, setVideoUrl1] = useState("");
  const [videoUrl2, setVideoUrl2] = useState("");
  const [videoUrl3, setVideoUrl3] = useState("");
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [phone, setPhone] = useState("");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  const filledSocialsCount = Object.values(socials).filter((v) => v.trim()).length;
  const next = () => {
    if (step === 2 && filledSocialsCount < 1) {
      toast.error("Agrega al menos un medio de contacto");
      return;
    }
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };
  const prev = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const saveProfile = async () => {
    if (!user) return false;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        bio,
        instagram_handle: socials.instagram || null,
        tiktok_handle: socials.tiktok || null,
        youtube_handle: socials.youtube || null,
        twitter_handle: socials.twitter || null,
        portfolio_url: socials.portfolio || null,
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
  const videos = [
    { val: videoUrl1, set: setVideoUrl1 },
    { val: videoUrl2, set: setVideoUrl2 },
    { val: videoUrl3, set: setVideoUrl3 },
  ];

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
      {/* Top navigation arrows */}
      {step > 0 && step < 5 && (
        <div className="flex items-center justify-between px-6 py-4">
          <button type="button" onClick={prev} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground">
            <ArrowLeft size={20} />
          </button>
          {step < 4 ? (
            <button type="button" onClick={next} className="p-2 rounded-full hover:bg-muted transition-colors text-foreground">
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextFromContact}
              disabled={saving}
              className="p-2 rounded-full hover:bg-muted transition-colors text-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
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
                <div className="text-center space-y-6 max-w-md mx-auto">
                  <img src={onboardingHero} alt="Miiles" className="mx-auto w-full max-w-sm rounded-2xl" />
                  <h1 className="text-3xl font-semibold">¡Hola {displayName}!</h1>
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

              {/* Step 1: Bio — card style like reference */}
              {step === 1 && (
                <div className="max-w-lg mx-auto space-y-8">
                  <h1 className="text-2xl font-semibold">Cuéntanos sobre ti</h1>
                  <div className="rounded-2xl bg-gradient-to-b from-[#FDFDFD] to-[#F8F9FD] p-6 shadow-[0px_100px_170px_0px_rgba(39,39,62,0.05)]">
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Me dedico a..."
                      className="min-h-[140px] font-light bg-transparent border-none shadow-none resize-none focus-visible:ring-0 p-0 text-base"
                      maxLength={200}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">{bio.length}/200 caracteres</span>
                      <Button onClick={next} size="sm" className="rounded-full px-6 text-xs">
                        Continuar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Medios de contacto — two column */}
              {step === 2 && (
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  {/* Left */}
                  <div className="md:w-2/5 space-y-4">
                    <h1 className="text-2xl font-semibold">Medios de contacto</h1>
                    <p className="text-muted-foreground font-light text-sm">
                      Agrega al menos <span className="font-normal text-foreground">3 medios de contacto</span>.
                    </p>
                    <button
                      type="button"
                      onClick={next}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                    >
                      Continuar
                    </button>
                  </div>
                  {/* Right — platform list */}
                  <div className="flex-1 rounded-2xl bg-gradient-to-b from-[#FDFDFD] to-[#F8F9FD] shadow-[0px_100px_170px_0px_rgba(39,39,62,0.05)] divide-y divide-muted/40">
                    {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon }) => {
                      const hasValue = socials[key]?.trim();
                      const isEditing = editingSocial === key;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Icon size={20} className="text-foreground" />
                              <span className="text-sm font-normal">{label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditing) {
                                  setEditingSocial(null);
                                } else {
                                  setSocialDraft(socials[key] || "");
                                  setEditingSocial(key);
                                }
                              }}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {hasValue ? "Editar" : "Añadir"}
                            </button>
                          </div>
                          <AnimatePresence>
                            {isEditing && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-4 flex gap-2">
                                  <Input
                                    autoFocus
                                    value={socialDraft}
                                    onChange={(e) => setSocialDraft(e.target.value)}
                                    placeholder={`Tu ${label}`}
                                    className="flex-1 h-9 text-sm border-none shadow-none bg-muted"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        setSocials({ ...socials, [key]: socialDraft });
                                        setEditingSocial(null);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    className="rounded-full px-4 h-9 text-xs"
                                    onClick={() => {
                                      setSocials({ ...socials, [key]: socialDraft });
                                      setEditingSocial(null);
                                    }}
                                  >
                                    OK
                                  </Button>
                                  {hasValue && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSocials({ ...socials, [key]: "" });
                                        setSocialDraft("");
                                        setEditingSocial(null);
                                      }}
                                      className="p-2 text-muted-foreground hover:text-foreground"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Portafolio — floating input on click */}
              {step === 3 && (
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <h1 className="text-2xl font-semibold">Portafolio</h1>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      Agrega hasta 3 videos que representen tu mejor trabajo.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {videos.map(({ val, set }, i) => {
                      const embedUrl = getVideoEmbedUrl(val);
                      const isEditing = editingVideo === i;
                      return (
                        <div key={i} className="relative">
                          <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-sm bg-muted/40 relative group">
                            {embedUrl ? (
                              <>
                                <iframe
                                  src={embedUrl}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={`Video ${i + 1}`}
                                />
                                {/* Edit / remove overlay */}
                                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingVideo(i)}
                                    className="p-2 rounded-full bg-background/90 text-foreground"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { set(""); setEditingVideo(null); }}
                                    className="p-2 rounded-full bg-background/90 text-foreground"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingVideo(i)}
                                className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Plus size={20} />
                                <span className="text-[10px] font-light mt-1">Video {i + 1}</span>
                              </button>
                            )}
                          </div>
                          {/* Floating dark input */}
                          <AnimatePresence>
                            {isEditing && (
                              <VideoLinkPopover
                                value={val}
                                onSave={(v) => { set(v); setEditingVideo(null); }}
                                onCancel={() => setEditingVideo(null)}
                              />
                            )}
                          </AnimatePresence>
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
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <h1 className="text-2xl font-semibold">Contacto</h1>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      ¿Cómo pueden contactarte las marcas?
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-light">Teléfono / WhatsApp</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 1234 5678" className="shadow-none border-none bg-muted" type="tel" />
                  </div>
                </div>
              )}

              {/* Step 5: Done */}
              {step === 5 && (
                <div className="text-center space-y-6 max-w-md mx-auto">
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
