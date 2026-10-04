# RareBridge

RareBridge is a focused vertical slice of an evidence atlas for rare-disease research. A patient-organization leader searches one disease and gets a provenance-aware graph, a supported path to work that already exists, and a concrete next step. The demo follows Maria, who leads a community around STXBP1-related disorder, to the shared natural-history study NCT06555965 and the STXBP1 Foundation.

## The problem

Rare-disease knowledge and research infrastructure are fragmented. Relevant studies, registries, communities, and experts sit under different disease names and organizational silos. Communities can spend months discovering work they might have aligned with instead of rebuilding.

## The solution

RareBridge is an evidence graph plus a pathfinder plus an action layer. Search resolves a disease, gene, phenotype, or mechanism to a canonical node. The graph shows typed relationships. A pathfinder walks a deterministic, source-backed route to a reusable asset and a collaborator. A collaboration brief turns that route into outreach language.

## Why a graph instead of ordinary search

Ordinary search returns documents. It does not show a multi-hop relationship: this disease is caused by this gene, that gene’s phenotype overlaps a neighboring disease description, that neighbor is a cohort in an existing study, and a patient organization is already listed on the study. A graph keeps those hops separate, attaches provenance to each one, and makes observed evidence, inference, and hypothesis visually distinct.

## The STXBP1 / SYNGAP1 vertical slice

The hackathon build does not map every rare disease. It proves the architecture on one cluster where a real shared asset exists: STXBP1-related disorder and SYNGAP1-related disorder, joined by the observational study NCT06555965. One defensible cluster is enough to show search, provenance, pathfinding, and a next action without inventing the rest of the atlas.

## Architecture

- **Frontend:** Next.js, TypeScript, Tailwind CSS, React Flow for the graph, Framer Motion for the landing-to-atlas transition.
- **Graph model:** `lib/rarebridge.dataset.ts` holds nodes and edges. `lib/search.ts` resolves aliases. `lib/pathfinder.ts` ranks evidence and returns the curated flagship path.
- **Evidence model:** every edge has a relationship, status (`observed`, `inferred`, or `hypothesis`), confidence, source name, source ID, source URL, explanation, caveat, and review date.
- **OpenAI layer:** `lib/generateBrief.ts` sends a locked evidence payload to the API when `OPENAI_API_KEY` is set. The route is `POST /api/collaboration-brief`.

The graph does not change at runtime. The model may only explain the curated evidence.

## OpenAI usage

1. **Extract.** At scale, a model would propose entities and relationships from source text. In this demo, extraction is simulated by a preloaded graph reviewed on 4 October 2026.
2. **Reconcile.** Search maps aliases such as STXBP1, EIEE4, and DEE4 onto one disease node. The demo alias map is curated. The interface says so.
3. **Explain.** With an API key, OpenAI writes the collaboration brief from the payload and the result is discarded if it introduces new NCT, PMID, OMIM, Orphanet, MONDO, or HGNC identifiers. Without a key, a deterministic brief uses the same facts. The product never fails closed because a key is missing.

## Evidence integrity

- **Observed** means a cited source states the relationship.
- **Inferred** means RareBridge interpreted two observed facts into a coordination link. The disease-to-disease neighbor edge is inferred. The pathfinder does not treat it as a substitute for the observed hops.
- **Hypothesis** means a plausible question that the sources do not support. Cure SYNGAP1 is a real patient community and is not listed as a collaborator on the study record reviewed here, so the link to NCT06555965 is a hypothesis.

No edge was added to make the picture denser. The dataset does not claim that the two disorders are clinically equivalent or that any therapy works. The study record says there is no planned intervention.

## Data schema

```ts
interface GraphNode {
  id: string;
  label: string;
  type: "disease" | "gene" | "mechanism" | "phenotype" | "study" | "asset" | "organization" | "researcher";
  aliases?: string[];
  summary: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: string;
  evidenceStatus: "observed" | "inferred" | "hypothesis";
  confidence: "high" | "moderate" | "exploratory";
  sourceName: string;
  sourceId: string;
  sourceUrl: string;
  explanation: string;
  contradiction?: string;
  lastReviewed: string;
}
```

