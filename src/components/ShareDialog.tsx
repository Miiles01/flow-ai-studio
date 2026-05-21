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
import { Loader2, Link as LinkIcon, Copy, X, Mail, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const publicUrl =
    publicToken ? `${window.location.origin}/boards/join/${publicToken}` : "";

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

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
      <DialogContent className="max-w-md rounded-3xl border-none shadow-[0_20px_60px_rgb(0,0,0,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-normal">Compartir tablero</DialogTitle>
          <DialogDescription className="text-[13px] font-light text-[#6B7280]">
            Invita a tu equipo o genera un enlace para colaborar en tiempo real.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin text-[#9CA3AF]" size={20} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email invite */}
            <div>
              <p className="text-[12px] font-light uppercase tracking-wider text-[#9CA3AF] mb-2">
                Invitar por correo
              </p>
              <form onSubmit={handleInvite} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-10 rounded-full bg-[#F3F4F6] text-[13px]"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="text-[13px] font-light px-3 h-10 rounded-full bg-[#F3F4F6] border-none outline-none cursor-pointer"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Lector</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting}
                  className="h-10 px-4 rounded-full bg-black text-white text-[13px] font-normal hover:bg-[#1F2937] transition-colors disabled:opacity-50"
                >
                  {inviting ? <Loader2 size={14} className="animate-spin" /> : "Invitar"}
                </button>
              </form>
            </div>

            {/* Collaborators list */}
            {collaborators.length > 0 && (
              <div className="space-y-2">
                {collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden shrink-0">
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-medium text-[#6B7280]">{initials(c.display_name)}</span>
                        )}
                      </div>
                      <span className="text-[13px] font-light truncate">{c.display_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={c.role}
                        onChange={(e) => updateCollabRole(c.id, e.target.value as Role)}
                        className="text-[12px] font-light px-2 h-8 rounded-full bg-transparent hover:bg-[#F3F4F6] border-none outline-none cursor-pointer"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Lector</option>
                      </select>
                      <button
                        onClick={() => removeCollab(c.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                        aria-label="Quitar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="h-[1px] bg-[#F3F4F6]" />

            {/* Public link */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[13px] font-normal flex items-center gap-2">
                    <LinkIcon size={14} className="text-[#6B7280]" />
                    Enlace público
                  </p>
                  <p className="text-[11px] font-light text-[#9CA3AF] mt-0.5">
                    Cualquiera con el enlace podrá acceder
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={togglePublic} />
              </div>

              {isPublic && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={publicUrl}
                      className="h-10 rounded-full bg-[#F3F4F6] text-[12px] font-light text-[#6B7280]"
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <button
                      onClick={copyLink}
                      className="h-10 px-4 rounded-full bg-black text-white text-[13px] font-normal hover:bg-[#1F2937] transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-light text-[#6B7280]">
                    Permisos del enlace:
                    <select
                      value={publicRole}
                      onChange={(e) => changePublicRole(e.target.value as Role)}
                      className="text-[12px] font-light px-2 h-7 rounded-full bg-[#F3F4F6] border-none outline-none cursor-pointer"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Lector</option>
                    </select>
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
