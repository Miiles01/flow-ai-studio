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
  type Edge,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { Workflow, Layers, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import FlowNode from "@/components/nodes/FlowNode";
import Toolbar from "@/components/Toolbar";
import AIPromptBar from "@/components/AIPromptBar";
import FlowSidebar from "@/components/FlowSidebar";
import { generateFlowFromPrompt } from "@/lib/generateFlow";

const nodeTypes = { flowNode: FlowNode };

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const nodeCounter = useRef(0);
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
        data: { label: `Nuevo nodo ${nodeCounter.current}`, type },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleAIGenerate = useCallback(
    async (prompt: string) => {
      setIsGenerating(true);
      try {
        const { nodes: newNodes, edges: newEdges } = await generateFlowFromPrompt(prompt);
        setNodes((prev) => [...prev, ...newNodes]);
        setEdges((prev) => [...prev, ...newEdges]);
        toast.success(`Diagrama generado con ${newNodes.length} nodos`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        toast.error(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [setNodes, setEdges]
  );

  const handleLoadFlow = useCallback(
    (loadedNodes: Node[], loadedEdges: Edge[]) => {
      setNodes(loadedNodes);
      setEdges(loadedEdges);
    },
    [setNodes, setEdges]
  );

  const handleNewFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    nodeCounter.current = 0;
  }, [setNodes, setEdges]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="w-screen h-screen bg-background overflow-hidden relative">
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
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(240 8% 14%)" />
        <Controls position="bottom-left" showInteractive={false} />

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
            <div className="ml-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary">
              <Layers size={12} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-mono">{nodes.length} nodos</span>
            </div>
            <div className="ml-2 flex items-center gap-1">
              <button
                onClick={() => navigate("/profile")}
                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Perfil"
              >
                <User size={14} />
              </button>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          </motion.div>
        </Panel>
      </ReactFlow>

      <Toolbar onAddNode={handleAddNode} />
      <AIPromptBar onGenerate={handleAIGenerate} isGenerating={isGenerating} />
      <FlowSidebar
        currentNodes={nodes}
        currentEdges={edges}
        onLoadFlow={handleLoadFlow}
        onNewFlow={handleNewFlow}
      />
    </div>
  );
};

export default Index;
