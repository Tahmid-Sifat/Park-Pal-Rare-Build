import { NoticeFields, NoticeType, RetrievedSource } from "@/lib/types/caseTypes";

const TYPE_HINTS: Record<NoticeType, string> = {
  council_pcn: "council PCN penalty charge notice appeal tribunal formal representation",
  private_parking_charge: "private parking charge operator appeal POPLA IAS signage",
  notice_to_keeper: "notice to keeper keeper liability private parking appeal",
  debt_collector_letter: "debt collector parking charge escalation risk",
  court_claim_or_legal_document: "court claim legal document parking defence",
  possible_scam: "scam phishing parking notice warning",
  unknown: "parking notice appeal evidence deadlines"
};

/**
 * Build a focused retrieval query from structured fields instead of dumping full notice text.
 */
export function buildRagQuery(fields: NoticeFields, noticeType: NoticeType): string {
  const parts = [
    TYPE_HINTS[noticeType],
    fields.issuerName,
    fields.reason,
    fields.location,
    noticeType === "private_parking_charge" || noticeType === "notice_to_keeper"
      ? "private parking overview appeal grounds"
      : "",
    noticeType === "council_pcn" ? "council pcn overview" : "",
    "evidence checklist appeal grounds deadlines"
  ];

  const rawHints = extractRawHints(fields.rawText);
  return [...parts, ...rawHints]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Query tuned for rejection / escalation retrieval. */
export function buildRejectionRagQuery(rejectionText: string, noticeType?: NoticeType): string {
  const lower = rejectionText.toLowerCase();
  const hints: string[] = [
    "rejection escalation deadline evidence appeal pack",
    noticeType ? TYPE_HINTS[noticeType] : "parking notice appeal"
  ];

  if (/\bpopla\b/.test(lower)) hints.push("POPLA route rejection code deadline evidence bundle");
  if (/\bias\b/.test(lower)) hints.push("IAS route independent appeals service deadline");
  if (/council|tribunal|formal representation|traffic penalty/.test(lower)) {
    hints.push("council PCN formal representation London tribunals rejection");
  }
  if (/court|claim|legal proceedings|solicitor/.test(lower)) hints.push("court claim stage debt collector legal risk");
  if (/sign(age|s)?|terms/.test(lower)) hints.push("unclear signage appeal grounds evidence photos");
  if (/grace|short stay|minutes/.test(lower)) hints.push("grace period short stay");
  if (/anpr|camera|timestamp|double.?dip/.test(lower)) hints.push("ANPR timing double dip");
  if (/keeper|driver|ntk/.test(lower)) hints.push("keeper liability notice to keeper");
  if (/payment|machine|app|ticket/.test(lower)) hints.push("payment machine app issues");
  if (/blue badge|disabled|disability/.test(lower)) hints.push("blue badge disability parking");

  return [...hints, ...extractRawHints(rejectionText)]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRawHints(rawText: string): string[] {
  const lower = rawText.toLowerCase();
  const hints: string[] = [];
  if (/\bsign(age|s)?\b/.test(lower)) hints.push("unclear signage");
  if (/\b(grace|short stay|brief|minutes?)\b/.test(lower)) hints.push("short stay grace period");
  if (/\b(popla|ias)\b/.test(lower)) hints.push(lower.includes("ias") ? "IAS route" : "POPLA route");
  if (/\b(debt|collector|solicitors?)\b/.test(lower)) hints.push("debt collector stage");
  if (/\b(keeper|ntk|notice to keeper)\b/.test(lower)) hints.push("notice to keeper");
  if (/\b(scam|phishing|urgent pay now)\b/.test(lower)) hints.push("scam detection");
  return hints;
}

export function formatRetrievedContext(sources: RetrievedSource[]): string {
  return sources.map((source) => `${source.document}: ${source.snippet}`).join("\n\n");
}
