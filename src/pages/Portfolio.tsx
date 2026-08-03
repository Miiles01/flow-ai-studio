import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import FloatingProjectInfo from "@/components/portfolio/FloatingProjectInfo";
import PortfolioSmoothScroll from "@/components/portfolio/PortfolioSmoothScroll";
import { portfolioProjects, PortfolioProject, Participation } from "@/data/portfolioProjects";
import { ArrowUpRight } from "lucide-react";

const ProjectSection = ({
  project,
  slug,
  lang,
  onHover,
}: {
  project: PortfolioProject;
  slug: string;
  lang: "es" | "en";
  onHover: (participation: Participation[] | null) => void;
}) => {
  const getPath = (img: string) => `/proyectos/${project.folder}/${img}`;
  const cover = project.images[0]?.src || "";
  const secondary = project.images.slice(1, 3);

  return (
    <div
      className="mb-28 md:mb-40 group"
      onMouseEnter={() => onHover(project.participation || [])}
      onMouseLeave={() => onHover(null)}
    >
      {/* Main Cover */}
      <Link to={`/trabajo/${slug}`} className="block w-full mb-6 md:mb-8 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-neutral-100 shadow-sm transition-all hover:shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="aspect-[16/9] w-full overflow-hidden"
        >
          <img
            src={getPath(cover)}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </motion.div>
      </Link>

      {/* Secondary Images & Gallery Preview */}
      {secondary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          {secondary.map((img, idx) => (
            <Link
              key={idx}
              to={`/trabajo/${slug}`}
              className="block overflow-hidden rounded-[2rem] bg-neutral-100 shadow-sm transition-all hover:shadow-lg"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: 0.1 * (idx + 1), ease: [0.16, 1, 0.3, 1] }}
                className="aspect-[4/5] overflow-hidden"
              >
                <img
                  src={getPath(img.src)}
                  alt={`${project.title} preview ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
                />
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Project Meta Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="px-2 md:px-4 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="max-w-2xl">
          <Link to={`/trabajo/${slug}`} className="inline-flex items-center gap-2 group/title">
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-neutral-950 transition-colors group-hover/title:text-miiles-blue">
              {project.title}
            </h3>
            <ArrowUpRight className="w-6 h-6 text-neutral-400 opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-1 group-hover/title:-translate-y-1 transition-all" />
          </Link>
          <p className="text-base md:text-lg font-light text-neutral-600 mt-2 leading-relaxed">
            {project.subtitle[lang]}
          </p>
        </div>

        <Link
          to={`/trabajo/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors pt-2 md:pt-0"
        >
          {lang === "es" ? "Ver proyecto completo" : "View full project"} &rarr;
        </Link>
      </motion.div>
    </div>
  );
};

export const Portfolio = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("en") ? "en" : "es") as "es" | "en";
  const [hoveredParticipation, setHoveredParticipation] = useState<Participation[] | null>(null);

  const projectsList = Object.values(portfolioProjects);

  return (
    <PortfolioSmoothScroll>
      <div className="min-h-screen bg-white text-neutral-950 flex flex-col selection:bg-neutral-900 selection:text-white">
        <FloatingProjectInfo
          participation={hoveredParticipation || []}
          isVisible={hoveredParticipation !== null}
        />

        <LandingNavbar isLanding={false} />

        <main className="flex-1 px-6 md:px-12 lg:px-20 container mx-auto pt-36 md:pt-48 pb-20">
          {/* Header Section */}
          <section className="mb-20 md:mb-32">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight max-w-3xl mb-6 text-neutral-500 leading-relaxed"
            >
              {lang === "es"
                ? "Pensamos con propósito para marcas que buscan autenticidad y escalabilidad."
                : "Designing with purpose for brands seeking authenticity and scalability."}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-[7.5vw] font-medium tracking-tighter leading-[0.95] text-neutral-950"
            >
              {lang === "es" ? "Proyectos" : "Selected Works"}
            </motion.h1>
          </section>

          {/* Projects List */}
          <section className="pb-12">
            {projectsList.map((project) => (
              <ProjectSection
                key={project.slug}
                project={project}
                slug={project.slug}
                lang={lang}
                onHover={setHoveredParticipation}
              />
            ))}
          </section>
        </main>

        <LandingFooter />
      </div>
    </PortfolioSmoothScroll>
  );
};

export default Portfolio;
