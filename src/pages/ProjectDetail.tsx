import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { portfolioProjects } from "@/data/portfolioProjects";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import PortfolioSmoothScroll from "@/components/portfolio/PortfolioSmoothScroll";
import { ArrowLeft } from "lucide-react";

/* ── Fade-in animation variant ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── Full-width image block ── */
const ProjectImage = ({ src, alt, index }: { src: string; alt: string; index: number }) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-80px" }}
    variants={fadeUp}
    className="w-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-100/60"
  >
    <img
      src={src}
      alt={alt}
      loading={index < 2 ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={index === 0 ? "high" : "auto"}
      className="w-full h-auto object-cover transition-opacity duration-500"
    />
  </motion.div>
);

export const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language?.startsWith("en") ? "en" : "es") as "es" | "en";

  const project = slug ? portfolioProjects[slug] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 font-sans">
        <h1 className="text-4xl font-normal tracking-tight mb-4 text-black">
          {lang === "es" ? "Proyecto no encontrado" : "Project not found"}
        </h1>
        <p className="text-neutral-500 mb-8 font-light">
          {lang === "es" ? "El proyecto que buscas no existe o ha sido movido." : "The project you are looking for does not exist."}
        </p>
        <Link
          to="/trabajo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-normal hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={16} />
          {lang === "es" ? "Volver a proyectos" : "Back to projects"}
        </Link>
      </div>
    );
  }

  const basePath = `/proyectos/${project.folder}/`;

  return (
    <PortfolioSmoothScroll>
      <div className="min-h-screen bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white">
        <LandingNavbar isLanding={false} />

        <main className="flex-1 pt-32 md:pt-44 pb-24">
          {/* Header */}
          <header className="px-6 md:px-12 lg:px-20 container mx-auto mb-16 md:mb-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-6xl md:text-8xl lg:text-[8vw] font-normal tracking-tight leading-tight mb-8 text-black"
            >
              {project.title}
            </motion.h1>

            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="grid md:grid-cols-2 gap-8 md:gap-16 max-w-4xl"
            >
              <div>
                <p className="text-xs tracking-widest text-neutral-400 mb-2 font-normal uppercase">
                  {lang === "es" ? "Industria" : "Industry"}
                </p>
                <p className="text-lg md:text-xl font-light leading-relaxed text-black/85">
                  {project.industry[lang]}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-widest text-neutral-400 mb-2 font-normal uppercase">
                  {lang === "es" ? "Qué hicimos" : "What we did"}
                </p>
                <p className="text-lg md:text-xl font-light leading-relaxed text-black/85">
                  {project.role[lang]}
                </p>
              </div>
            </motion.div>
          </header>

          {/* Cover image — full bleed */}
          <div className="px-4 md:px-8 lg:px-12 mb-8">
            <ProjectImage src={basePath + project.images[0].src} alt={project.images[0].alt} index={0} />
          </div>

          {/* Description block */}
          <div className="px-6 md:px-12 lg:px-20 container mx-auto my-20 md:my-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <p className="text-xs tracking-widest text-neutral-400 mb-4 font-normal uppercase">
                {lang === "es" ? "Sobre el proyecto" : "About the project"}
              </p>
              <p className="text-xl md:text-2xl font-light leading-relaxed text-black/85 whitespace-pre-line tracking-normal">
                {project.description[lang]}
              </p>
            </motion.div>
          </div>

          {/* Image gallery — single columns */}
          <div className="space-y-6 md:space-y-8">
            {project.images.slice(1).map((img, idx) => (
              <div key={idx + 1} className="px-4 md:px-8 lg:px-12">
                <ProjectImage src={basePath + img.src} alt={img.alt} index={idx + 1} />
              </div>
            ))}
          </div>

          {/* Back to projects */}
          <div className="px-6 md:px-12 lg:px-20 container mx-auto mt-32 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => navigate("/trabajo")}
                className="inline-flex items-center gap-3 text-2xl md:text-3xl font-normal tracking-tight text-black hover:opacity-60 transition-opacity"
              >
                <ArrowLeft size={24} />
                {lang === "es" ? "Volver a proyectos" : "Back to projects"}
              </button>
            </motion.div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </PortfolioSmoothScroll>
  );
};

export default ProjectDetail;
