/**
 * Paginación automática del contrato: si el contenido de una página se pasa del
 * alto útil de la hoja, las líneas sobrantes se mueven a la siguiente página
 * (creándola si hace falta) para que nunca se vea amontonado ni cortado.
 */
import { uid, type ContractPage } from "@/lib/contracts";

/** Alto útil del área de texto de una hoja (px-12 / pt-24 / pb-16 y el título en la primera). */
export function usableHeight(pageHeight: number, isFirst: boolean) {
  return pageHeight - 96 - 64 - (isFirst ? 66 : 0);
}

export function usableWidth(pageWidth: number) {
  return pageWidth - 96;
}

/** Mide cuántas líneas caben en el alto disponible. */
function fittingLines(lines: string[], width: number, height: number): number {
  if (typeof document === "undefined") return lines.length;
  const probe = document.createElement("div");
  probe.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "pointer-events:none",
    "left:-9999px",
    "top:0",
    `width:${width}px`,
    "font-size:13.5px",
    "line-height:1.85",
    "font-weight:300",
    "white-space:pre-wrap",
    "word-break:break-word",
  ].join(";");
  document.body.appendChild(probe);
  try {
    probe.textContent = lines.join("\n");
    if (probe.scrollHeight <= height) return lines.length;
    let fit = 0;
    for (let i = 1; i <= lines.length; i++) {
      probe.textContent = lines.slice(0, i).join("\n");
      if (probe.scrollHeight > height) break;
      fit = i;
    }
    return fit;
  } finally {
    probe.remove();
  }
}

/**
 * Reparte el contenido para que ninguna página desborde.
 * Devuelve `null` cuando no hace falta cambiar nada.
 */
export function repaginate(
  pages: ContractPage[],
  dims: { width: number; height: number }
): ContractPage[] | null {
  if (!pages.length) return null;
  const width = usableWidth(dims.width);
  const next = pages.map((p) => ({ ...p }));
  let changed = false;

  for (let i = 0; i < next.length; i++) {
    const height = usableHeight(dims.height, i === 0);
    const lines = (next[i].content ?? "").split("\n");
    const fit = fittingLines(lines, width, height);
    if (fit >= lines.length) continue;

    // Corta en un punto natural (línea en blanco) si está cerca del final.
    let cut = Math.max(fit, 1);
    for (let k = cut; k > Math.max(1, cut - 6); k--) {
      if (!lines[k - 1].trim()) {
        cut = k;
        break;
      }
    }

    const kept = lines.slice(0, cut).join("\n").replace(/\s+$/, "");
    const moved = lines.slice(cut).join("\n").replace(/^\n+/, "");
    if (!moved.trim()) continue;

    next[i] = { ...next[i], content: kept };
    if (i + 1 < next.length) {
      const rest = next[i + 1].content ?? "";
      next[i + 1] = { ...next[i + 1], content: rest.trim() ? `${moved}\n\n${rest}` : moved };
    } else {
      next.push({ id: uid(), content: moved });
    }
    changed = true;
    if (next.length > 40) break; // salvaguarda
  }

  return changed ? next : null;
}
