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
        className="bg-white"
      >
        <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#E5E7EB" />
        <Controls position="bottom-left" showInteractive={false} />

        <Panel position="top-left">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-6 px-6 py-4 rounded-full bg-white shadow-sm font-sans"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white">
                <Workflow size={20} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-normal text-black tracking-tighter leading-none">Miiles</h1>
                <p className="text-[10px] font-light text-miiles-gray-400 uppercase tracking-widest mt-1">Flow Studio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-miiles-gray-50">
              <Layers size={14} className="text-miiles-gray-400" />
              <span className="text-xs font-light text-miiles-gray-800">{nodes.length} nodos</span>
            </div>

            <div className="flex items-center gap-3 ml-2">
              <button
                onClick={() => navigate("/profile")}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-miiles-gray-50 text-miiles-gray-400 hover:text-black transition-all btn-hover-float"
                title="Perfil"
              >
                <User size={18} />
              </button>
              <button
                onClick={handleSignOut}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-miiles-pink-light text-miiles-gray-400 hover:text-miiles-pink transition-all btn-hover-float"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
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
