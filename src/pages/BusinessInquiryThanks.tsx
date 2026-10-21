import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

const BusinessInquiryThanks = () => {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  return (
    <>
      <LandingNavbar />
      <div className="bg-white text-black font-sans min-h-screen">
        <section className="max-w-2xl mx-auto px-6 pt-48 pb-32 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-8"
          >
            <Check className="text-white" size={28} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-4">{t("business.thanks.text1")}<span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>{t("business.thanks.text2")}</span>
          </h1>
          <p className="text-base font-light text-gray-500 mb-10 max-w-md">{t("business.thanks.text3")}</p>
          <Link
            to={localePath("/")}
            className="px-8 py-4 rounded-full bg-black text-white text-sm font-normal hover:bg-opacity-80 transition-all"
          >{t("business.thanks.text4")}</Link>
        </section>
        <LandingFooter />
      </div>
    </>
  );
};

export default BusinessInquiryThanks;
