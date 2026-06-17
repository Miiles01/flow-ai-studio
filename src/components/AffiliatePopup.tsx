import { useEffect, useState } from "react";
import { Gift, Copy, Check, Loader2, Link2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isValidUsername } from "@/lib/referral";
import { toast } from "sonner";

const BASE = "https://miiles.app";

export function AffiliatePopup({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [usernameDraft, setUsernameDraft] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ total: number; purchased: number }>({ total: 0, purchased: 0 });

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    Promise.all([
      supabase.from("profiles").select("username").eq("user_id", user.id).single(),
      supabase.rpc("get_referral_stats"),
    ]).then(([profileRes, statsRes]) => {
      const uname = (profileRes.data as any)?.username || "";
      setUsername(uname);
      setUsernameDraft(uname);
      const row = Array.isArray(statsRes.data) ? statsRes.data[0] : statsRes.data;
      setStats({
        total: Number((row as any)?.total_referrals ?? 0),
        purchased: Number((row as any)?.total_purchased ?? 0),
      });
      setLoading(false);
    });
  }, [open, user]);

  const saveUsername = async () => {
    if (!user) return;
    const value = usernameDraft.trim();
    if (!isValidUsername(value)) {
      toast.error("Usa 3-30 letras, números, guion o guion bajo");
      return;
    }
    setSavingUsername(true);
    const { error } = await supabase.from("profiles").update({ username: value } as any).eq("user_id", user.id);
    setSavingUsername(false);
    if (error) {
      toast.error("Ese nombre de usuario ya está en uso");
      return;
    }
    setUsername(value);
    toast.success("Nombre de usuario guardado");
  };

  const generateLink = () => {
    if (!username) {
      toast.error("Primero crea tu nombre de usuario");
      return;
    }
    setLink(`${BASE}/?ref=${username}`);
  };

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`sm:max-w-md rounded-[24px] p-6 border shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-md transition-colors duration-300 ${
          isDark ? "bg-zinc-950/95 border-white/10 text-white" : "bg-white/95 border-[#F3F4F6] text-black"
        }`}
      >
        <div className="space-y-4 pt-4 md:pt-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-zinc-100"}`}>
              <Gift size={18} className={isDark ? "text-white" : "text-black"} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-[15px] font-normal">afiliados</p>
              <p className="text-[11px] text-muted-foreground font-light">Comparte tu link y recibe comisiones</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {!username ? (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-light">Crea tu nombre de usuario</label>
                  <Input
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    placeholder="tunombre"
                    className={isDark ? "bg-white/5" : "bg-muted"}
                  />
                  <button
                    type="button"
                    onClick={saveUsername}
                    disabled={savingUsername}
                    className="w-full rounded-full py-2.5 text-sm font-normal bg-black text-white border border-white/10 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {savingUsername ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Guardar"}
                  </button>
                </div>
              ) : !link ? (
                <button
                  type="button"
                  onClick={generateLink}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-normal bg-black text-white border border-white/10 hover:opacity-90 transition-opacity"
                >
                  <Link2 size={16} /> Generar link
                </button>
              ) : (
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 ${isDark ? "bg-white/5" : "bg-muted"}`}>
                    <span className="text-xs font-light truncate flex-1">{link}</span>
                    <button type="button" onClick={copyLink} className="flex-shrink-0 p-1 rounded-md hover:opacity-70 transition-opacity">
                      {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-light text-center">
                    {copied ? "¡Copiado!" : "Compártelo y empieza a ganar"}
                  </p>
                </div>
              )}

              <div className={`flex items-center justify-around pt-3 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
                <div className="text-center">
                  <p className="text-lg font-normal">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground font-light">usaron tu link</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-normal">{stats.purchased}</p>
                  <p className="text-[10px] text-muted-foreground font-light">compraron un plan</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
