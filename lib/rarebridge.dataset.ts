import type { DataSource, GraphEdge, GraphNode, PathHop } from "./types";

export const REVIEWED = "2026-10-04";

const CT = "https://clinicaltrials.gov/study/NCT06555965";
const ORPHA_STX = "https://www.orpha.net/en/disease/detail/599373";
const ORPHA_SYN = "https://www.orpha.net/en/disease/detail/544254";
const GR = "https://www.ncbi.nlm.nih.gov/books/NBK396561/";
const MONDO_STX = "https://purl.obolibrary.org/obo/MONDO_0012812";
const MONDO_SYN = "https://purl.obolibrary.org/obo/MONDO_0012960";
const HGNC_STX = "https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:11444";
const HGNC_SYN = "https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:11497";
const STARR = "https://www.stxbp1disorders.org/starr";
const CURE =
  "https://curesyngap1.org/blog/syngap-research-fund-dba-cure-syngap1-srf-announces-the-release-of-their-syngap1-impact-report-for-2024-pr34/";

const SCOPE_CAVEAT =
  "The STXBP1 Foundation STARR page says STARR is listed as NCT06555965 and describes enrollment for STXBP1-related disorders. The ClinicalTrials.gov record with that NCT ID is titled for both STXBP1 and SYNGAP1 and has two cohorts. Confirm which sites, measures, and procedures apply to each cohort before treating the framework as shared. This is not clinical equivalence and not evidence that a treatment works.";

export const DATA_SOURCES: DataSource[] = [
  { name: "ClinicalTrials.gov", id: "NCT06555965", url: CT, usedFor: "Shared observational natural-history study, cohorts, sponsor, collaborator, principal investigator, and the synaptic-transmission sentence in the detailed description." },
  { name: "Orphanet", id: "ORPHA:599373", url: ORPHA_STX, usedFor: "Disease name and phenotype for STXBP1-related developmental and epileptic encephalopathy." },
  { name: "Orphanet", id: "ORPHA:544254", url: ORPHA_SYN, usedFor: "Disease name, phenotype, and gene cause for SYNGAP1-related developmental and epileptic encephalopathy." },
  { name: "GeneReviews", id: "NBK396561", url: GR, usedFor: "STXBP1 gene–disease relationship and the developmental-delay, intellectual-disability, and epilepsy picture." },
  { name: "Mondo Disease Ontology", id: "MONDO:0012812", url: MONDO_STX, usedFor: "Cross-check that developmental and epileptic encephalopathy 4 lists STXBP1-related synonyms, including EIEE4 and DEE4." },
  { name: "Mondo Disease Ontology", id: "MONDO:0012960", url: MONDO_SYN, usedFor: "Cross-check that intellectual disability, autosomal dominant 5 lists SYNGAP1-related synonyms, including MRD5." },
  { name: "HGNC", id: "HGNC:11444", url: HGNC_STX, usedFor: "Approved symbol and name: STXBP1, syntaxin binding protein 1." },
  { name: "HGNC", id: "HGNC:11497", url: HGNC_SYN, usedFor: "Approved symbol and name: SYNGAP1, synaptic Ras GTPase activating protein 1." },
  { name: "STXBP1 Foundation", id: "STARR", url: STARR, usedFor: "STARR name, foundation role, published study contact, and funding description." },
  { name: "SynGAP Research Fund (dba Cure SYNGAP1)", id: "CURE-SYNGAP1", url: CURE, usedFor: "Patient-community organization for SYNGAP1-related disorders. Not listed as a ClinicalTrials.gov collaborator." },
];

