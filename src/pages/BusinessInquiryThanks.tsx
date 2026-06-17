import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

const BusinessInquiryThanks = () => {
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
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-4">
            ¡Gracias! <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>Nos pondremos en contacto.</span>
          </h1>
          <p className="text-base font-light text-gray-500 mb-10 max-w-md">
            Recibimos tu solicitud del plan Negocios. Nuestro equipo te escribirá muy pronto al correo que nos dejaste.
          </p>
          <Link
            to="/"
            className="px-8 py-4 rounded-full bg-black text-white text-sm font-normal hover:bg-opacity-80 transition-all"
          >
            Volver al inicio
          </Link>
        </section>
        <LandingFooter />
      </div>
    </>
  );
};

export default BusinessInquiryThanks;
