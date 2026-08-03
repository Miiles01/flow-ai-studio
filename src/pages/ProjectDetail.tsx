import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { portfolioProjects } from "@/data/portfolioProjects";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import PortfolioSmoothScroll from "@/components/portfolio/PortfolioSmoothScroll";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";

export const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language?.startsWith("en") ? "en" : "es") as "es" | "en";

  const project = slug ? portfolioProjects[slug] : null;

  // Next project resolution
  const projectKeys = Object.keys(portfolioProjects);
  const currentIndex = slug ? projectKeys.indexOf(slug) : -1;
  const nextKey = projectKeys[(currentIndex + 1) % projectKeys.length];
  const nextProject = portfolioProjects[nextKey];

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

  const getPath = (img: string) => `/proyectos/${project.folder}/${img}`;

  return (
    <PortfolioSmoothScroll>
      <div className="min-h-screen bg-white text-neutral-950 flex flex-col selection:bg-neutral-900 selection:text-white">
        <LandingNavbar isLanding={false} />

        <main className="flex-1 container mx-auto px-6 md:px-12 lg:px-20 pt-36 md:pt-48 pb-24">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Link
              to="/trabajo"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft size={14} />
              {lang === "es" ? "Volver a proyectos" : "Back to projects"}
            </Link>
          </motion.div>

          {/* Project Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-[6.5vw] font-medium tracking-tighter leading-[1] text-neutral-950 mb-14 md:mb-20"
          >
            {project.title}
          </motion.h1>

          {/* Project Metadata Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-16 md:pb-24 border-b border-neutral-100 mb-16 md:mb-24"
          >
            {/* Industry */}
            <div className="md:col-span-4">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                {lang === "es" ? "Industria" : "Industry"}
              </span>
              <p className="text-lg md:text-xl font-normal text-neutral-900 leading-snug">
                {project.industry[lang]}
              </p>
            </div>

            {/* Role */}
            <div className="md:col-span-8">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                {lang === "es" ? "Qué hice" : "My Role & Scope"}
              </span>
              <p className="text-lg md:text-xl font-normal text-neutral-900 leading-snug">
                {project.role[lang]}
              </p>
            </div>
          </motion.div>

          {/* Hero Cover Image */}
          {project.images[0] && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-neutral-100 shadow-sm mb-20 md:mb-32"
            >
              <img
                src={getPath(project.images[0].src)}
                alt={project.images[0].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Description Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-24 md:mb-36">
            <div className="lg:col-span-4">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-neutral-900 sticky top-36">
                {lang === "es" ? "Sobre el proyecto" : "About the project"}
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <p className="text-xl md:text-2xl font-light text-neutral-800 leading-relaxed whitespace-pre-line">
                {project.description[lang]}
              </p>
            </div>
          </section>

          {/* Strategy / Functional Planning Section */}
          {project.strategy && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-24 md:mb-36 p-8 md:p-14 rounded-[2.5rem] bg-neutral-50/80 border border-neutral-100">
              <div className="lg:col-span-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 block mb-2">
                  {lang === "es" ? "Estrategia & Enfoque" : "Strategy & Approach"}
                </span>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-neutral-900">
                  {lang === "es" ? "Planificación Funcional" : "Functional Execution"}
                </h3>
              </div>
              <div className="lg:col-span-8">
                <p className="text-lg md:text-xl font-light text-neutral-700 leading-relaxed whitespace-pre-line">
                  {project.strategy[lang]}
                </p>
              </div>
            </section>
          )}

          {/* Media Gallery */}
          <section className="space-y-10 md:space-y-16 mb-28 md:mb-40">
            <div className="border-b border-neutral-100 pb-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {lang === "es" ? "Galería de Activos & Diseño" : "Design & Media Showcase"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {project.images.slice(1).map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-neutral-100 shadow-sm ${
                    idx % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3] md:aspect-[4/5]"
                  }`}
                >
                  <img
                    src={getPath(img.src)}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Next Project Footer */}
          {nextProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="pt-16 md:pt-24 border-t border-neutral-100"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                {lang === "es" ? "Siguiente proyecto" : "Next Project"}
              </span>
              <Link
                to={`/trabajo/${nextProject.slug}`}
                className="group flex items-center justify-between gap-6 py-6"
              >
                <div>
                  <h3 className="text-4xl md:text-6xl font-medium tracking-tight text-neutral-950 group-hover:text-miiles-blue transition-colors">
                    {nextProject.title}
                  </h3>
                  <p className="text-sm md:text-base font-light text-neutral-500 mt-2">
                    {nextProject.subtitle[lang]}
                  </p>
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all shrink-0">
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          )}
        </main>

        <LandingFooter />
      </div>
    </PortfolioSmoothScroll>
  );
};

export default ProjectDetail;
