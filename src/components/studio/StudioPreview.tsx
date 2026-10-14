import { useNavigate } from "react-router-dom";
import { useStudioTemplates } from "@/hooks/useStudioTemplates";
import StudioCard from "./StudioCard";

export default function StudioPreview() {
  const { templates } = useStudioTemplates();
  const navigate = useNavigate();
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-medium text-foreground">Estudio</h2>
          <p className="text-sm font-light text-miiles-gray-400 mt-1">Crea una mejor presentación: plantillas para tu portafolio o embudo de ventas</p>
        </div>
        <button onClick={() => navigate("/studio")} className="text-sm font-light text-muted-foreground hover:text-foreground">Ver todo</button>
      </div>
      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground font-light">Pronto habrá plantillas aquí.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pt-2 pb-6 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0">
          {templates.slice(0, 8).map((t) => (
            <StudioCard key={t.id} t={t} className="snap-start shrink-0 w-64" />
          ))}
        </div>
      )}
    </div>
  );
}
