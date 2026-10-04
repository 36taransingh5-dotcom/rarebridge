export type NodeType =
  | "disease"
  | "gene"
  | "mechanism"
  | "phenotype"
  | "study"
  | "asset"
  | "organization"
  | "researcher";

export type EvidenceStatus = "observed" | "inferred" | "hypothesis";
export type Confidence = "high" | "moderate" | "exploratory";

export interface Identifier {
  label: string;
  value: string;
  url?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  graphLabel: string;
  type: NodeType;
  aliases: string[];
  summary: string;
  identifiers: Identifier[];
  searchBias?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: string;
  evidenceStatus: EvidenceStatus;
  confidence: Confidence;
  sourceName: string;
  sourceId: string;
  sourceUrl: string;
  explanation: string;
  contradiction?: string;
  lastReviewed: string;
}

export interface PathHop {
  edgeId: string;
  nodeId: string;
  explanation: string;
}

export interface DataSource {
  name: string;
  id: string;
  url: string;
  usedFor: string;
}

export interface Brief {
  title: string;
  ourDisease: string;
  connection: string;
  sharedAsset: string;
  reusable: string[];
  needsReview: string[];
  outreachQuestion: string;
  sources: { name: string; id: string; url: string }[];
  disclaimer: string;
  generator: "openai" | "deterministic";
  reviewed: string;
}
