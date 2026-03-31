import { useCallback, useState, useRef } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type Node,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { Workflow, Layers } from "lucide-react";

import FlowNode from "@/components/nodes/FlowNode";
import Toolbar from "@/components/Toolbar";
import AIPromptBar from "@/components/AIPromptBar";
import { generateFlowFromPrompt } from "@/lib/generateFlow";

const nodeTypes = { flowNode: FlowNode };

const initialNodes: Node[] = [];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const nodeCounter = useRef(0);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(
    (type: string) => {
      nodeCounter.current += 1;
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "flowNode",
        position: {
          x: 250 + Math.random() * 300,
          y: 150 + nodeCounter.current * 80,
        },
        data: {
          label: `Nuevo nodo ${nodeCounter.current}`,
          type,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleAIGenerate = useCallback(
    async (prompt: string) => {
      setIsGenerating(true);
      // Simulate a small delay for UX
      await new Promise((r) => setTimeout(r, 800));
      const { nodes: newNodes, edges: newEdges } = generateFlowFromPrompt(prompt);
      setNodes((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);
      setIsGenerating(false);
    },
    [setNodes, setEdges]
  );

  return (
    <div className="w-screen h-screen bg-background overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="hsl(240 8% 14%)"
        />
        <Controls
          position="bottom-left"
          showInteractive={false}
        />

        <Panel position="top-left">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/40"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Workflow size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">FlowCraft</h1>
              <p className="text-[10px] text-muted-foreground">Diagramas con IA</p>
            </div>
            <div className="ml-4 flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary">
              <Layers size={12} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-mono">
                {nodes.length} nodos
              </span>
            </div>
          </motion.div>
        </Panel>
      </ReactFlow>

      <Toolbar onAddNode={handleAddNode} />
      <AIPromptBar onGenerate={handleAIGenerate} isGenerating={isGenerating} />
    </div>
  );
};

export default Index;
