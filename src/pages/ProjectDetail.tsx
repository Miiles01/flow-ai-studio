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
    className="w-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-100/50 shadow-sm"
  >
    <img
      src={src}
      alt={alt}
      loading={index < 2 ? "eager" : "lazy"}
      decoding="async"
      className="w-full h-auto object-cover"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <h1 className="text-4xl font-medium mb-4">
          {lang === "es" ? "Proyecto no encontrado" : "Project not found"}
        </h1>
        <p className="text-neutral-500 mb-8">
          {lang === "es" ? "El proyecto que buscas no existe o ha sido movido." : "The project you are looking for does not exist."}
        </p>
        <Link
          to="/trabajo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
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
      <div className="min-h-screen bg-white text-neutral-950 flex flex-col selection:bg-neutral-900 selection:text-white">
        <LandingNavbar isLanding={false} />

        <main className="flex-1 pt-32 md:pt-44 pb-24">
          {/* Header */}
          <header className="px-6 md:px-12 lg:px-20 container mx-auto mb-16 md:mb-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-6xl md:text-8xl lg:text-[8vw] font-medium tracking-tighter leading-none mb-8"
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
                <p className="text-xs tracking-widest text-neutral-400 mb-2 font-mono uppercase font-semibold">
                  {lang === "es" ? "Industria" : "Industry"}
                </p>
                <p className="text-lg font-light leading-relaxed text-neutral-900">
                  {project.industry[lang]}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-widest text-neutral-400 mb-2 font-mono uppercase font-semibold">
                  {lang === "es" ? "Qué hicimos" : "What we did"}
                </p>
                <p className="text-lg font-light leading-relaxed text-neutral-900">
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
              <p className="text-xs tracking-widest text-neutral-400 mb-4 font-mono uppercase font-semibold">
                {lang === "es" ? "Sobre el proyecto" : "About the project"}
              </p>
              <p className="text-xl md:text-2xl font-light leading-relaxed text-neutral-800 whitespace-pre-line">
                {project.description[lang]}
              </p>
            </motion.div>
          </div>

          {/* Image gallery — single columns with strategy block break */}
          <div className="space-y-6 md:space-y-8">
            {project.images.slice(1).map((img, idx) => {
              const realIdx = idx + 1;

              return (
                <React.Fragment key={realIdx}>
                  {/* Full-width image */}
                  <div className="px-4 md:px-8 lg:px-12">
                    <ProjectImage src={basePath + img.src} alt={img.alt} index={realIdx} />
                  </div>

                  {/* Render strategy right after the first gallery image */}
                  {idx === 0 && project.strategy && (
                    <div className="px-6 md:px-12 lg:px-20 container mx-auto my-20 md:my-32">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl pt-8"
                      >
                        <p className="text-xs tracking-widest text-neutral-400 mb-4 font-mono uppercase font-semibold">
                          {lang === "es" ? "Qué se hizo / Planificación Funcional" : "Strategy / Action Plan"}
                        </p>
                        <p className="text-xl md:text-2xl font-light leading-relaxed text-neutral-800 whitespace-pre-line">
                          {project.strategy[lang]}
                        </p>
                      </motion.div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
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
                className="inline-flex items-center gap-3 text-2xl md:text-3xl font-medium tracking-tight hover:opacity-60 transition-opacity"
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
