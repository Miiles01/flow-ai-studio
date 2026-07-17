import { useReactFlow } from "@xyflow/react";
import WidgetCommentBadge from "@/components/nodes/WidgetCommentBadge";
import type { WidgetAIComment } from "@/lib/widgetAI";

type Props = { nodeId: string };

const WidgetCommentSlot = ({ nodeId }: Props) => {
  const { getNode, setNodes } = useReactFlow();
  const node = getNode(nodeId);
  const comments = ((node?.data as any)?.aiComments as WidgetAIComment[] | undefined) ?? [];

  return (
    <WidgetCommentBadge
      comments={comments}
      onChange={(next) => {
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, data: { ...(n.data as any), aiComments: next } } : n))
        );
      }}
    />
  );
};

export default WidgetCommentSlot;
