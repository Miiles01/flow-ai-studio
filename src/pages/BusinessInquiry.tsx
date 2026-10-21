import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BusinessInquiry = () => {
  const { t } = useTranslation();
  const localePath = useLocalePath();
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
      toast.error(t("business.inquiry.text1"));
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
      toast.error(t("business.inquiry.text2"));
      return;
    }
    navigate(localePath("/precios/negocios/gracias"));
  };

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-[#F5F5F8] px-5 py-3.5 text-sm font-light text-black placeholder:text-gray-400 outline-none focus:border-black/30 transition-colors";

  return (
    <>
      <LandingNavbar />
      <div className="bg-white text-black font-sans min-h-screen">
        <section className="max-w-2xl mx-auto px-6 pt-40 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-4">{t("business.inquiry.text3")} <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>{t("business.inquiry.text4")}</span>
            </h1>
            <p className="text-base font-light text-gray-500 mb-10 max-w-lg">{t("business.inquiry.text5")}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">{t("business.inquiry.text6")}</label>
                  <input value={form.name} onChange={update("name")} className={inputClass} placeholder={t("business.inquiry.text7")} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">{t("business.inquiry.text8")}</label>
                  <input value={form.email} onChange={update("email")} type="email" className={inputClass} placeholder={t("business.inquiry.text9")} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">{t("business.inquiry.text10")}</label>
                  <input value={form.company} onChange={update("company")} className={inputClass} placeholder={t("business.inquiry.text11")} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">{t("business.inquiry.text12")}</label>
                  <input value={form.phone} onChange={update("phone")} className={inputClass} placeholder={t("business.inquiry.text13")} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">{t("business.inquiry.text14")}</label>
                  <input value={form.team_size} onChange={update("team_size")} className={inputClass} placeholder={t("business.inquiry.text15")} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-light">{t("business.inquiry.text16")}</label>
                  <input value={form.web_or_socials} onChange={update("web_or_socials")} className={inputClass} placeholder={t("business.inquiry.text17")} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-light">{t("business.inquiry.text18")}</label>
                <textarea
                  value={form.message}
                  onChange={update("message")}
                  rows={4}
                  className={inputClass + " resize-none"}
                  placeholder={t("business.inquiry.text19")}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black text-white text-sm font-normal hover:bg-opacity-80 transition-all disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}{t("business.inquiry.text20")}</button>
            </form>
          </motion.div>
        </section>
        <LandingFooter />
      </div>
    </>
  );
};

export default BusinessInquiry;
