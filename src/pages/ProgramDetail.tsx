import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Loader2, CheckCircle2, Bookmark, Share2, Check, Pencil, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EarningsCalculator from "@/components/program/EarningsCalculator";
import ProgramGallery from "@/components/program/ProgramGallery";

type Program = {
  id: string;
  name: string;
  brand_name: string;
  description: string;
  category: string;
  commission_rate: string | null;
  program_url: string | null;
  is_featured: boolean;
  logo_url: string | null;
  banner_url: string | null;
  banner_position: number;
  avg_sales: number;
  price_min: number | null;
  price_max: number | null;
  gallery_images: string[];
  slug: string;
};

type ApplicationStatus = "none" | "saved" | "applied";

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export default function ProgramDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState<ApplicationStatus>("none");
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const identifier = id || slug;

  const handleCopyLink = () => {
    const shortUrl = `${window.location.origin}/p/${program?.slug || ""}`;
    navigator.clipboard.writeText(shortUrl).then(() => {
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Fetch program data — does NOT depend on auth
  useEffect(() => {
    if (!identifier) return;
    const fetchProgram = async () => {
      const isId = id && isUUID(id);
      const query = isId
        ? supabase.from("brand_programs").select("*").eq("id", id).single()
        : supabase.from("brand_programs").select("*").eq("slug", identifier).single();

      const { data } = await query;
      if (data) {
        setProgram({
          ...(data as any),
          gallery_images: Array.isArray((data as any).gallery_images) ? (data as any).gallery_images : [],
        });
      }
      setLoading(false);
    };
    fetchProgram();
  }, [identifier, id]);

  // Fetch user-specific data (application status, admin) — depends on auth
  useEffect(() => {
    if (authLoading || !user || !program) return;
    const fetchUserData = async () => {
      const [appRes, roleRes] = await Promise.all([
        supabase.from("user_applications").select("status").eq("user_id", user.id).eq("program_id", program.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
      ]);
      setAppStatus((appRes.data?.status as ApplicationStatus) || "none");
      setIsAdmin(!!roleRes.data);
    };
    fetchUserData();
  }, [user, authLoading, program?.id]);

  async function handleApply() {
    if (!user || !program) return;
    setApplying(true);
    if (appStatus === "none") {
      const { error } = await supabase.from("user_applications").insert({
        user_id: user.id, program_id: program.id, status: "applied",
      });
      if (!error) { setAppStatus("applied"); toast.success("¡Te has postulado correctamente!"); }
      else toast.error("Error al postularte");
    } else if (appStatus === "saved") {
      const { error } = await supabase.from("user_applications").update({ status: "applied" }).eq("user_id", user.id).eq("program_id", program.id);
      if (!error) { setAppStatus("applied"); toast.success("¡Te has postulado correctamente!"); }
      else toast.error("Error al postularte");
    }
    setApplying(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4">
        <p className="text-miiles-gray-400 font-light">Programa no encontrado</p>
        <Button variant="secondary" onClick={() => navigate("/programs")}>
          <ArrowLeft size={14} className="mr-2" />
          Volver a programas
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Back button */}
        <button
          onClick={() => navigate("/programs")}
          className="inline-flex items-center gap-1.5 text-sm text-miiles-gray-400 hover:text-foreground transition-colors duration-200 mb-8 font-light"
        >
          <ArrowLeft size={16} />
          Volver a programas
        </button>

        {/* Banner */}
        {program.banner_url && (
          <img
            src={program.banner_url}
            alt={program.brand_name}
            className="w-full h-56 object-cover rounded-lg mb-8"
            style={{ objectPosition: `center ${program.banner_position}%` }}
            loading="lazy"
          />
        )}

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-normal">{program.brand_name}</h1>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-sm text-miiles-gray-400 hover:text-foreground transition-colors duration-200 font-light"
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? "Copiado" : "Compartir"}
            </button>
          </div>
          <p className="text-sm text-miiles-gray-400 font-light">{program.name}</p>
          <div className="flex items-center gap-2 pt-1">
            {program.commission_rate && (
              <span className="text-xs bg-miiles-blue-light text-miiles-blue px-3 py-1 rounded-full font-light">
                {program.commission_rate}
              </span>
            )}
            <span className="text-[10px] bg-miiles-pink-light text-miiles-pink px-2 py-0.5 rounded-full capitalize font-light">
              {program.category}
            </span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-8">
          <EarningsCalculator
            commissionRate={program.commission_rate}
            priceMin={program.price_min}
            priceMax={program.price_max}
            avgSales={program.avg_sales}
          />
          {isAdmin && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-miiles-blue font-light hover:underline"
              >
                <Pencil size={12} />
                Editar datos del calculador
              </button>
              <Link
                to={`/programs/${program.id}/applicants`}
                className="inline-flex items-center gap-1 text-xs text-miiles-blue font-light hover:underline"
              >
                <Users size={12} />
                Ver postulaciones
              </Link>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-8">
          <p className="text-sm text-miiles-gray-600 font-light leading-relaxed whitespace-pre-wrap">
            {program.description}
          </p>
        </div>

        {/* External link */}
        {program.program_url && (
          <a
            href={program.program_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-miiles-blue hover:underline mt-6 font-light"
          >
            Página del negocio <ExternalLink size={14} />
          </a>
        )}

        {/* Action area */}
        <div className="mt-10 flex items-center gap-4">
          {!user ? (
            <Button onClick={() => navigate("/login")} className="px-6">
              Iniciar sesión para postularme
            </Button>
          ) : appStatus === "applied" ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-miiles-blue-light text-miiles-blue text-sm font-light">
              <CheckCircle2 size={16} />
              Postulado
            </div>
          ) : (
            <Button onClick={handleApply} disabled={applying} className="px-6">
              {applying ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Postularme
            </Button>
          )}
          {appStatus === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-miiles-gray-400 font-light">
              <Bookmark size={14} />
              Guardado
            </span>
          )}
        </div>

        {/* Gallery */}
        <ProgramGallery
          programId={program.id}
          images={program.gallery_images}
          isAdmin={isAdmin}
          onUpdate={(imgs) => setProgram({ ...program, gallery_images: imgs })}
        />
      </motion.div>

      {/* Admin edit dialog */}
      {isAdmin && (
        <AdminEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          program={program}
          onSave={(updated) => setProgram({ ...program, ...updated })}
        />
      )}
    </div>
  );
}

function AdminEditDialog({
  open,
  onOpenChange,
  program,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  program: Program;
  onSave: (data: Partial<Program>) => void;
}) {
  const [priceMin, setPriceMin] = useState(String(program.price_min ?? ""));
  const [priceMax, setPriceMax] = useState(String(program.price_max ?? ""));
  const [commissionRate, setCommissionRate] = useState(program.commission_rate ?? "");
  const [avgSales, setAvgSales] = useState(String(program.avg_sales ?? 20));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPriceMin(String(program.price_min ?? ""));
    setPriceMax(String(program.price_max ?? ""));
    setCommissionRate(program.commission_rate ?? "");
    setAvgSales(String(program.avg_sales ?? 20));
  }, [program, open]);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from("brand_programs").update({
      price_min: priceMin ? Number(priceMin) : null,
      price_max: priceMax ? Number(priceMax) : null,
      commission_rate: commissionRate || null,
      avg_sales: avgSales ? Number(avgSales) : 20,
    } as any).eq("id", program.id);
    if (!error) {
      onSave({
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        commission_rate: commissionRate || null,
        avg_sales: avgSales ? Number(avgSales) : 20,
      });
      onOpenChange(false);
      toast.success("Datos actualizados");
    } else {
      toast.error("Error al actualizar");
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-normal">Datos del calculador</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-light text-xs">Precio mínimo ($)</Label>
              <Input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-light text-xs">Precio máximo ($)</Label>
              <Input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-light text-xs">Comisión</Label>
            <Input value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="ej: 10%" />
          </div>
          <div className="space-y-1.5">
            <Label className="font-light text-xs">Ventas promedio por afiliado</Label>
            <Input type="number" value={avgSales} onChange={(e) => setAvgSales(e.target.value)} placeholder="20" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
