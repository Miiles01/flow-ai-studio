import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Copy, X, Mail, Check, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

type Role = "viewer" | "editor";

type Collaborator = {
  id: string;
  user_id: string;
  role: Role;
  display_name: string;
  avatar_url: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
};

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const ShareDialog = ({ open, onOpenChange, flowId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [publicToken, setPublicToken] = useState<string>("");
  const [publicRole, setPublicRole] = useState<Role>("editor");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isDark } = useTheme();

  const publicUrl =
    publicToken ? `${window.location.protocol}//${window.location.host}/boards/join/${publicToken}` : "";

  const loadData = async () => {
    setLoading(true);
    const [{ data: flow }, { data: collabs }] = await Promise.all([
      supabase
        .from("flows")
        .select("is_public, public_token, public_role")
        .eq("id", flowId)
        .maybeSingle(),
      supabase
        .from("flow_collaborators")
        .select("id, user_id, role")
        .eq("flow_id", flowId),
    ]);

    if (flow) {
      setIsPublic(!!flow.is_public);
      setPublicToken((flow as any).public_token);
      setPublicRole(((flow as any).public_role as Role) ?? "editor");
    }

    if (collabs && collabs.length > 0) {
      const ids = collabs.map((c: any) => c.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids);
      const profMap = new Map(
        (profiles ?? []).map((p: any) => [p.user_id, p]),
      );
      setCollaborators(
        collabs.map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          role: c.role,
          display_name: profMap.get(c.user_id)?.display_name ?? "Usuario",
          avatar_url: profMap.get(c.user_id)?.avatar_url ?? null,
        })),
      );
    } else {
      setCollaborators([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (open) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flowId]);

  const togglePublic = async (value: boolean) => {
    setIsPublic(value);
    await supabase.from("flows").update({ is_public: value }).eq("id", flowId);
  };

  const changePublicRole = async (value: Role) => {
    setPublicRole(value);
    await supabase
      .from("flows")
      .update({ public_role: value })
      .eq("id", flowId);
  };

  const copyLink = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!publicUrl) {
      toast.error("No hay un enlace válido para copiar");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Clipboard API failed, using fallback:", err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = publicUrl;
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          toast.success("Enlace copiado al portapapeles");
          setTimeout(() => setCopied(false), 1500);
        } else {
          toast.error("No se pudo copiar el enlace");
        }
      } catch (err) {
        console.error("Fallback failed:", err);
        toast.error("No se pudo copiar el enlace");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!cleaned) return;
    setInviting(true);
    const { data, error } = await supabase.rpc("find_user_by_email", {
      p_email: cleaned,
    });
    if (error) {
      toast.error("Error al buscar usuario");
      setInviting(false);
      return;
    }
    const result = (data as any[])?.[0];
    if (!result?.user_id) {
      toast.error("Este usuario aún no tiene cuenta en Miiles");
      setInviting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("flow_collaborators")
      .insert({
        flow_id: flowId,
        user_id: result.user_id,
        role: inviteRole,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        toast.error("Este usuario ya es colaborador");
      } else {
        toast.error("No se pudo invitar al usuario");
      }
      setInviting(false);
      return;
    }

    toast.success(`Invitación enviada a ${cleaned}`);
    setEmail("");
    setInviting(false);
    loadData();
  };

  const updateCollabRole = async (collabId: string, role: Role) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === collabId ? { ...c, role } : c)),
    );
    await supabase
      .from("flow_collaborators")
      .update({ role })
      .eq("id", collabId);
  };

  const removeCollab = async (collabId: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== collabId));
    await supabase.from("flow_collaborators").delete().eq("id", collabId);
    toast.success("Colaborador removido");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md rounded-[28px] border-none shadow-[0_20px_60px_rgb(0,0,0,0.15)] ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-white text-black'}`}>
        <DialogHeader>
          <DialogTitle className="text-[18px] font-normal">Compartir tablero</DialogTitle>
          <DialogDescription className={`text-[13px] font-light ${isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
            Invita a tu equipo o genera un enlace para colaborar en tiempo real.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin text-[#9CA3AF]" size={20} />
          </div>
        ) : (
          <div className="space-y-7 mt-2">
            {/* Email invite */}
            <div>
              <p className={`text-[13px] font-medium mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                Invitar por correo
              </p>
              <form onSubmit={handleInvite} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`pl-9 h-11 rounded-full text-[13px] border-none focus-visible:ring-1 focus-visible:ring-[#4059F1] ${isDark ? 'bg-white/5 text-white placeholder:text-white/40' : 'bg-[#F3F4F6] text-black placeholder:text-[#9CA3AF]'}`}
                  />
                </div>
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className={`appearance-none text-[13px] font-light pl-4 pr-8 h-11 rounded-full border-none outline-none cursor-pointer focus:ring-1 focus:ring-[#4059F1] ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-[#F3F4F6] text-black hover:bg-[#E5E7EB]'}`}
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Lector</option>
                  </select>
                  <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-white/50' : 'text-[#6B7280]'}`} />
                </div>
                <button
                  type="submit"
                  disabled={inviting}
                  className={`h-11 px-5 rounded-full text-[13px] font-normal transition-colors disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-[#1F2937]'}`}
                >
                  {inviting ? <Loader2 size={14} className="animate-spin" /> : "Invitar"}
                </button>
              </form>
            </div>

            {/* Collaborators list */}
            {collaborators.length > 0 && (
              <div className="space-y-2.5">
                {collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`}>
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-[11px] font-medium ${isDark ? 'text-white/60' : 'text-[#6B7280]'}`}>{initials(c.display_name)}</span>
                        )}
                      </div>
                      <span className="text-[13.5px] font-light truncate">{c.display_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <select
                          value={c.role}
                          onChange={(e) => updateCollabRole(c.id, e.target.value as Role)}
                          className={`appearance-none text-[12.5px] font-light pl-3 pr-7 h-8 rounded-full border-none outline-none cursor-pointer ${isDark ? 'bg-transparent hover:bg-white/10 text-white' : 'bg-transparent hover:bg-[#F3F4F6] text-black'}`}
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Lector</option>
                        </select>
                        <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-white/50' : 'text-[#6B7280]'}`} />
                      </div>
                      <button
                        onClick={() => removeCollab(c.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDark ? 'hover:bg-[#EF4444]/20 text-[#9CA3AF] hover:text-[#EF4444]' : 'hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444]'}`}
                        aria-label="Quitar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={`h-[1px] ${isDark ? 'bg-white/10' : 'bg-[#F3F4F6]'}`} />

            {/* Public link */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13.5px] font-medium flex items-center gap-2">
                    <LinkIcon size={15} className={isDark ? 'text-white/70' : 'text-[#6B7280]'} />
                    Enlace público
                  </p>
                  <p className={`text-[12px] font-light mt-1 ${isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                    Cualquiera con el enlace podrá acceder
                  </p>
                </div>
                <Switch 
                  checked={isPublic} 
                  onCheckedChange={togglePublic} 
                  className={isDark ? 'data-[state=unchecked]:bg-white/10' : 'data-[state=unchecked]:bg-[#E5E7EB]'} 
                />
              </div>

              {isPublic && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={publicUrl}
                      className={`h-11 rounded-full text-[13px] font-light border-none focus-visible:ring-1 focus-visible:ring-[#4059F1] ${isDark ? 'bg-white/5 text-white/70' : 'bg-[#F3F4F6] text-[#6B7280]'}`}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <button
                      type="button"
                      onClick={copyLink}
                      className={`h-11 px-5 rounded-full text-[13px] font-normal transition-colors flex items-center gap-2 shrink-0 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-[#1F2937]'}`}
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <div className={`flex items-center gap-2 text-[12.5px] font-light ${isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                    Permisos del enlace:
                    <div className="relative">
                      <select
                        value={publicRole}
                        onChange={(e) => changePublicRole(e.target.value as Role)}
                        className={`appearance-none text-[12.5px] font-light pl-3 pr-7 h-8 rounded-full border-none outline-none cursor-pointer focus:ring-1 focus:ring-[#4059F1] ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-[#F3F4F6] text-black hover:bg-[#E5E7EB]'}`}
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Lector</option>
                      </select>
                      <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-white/50' : 'text-[#6B7280]'}`} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