The flagship path is STXBP1-related disorder → STXBP1 → developmental delay and epilepsy → SYNGAP1-related disorder → NCT06555965 → STXBP1 Foundation. Each of those hops is observed and high confidence.

## Sources

Reviewed 4 October 2026. Identifiers below were checked against the listed records. Nothing else is cited.

- ClinicalTrials.gov [NCT06555965](https://clinicaltrials.gov/study/NCT06555965) — STXBP1 and SYNGAP1 Related Disorders Natural History Study. Children’s Hospital of Philadelphia. Collaborator: STXBP1 Foundation. Principal investigator: Ingo Helbig, MD. Observational, recruiting on the record reviewed, both cohorts, no planned intervention.
- Orphanet [ORPHA:599373](https://www.orpha.net/en/disease/detail/599373) — STXBP1-related developmental and epileptic encephalopathy.
- Orphanet [ORPHA:544254](https://www.orpha.net/en/disease/detail/544254) — SYNGAP1-related developmental and epileptic encephalopathy, including the gene cause.
- GeneReviews [NBK396561](https://www.ncbi.nlm.nih.gov/books/NBK396561/) — STXBP1 Encephalopathy with Epilepsy.
- Mondo [MONDO:0012812](https://purl.obolibrary.org/obo/MONDO_0012812) — developmental and epileptic encephalopathy, 4.
- Mondo [MONDO:0012960](https://purl.obolibrary.org/obo/MONDO_0012960) — intellectual disability, autosomal dominant 5.
- HGNC [HGNC:11444](https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:11444) — STXBP1, syntaxin binding protein 1.
- HGNC [HGNC:11497](https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:11497) — SYNGAP1, synaptic Ras GTPase activating protein 1.
- [STXBP1 Foundation STARR page](https://www.stxbp1disorders.org/starr) — STARR name, funding description, and published contacts.
- [Cure SYNGAP1 / SynGAP Research Fund](https://curesyngap1.org/blog/syngap-research-fund-dba-cure-syngap1-srf-announces-the-release-of-their-syngap1-impact-report-for-2024-pr34/) — patient-community organization. Not a listed study collaborator.

One scope caveat is shown in the product: the Foundation page describes STARR for STXBP1-related disorders and says that study is listed as NCT06555965, while the ClinicalTrials.gov record includes a SYNGAP1 cohort. The atlas does not hide that difference.

## 10× hypothesis

The baseline is manual coordination discovery: finding adjacent communities, researchers, patient organizations, studies, and existing infrastructure before anyone can write a useful outreach note. That fragmented pass is modeled here as about ten weeks. A preconnected evidence graph can compress the discovery and outreach-prep step to under a week. That is a 10× coordination hypothesis, not a claim that treatment development becomes 10× faster, and it has to be validated with patient organizations.

Illustrative coordination-time hypothesis based on reducing manual discovery across fragmented sources. This is not a claim that treatment development itself becomes 10× faster.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Search `STXBP1-related disorder`, choose **Find my fastest path forward**, open any edge, then **Generate collaboration brief**.

Optional live explanation:

```bash
cp .env.example .env.local
# set OPENAI_API_KEY in .env.local
npm run dev
```

Without the key, the brief is deterministic and still sourced.

```bash
npm run build
```

## How this scales

Later ingestion can add nodes from HPO, Mondo, ClinVar, PubMed, ClinicalTrials.gov, NIH RePORTER, Orphanet, NORD, Global Genes, and verified patient-organization sites. The same edge schema applies: no relationship is stored without a source, a status, and a confidence. Extraction and reconciliation move from the curated alias map to a model, and explanations stay downstream of the audited graph.

## Safety / disclaimer

RareBridge does not provide medical advice and does not treat graph inferences as clinical evidence.
