import type { ConnectorType } from "@/hooks/useUserApps";

export type CatalogApp = {
  id: string;
  name: string;
  category: string;
  desc: string;
  connector_type: ConnectorType;
  url: string;
  keyLabel: string;
  keyHint: string;
  logo: string;
};

export const CATALOG: CatalogApp[] = [
  {
    id: "gmail",
    name: "Gmail",
    category: "Correo",
    desc: "Lee, busca y redacta correos desde tus flujos.",
    connector_type: "api",
    url: "https://gmail.googleapis.com/gmail/v1",
    keyLabel: "Access token de Google",
    keyHint: "Genera un token OAuth con el scope gmail.readonly o gmail.modify.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=gmail.com",
  },
  {
    id: "apify",
    name: "Apify",
    category: "Scraping",
    desc: "Ejecuta actors y extrae datos de la web automáticamente.",
    connector_type: "api",
    url: "https://api.apify.com/v2",
    keyLabel: "API token de Apify",
    keyHint: "Lo encuentras en apify.com → Settings → Integrations.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=apify.com",
  },
];

/** Logo de una app conectada: usa el del catálogo si coincide, si no el favicon de su dominio. */
export function logoForApp(name: string, url?: string | null): string | null {
  const preset = CATALOG.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (preset) return preset.logo;
  if (url) {
    try {
      const host = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
    } catch {
      return null;
    }
  }
  return null;
}
