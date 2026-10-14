import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { adminFetch } from "@/hooks/useAdminAuth";

const forbidden = /(^|\/)(\.git|node_modules|\.env[^/]*|\.DS_Store|\.aws|\.ssh)(\/|$)|\.(pem|key|sqlite|db)$/i;
const staticFile = /\.(html?|css|js|mjs|json|png|jpe?g|webp|gif|svg|ico|avif|woff2?|ttf|otf|mp4|webm|mp3|pdf|wasm)$/i;

export async function uploadStudioProject(file: File, entry: string, progress: (value: string) => void) {
  if (file.size > 50 * 1024 * 1024) throw new Error("El ZIP debe pesar menos de 50 MB.");
  const zip = await JSZip.loadAsync(file);
  const files = Object.values(zip.files).filter((f) => !f.dir);
  if (files.length > 2000) throw new Error("El proyecto contiene demasiados archivos (máximo 2000).");
  for (const f of files) {
    if (f.name.includes("\\") || f.name.split("/").includes("..") || (f as typeof f & { unsafeOriginalName?: string }).unsafeOriginalName?.split("/").includes("..")) throw new Error("El ZIP contiene rutas no seguras.");
  }
  const folders = new Set(files.map((f) => f.name.split("/")[0]));
  const strip = folders.size === 1 && files.every((f) => f.name.includes("/")) ? `${files[0]?.name.split("/")[0]}/` : "";
  const clean = new JSZip();
  const entries: { path: string; data: Uint8Array }[] = [];
  let total = 0;
  for (const f of files) {
    const path = f.name.slice(strip.length);
    if (forbidden.test(path)) continue;
    const size = (f as typeof f & { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0;
    if (size > 50 * 1024 * 1024 || total + size > 150 * 1024 * 1024) throw new Error("El proyecto descomprimido supera 150 MB.");
    const data = await f.async("uint8array");
    total += data.length;
    if (total > 150 * 1024 * 1024) throw new Error("El proyecto descomprimido supera 150 MB.");
    clean.file(path, data);
    entries.push({ path, data });
  }
  const entryPath = entry.trim().replace(/^\/+/, "") || "index.html";
  const main = entries.find((f) => f.path === entryPath);
  if (!main || !/\.html?$/i.test(entryPath)) throw new Error(`No encontramos ${entryPath}. Indica la ruta de la página principal dentro del ZIP.`);
  let html = new TextDecoder().decode(main.data);
  if (/src=["'][^"']*\.(tsx|jsx|ts)["']/i.test(html)) throw new Error("Este ZIP contiene código sin preparar. Sube la versión compilada con su index.html, CSS y JavaScript.");
  const root = entryPath.slice(0, entryPath.lastIndexOf("/") + 1);
  const assets = entries.filter((f) => f.path.startsWith(root) && staticFile.test(f.path) && f.path !== entryPath).map((f) => ({ ...f, path: f.path.slice(root.length) }));
  if (assets.length > 1000) throw new Error("La vista admite hasta 1000 archivos.");
  progress("Preparando proyecto…");
  const archive = await clean.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  if (archive.length > 50 * 1024 * 1024) throw new Error("El ZIP preparado supera 50 MB.");
  const paths = ["source.zip", ...assets.map((a) => a.path)];
  const { data, error } = await adminFetch("admin-studio-templates", { action: "prepare-upload", paths });
  if (error || data?.error) throw new Error(data?.error ?? error?.message ?? "No se pudo preparar la subida.");
  const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/studio-assets/${data.project}/`;
  const rewrite = (text: string) => text.replace(/(["'(])\/(?!\/)/g, `$1${base}`);
  html = rewrite(html).replace(/<base\b[^>]*>/gi, "");
  html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${base}"><style>*{scrollbar-width:none}*::-webkit-scrollbar{display:none}</style>`);
  if (!/<base\b/i.test(html)) html = `<base href="${base}">${html}`;
  const uploads = [{ path: "source.zip", data: archive }, ...assets];
  let done = 0;
  for (let i = 0; i < uploads.length; i += 4) {
    await Promise.all(uploads.slice(i, i + 4).map(async (item) => {
      const token = data.uploads.find((u: { path: string }) => u.path === item.path);
      if (!token) throw new Error("Falta permiso para subir un archivo.");
      const bytes = /\.(css|js|mjs|html?)$/i.test(item.path) ? new TextEncoder().encode(rewrite(new TextDecoder().decode(item.data))) : item.data;
      const result = await supabase.storage.from("studio-projects").uploadToSignedUrl(`${data.project}/${item.path}`, token.token, new Blob([bytes as BlobPart]));
      if (result.error) throw result.error;
      progress(`Subiendo ${++done} de ${uploads.length}…`);
    }));
  }
  return { html, preview_url: null, download_url: `${base}source.zip` };
}

export async function studioThumbnail(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp|avif)$/.test(file.type)) throw new Error("Usa una imagen PNG, JPG, WebP o AVIF.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(1600, img.naturalWidth);
    canvas.height = Math.round(img.naturalHeight * canvas.width / img.naturalWidth);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen.");
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL("image/webp", 0.85);
    if (result.length > 1_500_000) throw new Error("La miniatura es demasiado grande. Usa una imagen más pequeña.");
    return result;
  } finally { URL.revokeObjectURL(url); }
}