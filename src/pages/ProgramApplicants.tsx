import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Check, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ApplicantCard, { type Applicant } from "@/components/program/ApplicantCard";
import ApplicantProfile from "@/components/program/ApplicantProfile";

export default function ProgramApplicants() {
  const { id } = useParams<{ id: string }>();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState("");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerPosition, setBannerPosition] = useState(50);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Applicant | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      // Get program info with banner fields
      const { data: prog } = await supabase
        .from("brand_programs")
        .select("name, public_token, banner_url, banner_position")
        .eq("id", id)
        .single();

      if (!prog) { setLoading(false); return; }
      setProgramName(prog.name);
      setPublicToken(prog.public_token);
      setBannerUrl(prog.banner_url);
      setBannerPosition(prog.banner_position);

      // Use RPC with public_token to get applicants (works for anon)
      if (prog.public_token) {
        const { data: apps } = await supabase.rpc("get_program_applicants_by_token", {
          p_token: prog.public_token,
        });

        if (apps && apps.length > 0) {
          const userIds = apps.map((a: any) => a.user_id);
          const { data: profs } = await supabase.from("profiles").select("id, video_url_1, video_url_2, video_url_3").in("id", userIds);

          const merged: Applicant[] = apps.map((a: any) => {
            const p = profs?.find(prof => prof.id === a.user_id);
            return {
              application_id: a.application_id,
              user_id: a.user_id,
              status: a.status,
              applied_at: a.applied_at,
              display_name: a.display_name || null,
              avatar_url: a.avatar_url || null,
              bio: a.bio || null,
              instagram_handle: a.instagram_handle || null,
              tiktok_handle: a.tiktok_handle || null,
              youtube_handle: a.youtube_handle || null,
              twitter_handle: a.twitter_handle || null,
              phone: a.phone || null,
              portfolio_url: a.portfolio_url || null,
              video_url_1: a.video_url_1 || p?.video_url_1 || null,
              video_url_2: a.video_url_2 || p?.video_url_2 || null,
              video_url_3: a.video_url_3 || p?.video_url_3 || null,
              niche: a.niche || null,
              liked: a.liked ?? false,
            };
          });
          setApplicants(merged);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copiado");
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
    <div className="relative min-h-screen bg-background pb-12">
      {bannerUrl && (
        <div className="w-full h-40 sm:h-56 relative overflow-hidden -mt-4">
          <img 
            src={bannerUrl} 
            alt={programName} 
            className="w-full h-full object-cover"
            style={{ objectPosition: `center ${bannerPosition}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <div className={`p-6 md:p-10 mx-auto transition-all duration-300 ${selected ? 'lg:pr-[520px] max-w-[1200px]' : 'max-w-3xl'}`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8 relative z-10">
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
              <ApplicantCard
                key={a.application_id}
                applicant={a}
                onClick={() => setSelected(a)}
                onLikeToggle={(id, val) =>
                  setApplicants((prev) =>
                    prev.map((x) => (x.application_id === id ? { ...x, liked: val } : x))
                  )
                }
              />
            ))}
          </div>
        )}
        </motion.div>

        <ApplicantProfile applicant={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
      </div>
    </div>
  );
}
