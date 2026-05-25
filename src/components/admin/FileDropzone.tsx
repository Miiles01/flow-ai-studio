import { useCallback, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onFile: (file: File) => Promise<void> | void;
  accept?: string;
  disabled?: boolean;
};

export default function FileDropzone({ onFile, accept = ".csv,.xlsx,.xls,.pdf,.txt", disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        await onFile(f);
      }
    } finally {
      setBusy(false);
    }
  }, [onFile]);

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors",
        dragging ? "border-white/40 bg-white/10" : "border-white/15 bg-white/5 hover:bg-white/[0.07]",
        (disabled || busy) && "opacity-60 pointer-events-none"
      )}
    >
      {busy ? <Loader2 className="h-6 w-6 animate-spin text-white/70" /> : <UploadCloud className="h-6 w-6 text-white/70" />}
      <div className="text-center">
        <p className="text-sm text-white font-light">{busy ? "Procesando con IA…" : "Arrastra archivos o haz click"}</p>
        <p className="text-xs text-white/50 font-light mt-1">CSV · Excel · PDF · TXT</p>
      </div>
      <input
        type="file"
        accept={accept}
        multiple
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </label>
  );
}
