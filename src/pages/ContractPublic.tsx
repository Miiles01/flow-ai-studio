import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_DIMENSIONS, type ContractPage, type LogoPosition } from "@/lib/contracts";

type Contract = {
  public_id: string;
  title: string;
  page_size: string;
  logo_url: string | null;
  logo_position: LogoPosition;
  pages: ContractPage[];
  signer_name: string | null;
  signature_data: string | null;
  signed_at: string | null;
};

const logoClass = (pos: LogoPosition) => {
  switch (pos) {
    case "top-right":
      return "top-10 right-12";
    case "bottom-left":
      return "bottom-12 left-12";
    case "bottom-right":
      return "bottom-12 right-12";
    default:
      return "top-10 left-12";
  }
};

const ContractPublic = () => {
  const { publicId } = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signed, setSigned] = useState(false);
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"Dibujar" | "Escribir">("Dibujar");
  const [typed, setTyped] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("contracts")
        .select("public_id, title, page_size, logo_url, logo_position, pages, signer_name, signature_data, signed_at")
        .eq("public_id", publicId ?? "")
        .maybeSingle();
      if (!alive) return;
      setContract((data as unknown as Contract) ?? null);
      setSigned(!!data?.signed_at);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [publicId]);

  useEffect(() => {
    if (contract) document.title = contract.title || "Documento";
  }, [contract]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    hasStroke.current = true;
    const { x, y } = pos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
  };

  const sign = async () => {
    if (!name.trim() || !hasStroke.current || sending) return;
    setSending(true);
    const signature = canvasRef.current?.toDataURL("image/png") ?? "";
    await supabase.functions.invoke("sign-contract", {
      body: { publicId, name: name.trim(), email: email.trim() || null, signature },
    });
    setSigned(true);
    setSending(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-100" />;
  }

  if (!contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 text-[14px] font-light text-neutral-500">
        Este documento no está disponible.
      </div>
    );
  }

  const dims = PAGE_DIMENSIONS[contract.page_size] ?? PAGE_DIMENSIONS.Carta;
  const pages = contract.pages?.length ? contract.pages : [{ id: "1", content: "" }];

  return (
    <div className="min-h-screen bg-neutral-100 py-10">
      <div className="mx-auto flex w-full max-w-[860px] flex-col items-center gap-8 px-4">
        {pages.map((p, i) => (
          <div
            key={p.id}
            className="relative w-full bg-white"
            style={{
              maxWidth: dims.width,
              aspectRatio: `${dims.width} / ${dims.height}`,
              boxShadow: "0 10px 30px -14px rgba(0,0,0,0.18)",
            }}
          >
            {contract.logo_url && (
              <img
                src={contract.logo_url}
                alt="Logotipo del documento"
                className={`absolute max-h-16 max-w-[160px] object-contain ${logoClass(contract.logo_position)}`}
              />
            )}
            <div className="h-full overflow-hidden px-12 pb-16 pt-24">
              {i === 0 && (
                <h1 className="mb-8 text-[26px] font-normal leading-tight text-neutral-900">{contract.title}</h1>
              )}
              <p className="whitespace-pre-wrap text-[13.5px] font-light leading-[1.85] text-neutral-800">
                {p.content}
              </p>
            </div>
            <div className="absolute bottom-5 left-0 right-0 text-center text-[11px] font-light text-neutral-300">
              Página {i + 1} de {pages.length}
            </div>
          </div>
        ))}

        <div className="w-full rounded-2xl bg-white p-8" style={{ maxWidth: dims.width }}>
          {signed ? (
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-normal text-neutral-900">Firmado</span>
              {contract.signature_data && (
                <img src={contract.signature_data} alt="Firma" className="h-20 w-auto object-contain" />
              )}
              <span className="text-[12px] font-light text-neutral-400">
                {contract.signer_name || name}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <span className="text-[13px] font-normal text-zinc-900">Firma del documento</span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo"
                  className="flex-1 rounded-xl bg-zinc-50 px-4 py-3 text-[13px] font-light text-zinc-900 outline-none placeholder:text-zinc-400"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="flex-1 rounded-xl bg-zinc-50 px-4 py-3 text-[13px] font-light text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>

              <div className="flex w-fit items-center gap-1 rounded-full bg-zinc-50 p-1">
                {(["Dibujar", "Escribir"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMode(t)}
                    className={`rounded-full px-4 py-1.5 text-[12px] font-light transition-colors ${
                      mode === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {mode === "Dibujar" ? (
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={160}
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerLeave={end}
                  className="w-full touch-none rounded-xl bg-zinc-50"
                />
              ) : (
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Escribe tu nombre"
                  style={{ fontFamily: "'Welth Catritz', cursive" }}
                  className="h-[160px] w-full rounded-xl bg-zinc-50 px-6 text-[34px] italic text-zinc-900 outline-none placeholder:text-[18px] placeholder:not-italic placeholder:text-zinc-300"
                />
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={sign}
                  disabled={sending}
                  className="rounded-full bg-black px-5 py-2.5 text-[13px] font-normal text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                >
                  Firmar
                </button>
                <button
                  onClick={clearSignature}
                  className="rounded-full bg-neutral-100 px-5 py-2.5 text-[13px] font-normal text-neutral-600 transition-colors hover:bg-neutral-200"
                >
                  Borrar firma
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractPublic;
