import type { GraphEdge } from "./types";
import { FLAGSHIP_HOPS, FLAGSHIP_START, getEdge } from "./rarebridge.dataset";

const STATUS_COST = { observed: 0, inferred: 10, hypothesis: 25 } as const;
const CONFIDENCE_COST = { high: 0, moderate: 3, exploratory: 8 } as const;

/** Lower is better. Observed + high confidence is the best rank. */
export function evidenceRank(edge: GraphEdge) {
  return STATUS_COST[edge.evidenceStatus] + CONFIDENCE_COST[edge.confidence];
}

export function flagshipPath() {
  const hops = FLAGSHIP_HOPS.map((hop) => ({ ...hop, edge: getEdge(hop.edgeId) }));
  return {
    startId: FLAGSHIP_START,
    hops,
    summary: "Every hop on this route is observed and high confidence. The inferred disease-to-disease shortcut and the Cure SYNGAP1 hypothesis are left off the path.",
  };
}
