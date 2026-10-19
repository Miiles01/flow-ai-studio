import { STUDIO_TEMPLATES } from "@/lib/studio";

export function useStudioTemplates() {
  return { templates: STUDIO_TEMPLATES, loading: false };
}
