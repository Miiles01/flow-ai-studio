import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ContractRichText from "@/lib/contractRichText";
import SignatureDialog from "@/components/contracts/SignatureDialog";
import SignatureFieldBox from "@/components/contracts/SignatureFieldBox";
import {
  PAGE_DIMENSIONS,
  logoPositionClass,
  type ContractPage,
  type FieldSignature,
  type LogoPosition,
  type SignatureField,
} from "@/lib/contracts";

type Contract = {
  public_id: string;
  title: string;
  page_size: string;
  logo_url: string | null;
  logo_position: LogoPosition;
  logo_repeat: boolean | null;
  pages: ContractPage[];
  signature_fields: SignatureField[] | null;
  field_signatures: Record<string, FieldSignature> | null;
  signer_name: string | null;
  signature_data: string | null;
  signed_at: string | null;
};

const ContractPublic = () => {
  const { publicId } = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<Record<string, FieldSignature>>({});
  const [signingField, setSigningField] = useState<SignatureField | null>(null);
  const [globalOpen, setGlobalOpen] = useState(false);
  const [globalSignature, setGlobalSignature] = useState<FieldSignature | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const sheetsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("contracts")
        .select(
          "public_id, title, page_size, logo_url, logo_position, logo_repeat, pages, signature_fields, field_signatures, signer_name, signature_data, signed_at"
        )
        .eq("public_id", publicId ?? "")
        .maybeSingle();
      if (!alive) return;
      const c = (data as unknown as Contract) ?? null;
      setContract(c);
      setSignatures(c?.field_signatures ?? {});
      if (c?.signature_data && c.signed_at) {
        setGlobalSignature({
          name: c.signer_name ?? "",
          dataUrl: c.signature_data,
          signedAt: c.signed_at,
        });
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [publicId]);

  useEffect(() => {
    if (contract) document.title = contract.title || "Documento";
  }, [contract]);

  const fields = useMemo<SignatureField[]>(() => contract?.signature_fields ?? [], [contract]);

  const send = async (payload: { name: string; email: string | null; dataUrl: string }, fieldId?: string) => {
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("sign-contract", {
      body: { publicId, fieldId, name: payload.name, email: payload.email, signature: payload.dataUrl },
    });
    const message = fnError?.message || (data as any)?.error;
    if (message) {
      setError("No se pudo guardar la firma. Inténtalo de nuevo.");
      throw new Error(message);
    }
    const saved: FieldSignature = {
      name: payload.name,
      email: payload.email,
      dataUrl: payload.dataUrl,
      signedAt: new Date().toISOString(),
    };
    if (fieldId) setSignatures((prev) => ({ ...prev, [fieldId]: saved }));
    else setGlobalSignature(saved);
  };

  /** Quita una firma guardada (campo o firma global). */
  const removeSignature = async (fieldId?: string) => {
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("sign-contract", {
      body: { publicId, fieldId, action: "remove" },
    });
    const message = fnError?.message || (data as any)?.error;
    if (message) {
      setError("No se pudo quitar la firma. Inténtalo de nuevo.");
      return;
    }
    if (fieldId)
      setSignatures((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    else setGlobalSignature(null);
  };

  /** Descarga el documento como PDF, una hoja por página. */
  const downloadPdf = async () => {
    if (!sheetsRef.current || downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const sheets = Array.from(
        sheetsRef.current.querySelectorAll<HTMLElement>("[data-contract-sheet]")
      );
      if (!sheets.length) return;
      let pdf: any = null;
      for (const sheet of sheets) {
        const canvas = await html2canvas(sheet, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        const img = canvas.toDataURL("image/jpeg", 0.95);
        const w = sheet.offsetWidth;
        const h = sheet.offsetHeight;
        if (!pdf) {
          pdf = new jsPDF({ unit: "px", format: [w, h], orientation: w > h ? "landscape" : "portrait" });
        } else {
          pdf.addPage([w, h], w > h ? "landscape" : "portrait");
        }
        pdf.addImage(img, "JPEG", 0, 0, w, h);
      }
      const safe = (contract?.title || "documento").replace(/[^\w\s-]/g, "").trim() || "documento";
      pdf.save(`${safe}.pdf`);
    } catch {
      setError("No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  };


  if (loading) return <div className="min-h-screen bg-neutral-100" />;

  if (!contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 text-[14px] font-light text-neutral-500">
        Este documento no está disponible.
      </div>
    );
  }

  const dims = PAGE_DIMENSIONS[contract.page_size] ?? PAGE_DIMENSIONS.Carta;
  const pages = contract.pages?.length ? contract.pages : [{ id: "1", content: "" }];
  const pending = fields.filter((f) => !signatures[f.id]).length;

  return (
    <div className="min-h-screen bg-neutral-100 py-10">
      <div className="mx-auto flex w-full max-w-[860px] flex-col items-center gap-8 px-4">
        <div className="flex w-full max-w-[816px] items-center justify-between gap-4">
          <p className="text-[13px] font-light text-neutral-500">
            Documento solo lectura · únicamente puedes firmarlo
          </p>
          <div className="flex items-center gap-3">
            {fields.length > 0 && (
              <p className="text-[12px] font-light text-neutral-400">
                {pending === 0 ? "Todas las firmas completadas" : `${pending} firma${pending === 1 ? "" : "s"} pendiente${pending === 1 ? "" : "s"}`}
              </p>
            )}
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[12px] font-normal text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {downloading ? "Generando…" : "Descargar PDF"}
            </button>
          </div>
        </div>

        <div ref={sheetsRef} className="flex w-full flex-col items-center gap-8">
        {pages.map((p, i) => (
          <div
            key={p.id}
            data-contract-sheet
            className="relative w-full bg-white"
            style={{
              maxWidth: dims.width,
              minHeight: dims.height,
              boxShadow: "0 10px 30px -14px rgba(0,0,0,0.18)",
            }}
          >
            {contract.logo_url && (i === 0 || contract.logo_repeat) && (
              <img
                src={contract.logo_url}
                alt="Logotipo del documento"
                className={`absolute max-h-16 max-w-[160px] object-contain ${logoPositionClass(contract.logo_position)}`}
              />
            )}
            <div className="px-12 pb-16 pt-24">
              {i === 0 && (
                <h1 className="mb-8 text-[26px] font-normal leading-tight text-neutral-900">{contract.title}</h1>
              )}
              <ContractRichText
                content={p.content}
                className="text-[13.5px] font-light leading-[1.85] text-neutral-800"
              />

              {fields.filter((f) => f.pageIndex === i).length > 0 && (
                <div className="mt-10 flex flex-wrap gap-6">
                  {fields
                    .filter((f) => f.pageIndex === i)
                    .map((f) => (
                      <SignatureFieldBox
                        key={f.id}
                        label={f.label}
                        signature={signatures[f.id]}
                        onClick={signatures[f.id] ? undefined : () => setSigningField(f)}
                      />
                    ))}
                </div>
              )}
            </div>
            <div className="absolute bottom-5 left-0 right-0 text-center text-[11px] font-light text-neutral-300">
              Página {i + 1} de {pages.length}
            </div>
          </div>
        ))}

        {/* Documentos sin campos insertados: firma única al final */}
        {fields.length === 0 && (
          <div className="w-full max-w-[816px] rounded-[28px] bg-white p-7 shadow-sm">
            {globalSignature ? (
              <div className="flex items-center gap-5">
                <img src={globalSignature.dataUrl} alt="Firma" className="max-h-[64px] object-contain" />
                <div>
                  <p className="text-[14px] font-normal text-neutral-900">{globalSignature.name}</p>
                  <p className="text-[12px] font-light text-neutral-400">
                    Firmado el {new Date(globalSignature.signedAt).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-normal text-neutral-900">Firmar documento</p>
                  <p className="mt-1 text-[12px] font-light text-neutral-400">
                    No necesitas cuenta: firma y quedará guardada en el documento.
                  </p>
                </div>
                <button
                  onClick={() => setGlobalOpen(true)}
                  className="rounded-full bg-black px-5 py-2.5 text-[13px] font-normal text-white transition-colors hover:bg-neutral-800"
                >
                  Firmar
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-[12px] font-light text-red-500">{error}</p>}
      </div>

      <SignatureDialog
        open={!!signingField}
        label={signingField?.label}
        onClose={() => setSigningField(null)}
        onConfirm={async (payload) => {
          if (signingField) await send(payload, signingField.id);
        }}
      />

      <SignatureDialog
        open={globalOpen}
        label="Firma del documento"
        onClose={() => setGlobalOpen(false)}
        onConfirm={(payload) => send(payload)}
      />
    </div>
  );
};

export default ContractPublic;