export const nodes: GraphNode[] = [
  {
    id: "disease-stxbp1",
    label: "STXBP1-related disorder",
    graphLabel: "STXBP1-related disorder",
    type: "disease",
    searchBias: 4,
    aliases: ["stxbp1", "stxbp1 related disorder", "stxbp1-related disorder", "stxbp1 related encephalopathy", "stxbp1 encephalopathy", "stxbp1 encephalopathy with epilepsy", "eiee4", "dee4", "developmental and epileptic encephalopathy 4", "stxbp1 related developmental and epileptic encephalopathy", "orpha 599373", "orpha:599373", "mondo 0012812", "mondo:0012812"],
    summary: "Orphanet’s name for this record is STXBP1-related developmental and epileptic encephalopathy (ORPHA:599373): severe intellectual disability, developmental delay, and, in most people, early-onset epilepsy. MONDO:0012812 is developmental and epileptic encephalopathy 4, with synonyms that include STXBP1-related encephalopathy, EIEE4, and DEE4. GeneReviews uses the name STXBP1 encephalopathy with epilepsy for the condition established by a heterozygous pathogenic STXBP1 variant.",
    identifiers: [
      { label: "Orphanet", value: "ORPHA:599373", url: ORPHA_STX },
      { label: "MONDO", value: "MONDO:0012812", url: MONDO_STX },
      { label: "GeneReviews", value: "NBK396561", url: GR },
    ],
  },
  {
    id: "gene-stxbp1",
    label: "STXBP1",
    graphLabel: "STXBP1",
    type: "gene",
    searchBias: 1,
    aliases: ["stxbp1 gene", "syntaxin binding protein 1", "hgnc 11444", "hgnc:11444"],
    summary: "HGNC:11444. Approved gene name: syntaxin binding protein 1. In this atlas the gene is the observed cause of STXBP1-related disorder, not a treatment target.",
    identifiers: [{ label: "HGNC", value: "HGNC:11444", url: HGNC_STX }],
  },
  {
    id: "phenotype-dee",
    label: "Developmental delay and epilepsy",
    graphLabel: "Developmental delay and epilepsy",
    type: "phenotype",
    searchBias: 2,
    aliases: ["developmental and epileptic encephalopathy", "developmental epileptic encephalopathy", "dee", "epilepsy and developmental delay", "developmental delay and epilepsy"],
    summary: "A plain-language grouping so the two disease descriptions can be compared. It is not an HPO term, not a diagnosis, and not a claim that STXBP1-related disorder and SYNGAP1-related disorder are the same syndrome.",
    identifiers: [],
  },
  {
    id: "mechanism-synapse",
    label: "Altered synaptic transmission",
    graphLabel: "Altered synaptic transmission",
    type: "mechanism",
    aliases: ["synaptic transmission", "synapse", "synaptic", "altered synaptic transmission"],
    summary: "The NCT06555965 detailed description says both related disorders cause differences in synaptic transmission. That sentence is quoted here. It does not identify a shared molecular step, and it is not a reason to transfer a therapy.",
    identifiers: [{ label: "ClinicalTrials.gov", value: "NCT06555965", url: CT }],
  },
  {
    id: "disease-syngap1",
    label: "SYNGAP1-related disorder",
    graphLabel: "SYNGAP1-related disorder",
    type: "disease",
    searchBias: 4,
    aliases: ["syngap1", "syngap1 related disorder", "syngap1-related disorder", "syngap1 related intellectual disability", "syngap1-related intellectual disability", "mrd5", "syngap1 syndrome", "syngap1 related developmental and epileptic encephalopathy", "orpha 544254", "orpha:544254", "mondo 0012960", "mondo:0012960"],
    summary: "Orphanet describes SYNGAP1-related developmental and epileptic encephalopathy (ORPHA:544254) as a rare genetic developmental and epileptic encephalopathy with developmental delay, generalized epilepsy (including eyelid myoclonia with absences and myoclonic-atonic seizures), intellectual disability, and autism spectrum disorder. MONDO:0012960 is intellectual disability, autosomal dominant 5, and lists SYNGAP1-related developmental and epileptic encephalopathy and MRD5 as synonyms.",
    identifiers: [
      { label: "Orphanet", value: "ORPHA:544254", url: ORPHA_SYN },
      { label: "MONDO", value: "MONDO:0012960", url: MONDO_SYN },
    ],
  },
  {
    id: "gene-syngap1",
    label: "SYNGAP1",
    graphLabel: "SYNGAP1",
    type: "gene",
    searchBias: 1,
    aliases: ["syngap1 gene", "synaptic ras gtpase activating protein 1", "hgnc 11497", "hgnc:11497"],
    summary: "HGNC:11497. Approved gene name: synaptic Ras GTPase activating protein 1. Orphanet attributes the disorder to heterozygous pathogenic SYNGAP1 variants or to 6p21.32 microdeletions that include the gene.",
    identifiers: [{ label: "HGNC", value: "HGNC:11497", url: HGNC_SYN }],
  },
  {
    id: "asset-nct",
    label: "NCT06555965 — STXBP1 and SYNGAP1 Related Disorders Natural History Study",
    graphLabel: "NCT06555965",
    type: "asset",
    searchBias: 3,
    aliases: ["nct06555965", "nct 06555965", "starr", "starr study", "natural history study", "stxbp1 and syngap1 related disorders natural history study"],
    summary: "Observational, prospective, non-interventional cohort study sponsored by Children’s Hospital of Philadelphia. Record reviewed 4 October 2026: recruiting; start 30 August 2023; estimated enrollment 600. Conditions include STXBP1 Encephalopathy With Epilepsy and SYNGAP1-Related Intellectual Disability, with an STXBP1 cohort and a SYNGAP1 cohort. The stated aim is developmental, seizure, and quality-of-life assessment as an extension of routine care, to prepare for future treatment trials. There is no planned intervention. The STXBP1 Foundation calls this listing the STARR study.",
    identifiers: [
      { label: "ClinicalTrials.gov", value: "NCT06555965", url: CT },
      { label: "STARR page", value: "STXBP1 Foundation", url: STARR },
    ],
  },
  {
    id: "org-stxbp1",
    label: "STXBP1 Foundation",
    graphLabel: "STXBP1 Foundation",
    type: "organization",
    aliases: ["stxbp1 foundation"],
    summary: "Patient-community organization listed as a collaborator on NCT06555965. Its STARR page says the study is funded by the Foundation through the FLOURISH campaign and by the ENDD Center at Penn Medicine and Children’s Hospital of Philadelphia. Published contact for study questions: RESEARCH@STXBP1DISORDERS.ORG. The CHOP site contact published on that page is ENDD@CHOP.EDU.",
    identifiers: [
      { label: "STARR", value: "stxbp1disorders.org/starr", url: STARR },
      { label: "ClinicalTrials.gov", value: "NCT06555965", url: CT },
    ],
  },
  {
    id: "org-syngap1",
    label: "Cure SYNGAP1",
    graphLabel: "Cure SYNGAP1",
    type: "organization",
    aliases: ["cure syngap1", "syngap research fund", "srf", "curesyngap1"],
    summary: "SynGAP Research Fund, doing business as Cure SYNGAP1, describes itself as a family-led 501(c)(3) whose mission is to improve quality of life for people with SYNGAP1-related disorders through research and the development of treatments, therapies, and support. That is the organization’s mission statement, not evidence that a treatment exists. It is not named as a collaborator on the NCT06555965 record reviewed for this demo.",
    identifiers: [{ label: "Organization", value: "CURE-SYNGAP1", url: CURE }],
  },
  {
    id: "researcher-helbig",
    label: "Ingo Helbig, MD",
    graphLabel: "Ingo Helbig, MD",
    type: "researcher",
    aliases: ["ingo helbig", "helbig", "dr ingo helbig"],
    summary: "Listed on ClinicalTrials.gov as principal investigator for NCT06555965, affiliated with Children’s Hospital of Philadelphia. The STXBP1 Foundation STARR page also names him as multi-site principal investigator. A study role is not medical advice and is not an open invitation for individual clinical questions.",
    identifiers: [{ label: "ClinicalTrials.gov", value: "NCT06555965", url: CT }],
  },
];

