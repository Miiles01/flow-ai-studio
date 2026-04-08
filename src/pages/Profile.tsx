import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Save, Loader2, Instagram, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Profile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          setInstagramHandle((data as any).instagram_handle || "");
          setBio((data as any).bio || "");
          setNiche((data as any).niche || "");
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
        bio,
        niche,
      } as any)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Error al guardar");
    } else {
      toast.success("Perfil actualizado");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-lg mx-auto">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-miiles-blue-light flex items-center justify-center">
            <User size={24} className="text-miiles-blue" />
          </div>
          <div>
            <h1 className="text-xl font-normal">Mi perfil</h1>
            <p className="text-xs text-miiles-gray-400 font-light">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-xs text-miiles-gray-400 mb-2 block font-light">Nombre</label>
            <div className="relative">
              <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div>
            <label className="text-xs text-miiles-gray-400 mb-2 block font-light">Instagram</label>
            <div className="relative">
              <Instagram size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
              <Input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@tuusuario" className="pl-10" />
            </div>
          </div>

          <div>
            <label className="text-xs text-miiles-gray-400 mb-2 block font-light">Nicho</label>
            <div className="relative">
              <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
              <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Moda, Fitness, Tech..." className="pl-10" />
            </div>
          </div>

          <div>
            <label className="text-xs text-miiles-gray-400 mb-2 block font-light">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..." className="bg-background shadow-sm rounded-sm min-h-[80px] font-light" />
          </div>

          <div>
            <label className="text-xs text-miiles-gray-400 mb-2 block font-light">URL del avatar</label>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Guardar cambios
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
