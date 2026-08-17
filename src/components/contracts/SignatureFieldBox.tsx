/**
 * Caja de firma dentro de la hoja del contrato.
 * Vacía: recuadro redondeado punteado que invita a firmar.
 * Firmada: muestra la imagen de la firma, el nombre y la fecha.
 */

import type { FieldSignature } from "@/lib/contracts";

type Props = {
  label?: string;
  signature?: FieldSignature | null;
  onClick?: () => void;
  onRemove?: () => void;
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })} · ${d.toLocaleTimeString(
    "es-MX",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
};

const SignatureFieldBox = ({ label, signature, onClick, onRemove }: Props) => (
  <div className="group/sign relative w-[240px]">
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      disabled={!onClick}
      className={`nodrag nopan flex h-[104px] w-full flex-col items-center justify-center gap-1 rounded-2xl px-3 transition-colors ${
        signature
          ? "bg-neutral-50/60"
          : "border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-700"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
      title={signature ? "Firmado" : "Firmar aquí"}
    >
      {signature ? (
        <img src={signature.dataUrl} alt={`Firma de ${signature.name}`} className="max-h-[52px] object-contain" />
      ) : (
        <span className="text-[12px] font-light">Firmar aquí</span>
      )}
    </button>
    <div className="mt-1.5 border-t border-neutral-200 pt-1.5 text-center">
      <p className="text-[11px] font-light text-neutral-600">
        {signature?.name || label?.trim() || "Firma"}
      </p>
      {signature ? (
        <p className="text-[10px] font-light text-neutral-300">{fmt(signature.signedAt)}</p>
      ) : (
        label?.trim() ? null : <p className="text-[10px] font-light text-neutral-300">Nombre y fecha</p>
      )}
    </div>
    {onRemove && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="nodrag nopan absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] text-neutral-400 shadow-sm hover:text-neutral-900 group-hover/sign:flex"
        title="Quitar campo de firma"
      >
        ×
      </button>
    )}
  </div>
);

export default SignatureFieldBox;
