import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Node, Edge } from "@xyflow/react";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type PresenceUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  color: string;
  is_anon: boolean;
};

type Options = {
  flowId: string | null;
  enabled: boolean;
  identity: PresenceUser;
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  isApplyingRemoteRef: React.MutableRefObject<boolean>;
  onPresenceChange: (users: PresenceUser[]) => void;
};

const SEND_INTERVAL_MS = 120;

export function useFlowRealtime({
  flowId,
  enabled,
  identity,
  nodes,
  edges,
  setNodes,
  setEdges,
  isApplyingRemoteRef,
  onPresenceChange,
}: Options) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSentRef = useRef<number>(0);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRemoteTsRef = useRef<number>(0);
  const latestStateRef = useRef<{ nodes: Node[]; edges: Edge[] }>({ nodes, edges });
  latestStateRef.current = { nodes, edges };

  // Stable client id for tie-breaking
  const clientIdRef = useRef<string>(
    `${identity.id}-${Math.random().toString(36).slice(2, 8)}`,
  );

  // Set up channel
  useEffect(() => {
    if (!enabled || !flowId) return;

    const channel = supabase.channel(`flow:${flowId}`, {
      config: {
        broadcast: { self: false, ack: false },
        presence: { key: clientIdRef.current },
      },
    });

    channel
      .on("broadcast", { event: "state" }, (payload) => {
        const data = payload.payload as {
          nodes: Node[];
          edges: Edge[];
          ts: number;
          by: string;
        };
        if (!data || data.by === clientIdRef.current) return;
        if (data.ts <= lastRemoteTsRef.current) return;
        lastRemoteTsRef.current = data.ts;
        isApplyingRemoteRef.current = true;
        setNodes(data.nodes);
        setEdges(data.edges);
        // Reset flag on next microtask
        queueMicrotask(() => {
          isApplyingRemoteRef.current = false;
        });
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, PresenceUser[]>;
        const users: PresenceUser[] = [];
        const seen = new Set<string>();
        for (const key of Object.keys(state)) {
          for (const entry of state[key] ?? []) {
            const uid = entry.id;
            if (seen.has(uid)) continue;
            seen.add(uid);
            users.push(entry);
          }
        }
        onPresenceChange(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(identity);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack().catch(() => {});
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId, enabled]);

  // Broadcast local changes (throttled)
  useEffect(() => {
    if (!enabled || !channelRef.current) return;
    if (isApplyingRemoteRef.current) return;

    const send = () => {
      const ch = channelRef.current;
      if (!ch) return;
      const ts = Date.now();
      lastSentRef.current = ts;
      lastRemoteTsRef.current = Math.max(lastRemoteTsRef.current, ts);
      ch.send({
        type: "broadcast",
        event: "state",
        payload: {
          nodes: latestStateRef.current.nodes,
          edges: latestStateRef.current.edges,
          ts,
          by: clientIdRef.current,
        },
      });
    };

    const elapsed = Date.now() - lastSentRef.current;
    if (elapsed >= SEND_INTERVAL_MS) {
      send();
    } else {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = setTimeout(send, SEND_INTERVAL_MS - elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, enabled]);
}
