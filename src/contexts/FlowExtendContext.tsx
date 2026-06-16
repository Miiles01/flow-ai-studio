import { createContext, useContext } from "react";

export type ExtendSide = "top" | "bottom" | "left" | "right";

export interface FlowExtendTarget {
  nodeId: string;
  side: ExtendSide;
}

export interface FlowExtendContextValue {
  active: FlowExtendTarget | null;
  requestExtend: (nodeId: string, side: ExtendSide) => void;
}

export const FlowExtendContext = createContext<FlowExtendContextValue>({
  active: null,
  requestExtend: () => {},
});

export const useFlowExtend = () => useContext(FlowExtendContext);
