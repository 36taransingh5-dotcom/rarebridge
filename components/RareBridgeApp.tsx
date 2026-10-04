"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { briefToText, deterministicBrief } from "@/lib/brief";
import { flagshipPath } from "@/lib/pathfinder";
import { resolveQuery, searchNodes } from "@/lib/search";
import { DATA_SOURCES, edges, edgesFor, FLAGSHIP_HOPS, getEdge, getNode, nodes } from "@/lib/rarebridge.dataset";
import type { Brief, EvidenceStatus, GraphEdge, GraphNode } from "@/lib/types";

const EvidenceGraph = dynamic(() => import("@/components/EvidenceGraph"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-[#6f685f]">Preparing the atlas…</div>,
});

const EXAMPLES = [
  "STXBP1-related disorder",
  "SYNGAP1-related disorder",
  "developmental epileptic encephalopathy",
  "synaptic transmission",
];

const STATUSES = ["Resolving synonyms", "Loading evidence graph", "Ranking supported paths"];

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  observed: "OBSERVED",
  inferred: "INFERRED",
  hypothesis: "HYPOTHESIS / REQUIRES EXPERT VALIDATION",
};

const CONFIDENCE_LABEL = { high: "High", moderate: "Moderate", exploratory: "Exploratory" };

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function formatReviewed(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function statusClass(status: EvidenceStatus) {
  if (status === "observed") return "bg-[#e5f4ec] text-[#1f6b4a]";
  if (status === "inferred") return "bg-[#f8efd8] text-[#8a5a12]";
  return "bg-[#f8e8ee] text-[#8d3d55]";
}

export function RareBridgeApp() {
  const reduced = usePrefersReducedMotion();
  const path = useMemo(() => flagshipPath(), []);
  const [phase, setPhase] = useState<"landing" | "searching" | "atlas">("landing");
  const [query, setQuery] = useState("");
  const [searchTick, setSearchTick] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [miss, setMiss] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [pathStep, setPathStep] = useState(-1);
  const [pathRunning, setPathRunning] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);

  const suggestions = query.trim().length >= 2 ? searchNodes(query).slice(0, 5) : [];

  useEffect(() => {
    if (phase !== "searching") return;
    const step = reduced ? 70 : 300;
    const timers = [
      window.setTimeout(() => setStatusIdx(1), step),
      window.setTimeout(() => setStatusIdx(2), step * 2),
      window.setTimeout(() => setPhase("atlas"), reduced ? 220 : 900),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [phase, searchTick, reduced]);

  useEffect(() => {
    if (!pathRunning) return;
    if (pathStep >= FLAGSHIP_HOPS.length) {
      setPathRunning(false);
      setActionOpen(true);
      return;
    }
    const timer = window.setTimeout(() => setPathStep((step) => step + 1), reduced ? 0 : 720);
    return () => window.clearTimeout(timer);
  }, [pathRunning, pathStep, reduced]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setBriefOpen(false);
      setExplainerOpen(false);
      setImpactOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(raw: string) {
    const hit = resolveQuery(raw);
    setQuery(raw);
    if (!hit) {
      setMiss(true);
      return;
    }
    const node = getNode(hit.nodeId);
    setMiss(false);
    setFocusId(hit.nodeId);
    setSelectedNodeId(hit.nodeId);
    setSelectedEdgeId(null);
    setNote(hit.reconciled ? `Reconciled “${hit.matchedAlias}” to ${node.label}. The demo graph is preloaded; this alias step is the reconciliation.` : `Opened ${node.label}.`);
    setStatusIdx(0);
    setSearchTick((tick) => tick + 1);
    setPhase("searching");
  }

  function reset() {
    setPhase("landing");
    setQuery("");
    setMiss(false);
    setNote(null);
    setPathStep(-1);
    setPathRunning(false);
    setActionOpen(false);
    setSelectedEdgeId(null);
    setSelectedNodeId(null);
    setBriefOpen(false);
    setExplainerOpen(false);
  }

  function startPath() {
    setPathStep(0);
    setPathRunning(true);
    setActionOpen(false);
    setSelectedEdgeId(FLAGSHIP_HOPS[0].edgeId);
  }

  async function openBrief() {
    setBriefOpen(true);
    setBriefLoading(true);
    setBriefError(null);
    setCopied(false);
    try {
      const response = await fetch("/api/collaboration-brief", { method: "POST" });
      if (!response.ok) throw new Error("Brief request failed");
      const data = (await response.json()) as Brief;
      if (!data?.sharedAsset || !data.disclaimer) throw new Error("Incomplete brief");
      setBrief(data);
    } catch {
      setBrief(deterministicBrief());
      setBriefError("Live explanation was unavailable, so RareBridge used the deterministic brief from the same evidence.");
    } finally {
      setBriefLoading(false);
    }
  }

  const hopIndex = pathStep >= 0 ? Math.min(pathStep, FLAGSHIP_HOPS.length - 1) : -1;
  const hop = hopIndex >= 0 ? FLAGSHIP_HOPS[hopIndex] : null;
  const selectedEdge = selectedEdgeId ? getEdge(selectedEdgeId) : null;
  const selectedNode = selectedNodeId ? getNode(selectedNodeId) : null;

  return (
    <div className="min-h-dvh text-[#1c1915]">
      <header className="sticky top-0 z-30 border-b border-[#e4ddd2]/80 bg-[#f3f0e8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <button type="button" onClick={reset} className="flex items-center gap-2 text-left">
            <Mark />
            <span className="font-display text-xl tracking-tight">RareBridge</span>
          </button>
          {phase === "atlas" && (
            <form
              className="hidden min-w-0 flex-1 md:block"
              onSubmit={(event) => {
                event.preventDefault();
                submit(query);
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search the atlas"
                placeholder="Search a disease, gene, symptom or mechanism…"
                className="w-full rounded-full border border-[#e4ddd2] bg-white px-4 py-2 text-sm outline-none ring-[#2c3a86] focus:ring-2"
              />
            </form>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setExplainerOpen(true)} className="rounded-full px-3 py-1.5 text-sm text-[#2c3a86] hover:bg-white">
              How the AI Atlas works
            </button>
            <span className="hidden rounded-full border border-[#d9d3ea] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b4b8a] sm:inline">
              Powered by OpenAI
            </span>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase !== "atlas" ? (
          <motion.main key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2c3a86]">Evidence atlas · STXBP1 and SYNGAP1</p>
            <h1 className="font-display mt-3 text-5xl tracking-tight sm:text-7xl">RareBridge</h1>
            <p className="font-display mt-3 text-2xl italic text-[#3f3a33] sm:text-3xl">From an isolated diagnosis to the research you can reuse.</p>
            <p className="mt-4 max-w-2xl text-lg text-[#4e4942]">Search one disease. See the evidence, existing work, and fastest supported path forward.</p>
            <form
              className="mt-8"
              onSubmit={(event) => {
                event.preventDefault();
                submit(query);
              }}
            >
              <div className="flex flex-col gap-2 rounded-3xl border border-[#e4ddd2] bg-white p-2 shadow-[0_20px_60px_rgba(44,58,134,0.06)] sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setMiss(false);
                  }}
                  aria-label="Search a disease, gene, symptom or mechanism"
                  placeholder="Search a disease, gene, symptom or mechanism…"
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-lg outline-none"
                />
                <button type="submit" className="rounded-2xl bg-[#2c3a86] px-5 py-3 text-sm font-semibold text-white">
                  Search the atlas
                </button>
              </div>
              {suggestions.length > 0 && (
                <ul className="mt-2 overflow-hidden rounded-2xl border border-[#e4ddd2] bg-white">
                  {suggestions.map((hit) => {
                    const node = getNode(hit.nodeId);
                    return (
                      <li key={node.id}>
                        <button type="button" onClick={() => submit(node.label)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f7f4ee]">
                          <span>{node.label}</span>
                          <span className="text-xs uppercase tracking-wide text-[#6f685f]">{node.type}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button key={example} type="button" onClick={() => submit(example)} className="rounded-full border border-[#e4ddd2] bg-white px-3 py-1.5 text-sm hover:border-[#2c3a86]">
                  {example}
                </button>
              ))}
            </div>
            {miss && <p className="mt-4 text-sm text-[#8d3d55]">Nothing in this vertical slice matches that query. Try STXBP1-related disorder, SYNGAP1, or synaptic transmission.</p>}
            <p className="mt-6 max-w-2xl text-sm text-[#6f685f]">Every connection in this atlas is sourced. Observed evidence is drawn differently from inference. RareBridge does not provide medical advice.</p>
            {phase === "searching" && (
              <div className="mt-8 rounded-3xl border border-[#e4ddd2] bg-white p-6" aria-live="polite">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2c3a86]">{STATUSES[statusIdx]}</p>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#efeae2]">
                  <div className="h-full bg-[#2c3a86] transition-all" style={{ width: `${((statusIdx + 1) / 3) * 100}%` }} />
                </div>
                <p className="mt-3 text-sm text-[#6f685f]">Preloaded STXBP1 / SYNGAP1 evidence. No live scrape.</p>
              </div>
            )}
            <ImpactCard />
          </motion.main>
        ) : (
          <motion.main key="atlas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[calc(100dvh-61px)] flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b border-[#e4ddd2] px-4 py-2 text-sm sm:px-6">
              <span className="font-medium">{edges.length} sourced edges · {nodes.length} entities</span>
              <Legend />
              <button type="button" onClick={() => setImpactOpen(true)} className="ml-auto text-[#2c3a86]">
                10× coordination hypothesis
              </button>
            </div>
            {note && <p className="border-b border-[#e4ddd2] bg-[#e7e9f4] px-4 py-2 text-sm text-[#2c3a86] sm:px-6">{note}</p>}
            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
              <section className="flex min-h-[640px] flex-col">
                <div className="relative min-h-[460px] flex-1">
                  <EvidenceGraph
                    focusId={focusId}
                    selectedEdgeId={selectedEdgeId}
                    selectedNodeId={selectedNodeId}
                    pathStep={pathStep}
                    onNodeClick={(id) => {
                      setSelectedNodeId(id);
                      setSelectedEdgeId(null);
                    }}
                    onEdgeClick={(id) => {
                      setSelectedEdgeId(id);
                      setSelectedNodeId(null);
                    }}
                  />
                  {hop && (
                    <div className="pointer-events-none absolute left-3 right-3 top-3 z-10" aria-live="polite">
                      <div className="mx-auto max-w-xl rounded-2xl border border-[#e4ddd2] bg-white/95 px-4 py-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2c3a86]">
                          {pathRunning ? `Hop ${Math.min(pathStep + 1, FLAGSHIP_HOPS.length)} of ${FLAGSHIP_HOPS.length}` : "Path complete"}
                        </p>
                        <p className="mt-1 text-sm">{pathRunning ? hop.explanation : path.summary}</p>
                      </div>
                    </div>
                  )}
                  {!actionOpen && (
                    <button type="button" onClick={startPath} disabled={pathRunning} className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#2c3a86] px-5 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-70">
                      {pathRunning ? "Tracing the supported path…" : "Find my fastest path forward"}
                    </button>
                  )}
                </div>
                {actionOpen && (
                  <ActionPanel
                    onBrief={openBrief}
                    onReplay={startPath}
                    onStudyEvidence={() => {
                      setSelectedEdgeId("e-syngap-asset");
                      setSelectedNodeId(null);
                    }}
                  />
                )}
              </section>
              <aside className="border-t border-[#e4ddd2] bg-[#fffcf8] lg:border-l lg:border-t-0">
                {selectedEdge ? (
                  <EdgeDrawer edge={selectedEdge} onClose={() => setSelectedEdgeId(null)} />
                ) : selectedNode ? (
                  <NodeDrawer
                    node={selectedNode}
                    onClose={() => setSelectedNodeId(null)}
                    onEdge={(id) => {
                      setSelectedEdgeId(id);
                      setSelectedNodeId(null);
                    }}
                  />
                ) : (
                  <div className="p-6 text-sm text-[#6f685f]">
                    <p className="font-medium text-[#1c1915]">Click a node or a line.</p>
                    <p className="mt-2">Solid green is observed. Dashed amber is inferred. Dotted rose is a hypothesis that still needs an expert.</p>
                    <p className="mt-4 font-display text-lg italic text-[#1c1915]">Find the research you don&apos;t need to rebuild.</p>
                  </div>
                )}
              </aside>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {briefOpen && (
        <Modal onClose={() => setBriefOpen(false)} title="Collaboration Brief">
          {briefLoading && <p>Writing from the evidence on this path…</p>}
          {brief && (
            <div className="space-y-4 text-sm leading-relaxed">
              <p className="text-xs uppercase tracking-[0.14em] text-[#5b4b8a]">{brief.generator === "openai" ? "Explained with OpenAI" : "Deterministic explanation — API key not used"}</p>
              {briefError && <p className="text-[#8a5a12]">{briefError}</p>}
              <Section title="Our disease" body={brief.ourDisease} />
              <Section title="Evidence-backed connection" body={brief.connection} />
              <Section title="Shared asset" body={brief.sharedAsset} />
              <div>
                <h3 className="font-semibold">What may be reusable</h3>
                <ul className="mt-1 list-disc space-y-1 pl-4">{brief.reusable.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h3 className="font-semibold">Needs expert review</h3>
                <ul className="mt-1 list-disc space-y-1 pl-4">{brief.needsReview.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <Section title="Proposed outreach question" body={brief.outreachQuestion} />
              <div>
                <h3 className="font-semibold">Sources</h3>
                <ul className="mt-1 space-y-1">
                  {brief.sources.map((source) => (
                    <li key={source.id}>
                      <a className="text-[#2c3a86] underline" href={source.url} target="_blank" rel="noreferrer">{source.name} · {source.id}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="rounded-xl bg-[#f8e8ee] px-3 py-2 text-[#8d3d55]">{brief.disclaimer}</p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(briefToText(brief));
                  setCopied(true);
                }}
                className="rounded-full border border-[#e4ddd2] px-4 py-2"
              >
                {copied ? "Copied" : "Copy brief"}
              </button>
            </div>
          )}
        </Modal>
      )}
      {explainerOpen && (
        <Modal onClose={() => setExplainerOpen(false)} title="How the AI Atlas works">
          <Explainer />
        </Modal>
      )}
      {impactOpen && (
        <Modal onClose={() => setImpactOpen(false)} title="From discovery to collaboration">
          <ImpactCard />
        </Modal>
      )}
    </div>
  );
}

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="7" cy="18" r="3" fill="#2c3a86" />
      <circle cx="21" cy="10" r="3" fill="#5b4b8a" />
      <path d="M9 16c3-6 8-8 11-8" fill="none" stroke="#2c3a86" strokeWidth="1.6" />
    </svg>
  );
}

function Legend() {
  const items = [
    ["Disease", "bg-[#2c3a86]"],
    ["Gene", "bg-[#0f6e6b]"],
    ["Phenotype", "bg-[#8a5a12]"],
    ["Mechanism", "bg-[#5b4b8a]"],
    ["Asset", "bg-[#1d4e89]"],
    ["Organization", "bg-[#8d3d55]"],
    ["Observed", "bg-[#1f6b4a]"],
    ["Inferred", "bg-[#9a6b12]"],
    ["Hypothesis", "bg-[#8d3d55]"],
  ];
  return (
    <div className="flex flex-wrap gap-2 text-[11px] text-[#6f685f]">
      {items.map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

function EdgeDrawer({ edge, onClose }: { edge: GraphEdge; onClose: () => void }) {
  return (
    <div className="h-full overflow-auto p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f685f]">Evidence</p>
        <button type="button" onClick={onClose} className="text-sm text-[#6f685f]">Close</button>
      </div>
      <h2 className="font-display mt-2 text-2xl leading-tight">Relationship</h2>
      <p className="mt-2 text-base">{edge.relationshipType}</p>
      <p className="mt-1 text-sm text-[#6f685f]">{getNode(edge.source).label} → {getNode(edge.target).label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(edge.evidenceStatus)}`}>{STATUS_LABEL[edge.evidenceStatus]}</span>
        <span className="rounded-full bg-[#efeae2] px-2.5 py-1 text-[11px] font-semibold">{CONFIDENCE_LABEL[edge.confidence]} confidence</span>
      </div>
      <Field label="Source" value={edge.sourceName} />
      <Field label="Source ID" value={edge.sourceId} />
      <Field label="Source link" value={edge.sourceUrl} href={edge.sourceUrl} />
      <Field label="Why this edge exists" value={edge.explanation} />
      <Field label="Contradictions / caveats" value={edge.contradiction?.trim() || "No contradiction captured in this demo dataset"} />
      <Field label="Last reviewed" value={formatReviewed(edge.lastReviewed)} />
    </div>
  );
}

function NodeDrawer({ node, onClose, onEdge }: { node: GraphNode; onClose: () => void; onEdge: (id: string) => void }) {
  return (
    <div className="h-full overflow-auto p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f685f]">{node.type}</p>
        <button type="button" onClick={onClose} className="text-sm text-[#6f685f]">Close</button>
      </div>
      <h2 className="font-display mt-2 text-2xl leading-tight">{node.label}</h2>
      <p className="mt-3 text-sm leading-relaxed">{node.summary}</p>
      {node.identifiers.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {node.identifiers.map((item) => (
            <li key={item.value}>
              {item.url ? <a className="text-[#2c3a86] underline" href={item.url} target="_blank" rel="noreferrer">{item.label}: {item.value}</a> : `${item.label}: ${item.value}`}
            </li>
          ))}
        </ul>
      )}
      <h3 className="mt-5 text-sm font-semibold">Relationships</h3>
      <ul className="mt-2 space-y-2">
        {edgesFor(node.id).map((edge) => (
          <li key={edge.id}>
            <button type="button" onClick={() => onEdge(edge.id)} className="w-full rounded-xl border border-[#e4ddd2] px-3 py-2 text-left text-sm hover:border-[#2c3a86]">
              <span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(edge.evidenceStatus)}`}>{STATUS_LABEL[edge.evidenceStatus]}</span>
              {edge.relationshipType}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f685f]">{label}</p>
      {href ? <a className="mt-1 block break-all text-sm text-[#2c3a86] underline" href={href} target="_blank" rel="noreferrer">{value}</a> : <p className="mt-1 text-sm leading-relaxed">{value}</p>}
    </div>
  );
}

function ActionPanel({ onBrief, onReplay, onStudyEvidence }: { onBrief: () => void; onReplay: () => void; onStudyEvidence: () => void }) {
  return (
    <div className="border-t border-[#e4ddd2] bg-white px-4 py-5 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f6b4a]">Connection found · high confidence</p>
      <h2 className="font-display mt-1 text-3xl">A research shortcut already exists.</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Section title="Connection" body="SYNGAP1-related disorder is relevant because Orphanet describes developmental delay and epilepsy there too, and because ClinicalTrials.gov places it in the same observational study as STXBP1-related disorder, in its own cohort. That is a coordination connection. It is not a finding that the diseases are the same or that a treatment for one fits the other." />
        <div>
          <h3 className="text-sm font-semibold">Reusable asset</h3>
          <p className="mt-1 font-medium">NCT06555965</p>
          <p className="text-sm">STXBP1 and SYNGAP1 Related Disorders Natural History Study</p>
        </div>
        <Section title="Why it matters" body="Maria can investigate whether relevant study infrastructure, assessments, recruitment experience, or coordination practices can be reused or aligned rather than starting from zero. This is a research-coordination opportunity, not proof of treatment equivalence." />
        <Section title="Next step this week" body="Contact the study/foundation team with a sourced collaboration brief asking which natural-history measures, infrastructure, or research coordination practices may be reusable or alignable. The STXBP1 Foundation publishes RESEARCH@STXBP1DISORDERS.ORG for STARR questions, and ENDD@CHOP.EDU for the CHOP site." />
      </div>
      <p className="mt-3 text-sm text-[#6f685f]">Evidence confidence: high. Every hop on this route is observed. An inferred neighbor link exists and was not used as a substitute for those hops.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onBrief} className="rounded-full bg-[#2c3a86] px-4 py-2 text-sm font-semibold text-white">Generate collaboration brief</button>
        <button type="button" onClick={onStudyEvidence} className="rounded-full border border-[#e4ddd2] px-4 py-2 text-sm">Open study evidence</button>
        <button type="button" onClick={onReplay} className="rounded-full border border-[#e4ddd2] px-4 py-2 text-sm">Replay path</button>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function ImpactCard() {
  return (
    <section className="mt-10 rounded-3xl border border-[#e4ddd2] bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f685f]">From discovery to collaboration</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat k="~10 weeks" v="Traditional fragmented search" />
        <Stat k="<1 week" v="RareBridge target" />
        <Stat k="10×" v="Potential coordination acceleration" />
      </div>
      <p className="mt-4 text-sm text-[#4e4942]">Illustrative coordination-time hypothesis based on reducing manual discovery across fragmented sources. This is not a claim that treatment development itself becomes 10× faster.</p>
      <p className="mt-2 text-xs text-[#6f685f]">The baseline is time spent identifying adjacent communities, studies, patient organizations, and existing infrastructure before outreach. It is a product hypothesis to validate with patient organizations, not a measured trial result.</p>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="font-display text-3xl">{k}</p>
      <p className="text-sm text-[#6f685f]">{v}</p>
    </div>
  );
}

function Explainer() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>RareBridge keeps the graph deterministic. OpenAI explains verified evidence. It does not invent nodes or edges at runtime.</p>
      <div>
        <h3 className="font-semibold">1. Extract</h3>
        <p>At scale, OpenAI would turn source text into candidate diseases, genes, phenotypes, mechanisms, studies, investigators, and research assets. In this demo the graph is preloaded from records reviewed on 4 October 2026, so the demo cannot drift.</p>
      </div>
      <div>
        <h3 className="font-semibold">2. Reconcile</h3>
        <p>Search maps aliases onto one canonical node. STXBP1, EIEE4, DEE4, and STXBP1-related encephalopathy resolve to the same disease. The demo alias map is curated. The product labels that step as reconciliation and does not pretend the graph was generated live.</p>
      </div>
      <div>
        <h3 className="font-semibold">3. Explain</h3>
        <p>When OPENAI_API_KEY is present, the collaboration brief is written from a locked evidence payload and rejected if it adds identifiers. With no key, the same facts are returned from a deterministic brief. The app still works.</p>
      </div>
      <div>
        <h3 className="font-semibold">Sources in this slice</h3>
        <ul className="mt-1 space-y-1">
          {DATA_SOURCES.map((source) => (
            <li key={source.id}><a className="text-[#2c3a86] underline" href={source.url} target="_blank" rel="noreferrer">{source.name} · {source.id}</a></li>
          ))}
        </ul>
      </div>
      <p>RareBridge does not provide medical advice and does not treat graph inferences as clinical evidence.</p>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1c1915]/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-3xl bg-[#fffcf8] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="font-display text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-[#6f685f]">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