export const edges: GraphEdge[] = [
  {
    id: "e-stx-gene",
    source: "disease-stxbp1",
    target: "gene-stxbp1",
    relationshipType: "Caused by pathogenic variants in",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "GeneReviews — STXBP1 Encephalopathy with Epilepsy",
    sourceId: "NBK396561",
    sourceUrl: GR,
    explanation: "GeneReviews states that the diagnosis is established in a person with suggestive findings and a heterozygous pathogenic or likely pathogenic variant in STXBP1. This atlas maps that GeneReviews name onto the STXBP1-related disorder node.",
    contradiction: "GeneReviews says clinical features alone are not enough to make the diagnosis. A variant of uncertain significance does not establish it. This edge is not a statement about any individual.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-gene-pheno",
    source: "gene-stxbp1",
    target: "phenotype-dee",
    relationshipType: "Associated with this phenotypic picture",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "GeneReviews — STXBP1 Encephalopathy with Epilepsy",
    sourceId: "NBK396561",
    sourceUrl: GR,
    explanation: "GeneReviews characterizes STXBP1 encephalopathy with epilepsy by early-onset developmental delay, intellectual disability or cognitive dysfunction, and epilepsy. The phenotype node is only a grouping label.",
    contradiction: "Orphanet describes early-onset epilepsy in the majority of cases, not in every person, and lists a broad seizure spectrum. Age of onset and seizure type vary. Sharing this label with another disease is not clinical equivalence.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-pheno-syngap",
    source: "phenotype-dee",
    target: "disease-syngap1",
    relationshipType: "Also part of the described phenotype",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "Orphanet",
    sourceId: "ORPHA:544254",
    sourceUrl: ORPHA_SYN,
    explanation: "Orphanet describes SYNGAP1-related developmental and epileptic encephalopathy as a rare genetic developmental and epileptic encephalopathy with developmental delay and generalized epilepsy, plus intellectual disability and autism spectrum disorder.",
    contradiction: "The seizure pattern named by Orphanet for SYNGAP1 (eyelid myoclonia with absences and myoclonic-atonic seizures) is not the pattern GeneReviews emphasizes for STXBP1. Overlap of broad features is not a shared syndrome and not a shared treatment.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-syngap-gene",
    source: "disease-syngap1",
    target: "gene-syngap1",
    relationshipType: "Caused by pathogenic variants in",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "Orphanet",
    sourceId: "ORPHA:544254",
    sourceUrl: ORPHA_SYN,
    explanation: "The Orphanet disease page states that this disorder is caused by heterozygous pathogenic SYNGAP1 variants or by chromosome 6p21.32 microdeletions that include SYNGAP1. The gene’s approved name is HGNC:11497.",
    contradiction: "The cause includes both sequence variants and some microdeletions. This edge does not interpret any specific variant.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-syngap-asset",
    source: "disease-syngap1",
    target: "asset-nct",
    relationshipType: "Listed cohort in this observational study",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "ClinicalTrials.gov",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "The record lists the condition SYNGAP1-Related Intellectual Disability and an arm group labeled SYNGAP1 cohort. The study is observational. Its primary objective is to outline the clinical spectrum of STXBP1 and SYNGAP1 through developmental, seizure, and quality-of-life assessments. There is no planned intervention.",
    contradiction: SCOPE_CAVEAT,
    lastReviewed: REVIEWED,
  },
  {
    id: "e-stx-asset",
    source: "disease-stxbp1",
    target: "asset-nct",
    relationshipType: "Listed cohort in this observational study",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "ClinicalTrials.gov",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "The record lists the condition STXBP1 Encephalopathy With Epilepsy and an arm group labeled STXBP1 cohort. Lead sponsor: Children’s Hospital of Philadelphia. The STXBP1 Foundation identifies this NCT ID as the STARR study. Estimated enrollment is 600; that figure is an estimate, not a count of people enrolled.",
    contradiction: SCOPE_CAVEAT,
    lastReviewed: REVIEWED,
  },
  {
    id: "e-asset-org",
    source: "asset-nct",
    target: "org-stxbp1",
    relationshipType: "Lists as collaborator",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "ClinicalTrials.gov",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "The sponsor and collaborators module lists the STXBP1 Foundation as a collaborator. Children’s Hospital of Philadelphia is the lead sponsor. The Foundation’s own STARR page is a separate description of its role, including a funding statement.",
    contradiction: "Collaborator status does not say which measures, documents, or coordination practices another organization may reuse. Confirm that with the study team.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-stx-mechanism",
    source: "disease-stxbp1",
    target: "mechanism-synapse",
    relationshipType: "Study record attributes differences in synaptic transmission",
    evidenceStatus: "observed",
    confidence: "moderate",
    sourceName: "ClinicalTrials.gov detailed description",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "The detailed description says STXBP1 and SYNGAP1 related disorders are genetic disorders that cause differences in the synaptic transmission of the brain. This edge cites that sentence only.",
    contradiction: "A protocol overview is not a comparative molecular review. It does not say the two genes act at the same synaptic step, and it is not a reason to use one disease’s intervention in the other.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-syngap-mechanism",
    source: "disease-syngap1",
    target: "mechanism-synapse",
    relationshipType: "Study record attributes differences in synaptic transmission",
    evidenceStatus: "observed",
    confidence: "moderate",
    sourceName: "ClinicalTrials.gov detailed description",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "The same detailed description attributes differences in synaptic transmission to SYNGAP1-related disorders as well as STXBP1-related disorders.",
    contradiction: "Do not read the shared sentence as proof of one mechanism or of therapeutic interchangeability.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-neighbor",
    source: "disease-stxbp1",
    target: "disease-syngap1",
    relationshipType: "Research-coordination neighbor",
    evidenceStatus: "inferred",
    confidence: "moderate",
    sourceName: "RareBridge interpretation of ClinicalTrials.gov",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "Both disorders are separate cohorts in one observational natural-history study. RareBridge infers a research-coordination relationship from that co-listing. The study record does not declare the diseases equivalent. The cohort edges are observed; this direct link is the interpretation.",
    contradiction: "This is not biological identity, clinical equivalence, or a treatment bridge. The pathfinder uses the observed hop-by-hop route instead of this shortcut.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-org-syngap",
    source: "org-syngap1",
    target: "disease-syngap1",
    relationshipType: "Patient community for",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "SynGAP Research Fund (dba Cure SYNGAP1)",
    sourceId: "CURE-SYNGAP1",
    sourceUrl: CURE,
    explanation: "The organization’s 2024 impact announcement describes a family-led 501(c)(3), doing business as Cure SYNGAP1, focused on SYNGAP1-related disorders.",
    contradiction: "No contradiction about the organization’s existence was captured. This edge does not put the organization on NCT06555965.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-hypothesis",
    source: "org-syngap1",
    target: "asset-nct",
    relationshipType: "Possible coordination counterpart to validate",
    evidenceStatus: "hypothesis",
    confidence: "exploratory",
    sourceName: "ClinicalTrials.gov collaborator list, reviewed for absence",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "Cure SYNGAP1 is a patient community for one condition named in the study. It is a hypothesis — not a finding — that they are a coordination counterpart. The collaborator list reviewed on 4 October 2026 names the STXBP1 Foundation and does not name Cure SYNGAP1.",
    contradiction: "Do not introduce Cure SYNGAP1 as a study partner. The NCT ID on this edge documents the negative check, not a claimed affiliation.",
    lastReviewed: REVIEWED,
  },
  {
    id: "e-pi",
    source: "researcher-helbig",
    target: "asset-nct",
    relationshipType: "Principal investigator",
    evidenceStatus: "observed",
    confidence: "high",
    sourceName: "ClinicalTrials.gov",
    sourceId: "NCT06555965",
    sourceUrl: CT,
    explanation: "Ingo Helbig, MD, Children’s Hospital of Philadelphia, is listed as principal investigator. The STARR page also names him as multi-site principal investigator.",
    contradiction: "A role listing is not a statement of availability, and it is not medical advice for any person.",
    lastReviewed: REVIEWED,
  },
];

