import type { Brief } from "./types";
import { DATA_SOURCES, REVIEWED } from "./rarebridge.dataset";

export const OUTREACH_QUESTION =
  "Could our community align with or reuse elements of the existing STXBP1/SYNGAP1 natural-history framework rather than creating a parallel effort?";

export const DISCLAIMER = "AI-generated research coordination proposal — not medical advice.";

const BRIEF_SOURCE_IDS = ["NBK396561", "ORPHA:599373", "ORPHA:544254", "NCT06555965", "STARR", "CURE-SYNGAP1", "HGNC:11444", "HGNC:11497", "MONDO:0012812", "MONDO:0012960"];

export function briefSources() {
  return BRIEF_SOURCE_IDS.map((id) => {
    const source = DATA_SOURCES.find((item) => item.id === id);
    if (!source) throw new Error(`Missing brief source ${id}`);
    return { name: source.name, id: source.id, url: source.url };
  });
}

export function deterministicBrief(): Brief {
  return {
    title: "Collaboration Brief",
    ourDisease: "STXBP1-related disorder (Orphanet ORPHA:599373; MONDO:0012812 / developmental and epileptic encephalopathy 4). GeneReviews NBK396561 establishes the related condition by a heterozygous pathogenic STXBP1 variant (HGNC:11444).",
    connection: "SYNGAP1-related disorder (Orphanet ORPHA:544254; MONDO:0012960), in the shared natural-history study context of NCT06555965. Orphanet describes developmental delay and generalized epilepsy, with a seizure pattern that differs from the STXBP1 descriptions. This is a research-coordination connection, not clinical equivalence.",
    sharedAsset: "NCT06555965 — STXBP1 and SYNGAP1 Related Disorders Natural History Study. Observational, non-interventional, sponsored by Children’s Hospital of Philadelphia, with an STXBP1 cohort and a SYNGAP1 cohort. The STXBP1 Foundation refers to this listing as the STARR study.",
    reusable: [
      "Natural-history study infrastructure that already names both an STXBP1 cohort and a SYNGAP1 cohort (NCT06555965). Whether day-to-day procedures are actually shared across cohorts is to validate with the study team.",
      "A developmental, seizure, and quality-of-life assessment approach, which is the study’s stated primary objective. The ClinicalTrials.gov text reviewed here does not name every instrument for both cohorts, so treat specific measures as questions.",
      "Caregiver-reported measures named on the STXBP1 Foundation STARR page (Vineland and a quality-of-life inventory, via RARE-X). Potentially reusable for STXBP1 coordination; do not assume those exact measures are used for the SYNGAP1 cohort until the study team confirms.",
      "Recruitment and multi-site coordination experience. The Foundation describes STXBP1 enrollment across its STARR sites and is listed as a ClinicalTrials.gov collaborator. Aligning another community with that infrastructure is potentially reusable and must be validated.",
    ],
    needsReview: [
      "The STARR page frames the study around STXBP1-related disorders, while ClinicalTrials.gov titles NCT06555965 for both STXBP1 and SYNGAP1. Confirm which elements are shared.",
      "Phenotype overlap is not diagnostic equivalence. Seizure types described for the two disorders differ. Nothing here supports transferring a therapy.",
      "Cure SYNGAP1 (SynGAP Research Fund) is a patient community for SYNGAP1-related disorders and is not listed as a collaborator on the record reviewed 4 October 2026.",
      "Estimated enrollment of 600 is not a count of participants. The study prepares for future trials; it does not test a treatment.",
    ],
    outreachQuestion: OUTREACH_QUESTION,
    sources: briefSources(),
    disclaimer: DISCLAIMER,
    generator: "deterministic",
    reviewed: REVIEWED,
  };
}

export function briefToText(brief: Brief) {
  return [
    brief.title,
    "",
    "Our disease",
    brief.ourDisease,
    "",
    "Evidence-backed connection",
    brief.connection,
    "",
    "Shared asset",
    brief.sharedAsset,
    "",
    "What may be reusable",
    ...brief.reusable.map((item) => `- ${item}`),
    "",
    "Needs expert review",
    ...brief.needsReview.map((item) => `- ${item}`),
    "",
    "Proposed outreach question",
    brief.outreachQuestion,
    "",
    "Sources",
    ...brief.sources.map((source) => `- ${source.name} (${source.id}) ${source.url}`),
    "",
    brief.disclaimer,
    `Evidence reviewed ${brief.reviewed}.`,
  ].join("\n");
}
