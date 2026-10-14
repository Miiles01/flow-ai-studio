import JSZip from "jszip";

export type StudioTemplate = {
  id: string;
  slug: string;
  title: string;
  kind: "portfolio" | "website" | string;
  description: string;
  thumbnail_url: string | null;
  html: string;
  is_published?: boolean;
  preview_url?: string | null;
  download_url?: string | null;
};

export const KIND_LABEL: Record<string, string> = { portfolio: "Portafolio", website: "Página web" };

export async function downloadTemplateZip(t: StudioTemplate) {
  if (t.download_url) {
    const a = document.createElement("a");
    a.href = t.download_url;
    a.download = `${t.slug}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  const zip = new JSZip();
  zip.file("index.html", t.html);
  zip.file(
    "README.md",
    `# ${t.title}\n\n${t.description}\n\nPlantilla de Miiles Estudio.\n\n## Para tu IA de vibe coding\nEste proyecto es una página estática en un solo archivo \`index.html\` (HTML + CSS).\nPídele a tu IA que la adapte con tu nombre, tus trabajos y tus datos de contacto, manteniendo la estructura.\n`,
  );
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t.slug}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
