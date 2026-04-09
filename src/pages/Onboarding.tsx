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
import logoImg from "@/assets/logo.png";

const TOTAL_STEPS = 5;

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
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [bio, setBio] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [videoUrl1, setVideoUrl1] = useState("");
  const [videoUrl2, setVideoUrl2] = useState("");
  const [videoUrl3, setVideoUrl3] = useState("");
  const [phone, setPhone] = useState("");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  const next = () => { setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); };
  const prev = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)); };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        bio,
        instagram_handle: instagramHandle,
        tiktok_handle: tiktokHandle,
        youtube_handle: youtubeHandle,
        twitter_handle: twitterHandle,
        video_url_1: videoUrl1 || null,
        video_url_2: videoUrl2 || null,
        video_url_3: videoUrl3 || null,
        phone,
        onboarding_completed: true,
      } as any)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Error al guardar tu perfil");
    } else {
      toast.success("¡Bienvenido a Miiles!");
      navigate("/", { replace: true });
    }
    setSaving(false);
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-light">
                    Hola, <span className="font-normal">{displayName}</span> 👋
                  </h1>
                  <p className="text-muted-foreground font-light text-sm">
                    Vamos a configurar tu perfil para que las marcas te encuentren.
                  </p>
                  <div className="pt-6">
                    <Button onClick={next} className="w-full">
                      Comenzar <ArrowRight size={16} className="ml-2" />
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
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-light">Instagram</label>
                      <Input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@tuusuario" className="shadow-sm border-none" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-light">TikTok</label>
                      <Input value={tiktokHandle} onChange={(e) => setTiktokHandle(e.target.value)} placeholder="@tuusuario" className="shadow-sm border-none" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-light">YouTube</label>
                      <Input value={youtubeHandle} onChange={(e) => setYoutubeHandle(e.target.value)} placeholder="@tucanal" className="shadow-sm border-none" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-light">X (Twitter)</label>
                      <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@tuusuario" className="shadow-sm border-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Videos */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-light">Tus mejores videos</h1>
                    <p className="text-muted-foreground font-light text-sm mt-1">
                      Pega los links de tus 3 videos más importantes.
                    </p>
                  </div>
                  <div className="space-y-5">
                    {[
                      { val: videoUrl1, set: setVideoUrl1, n: 1 },
                      { val: videoUrl2, set: setVideoUrl2, n: 2 },
                      { val: videoUrl3, set: setVideoUrl3, n: 3 },
                    ].map(({ val, set, n }) => (
                      <div key={n} className="space-y-2">
                        <label className="text-xs text-muted-foreground font-light">Video {n}</label>
                        <Input value={val} onChange={(e) => set(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="shadow-sm border-none" />
                        <VideoPreview url={val} />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-light mx-auto"
                  >
                    <SkipForward size={14} /> Saltar este paso
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
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          {step > 0 && (
            <div className="flex gap-3 mt-10">
              <Button variant="outline" onClick={prev} className="flex-1 shadow-sm border-none bg-muted/50">
                <ArrowLeft size={16} className="mr-2" /> Atrás
              </Button>
              {step < TOTAL_STEPS - 1 ? (
                <Button onClick={next} className="flex-1">
                  Siguiente <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleFinish} className="flex-1" disabled={saving}>
                  {saving && <Loader2 size={16} className="animate-spin mr-2" />}
                  Finalizar
                </Button>
              )}
            </div>
          )}

          {/* Step indicator dots */}
          <div className="flex justify-center gap-1.5 mt-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
