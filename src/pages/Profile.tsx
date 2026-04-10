import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Save, Loader2, Instagram, Tag, Phone, Globe,
  LogOut, Twitter, Youtube, Video, Plus, Pencil, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AvatarUpload from "@/components/AvatarUpload";

import { getVideoEmbedUrl } from "@/lib/videoEmbed";

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
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
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
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
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
      })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Error al guardar");
    } else {
      toast.success("Perfil actualizado");
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
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
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
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
            <h1 className="text-xl font-normal truncate">{displayName || "Usuario"}</h1>
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
                      <div className="aspect-[9/16] rounded-xl overflow-hidden bg-muted/40 relative group">
                        {embedUrl ? (
                          <>
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`Video ${i + 1}`}
                            />
                            <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button type="button" onClick={() => setEditingVideo(i)} className="p-2 rounded-full bg-background/90 text-foreground">
                                <Pencil size={14} />
                              </button>
                              <button type="button" onClick={() => { set(""); setEditingVideo(null); }} className="p-2 rounded-full bg-background/90 text-foreground">
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

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Guardar cambios
          </Button>
        </form>

        <Separator className="my-6" />

        <Button variant="destructive" className="w-full" onClick={handleSignOut}>
          <LogOut size={16} className="mr-2" />
          Cerrar sesión
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
