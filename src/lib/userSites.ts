// Reglas compartidas de páginas de usuarios (conector, Estudio y tests).
export const PUBLIC_SITE_BASE = "https://wearemiiles.com";
export const MAX_FILE_BYTES = 3_000_000;
export const MAX_FILES_PER_SAVE = 50;

const TYPES: Record<string, string> = {
  html: "text/html", htm: "text/html", css: "text/css", js: "application/javascript", mjs: "application/javascript",
  json: "application/json", txt: "text/plain", xml: "application/xml", svg: "image/svg+xml",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif", gif: "image/gif", ico: "image/x-icon",
  woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf", mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", pdf: "application/pdf",
};
const TEXT = new Set(["html", "htm", "css", "js", "mjs", "json", "txt", "xml", "svg"]);

export function fileExtension(path: string) {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

/** Devuelve el tipo de archivo o lanza un error en español si la ruta no es válida. */
export function validateSiteFile(path: string, encoding: "utf8" | "base64") {
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(path) || path.includes("..") || path.split("/").some((p) => !p || p.startsWith("."))) {
    throw new Error(`Ruta de archivo inválida: ${path}`);
  }
  const ext = fileExtension(path);
  const type = TYPES[ext];
  if (!type) throw new Error(`Tipo de archivo no permitido: ${path}`);
  if (encoding === "utf8" && !TEXT.has(ext)) throw new Error(`${path} es binario: envíalo con encoding "base64"`);
  return type;
}

export function byteSize(content: string, encoding: "utf8" | "base64") {
  if (encoding === "base64") return Math.floor((content.replace(/=+$/, "").length * 3) / 4);
  return new TextEncoder().encode(content).length;
}

export function normalizePageSlug(value: string | undefined | null) {
  const slug = (value ?? "").trim().toLowerCase();
  if (slug && !/^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$/.test(slug)) throw new Error("Nombre de página inválido: usa letras, números y guiones");
  return slug;
}

export function publicSiteUrl(path: string) {
  return `${PUBLIC_SITE_BASE}/${path}/`;
}

/** Free: 1 página. Pro: ilimitadas. */
export function canCreateSite(isPro: boolean, existing: number) {
  return isPro || existing < 1;
}
