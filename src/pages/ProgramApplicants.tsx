import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Copy, Check, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ApplicantCard, { type Applicant } from "@/components/program/ApplicantCard";
import ApplicantProfile from "@/components/program/ApplicantProfile";

export default function ProgramApplicants() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState("");
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Applicant | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    const fetch = async () => {
      // Check admin
      const { data: role } = await supabase
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!role) { navigate("/"); return; }

      // Get program info
      const { data: prog } = await supabase.from("brand_programs").select("name, public_token").eq("id", id).single();
      if (prog) {
        setProgramName((prog as any).name);
        setPublicToken((prog as any).public_token);
      }

      // Get applicants with profiles
      const { data: apps } = await supabase
        .from("user_applications")
        .select("id, user_id, status, created_at, program_id")
        .eq("program_id", id)
        .eq("status", "applied");

      if (apps && apps.length > 0) {
        const userIds = apps.map((a) => a.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", userIds);

        const merged: Applicant[] = apps.map((a) => {
          const p = profiles?.find((pr) => pr.user_id === a.user_id);
          return {
            application_id: a.id,
            user_id: a.user_id,
            status: a.status,
            applied_at: a.created_at,
            display_name: p?.display_name || null,
            avatar_url: p?.avatar_url || null,
            bio: p?.bio || null,
            instagram_handle: p?.instagram_handle || null,
            tiktok_handle: p?.tiktok_handle || null,
            youtube_handle: p?.youtube_handle || null,
            twitter_handle: p?.twitter_handle || null,
            phone: p?.phone || null,
            portfolio_url: p?.portfolio_url || null,
            video_url_1: p?.video_url_1 || null,
            video_url_2: p?.video_url_2 || null,
            video_url_3: p?.video_url_3 || null,
            niche: p?.niche || null,
          };
        });
        setApplicants(merged);
      }
      setLoading(false);
    };
    fetch();
  }, [id, user, navigate]);

  const handleCopyLink = () => {
    if (!publicToken) return;
    const url = `${window.location.origin}/applicants/${publicToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link público copiado");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(`/programs/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-light"
        >
          <ArrowLeft size={16} /> Volver al programa
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-normal">Postulaciones</h1>
            <p className="text-sm text-muted-foreground font-light mt-0.5">{programName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copiado" : "Compartir link"}
          </Button>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users size={32} className="mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-light">Aún no hay postulaciones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {applicants.map((a) => (
              <ApplicantCard key={a.application_id} applicant={a} onClick={() => setSelected(a)} />
            ))}
          </div>
        )}
      </motion.div>

      <ApplicantProfile applicant={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
}
