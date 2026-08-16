import { supabase } from "@/integrations/supabase/client";

export type ContractPage = { id: string; content: string };

export type LogoPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: "top-left", label: "Arriba izquierda" },
  { value: "top-center", label: "Arriba centro" },
  { value: "top-right", label: "Arriba derecha" },
  { value: "bottom-left", label: "Abajo izquierda" },
  { value: "bottom-center", label: "Abajo centro" },
  { value: "bottom-right", label: "Abajo derecha" },
];

/** Clases de posición del logotipo dentro de la hoja. */
export const logoPositionClass = (pos: LogoPosition = "top-left") => {
  const vertical = pos.startsWith("bottom") ? "bottom-12" : "top-10";
  if (pos.endsWith("center")) return `${vertical} left-1/2 -translate-x-1/2`;
  return `${vertical} ${pos.endsWith("right") ? "right-12" : "left-12"}`;
};

/** Campo de firma insertado en una página del documento. */
export type SignatureField = {
  id: string;
  pageIndex: number;
  label?: string;
};

/** Firma guardada para un campo (la escribe la edge function, nunca el widget). */
export type FieldSignature = {
  name: string;
  email?: string | null;
  dataUrl: string;
  signedAt: string;
};

export type ContractsNodeData = {
  title?: string;
  currency?: string;
  pageSize?: string;
  logoUrl?: string;
  logoPosition?: LogoPosition;
  /** Si es true el logotipo aparece en todas las páginas; si no, solo en la primera. */
  logoRepeat?: boolean;
  pages?: ContractPage[];
  publicId?: string;
  /** Campos de firma que el usuario inserta en el documento. */
  signatureFields?: SignatureField[];
  /** Firmas ya guardadas, indexadas por id de campo (solo lectura desde el widget). */
  fieldSignatures?: Record<string, FieldSignature>;
};

export const CURRENCIES = ["MXN", "USD", "EUR", "COP", "ARS", "CLP"];
export const PAGE_SIZES = ["Carta", "A4", "Oficio"];

/** Medidas en px a 96 dpi. */
export const PAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  Carta: { width: 816, height: 1056 },
  A4: { width: 794, height: 1123 },
  Oficio: { width: 816, height: 1344 },
};

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const shortId = () =>
  `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

/** Redimensiona el logotipo y lo devuelve como data URL para que la vista pública no dependa de almacenamiento. */
export function readLogoAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const max = 480;
      let w = img.width;
      let h = img.height;
      if (w > h && w > max) {
        h = (h * max) / w;
        w = max;
      } else if (h >= w && h > max) {
        w = (w * max) / h;
        h = max;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No se pudo procesar la imagen"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Imagen no válida"));
    img.src = URL.createObjectURL(file);
  });
}

/** Guarda o actualiza el contrato para que la vista pública siempre esté al día. */
export async function syncContract(
  data: ContractsNodeData,
  meta: { nodeId: string; flowId?: string | null }
): Promise<boolean> {
  if (!data.publicId) return false;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return false;

  const payload = {
    public_id: data.publicId,
    owner_id: user.id,
    flow_id: meta.flowId && /^[0-9a-f-]{36}$/i.test(meta.flowId) ? meta.flowId : null,
    node_id: meta.nodeId,
    title: data.title?.trim() || "Contratos",
    currency: data.currency || "MXN",
    page_size: data.pageSize || "Carta",
    logo_url: data.logoUrl ?? null,
    logo_position: data.logoPosition || "top-left",
    logo_repeat: !!data.logoRepeat,
    pages: (data.pages ?? []) as any,
    // Solo se sincroniza la definición de los campos: las firmas las guarda la edge function.
    signature_fields: (data.signatureFields ?? []) as any,
  };

  const { error } = await supabase.from("contracts").upsert(payload, { onConflict: "public_id" });
  return !error;
}

/** Lee las firmas guardadas del documento público para reflejarlas en el canvas. */
export async function fetchFieldSignatures(
  publicId?: string
): Promise<Record<string, FieldSignature> | null> {
  if (!publicId) return null;
  const { data, error } = await supabase
    .from("contracts")
    .select("field_signatures")
    .eq("public_id", publicId)
    .maybeSingle();
  if (error || !data) return null;
  return ((data as any).field_signatures ?? {}) as Record<string, FieldSignature>;
}
