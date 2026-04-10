import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import ApplicantCard, { type Applicant } from "@/components/program/ApplicantCard";
import ApplicantProfile from "@/components/program/ApplicantProfile";

export default function PublicApplicants() {
  const { token } = useParams<{ token: string }>();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Applicant | null>(null);

  useEffect(() => {
    if (!token) return;
    supabase
      .rpc("get_program_applicants_by_token", { p_token: token })
      .then(({ data }) => {
        if (data) setApplicants(data as unknown as Applicant[]);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-xl font-normal">Postulantes</h1>
          <p className="text-sm text-muted-foreground font-light mt-0.5">{applicants.length} personas</p>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users size={32} className="mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-light">No hay postulaciones aún</p>
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