export const FLAGSHIP_START = "disease-stxbp1";

export const FLAGSHIP_HOPS: PathHop[] = [
  {
    edgeId: "e-stx-gene",
    nodeId: "gene-stxbp1",
    explanation: "GeneReviews ties STXBP1-related disorder to a heterozygous pathogenic variant in the STXBP1 gene.",
  },
  {
    edgeId: "e-gene-pheno",
    nodeId: "phenotype-dee",
    explanation: "The same source describes developmental delay, intellectual disability, and epilepsy — a phenotypic context, not a diagnosis.",
  },
  {
    edgeId: "e-pheno-syngap",
    nodeId: "disease-syngap1",
    explanation: "Orphanet describes SYNGAP1-related disorder with developmental delay and epilepsy, and with a different seizure pattern.",
  },
  {
    edgeId: "e-syngap-asset",
    nodeId: "asset-nct",
    explanation: "ClinicalTrials.gov places a SYNGAP1 cohort in NCT06555965, a non-interventional natural-history study.",
  },
  {
    edgeId: "e-asset-org",
    nodeId: "org-stxbp1",
    explanation: "That record lists the STXBP1 Foundation as a collaborator already attached to the study.",
  },
];

export const PATH_NODE_IDS = [FLAGSHIP_START, ...FLAGSHIP_HOPS.map((hop) => hop.nodeId)];

