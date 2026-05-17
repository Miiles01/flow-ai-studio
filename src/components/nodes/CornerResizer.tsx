import { NodeResizer } from "@xyflow/react";

/**
 * CornerResizer — L-shaped bracket corner handles (Figma-style).
 *
 * Replaces the default square handles with sleek inward-pointing
 * L-brackets at the four corners. The border line is hidden so only
 * the corner marks are visible.
 */

const BRACKET_SIZE = 10; // px — length of each arm of the L
const THICKNESS = 2;     // px — stroke width
const COLOR = "#4059F1"; // brand blue
const OFFSET = -1;       // px — push slightly outside the node edge

// One L-bracket rendered as an inline SVG positioned at a corner.
function Bracket({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const s = BRACKET_SIZE;
  const t = THICKNESS;
  const o = OFFSET;

  // Each corner is a pair of rectangles forming an L.
  const paths: Record<string, React.ReactNode> = {
    tl: (
      <>
        {/* horizontal arm */}
        <rect x={0} y={0} width={s} height={t} fill={COLOR} />
        {/* vertical arm */}
        <rect x={0} y={0} width={t} height={s} fill={COLOR} />
      </>
    ),
    tr: (
      <>
        <rect x={0} y={0} width={s} height={t} fill={COLOR} />
        <rect x={s - t} y={0} width={t} height={s} fill={COLOR} />
      </>
    ),
    bl: (
      <>
        <rect x={0} y={s - t} width={s} height={t} fill={COLOR} />
        <rect x={0} y={0} width={t} height={s} fill={COLOR} />
      </>
    ),
    br: (
      <>
        <rect x={0} y={s - t} width={s} height={t} fill={COLOR} />
        <rect x={s - t} y={0} width={t} height={s} fill={COLOR} />
      </>
    ),
  };

  const posStyle: React.CSSProperties = {
    position: "absolute",
    width: s,
    height: s,
    pointerEvents: "none",
    ...(corner === "tl" && { top: o, left: o }),
    ...(corner === "tr" && { top: o, right: o }),
    ...(corner === "bl" && { bottom: o, left: o }),
    ...(corner === "br" && { bottom: o, right: o }),
  };

  return (
    <div style={posStyle}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
        {paths[corner]}
      </svg>
    </div>
  );
}

type CornerResizerProps = {
  isVisible: boolean;
  minWidth?: number;
  minHeight?: number;
};

export default function CornerResizer({
  isVisible,
  minWidth = 60,
  minHeight = 60,
}: CornerResizerProps) {
  return (
    <>
      {/* ReactFlow's built-in resizer — handles only, no line, no squares */}
      <NodeResizer
        isVisible={isVisible}
        minWidth={minWidth}
        minHeight={minHeight}
        lineStyle={{ border: "none" }}
        handleStyle={{
          width: 14,
          height: 14,
          background: "transparent",
          border: "none",
          borderRadius: 0,
        }}
      />

      {/* L-bracket overlays — only show when selected */}
      {isVisible && (
        <>
          <Bracket corner="tl" />
          <Bracket corner="tr" />
          <Bracket corner="bl" />
          <Bracket corner="br" />
        </>
      )}
    </>
  );
}
