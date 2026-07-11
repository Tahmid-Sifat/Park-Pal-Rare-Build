import { CaseFile, RejectionAnalysis, RetrievedSource } from "@/lib/types/caseTypes";
import { generateText } from "@/lib/llm/provider";
import { retrieveRagContext } from "./ragKnowledgeAgent";
import { buildRejectionRagQuery, formatRetrievedContext } from "@/lib/rag/queryBuilder";

export type RejectionAnalysisResult = RejectionAnalysis & {
  retrievedSources: RetrievedSource[];
  retrievedContext: string;
  ragModeUsed: string;
};

export async function analyzeRejectionText(
  text: string,
  caseFile?: CaseFile | null
): Promise<RejectionAnalysisResult> {
  const lower = text.toLowerCase();
  const ragQuery = buildRejectionRagQuery(text, caseFile?.noticeType);
  const rag = await retrieveRagContext(ragQuery, 6);
  const sources = rag.relevantSnippets;
  const retrievedContext = formatRetrievedContext(sources) || rag.retrievedContext;

  const baseline = buildBaselineAnalysis(text, lower, sources, retrievedContext);
  const enrichedDraft = await enrichEscalationDraft(baseline, text, retrievedContext, caseFile);

  return {
    ...baseline,
    escalationDraft: enrichedDraft,
    retrievedSources: sources,
    retrievedContext,
    ragModeUsed: rag.modeUsed
  };
}

function buildBaselineAnalysis(
  text: string,
  lower: string,
  sources: RetrievedSource[],
  retrievedContext: string
): RejectionAnalysis {
  const popla = lower.includes("popla");
  const ias = lower.includes("ias");
  const council = /council|tribunal|formal representation|notice of rejection|traffic penalty/.test(lower);
  const court = /court|claim|legal proceedings/.test(lower);
  const deadlineMatch = text.match(
    /(?:by|before|within)\s+([0-9]{1,2}[\/\-. ][0-9]{1,2}[\/\-. ][0-9]{2,4}|\d+\s+days)/i
  );

  const sourceNames = sources.map((s) => s.document);
  const kbHintsRoute =
    sourceNames.find((name) => name.includes("popla")) ||
    sourceNames.find((name) => name.includes("ias")) ||
    sourceNames.find((name) => name.includes("council") || name.includes("tribunal")) ||
    sourceNames.find((name) => name.includes("court") || name.includes("debt"));

  const escalationRoute = court
    ? "Urgent human/legal review recommended."
    : popla || kbHintsRoute?.includes("popla")
      ? "Potential POPLA escalation route. Check the rejection code and deadline."
      : ias || kbHintsRoute?.includes("ias")
        ? "Potential IAS escalation route. Check the official deadline."
        : council || kbHintsRoute?.includes("council") || kbHintsRoute?.includes("tribunal")
          ? "Potential council formal representation or tribunal route. Check the notice stage and stated deadline."
          : "Check whether the operator or council has provided a formal escalation route.";

  const guidanceSnippet = sources[0]?.snippet?.slice(0, 220);
  const riskFlags = [
    ...(court ? ["Court/legal wording detected. Human review recommended."] : []),
    "Verify the new deadline and appeal body against the rejection letter.",
    ...(sources.length
      ? [`RAG consulted ${sources.length} knowledge sources (${ragModeLabel(sourceNames)}).`]
      : ["No knowledge-base sources matched; rely on the rejection letter wording."])
  ];

  return {
    rejectionReason: lower.includes("sign")
      ? "The rejection appears to rely on signage or displayed terms."
      : lower.includes("evidence")
        ? "The rejection appears to dispute or dismiss the evidence provided."
        : "The rejection reason needs manual confirmation from the letter.",
    newDeadline: deadlineMatch?.[1] || null,
    escalationRoute,
    evidenceAddressed:
      lower.includes("evidence") || lower.includes("receipt") || lower.includes("photo")
        ? "Some evidence appears to be mentioned."
        : "The letter may not clearly address the user's evidence.",
    nextRecommendedAction: court
      ? "Do not ignore the letter. Consider qualified legal support urgently."
      : "Prepare an escalation bundle and verify the deadline from the rejection letter.",
    escalationDraft: [
      "I am escalating this matter because the rejection does not appear to fully address the evidence and appeal grounds already provided.",
      "Please review the attached evidence bundle and confirm the applicable deadline and route.",
      guidanceSnippet ? `Guidance note (informational): ${guidanceSnippet}` : "",
      retrievedContext ? "" : ""
    ]
      .filter(Boolean)
      .join(" "),
    riskFlags
  };
}

async function enrichEscalationDraft(
  baseline: RejectionAnalysis,
  rejectionText: string,
  retrievedContext: string,
  caseFile?: CaseFile | null
): Promise<string> {
  if (!retrievedContext.trim() && process.env.DEMO_MODE === "true") {
    return baseline.escalationDraft;
  }

  const prompt = [
    "You help draft a cautious UK parking escalation letter. Not legal advice.",
    "Use only the rejection letter and knowledge snippets. Do not invent deadlines, codes, or facts.",
    "Write 1 short formal paragraph the user can edit. Calm and factual tone.",
    "",
    `Notice type: ${caseFile?.noticeType || "unknown"}`,
    `Issuer: ${caseFile?.noticeFields.issuerName || "unknown"}`,
    `Reference: ${caseFile?.noticeFields.noticeReference || "unknown"}`,
    `Suggested route: ${baseline.escalationRoute}`,
    `Deadline clue: ${baseline.newDeadline || "not found — user must verify"}`,
    "",
    "Rejection letter:",
    rejectionText.slice(0, 2500),
    "",
    "Knowledge snippets:",
    retrievedContext.slice(0, 2500) || "(none)",
    "",
    "Return only the draft paragraph."
  ].join("\n");

  try {
    const drafted = (await generateText(prompt, { temperature: 0.2 })).trim();
    if (!drafted || drafted.startsWith("Demo-mode") || drafted.startsWith("Ollama error")) {
      return baseline.escalationDraft;
    }
    return drafted.slice(0, 2000);
  } catch {
    return baseline.escalationDraft;
  }
}

function ragModeLabel(sourceNames: string[]) {
  return sourceNames.slice(0, 4).join(", ") || "none";
}
