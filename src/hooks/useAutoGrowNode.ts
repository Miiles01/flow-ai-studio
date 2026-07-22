import { useEffect, type RefObject } from "react";
import { useReactFlow } from "@xyflow/react";

/**
 * Grows a node's height to fit its content. Never shrinks — the user can still
 * resize manually with NodeResizer. Uses ResizeObserver on the given element
 * (span/textarea/editor). `extraPadding` is added on top of the content's
 * scrollHeight to leave visual breathing room (useful for shapes where the
 * label is vertically centered inside an SVG frame).
 */
export function useAutoGrowNode(
  id: string,
  contentRef: RefObject<HTMLElement | null>,
  extraPadding = 0,
  minHeight = 0,
) {
  const { setNodes } = useReactFlow();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    let frame = 0;

    const measureAndGrow = () => {
      const el2 = contentRef.current;
      if (!el2) return;
      const contentH = Math.max(el2.scrollHeight, el2.offsetHeight);
      const needed = Math.max(minHeight, contentH + extraPadding);

      setNodes((nds) => {
        let changed = false;
        const next = nds.map((n) => {
          if (n.id !== id) return n;
          const currentH = Number((n.style as any)?.height ?? (n as any).height ?? 0);
          // Allow shrinking and growing
          if (Math.abs(needed - currentH) > 1) {
            changed = true;
            return { ...n, style: { ...(n.style ?? {}), height: needed } };
          }
          return n;
        });
        return changed ? next : nds;
      });
    };

    const handleInput = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureAndGrow);
    };

    const mo = new MutationObserver(handleInput);
    mo.observe(el, { characterData: true, childList: true, subtree: true });

    el.addEventListener("input", handleInput);

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureAndGrow);
    });
    ro.observe(el);
    measureAndGrow();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener("input", handleInput);
    };
  }, [id, contentRef, extraPadding, minHeight, setNodes]);
}
