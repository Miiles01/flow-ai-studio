import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, X, Instagram, Youtube, Globe, SkipForward, ArrowRight, ArrowLeft, Loader2, Pencil, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AvatarUpload from "@/components/AvatarUpload";
import onboardingHero from "@/assets/onboarding-hero.webp";
import onboardingDone from "@/assets/onboarding-done.webp";
import { getVideoEmbedUrl } from "@/lib/videoEmbed";

const TOTAL_STEPS = 7;

/* TikTok & X icons (not in lucide) */
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
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

/* Custom SplitText using framer-motion matching requested curve */
export const AnimatedText = forwardRef<HTMLDivElement, { text: string; className?: string }>(({ text, className = "" }, ref) => {
  const words = text.split(" ");
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      className={className}
      variants={{
        visible: {
          transition: { staggerChildren: 0.06 }
        }
      }}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] py-[0.1em] -my-[0.1em]">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%" },
              visible: {
                y: "0%",
                transition: { 
                  duration: 0.6, 
                  ease: [0.625, 0.05, 0, 1] 
                }
              }
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
});

AnimatedText.displayName = "AnimatedText";

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-4 mb-4 sm:mb-0 p-6 rounded-2xl bg-neutral-900 text-white dark:bg-[#1C1C1E] border border-white/10 shadow-2xl space-y-4"
      >
        <p className="text-white text-sm font-semibold">Pega el link del video</p>
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="bg-white/10 border-white/15 shadow-none text-white placeholder:text-white/40 text-base h-12 rounded-xl"
        />
        <p className="text-xs text-white/80 font-normal leading-relaxed">
          Acepta links públicos de YouTube, TikTok, Instagram, Facebook, Vimeo y Loom.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSave(draft.trim())}
            className="flex-1 text-sm py-2.5 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition-colors"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm py-2.5 px-5 rounded-xl text-white/80 hover:text-white font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const COUNTRY_CODES = [
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+1", country: "Canadá", flag: "🇨🇦" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
  { code: "+507", country: "Panamá", flag: "🇵🇦" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+1", country: "Puerto Rico", flag: "🇵🇷" },
  { code: "+1", country: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "+33", country: "Francia", flag: "🇫🇷" },
  { code: "+49", country: "Alemania", flag: "🇩🇪" },
  { code: "+39", country: "Italia", flag: "🇮🇹" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+81", country: "Japón", flag: "🇯🇵" },
  { code: "+82", country: "Corea del Sur", flag: "🇰🇷" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  const filledSocialsCount = Object.values(socials).filter((v) => v.trim()).length;
  const next = () => {
    if (step === 3 && filledSocialsCount < 1) {
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
        ...(username.trim() ? { username: username.trim() } : {}),
        avatar_url: avatarUrl || null,
        instagram_handle: socials.instagram || null,
        tiktok_handle: socials.tiktok || null,
        youtube_handle: socials.youtube || null,
        twitter_handle: socials.twitter || null,
        portfolio_url: socials.portfolio || null,
        video_url_1: videoUrl1 || null,
        video_url_2: videoUrl2 || null,
        video_url_3: videoUrl3 || null,
        phone: phone ? `${countryCode.code} ${phone}` : null,
        onboarding_completed: true,
      } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      const isUnique = (error as any).code === "23505" || /duplicate|unique/i.test(error.message || "");
      toast.error(isUnique ? "Ese nombre de usuario ya está en uso" : "Error al guardar tu perfil");
      return false;
    }
    return true;
  };

  const handleNextFromContact = async () => {
    const ok = await saveProfile();
    if (ok) {
      setDir(1);
      setStep(6);
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
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Progress bar */}
      <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800">
        <motion.div
          className="h-full bg-neutral-950 dark:bg-white"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>
      {/* Top navigation arrows */}
      {step > 0 && step < 6 && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <button
            type="button"
            onClick={prev}
            className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white"
            title="Atrás"
          >
            <ArrowLeft size={20} />
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={next}
              className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white"
              title="Siguiente"
            >
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextFromContact}
              disabled={saving}
              className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white disabled:opacity-50"
              title="Guardar y finalizar"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
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
                  <img src={onboardingHero} alt="Miiles" className="mx-auto w-full max-w-[280px] sm:max-w-sm rounded-2xl shadow-sm" />
                  <AnimatedText text={`¡Hola ${displayName}!`} className="text-3xl sm:text-4xl font-normal text-neutral-950 dark:text-white tracking-tight" />
                  <p className="text-neutral-700 dark:text-neutral-300 font-normal text-base max-w-sm mx-auto leading-relaxed">
                    Presentamos Miiles: una nueva forma para crear colaboraciones.
                  </p>
                  <div className="pt-2">
                    <Button onClick={next} className="px-10 rounded-full font-medium text-sm h-11">
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 1: Avatar upload */}
              {step === 1 && (
                <div className="text-center space-y-6 max-w-md mx-auto">
                  <AnimatedText text="Tu foto de perfil" className="text-2xl sm:text-3xl font-normal text-neutral-950 dark:text-white tracking-tight" />
                  <p className="text-neutral-700 dark:text-neutral-300 font-normal text-sm sm:text-base leading-relaxed">
                    Agrega una foto para que las marcas te reconozcan de inmediato.
                  </p>
                  <div className="flex flex-col items-center gap-3 py-4">
                    <AvatarUpload
                      userId={user?.id || ""}
                      avatarUrl={avatarUrl}
                      fallback={displayName.charAt(0).toUpperCase()}
                      onUploaded={(url) => setAvatarUrl(url)}
                      size="lg"
                    />
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Toca para subir tu foto</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 pt-2 min-h-[64px] justify-center">
                    <AnimatePresence mode="popLayout">
                      {avatarUrl && (
                        <motion.div
                          key="continuar"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Button onClick={next} className="px-10 rounded-full font-medium text-sm h-11">
                            Continuar
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Step 2: Bio & Username */}
              {step === 2 && (
                <div className="max-w-lg mx-auto space-y-8">
                  <div>
                    <AnimatedText text="Cuéntanos sobre ti" className="text-2xl sm:text-3xl font-normal text-neutral-950 dark:text-white tracking-tight" />
                    <p className="text-neutral-700 dark:text-neutral-300 font-normal text-sm sm:text-base mt-1.5 leading-relaxed">
                      Escribe una breve descripción y elige tu nombre de usuario para tu enlace personal.
                    </p>
                  </div>
                  <div className="w-full">
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Me dedico a crear contenido sobre estilo de vida, fotografía y tecnología..."
                      className="min-h-[120px] font-normal text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent border-none shadow-none resize-none focus-visible:ring-0 focus:ring-0 p-0 text-base rounded-none outline-none leading-relaxed"
                      maxLength={200}
                    />
                    <div className="mt-6 pt-6 border-t border-black/[0.08] dark:border-white/[0.1]">
                      <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 block mb-2">Elige tu nombre de usuario</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 font-semibold text-sm">@</span>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                          placeholder="tunombre"
                          className="pl-8 bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-medium h-11 rounded-xl"
                        />
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-normal mt-2">Te identifica en tu link de afiliado. Podrás cambiarlo después.</p>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{bio.length}/200 caracteres</span>
                      <Button onClick={next} size="sm" className="rounded-full px-7 text-xs font-semibold h-9">
                        Continuar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Medios de contacto — two column */}
              {step === 3 && (
                <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start w-full">
                  {/* Left */}
                  <div className="w-full md:w-2/5 space-y-4">
                    <AnimatedText text="Medios de contacto" className="text-2xl sm:text-3xl font-normal text-neutral-950 dark:text-white tracking-tight" />
                    <p className="text-neutral-700 dark:text-neutral-300 font-normal text-sm sm:text-base leading-relaxed">
                      Agrega al menos <span className="font-semibold text-neutral-950 dark:text-white">3 medios de contacto</span> para recibir propuestas y colaboraciones.
                    </p>
                    {filledSocialsCount >= 3 && (
                      <div className="pt-2 sm:pt-6">
                        <Button onClick={next} className="rounded-full px-8 text-sm font-semibold h-11 w-full md:w-auto">
                          Continuar
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Right — platform list */}
                  <div className="flex-1 w-full rounded-[2rem] bg-[#F4F5FA] dark:bg-white/[0.04] p-3.5 sm:p-6 flex flex-col gap-2.5 border border-black/[0.05] dark:border-white/[0.06] shadow-[0px_20px_40px_-10px_rgba(0,0,0,0.04)]">
                    {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon }) => {
                      const hasValue = socials[key]?.trim();
                      const isEditing = editingSocial === key;
                      return (
                        <div key={key} className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] overflow-hidden transition-all">
                          <div className="flex items-center justify-between px-4 sm:px-5 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon size={20} className="text-neutral-900 dark:text-neutral-100 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{label}</span>
                                {hasValue && !isEditing && (
                                  <span className="text-xs text-neutral-600 dark:text-neutral-400 font-normal truncate max-w-[160px] sm:max-w-[220px]">
                                    {socials[key]}
                                  </span>
                                )}
                              </div>
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
                              className="text-[13px] text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors font-semibold px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
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
                                <div className="px-4 sm:px-5 pb-4 pt-1 flex flex-col sm:flex-row gap-2">
                                  <div className="flex flex-1 gap-2">
                                    <Input
                                      autoFocus
                                      value={socialDraft}
                                      onChange={(e) => setSocialDraft(e.target.value)}
                                      placeholder={`Tu ${label}`}
                                      className="flex-1 h-10 text-sm border border-black/[0.08] dark:border-white/[0.1] shadow-none bg-neutral-100 dark:bg-white/[0.08] text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:ring-0 rounded-xl px-4 font-normal"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          setSocials({ ...socials, [key]: socialDraft });
                                          setEditingSocial(null);
                                        }
                                      }}
                                    />
                                    {hasValue && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSocials({ ...socials, [key]: "" });
                                          setSocialDraft("");
                                          setEditingSocial(null);
                                        }}
                                        className="h-10 w-10 shrink-0 rounded-xl bg-neutral-100 dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:text-red-500 transition-colors flex items-center justify-center"
                                        title="Eliminar"
                                      >
                                        <X size={16} />
                                      </button>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    className="rounded-xl px-6 h-10 text-xs font-semibold w-full sm:w-auto hover:translate-y-0"
                                    onClick={() => {
                                      setSocials({ ...socials, [key]: socialDraft });
                                      setEditingSocial(null);
                                    }}
                                  >
                                    OK
                                  </Button>
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

              {/* Step 4: Portafolio — videos */}
              {step === 4 && (
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <AnimatedText text="Portafolio" className="text-2xl sm:text-3xl font-normal text-neutral-950 dark:text-white tracking-tight" />
                    <p className="text-neutral-700 dark:text-neutral-300 font-normal text-sm sm:text-base mt-1.5 leading-relaxed">
                      Agrega hasta 3 videos que representen tu mejor trabajo.{" "}
                      <span className="font-semibold text-neutral-950 dark:text-white">
                        Esto ayuda a conocer mejor tus resultados.
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {videos.map(({ val, set }, i) => {
                      const embedUrl = getVideoEmbedUrl(val);
                      const isEditing = editingVideo === i;
                      return (
                        <div key={i} className="relative">
                          <div className="aspect-[9/16] rounded-2xl overflow-hidden shadow-sm bg-neutral-100 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] relative">
                            {embedUrl ? (
                              <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                title={`Video ${i + 1}`}
                              />
                            ) : val.trim() ? (
                              <button
                                type="button"
                                onClick={() => setEditingVideo(i)}
                                className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors"
                              >
                                <Pencil size={18} />
                                <span className="text-xs font-semibold">No se pudo generar el preview</span>
                                <span className="text-[11px] font-normal text-neutral-600 dark:text-neutral-400">Edita el link o usa un enlace público.</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingVideo(i)}
                                className="flex flex-col items-center justify-center w-full h-full text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all"
                              >
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 shadow-xs flex items-center justify-center mb-1.5 border border-black/[0.04] dark:border-white/[0.08]">
                                  <Plus size={20} className="text-neutral-900 dark:text-white" />
                                </div>
                                <span className="text-xs font-semibold text-neutral-900 dark:text-white">Video {i + 1}</span>
                              </button>
                            )}

                            {val.trim() && (
                              <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingVideo(i)}
                                  className="p-2 rounded-full bg-white/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-white shadow-md hover:scale-105 transition-transform"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { set(""); setEditingVideo(null); }}
                                  className="p-2 rounded-full bg-white/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-white shadow-md hover:scale-105 transition-transform"
                                  title="Eliminar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
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
                    className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors font-medium mx-auto py-1"
                  >
                    <SkipForward size={14} /> No soy creador de contenido
                  </button>
                  {(videoUrl1 || videoUrl2 || videoUrl3) && (
                    <div className="flex justify-center pt-2">
                      <Button onClick={next} className="rounded-full px-9 text-sm font-semibold h-11">
                        Continuar
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Phone */}
              {step === 5 && (
                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <AnimatedText text="Contacto" className="text-2xl sm:text-3xl font-normal text-neutral-950 dark:text-white tracking-tight" />
                    <p className="text-neutral-700 dark:text-neutral-300 font-normal text-sm sm:text-base mt-1.5 leading-relaxed">
                      ¿Cómo pueden contactarte directamente?
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-800 dark:text-neutral-200 mb-2 block font-semibold">Número celular</label>
                    <div className="flex gap-2.5">
                      {/* Country code selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setShowCountryPicker(!showCountryPicker); setCountrySearch(""); }}
                          className="flex items-center gap-2 h-11 px-3.5 rounded-xl bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-neutral-950 dark:text-white text-sm font-medium whitespace-nowrap hover:bg-neutral-200/60 dark:hover:bg-white/[0.1] transition-colors"
                        >
                          <span className="text-base">{countryCode.flag}</span>
                          <span>{countryCode.code}</span>
                          <ChevronDown size={14} className="text-neutral-600 dark:text-neutral-400" />
                        </button>
                        <AnimatePresence>
                          {showCountryPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute top-13 left-0 z-50 w-64 max-h-60 overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-white/10 shadow-xl flex flex-col"
                            >
                              <div className="p-2 border-b border-neutral-100 dark:border-white/10">
                                <div className="flex items-center gap-2 px-3 rounded-xl bg-neutral-100 dark:bg-white/[0.06]">
                                  <Search size={14} className="text-neutral-500" />
                                  <input
                                    autoFocus
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    placeholder="Buscar país..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-normal"
                                  />
                                </div>
                              </div>
                              <div className="overflow-y-auto flex-1 p-1">
                                {COUNTRY_CODES.filter(c =>
                                  c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                  c.code.includes(countrySearch)
                                ).map((c, i) => (
                                  <button
                                    key={`${c.code}-${c.country}-${i}`}
                                    type="button"
                                    onClick={() => { setCountryCode(c); setShowCountryPicker(false); }}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm rounded-xl hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-left text-neutral-900 dark:text-neutral-100"
                                  >
                                    <span className="text-base">{c.flag}</span>
                                    <span className="flex-1 font-medium">{c.country}</span>
                                    <span className="text-neutral-600 dark:text-neutral-400 font-semibold text-xs">{c.code}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
                        placeholder="55 1234 5678"
                        className="flex-1 shadow-none bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-neutral-950 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-medium h-11 rounded-xl px-4"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Done */}
              {step === 6 && (
                <div className="text-center space-y-6 max-w-md mx-auto">
                  <div className="mx-auto w-28 h-28">
                    <img src={onboardingDone} alt="Listo" className="w-full h-full object-contain" />
                  </div>
                  <AnimatedText text="¡Todo listo!" className="text-3xl sm:text-4xl font-normal text-neutral-950 dark:text-white tracking-tight" />
                  <p className="text-neutral-700 dark:text-neutral-300 font-normal text-base max-w-xs mx-auto leading-relaxed">
                    Es hora de descubrir oportunidades y pasar al siguiente nivel.
                  </p>
                  <div className="pt-2">
                    <Button onClick={handleFinish} className="px-10 rounded-full font-semibold text-sm h-11">
                      Empezar a descubrir
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step indicator dots */}
          {step < 6 && (
            <motion.div
              key={`dots-${step}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 180, damping: 22, delay: 0.35 }}
              className="flex justify-center gap-1.5 mt-10"
            >
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-neutral-950 dark:bg-white" : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
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
