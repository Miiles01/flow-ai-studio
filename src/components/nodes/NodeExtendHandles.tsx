import { useState } from "react";
import { useViewport } from "@xyflow/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useFlowExtend, type ExtendSide } from "@/contexts/FlowExtendContext";
import estrellaIcon from "@/assets/miiles/Estrella.svg";

const SIDES: ExtendSide[] = ["top", "bottom", "left", "right"];
const ZONE = 38; // px catch area outside the node border

const NodeExtendHandles = ({ nodeId }: { nodeId: string }) => {
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const { active, requestExtend } = useFlowExtend();
  const [hovered, setHovered] = useState<ExtendSide | null>(null);

  const scale = 1 / zoom;

  return (
    <>
      {SIDES.map((side) => {
        const isActive = active?.nodeId === nodeId && active?.side === side;
        const show = hovered === side || isActive;

        const zoneStyle: React.CSSProperties = { position: "absolute", zIndex: 30, display: "flex" };
        if (side === "top") Object.assign(zoneStyle, { top: -ZONE, left: 0, right: 0, height: ZONE, alignItems: "flex-start", justifyContent: "center" });
        if (side === "bottom") Object.assign(zoneStyle, { bottom: -ZONE, left: 0, right: 0, height: ZONE, alignItems: "flex-end", justifyContent: "center" });
        if (side === "left") Object.assign(zoneStyle, { left: -ZONE, top: 0, bottom: 0, width: ZONE, alignItems: "center", justifyContent: "flex-start" });
        if (side === "right") Object.assign(zoneStyle, { right: -ZONE, top: 0, bottom: 0, width: ZONE, alignItems: "center", justifyContent: "flex-end" });

        const transformOrigin =
          side === "top" ? "top center" :
          side === "bottom" ? "bottom center" :
          side === "left" ? "center left" : "center right";

        return (
          <div
            key={side}
            className="nodrag nopan"
            style={zoneStyle}
            onMouseEnter={() => setHovered(side)}
            onMouseLeave={() => setHovered((h) => (h === side ? null : h))}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {show && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  requestExtend(nodeId, side);
                }}
                style={{ transform: `scale(${scale})`, transformOrigin }}
                className={`flex items-center justify-center w-7 h-7 rounded-lg shadow-md transition-colors ${
                  isActive
                    ? "bg-[#4059F1] ring-2 ring-[#4059F1]/30"
                    : isDark
                      ? "bg-[#1C1C1E] border border-white/10 hover:bg-white/10"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                title="Ampliar con IA desde aquí"
              >
                <img
                  src={estrellaIcon}
                  alt=""
                  className="w-3.5 h-3.5"
                  style={{ filter: isActive || isDark ? "invert(1)" : "none" }}
                />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};

export default NodeExtendHandles;
