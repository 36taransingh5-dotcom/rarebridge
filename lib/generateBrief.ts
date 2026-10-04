import OpenAI from "openai";
import { DISCLAIMER, OUTREACH_QUESTION, briefSources, deterministicBrief } from "./brief";
import { edges, nodes } from "./rarebridge.dataset";
import type { Brief } from "./types";

const ALLOWED_ORPHA = new Set(["ORPHA:599373", "ORPHA:544254"]);
const ALLOWED_MONDO = new Set(["MONDO:0012812", "MONDO:0012960"]);
const ALLOWED_HGNC = new Set(["HGNC:11444", "HGNC:11497"]);

function unsafe(text: string) {
  const ncts = text.match(/NCT\d+/g) ?? [];
  if (ncts.some((id) => id !== "NCT06555965")) return true;
  if (/PMID/i.test(text)) return true;
  if (/OMIM/i.test(text)) return true;
  if (/clinically equivalent|interchangeab|approved treatment|therapy is effective/i.test(text)) return true;
  const orphas = text.match(/ORPHA:\d+/g) ?? [];
  if (orphas.some((id) => !ALLOWED_ORPHA.has(id))) return true;
  const mondos = text.match(/MONDO:\d+/g) ?? [];
  if (mondos.some((id) => !ALLOWED_MONDO.has(id))) return true;
  const hgncs = text.match(/HGNC:\d+/g) ?? [];
  if (hgncs.some((id) => !ALLOWED_HGNC.has(id))) return true;
  return false;
}

function asStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 6);
}

export async function generateBrief(): Promise<Brief> {
  const fallback = deterministicBrief();
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallback;

  const payload = {
    instruction: "Write a research-coordination brief for a patient-organization leader. Use only these facts. Do not add studies, identifiers, organizations, mechanisms, or clinical claims. Do not claim therapeutic efficacy or clinical equivalence. Phrase reuse as questions to validate. Repeat source IDs already present. Return JSON with keys ourDisease, connection, sharedAsset, reusable, needsReview.",
    nodes: nodes.map((node) => ({ id: node.id, label: node.label, type: node.type, summary: node.summary })),
    edges: edges.map((edge) => ({
      relationshipType: edge.relationshipType,
      evidenceStatus: edge.evidenceStatus,
      confidence: edge.confidence,
      sourceName: edge.sourceName,
      sourceId: edge.sourceId,
      explanation: edge.explanation,
      contradiction: edge.contradiction ?? "",
    })),
    requiredOutreachQuestion: OUTREACH_QUESTION,
  };

  try {
    const client = new OpenAI({ apiKey: key });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You explain a pre-verified evidence graph. You never invent citations or medical advice." },
        { role: "user", content: JSON.stringify(payload) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    if (!raw || unsafe(raw) || !raw.includes("NCT06555965")) return fallback;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const reusable = asStrings(parsed.reusable);
    const needsReview = asStrings(parsed.needsReview);
    if (reusable.length < 2 || needsReview.length < 2) return fallback;
    const brief: Brief = {
      ...fallback,
      ourDisease: typeof parsed.ourDisease === "string" ? parsed.ourDisease : fallback.ourDisease,
      connection: typeof parsed.connection === "string" ? parsed.connection : fallback.connection,
      sharedAsset: typeof parsed.sharedAsset === "string" ? parsed.sharedAsset : fallback.sharedAsset,
      reusable,
      needsReview,
      outreachQuestion: OUTREACH_QUESTION,
      sources: briefSources(),
      disclaimer: DISCLAIMER,
      generator: "openai",
    };
    if (unsafe(JSON.stringify(brief))) return fallback;
    return brief;
  } catch {
    return fallback;
  }
}
