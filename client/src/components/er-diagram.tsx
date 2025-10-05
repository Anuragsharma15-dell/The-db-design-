import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";

interface ERDiagramProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

const defaultNodes: Node[] = [
  {
    id: "1",
    type: "default",
    data: { label: "Users\n• id: UUID\n• email: String\n• name: String" },
    position: { x: 100, y: 100 },
    style: {
      background: "hsl(var(--card))",
      border: "2px solid hsl(var(--primary))",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "12px",
      fontFamily: "var(--font-mono)",
      width: 200,
    },
  },
  {
    id: "2",
    type: "default",
    data: { label: "Posts\n• id: UUID\n• userId: UUID\n• title: String\n• content: Text" },
    position: { x: 400, y: 100 },
    style: {
      background: "hsl(var(--card))",
      border: "2px solid hsl(var(--accent))",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "12px",
      fontFamily: "var(--font-mono)",
      width: 200,
    },
  },
];

const defaultEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    label: "has many",
    type: "smoothstep",
    style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    labelStyle: { fill: "hsl(var(--foreground))", fontSize: 10 },
  },
];

export function ERDiagram({ initialNodes = defaultNodes, initialEdges = defaultEdges }: ERDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-[600px] w-full rounded-2xl border border-card-border bg-background/50 backdrop-blur-xl overflow-hidden"
      data-testid="container-er-diagram"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return "hsl(var(--primary))";
          }}
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        />
      </ReactFlow>
    </motion.div>
  );
}
