import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Save, Loader2, Instagram, Tag, Phone, Globe,
  LogOut, Twitter, Youtube, Video, Plus, Pencil, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AvatarUpload from "@/components/AvatarUpload";
import { UpgradeProDialog } from "@/components/UpgradeProDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";

import { getVideoEmbedUrl } from "@/lib/videoEmbed";
import { isValidUsername } from "@/lib/referral";

function VideoLinkPopover({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-4 mb-4 sm:mb-0 p-5 rounded-2xl bg-foreground space-y-4"
      >
        <p className="text-background text-sm font-medium">Pega el link del video</p>
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="bg-background/10 border-none shadow-none text-background placeholder:text-background/40 text-base h-12"
        />
        <p className="text-xs text-background/60">
          Acepta links públicos de YouTube, TikTok, Instagram, Facebook, Vimeo y Loom.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => onSave(draft.trim())} className="flex-1 text-sm py-2.5 rounded-xl bg-background text-foreground font-medium">
            Guardar
          </button>
          <button type="button" onClick={onCancel} className="text-sm py-2.5 px-5 rounded-xl text-background/70 hover:text-background">
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
const Profile = () => {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("free");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const { subscription, isActive } = useSubscription();
  const planRef = useRef<HTMLDivElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [videoUrl1, setVideoUrl1] = useState("");
  const [videoUrl2, setVideoUrl2] = useState("");
  const [videoUrl3, setVideoUrl3] = useState("");
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const videos = [
    { val: videoUrl1, set: setVideoUrl1 },
    { val: videoUrl2, set: setVideoUrl2 },
    { val: videoUrl3, set: setVideoUrl3 },
  ];

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setUsername((data as any).username || "");
          setAvatarUrl(data.avatar_url || "");
          setInstagramHandle(data.instagram_handle || "");
          setTiktokHandle(data.tiktok_handle || "");
          setTwitterHandle(data.twitter_handle || "");
          setYoutubeHandle(data.youtube_handle || "");
          setBio(data.bio || "");
          setNiche(data.niche || "");
          setPhone(data.phone || "");
          setPortfolioUrl(data.portfolio_url || "");
          setVideoUrl1(data.video_url_1 || "");
          setVideoUrl2(data.video_url_2 || "");
          setVideoUrl3(data.video_url_3 || "");
          setPlan(data.plan || "free");

          setOriginalData({
            displayName: data.display_name || "",
            username: (data as any).username || "",
            avatarUrl: data.avatar_url || "",
            instagramHandle: data.instagram_handle || "",
            tiktokHandle: data.tiktok_handle || "",
            twitterHandle: data.twitter_handle || "",
            youtubeHandle: data.youtube_handle || "",
            bio: data.bio || "",
            niche: data.niche || "",
            phone: data.phone || "",
            portfolioUrl: data.portfolio_url || "",
            videoUrl1: data.video_url_1 || "",
            videoUrl2: data.video_url_2 || "",
            videoUrl3: data.video_url_3 || "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  // Keep the displayed plan in sync with the live subscription state.
  useEffect(() => {
    if (isActive && subscription) {
      setPlan(subscription.price_id?.startsWith("pro") ? "pro" : plan);
    } else if (subscription && !isActive && (plan === "pro")) {
      setPlan("free");
    }
  }, [isActive, subscription]);


  useEffect(() => {
    if (!loading && window.location.hash === "#plan") {
      const timer = setTimeout(() => {
        planRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, window.location.hash]);

  const currentData = {
    displayName, username, avatarUrl, instagramHandle, tiktokHandle, twitterHandle,
    youtubeHandle, bio, niche, phone, portfolioUrl, videoUrl1, videoUrl2, videoUrl3
  };

  const isDirty = originalData && JSON.stringify(originalData) !== JSON.stringify(currentData);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    const trimmedUsername = username.trim();
    if (trimmedUsername && !isValidUsername(trimmedUsername)) {
      toast.error("Nombre de usuario inválido: usa 3-30 letras, números, guion o guion bajo");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        username: trimmedUsername || null,
        avatar_url: avatarUrl,
        instagram_handle: instagramHandle,
        tiktok_handle: tiktokHandle,
        twitter_handle: twitterHandle,
        youtube_handle: youtubeHandle,
        bio,
        niche,
        phone,
        portfolio_url: portfolioUrl,
        video_url_1: videoUrl1,
        video_url_2: videoUrl2,
        video_url_3: videoUrl3,
      } as any)
      .eq("user_id", user.id);
    if (error) {
      const isUnique = (error as any).code === "23505" || /duplicate|unique/i.test(error.message || "");
      toast.error(isUnique ? "Ese nombre de usuario ya está en uso" : "Error al guardar");
      setSaving(false);
    } else {
      toast.success("Perfil actualizado");
      setSaving(false);
      setSavedSuccess(true);
      setOriginalData(currentData);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Show a confirmation when returning from a successful checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("¡Pago recibido! Tu plan Pro se activará en unos segundos.");
      window.history.replaceState({}, "", "/profile#plan");
    }
  }, []);

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          returnUrl: `${window.location.origin}/profile#plan`,
          environment: getStripeEnvironment(),
        },
      });
      if (error || !data?.url) throw new Error(error?.message || data?.error || "No se pudo abrir el portal");
      window.open(data.url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo abrir el portal de suscripción");
    } finally {
      setOpeningPortal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "M";

  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url);
    if (user) {
      await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    }
  };

  return (
    <div className="p-6 md:px-10 md:pb-10 md:pt-48 max-w-2xl mx-auto">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          {user && (
            <AvatarUpload
              userId={user.id}
              avatarUrl={avatarUrl}
              fallback={initials}
              onUploaded={handleAvatarUploaded}
              size="lg"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-normal truncate text-foreground">{displayName || "Usuario"}</h1>
            <p className="text-xs text-muted-foreground font-light">{user?.email}</p>
            {niche && (
              <Badge variant="secondary" className="mt-2 text-xs font-light">
                {niche}
              </Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Información personal */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Información personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">Nombre</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">Nombre de usuario</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    placeholder="tunombre"
                    className="pl-8"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground font-light mt-1">Tu link de afiliado: miiles.app/?ref={username || "tunombre"}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">Nicho</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Moda, Fitness, Tech..." className="pl-9" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">Teléfono</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" className="pl-9" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">Bio</label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..." className="min-h-[80px] font-light" />
              </div>
            </CardContent>
          </Card>

          {/* Redes sociales */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Redes sociales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">Instagram</label>
                <div className="relative">
                  <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@tuusuario" className="pl-9" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">TikTok</label>
                <div className="relative">
                  <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={tiktokHandle} onChange={(e) => setTiktokHandle(e.target.value)} placeholder="@tuusuario" className="pl-9" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">Twitter / X</label>
                <div className="relative">
                  <Twitter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@tuusuario" className="pl-9" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">YouTube</label>
                <div className="relative">
                  <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={youtubeHandle} onChange={(e) => setYoutubeHandle(e.target.value)} placeholder="@tucanal" className="pl-9" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portafolio de videos */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Portafolio de videos</CardTitle>
              <p className="text-xs text-muted-foreground font-light mt-1">Agrega hasta 3 videos que representen tu mejor trabajo.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {videos.map(({ val, set }, i) => {
                  const embedUrl = getVideoEmbedUrl(val);
                  return (
                    <div key={i} className="relative">
                      <div className="aspect-[9/16] rounded-xl overflow-hidden bg-muted/40 relative">
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
                            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil size={18} />
                            <span className="text-xs font-light">No se pudo generar el preview</span>
                            <span className="text-[10px] font-light opacity-80">Edita el link o usa un enlace público.</span>
                          </button>
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

                        {val.trim() && (
                          <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
                            <button type="button" onClick={() => setEditingVideo(i)} className="p-2 rounded-full bg-background/90 text-foreground shadow-sm">
                              <Pencil size={14} />
                            </button>
                            <button type="button" onClick={() => { set(""); setEditingVideo(null); }} className="p-2 rounded-full bg-background/90 text-foreground shadow-sm">
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <AnimatePresence>
                        {editingVideo === i && (
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-light">URL de portafolio</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://miportafolio.com" className="pl-9" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Membresía / Plan */}
          <div ref={planRef} className="scroll-mt-6">
            <Card className="border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Tu plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`
                    p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between
                    ${isDark
                      ? "bg-white/5 border-white/10 text-white"
                      : "bg-gray-50 border-gray-100 text-black shadow-sm"
                    }
                  `}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold tracking-wider uppercase opacity-50 block">Membresía Activa</span>
                    <span className="text-base font-semibold block">
                      {plan === "pro" ? "Plan Pro" : plan === "business" || plan === "negocios" ? "Plan Negocios" : "Plan Gratis"}
                    </span>
                    <span className="text-xs font-light text-muted-foreground block">
                      {plan === "free"
                        ? "Gratis para siempre"
                        : subscription?.cancel_at_period_end && subscription?.current_period_end
                          ? `Se cancela el ${new Date(subscription.current_period_end).toLocaleDateString("es-MX")}`
                          : subscription?.current_period_end
                            ? `Se renueva el ${new Date(subscription.current_period_end).toLocaleDateString("es-MX")}`
                            : "Ciclo activo"}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-2xl font-semibold block">
                      {plan === "pro"
                        ? (subscription?.price_id === "pro_yearly" ? "$1,800" : "$179")
                        : plan === "business" || plan === "negocios" ? "Custom" : "$0"}
                    </span>
                    <span className="text-[10px] font-light text-muted-foreground block">
                      {plan === "free"
                        ? "Gratis para siempre"
                        : plan === "pro"
                          ? (subscription?.price_id === "pro_yearly" ? "MXN / año" : "MXN / mes")
                          : "Plan a medida"}
                    </span>
                  </div>
                </div>

                {plan === "free" ? (
                  <Button
                    type="button"
                    onClick={() => setUpgradeOpen(true)}
                    className={`w-full rounded-full ${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-miiles-pink"}`}
                  >
                    Mejorar a Pro
                  </Button>
                ) : isActive && subscription ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={openingPortal}
                    onClick={handleManageSubscription}
                    className="w-full rounded-full"
                  >
                    {openingPortal ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                    Gestionar suscripción
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </form>

        <UpgradeProDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />


        <Separator className="my-6" />

        <div className="flex justify-center">
          <Button variant="destructive" className={`w-auto px-10 rounded-full border-none shadow-none ${isDark ? 'bg-red-950/40 text-red-400 hover:bg-red-950/60' : 'bg-red-50 text-red-500 hover:bg-red-100'}`} onClick={handleSignOut}>
            <LogOut size={16} className="mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </motion.div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {(isDirty || savedSuccess) && (
          <div className="w-full flex justify-center pointer-events-none">
            <motion.div
              key="save-bar"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 z-50 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <Button 
                  onClick={() => handleSave()}
                  disabled={saving}
                  className={`w-auto px-8 h-12 rounded-full shadow-2xl font-medium transition-all border ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border-white/20' : 'bg-white text-black hover:bg-gray-100 border-gray-200'}`}
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : savedSuccess ? (
                    <Check size={18} className="mr-2 text-green-500" />
                  ) : (
                    <Save size={18} className="mr-2" />
                  )}
                  {savedSuccess ? "Guardado" : "Guardar cambios"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
