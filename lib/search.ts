import { getNode, nodes } from "./rarebridge.dataset";

export interface SearchHit {
  nodeId: string;
  score: number;
  matchedAlias: string;
  reconciled: boolean;
}

export function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreAlias(query: string, alias: string) {
  if (!query || !alias) return 0;
  if (query === alias) return 100;
  const shorter = Math.min(query.length, alias.length);
  if (shorter < 4) return 0;
  if (alias.startsWith(query) || query.startsWith(alias)) return 70 + shorter;
  if (alias.includes(query) && query.length >= 4) return 60 + query.length;
  const tokens = query.split(" ").filter((token) => token.length > 2);
  if (!tokens.length) return 0;
  const aliasTokens = new Set(alias.split(" "));
  const hits = tokens.filter((token) => aliasTokens.has(token)).length;
  if (!hits) return 0;
  return (hits / tokens.length) * 40;
}

export function searchNodes(raw: string): SearchHit[] {
  const query = normalize(raw);
  if (query.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const node of nodes) {
    const candidates = [node.label, node.graphLabel, ...node.aliases];
    let best = 0;
    let matched = node.label;
    for (const candidate of candidates) {
      const score = scoreAlias(query, normalize(candidate));
      if (score > best) {
        best = score;
        matched = candidate;
      }
    }
    if (best >= 50) {
      const canonical = normalize(node.label);
      hits.push({
        nodeId: node.id,
        score: best + (node.searchBias ?? 0),
        matchedAlias: matched,
        reconciled: normalize(matched) !== canonical && query !== canonical,
      });
    }
  }
  hits.sort((a, b) => b.score - a.score || a.nodeId.localeCompare(b.nodeId));
  return hits;
}

export function resolveQuery(raw: string) {
  return searchNodes(raw)[0] ?? null;
}

export function assertDemoSearch() {
  const cases: Array<[string, string]> = [
    ["STXBP1-related disorder", "disease-stxbp1"],
    ["STXBP1", "disease-stxbp1"],
    ["SYNGAP1", "disease-syngap1"],
    ["SYNGAP1-related disorder", "disease-syngap1"],
    ["developmental epileptic encephalopathy", "phenotype-dee"],
    ["synaptic transmission", "mechanism-synapse"],
    ["NCT06555965", "asset-nct"],
    ["EIEE4", "disease-stxbp1"],
    ["MRD5", "disease-syngap1"],
    ["STARR", "asset-nct"],
    ["STXBP1 gene", "gene-stxbp1"],
  ];
  for (const [query, nodeId] of cases) {
    const hit = resolveQuery(query);
    if (!hit || hit.nodeId !== nodeId) {
      throw new Error(`Search failed for "${query}": ${hit?.nodeId ?? "none"}`);
    }
  }
  if (resolveQuery("zzzz-not-a-disease")) {
    throw new Error("Unknown query should miss");
  }
  void getNode("disease-stxbp1");
}

assertDemoSearch();
