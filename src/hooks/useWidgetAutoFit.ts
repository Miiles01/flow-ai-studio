import { useEffect, type RefObject } from "react";
import { useReactFlow } from "@xyflow/react";

/**
 * Adjusts a widget node's height so the natural content fits after an AI edit
 * (or any external data change tracked by `nonce`). Uses the scroll container's
 * scrollHeight — which reflects the full natural content even when clipped —
 * plus the surrounding chrome (header/footer) height, so nothing gets cut and
 * no big empty space is left after the AI removes cards/campaigns.
 *
 * - Triggered only when `nonce` changes (opt-in per edit, not on every render).
 * - Does not touch width.
 * - Clamps with `minHeight` and `maxHeight`.
 */
export function useWidgetAutoFit(
  id: string,
  nonce: unknown,
  scrollRef: RefObject<HTMLElement | null>,
  outerRef: RefObject<HTMLElement | null>,
  opts: { minHeight?: number; maxHeight?: number } = {}
) {
  const { setNodes } = useReactFlow();
  const { minHeight = 200, maxHeight = 2400 } = opts;

  useEffect(() => {
    if (nonce === undefined || nonce === null) return;
    const scrollEl = scrollRef.current;
    const outerEl = outerRef.current;
    if (!scrollEl || !outerEl) return;

    // Wait two frames so the new data has painted and layout is settled.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const chrome = Math.max(0, outerEl.clientHeight - scrollEl.clientHeight);
        const natural = scrollEl.scrollHeight;
        const needed = Math.min(maxHeight, Math.max(minHeight, natural + chrome + 8));
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== id) return n;
            const curH = parseFloat(
              String((n.style as any)?.height ?? (n.measured as any)?.height ?? 0)
            );
            if (Math.abs(curH - needed) < 6) return n;
            return { ...n, style: { ...(n.style ?? {}), height: needed } };
          })
        );
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [id, nonce, scrollRef, outerRef, minHeight, maxHeight, setNodes]);
}
