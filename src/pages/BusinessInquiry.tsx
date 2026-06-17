import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BusinessInquiry = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    team_size: "",
    web_or_socials: "",
    message: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nombre y email son obligatorios");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("business_inquiries").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim() || null,
      team_size: form.team_size.trim() || null,
      web_or_socials: form.web_or_socials.trim() || null,
      message: form.message.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("No se pudo enviar tu solicitud. Inténtalo de nuevo.");
      return;
    }
    navigate("/precios/negocios/gracias");
  };

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-[#F5F5F8] px-5 py-3.5 text-sm font-light text-black placeholder:text-gray-400 outline-none focus:border-black/30 transition-colors";

  return (
    <>
      <LandingNavbar />
      <div className="bg-white text-black font-sans min-h-screen">
        <section className="max-w-2xl mx-auto px-6 pt-40 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-4">
              Hablemos de tu <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>equipo.</span>
            </h1>
            <p className="text-base font-light text-gray-500 mb-10 max-w-lg">
              Cuéntanos sobre tu empresa y te contactaremos para armar un plan Negocios a tu medida.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">Nombre *</label>
                  <input value={form.name} onChange={update("name")} className={inputClass} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">Email *</label>
                  <input value={form.email} onChange={update("email")} type="email" className={inputClass} placeholder="tu@empresa.com" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">Empresa</label>
                  <input value={form.company} onChange={update("company")} className={inputClass} placeholder="Nombre de la empresa" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">Teléfono</label>
                  <input value={form.phone} onChange={update("phone")} className={inputClass} placeholder="+52 ..." />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">Tamaño del equipo</label>
                  <input value={form.team_size} onChange={update("team_size")} className={inputClass} placeholder="Ej. 5-20 personas" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">Página web o redes</label>
                  <input value={form.web_or_socials} onChange={update("web_or_socials")} className={inputClass} placeholder="sitio.com / @usuario" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-light">¿En qué te podemos ayudar?</label>
                <textarea
                  value={form.message}
                  onChange={update("message")}
                  rows={4}
                  className={inputClass + " resize-none"}
                  placeholder="Cuéntanos un poco más..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black text-white text-sm font-normal hover:bg-opacity-80 transition-all disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Enviar solicitud
              </button>
            </form>
          </motion.div>
        </section>
        <LandingFooter />
      </div>
    </>
  );
};

export default BusinessInquiry;