const ALLOWED_SOURCE_IDS = new Set(DATA_SOURCES.map((source) => source.id));
const ALLOWED_URLS = new Set(DATA_SOURCES.map((source) => source.url));

function assertDataset() {
  const problems: string[] = [];
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) problems.push(`Duplicate node ${node.id}`);
    nodeIds.add(node.id);
    if (!node.summary.trim()) problems.push(`Empty summary ${node.id}`);
  }
  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) problems.push(`Duplicate edge ${edge.id}`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) problems.push(`Dangling edge ${edge.id}`);
    if (!ALLOWED_SOURCE_IDS.has(edge.sourceId)) problems.push(`Unknown source id ${edge.sourceId}`);
    if (!ALLOWED_URLS.has(edge.sourceUrl)) problems.push(`Unknown source url ${edge.sourceUrl}`);
    if (!edge.explanation.trim() || !edge.relationshipType.trim()) problems.push(`Incomplete edge ${edge.id}`);
    if (/PMID\s*:?\s*\d+/i.test(`${edge.explanation} ${edge.sourceId}`)) problems.push(`PMID on ${edge.id}`);
  }
  for (const hop of FLAGSHIP_HOPS) {
    const edge = edges.find((item) => item.id === hop.edgeId);
    if (!edge) problems.push(`Missing hop ${hop.edgeId}`);
    else if (edge.evidenceStatus !== "observed" || edge.confidence !== "high") problems.push(`Flagship hop ${hop.edgeId} is not observed/high`);
    if (edge && edge.target !== hop.nodeId && edge.source !== hop.nodeId) problems.push(`Hop ${hop.edgeId} misses ${hop.nodeId}`);
  }
  if (!nodes.some((node) => node.graphLabel.includes("NCT06555965"))) problems.push("Missing flagship asset");
  if (problems.length) throw new Error(problems.join("\n"));
}

assertDataset();

const nodeMap = new Map(nodes.map((node) => [node.id, node]));
const edgeMap = new Map(edges.map((edge) => [edge.id, edge]));

export function getNode(id: string) {
  const node = nodeMap.get(id);
  if (!node) throw new Error(`Missing node ${id}`);
  return node;
}

export function getEdge(id: string) {
  const edge = edgeMap.get(id);
  if (!edge) throw new Error(`Missing edge ${id}`);
  return edge;
}

export function edgesFor(nodeId: string) {
  return edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
}
