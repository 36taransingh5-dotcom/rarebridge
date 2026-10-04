"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edges, getNode, nodes, PATH_NODE_IDS, FLAGSHIP_HOPS } from "@/lib/rarebridge.dataset";
import type { EvidenceStatus, NodeType } from "@/lib/types";

const TYPE_META: Record<NodeType, { label: string; bar: string; text: string }> = {
  disease: { label: "Disease", bar: "bg-[#2c3a86]", text: "text-[#2c3a86]" },
  gene: { label: "Gene", bar: "bg-[#0f6e6b]", text: "text-[#0f6e6b]" },
  phenotype: { label: "Phenotype", bar: "bg-[#8a5a12]", text: "text-[#8a5a12]" },
  mechanism: { label: "Mechanism", bar: "bg-[#5b4b8a]", text: "text-[#5b4b8a]" },
  study: { label: "Study", bar: "bg-[#1d4e89]", text: "text-[#1d4e89]" },
  asset: { label: "Research asset", bar: "bg-[#1d4e89]", text: "text-[#1d4e89]" },
  organization: { label: "Organization", bar: "bg-[#8d3d55]", text: "text-[#8d3d55]" },
  researcher: { label: "Researcher", bar: "bg-[#3d4a44]", text: "text-[#3d4a44]" },
};

const STATUS_STROKE: Record<EvidenceStatus, string> = {
  observed: "#1f6b4a",
  inferred: "#9a6b12",
  hypothesis: "#8d3d55",
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  "disease-stxbp1": { x: 0, y: 20 },
  "gene-stxbp1": { x: 240, y: 20 },
  "phenotype-dee": { x: 480, y: 20 },
  "disease-syngap1": { x: 720, y: 20 },
  "asset-nct": { x: 960, y: 20 },
  "mechanism-synapse": { x: 240, y: 230 },
  "gene-syngap1": { x: 720, y: 230 },
  "researcher-helbig": { x: 960, y: 230 },
  "org-stxbp1": { x: 960, y: 430 },
  "org-syngap1": { x: 720, y: 430 },
};

type FlowData = {
  graphLabel: string;
  nodeType: NodeType;
  dimmed: boolean;
  onPath: boolean;
  focused: boolean;
};

type FlowNode = Node<FlowData, "entity">;

function EntityNode({ data, selected }: NodeProps<FlowNode>) {
  const meta = TYPE_META[data.nodeType];
  return (
    <div
      className={`w-[200px] rounded-2xl border bg-[#fffcf8] px-3 py-2.5 shadow-[0_10px_30px_rgba(40,32,16,0.06)] transition ${
        data.dimmed ? "opacity-25" : "opacity-100"
      } ${data.onPath ? "border-[#2c3a86] ring-2 ring-[#2c3a86]/30" : "border-[#e4ddd2]"} ${
        selected || data.focused ? "ring-2 ring-[#2c3a86]" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-transparent" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-transparent" />
      <Handle type="source" position={Position.Bottom} id="b" className="!h-2 !w-2 !border-0 !bg-transparent" />
      <Handle type="target" position={Position.Top} id="t" className="!h-2 !w-2 !border-0 !bg-transparent" />
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${meta.bar}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.text}`}>{meta.label}</span>
      </div>
      <div className="mt-1 text-[13.5px] font-semibold leading-snug text-[#1c1915]">{data.graphLabel}</div>
    </div>
  );
}

const nodeTypes = { entity: EntityNode };

function nodeRevealed(id: string, pathStep: number) {
  const index = PATH_NODE_IDS.indexOf(id);
  return index >= 0 && index <= pathStep + 1;
}

export default function EvidenceGraph({
  focusId,
  selectedNodeId,
  selectedEdgeId,
  pathStep,
  onNodeClick,
  onEdgeClick,
}: {
  focusId: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  pathStep: number;
  onNodeClick: (id: string) => void;
  onEdgeClick: (id: string) => void;
}) {
  const flowNodes = useMemo<FlowNode[]>(() => {
    return nodes.map((node) => {
      const onPath = pathStep >= 0 && nodeRevealed(node.id, pathStep);
      const dimmed = pathStep >= 0 && !onPath;
      return {
        id: node.id,
        type: "entity",
        position: POSITIONS[node.id] ?? { x: 0, y: 0 },
        data: {
          graphLabel: node.graphLabel,
          nodeType: node.type,
          dimmed,
          onPath,
          focused: focusId === node.id,
        },
        selected: selectedNodeId === node.id,
        draggable: false,
      };
    });
  }, [focusId, pathStep, selectedNodeId]);

  const flowEdges = useMemo<Edge[]>(() => {
    return edges.map((edge) => {
      const hopIndex = FLAGSHIP_HOPS.findIndex((hop) => hop.edgeId === edge.id);
      const onPath = pathStep >= 0 && hopIndex >= 0 && hopIndex <= pathStep;
      const dimmed = pathStep >= 0 && !onPath;
      const selected = selectedEdgeId === edge.id;
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        interactionWidth: 24,
        animated: onPath && hopIndex === Math.min(pathStep, FLAGSHIP_HOPS.length - 1),
        label: selected ? edge.evidenceStatus.toUpperCase() : undefined,
        style: {
          stroke: STATUS_STROKE[edge.evidenceStatus],
          strokeWidth: selected || onPath ? 2.8 : 1.6,
          opacity: dimmed ? 0.12 : 1,
          strokeDasharray: edge.evidenceStatus === "observed" ? undefined : edge.evidenceStatus === "inferred" ? "7 5" : "1.5 4",
        },
        labelStyle: { fontSize: 10, fontWeight: 700, fill: STATUS_STROKE[edge.evidenceStatus] },
      };
    });
  }, [pathStep, selectedEdgeId]);

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      colorMode="light"
      fitView
      fitViewOptions={{ padding: 0.12 }}
      minZoom={0.35}
      maxZoom={1.5}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      proOptions={{ hideAttribution: true }}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      onEdgeClick={(_, edge) => onEdgeClick(edge.id)}
    >
      <Background gap={22} size={1.1} color="#e4ddd2" />
      <Controls showInteractive={false} />
      <span className="sr-only">{getNode(focusId ?? "disease-stxbp1").label}</span>
    </ReactFlow>
  );
}
