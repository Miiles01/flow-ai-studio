import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStudioTemplates } from "@/hooks/useStudioTemplates";
import "./TemplateCarousel.css";

export default function TemplateCarousel() {
  const { t } = useTranslation();
  const { templates } = useStudioTemplates();
  const portfolios = templates.filter((template) => template.kind === "portfolio" && template.thumbnail_url);

  return (
    <div id="home-templates" aria-label={t("home.landing.explore_templates")} className="home-template-carousel relative w-full py-3">
      <div className="home-template-track">
        {[false, true].map((duplicate) => (
          <div key={String(duplicate)} className="home-template-group" aria-hidden={duplicate || undefined}>
            {portfolios.map((template) => (
              <Button key={template.id} asChild variant="ghost" className="block h-auto w-[280px] sm:w-[360px] lg:w-[420px] shrink-0 aspect-video overflow-hidden rounded-lg p-0 bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Link to={`/studio/${template.slug}`} tabIndex={duplicate ? -1 : 0} aria-label={template.title}>
                  <img src={template.thumbnail_url ?? undefined} alt={duplicate ? "" : template.title} className="h-full w-full object-cover object-top" draggable={false} />
                </Link>
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}