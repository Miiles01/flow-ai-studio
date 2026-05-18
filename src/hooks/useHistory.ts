import { useCallback, useEffect, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";

type Snapshot = { nodes: Node[]; edges: Edge[] };
const MAX_HISTORY = 100;
const DEBOUNCE_MS = 350;

const clone = (s: Snapshot): Snapshot => ({
  nodes: JSON.parse(JSON.stringify(s.nodes)),
  edges: JSON.parse(JSON.stringify(s.edges)),
});

const serialize = (s: Snapshot) => {
  const n = s.nodes.map(({ selected, dragging, ...r }: any) => r);
  const e = s.edges.map(({ selected, ...r }: any) => r);
  return JSON.stringify({ n, e });
};

export function useHistory(
  nodes: Node[],
  edges: Edge[],
  setNodes: (n: Node[]) => void,
  setEdges: (e: Edge[]) => void,
  ready: boolean,
) {
  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const lastSerializedRef = useRef<string>("");
  const suspendRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);

  // Initialize baseline once data is ready
  useEffect(() => {
    if (!ready || initializedRef.current) return;
    initializedRef.current = true;
    lastSerializedRef.current = serialize({ nodes, edges });
  }, [ready, nodes, edges]);

  // Track changes
  useEffect(() => {
    if (!ready || !initializedRef.current) return;
    if (suspendRef.current) {
      // Update baseline silently after undo/redo
      lastSerializedRef.current = serialize({ nodes, edges });
      suspendRef.current = false;
      return;
    }
    const cur = serialize({ nodes, edges });
    if (cur === lastSerializedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    const prevSerialized = lastSerializedRef.current;
    timerRef.current = setTimeout(() => {
      // Snapshot the PREVIOUS state into past
      try {
        const prev = JSON.parse(prevSerialized);
        pastRef.current.push({ nodes: prev.n, edges: prev.e });
        if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
        futureRef.current = [];
        lastSerializedRef.current = serialize({ nodes, edges });
        refresh();
      } catch {
        // ignore
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodes, edges, ready]);

  const undo = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pastRef.current.length === 0) return;
    const prev = pastRef.current.pop()!;
    futureRef.current.push(clone({ nodes, edges }));
    suspendRef.current = true;
    setNodes(prev.nodes);
    setEdges(prev.edges);
    refresh();
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    pastRef.current.push(clone({ nodes, edges }));
    suspendRef.current = true;
    setNodes(next.nodes);
    setEdges(next.edges);
    refresh();
  }, [nodes, edges, setNodes, setEdges]);

  return {
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
