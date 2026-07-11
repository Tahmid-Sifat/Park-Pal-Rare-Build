import { CaseFile, NoticeType } from "@/lib/types/caseTypes";

export function buildRiskFlags(partial: Pick<CaseFile, "noticeFields" | "deadlines" | "evidenceItems"> & { noticeType: NoticeType; redFlags?: string[] }) {
  const flags = new Set<string>();

  if (partial.noticeFields.confidence < 0.6) {
    flags.add("OCR or extraction confidence is low. Please upload a clearer image or confirm the details manually.");
  }

  if (partial.deadlines.some((deadline) => deadline.confidence < 0.65)) {
    flags.add("At least one deadline was extracted or calculated with low confidence. Please verify against the official notice.");
  }

  if (partial.evidenceItems.some((item) => item.status === "missing")) {
    flags.add("Some evidence is missing. The appeal should not rely on unsupported facts.");
  }

  if (partial.noticeType === "court_claim_or_legal_document") {
    flags.add("This appears court-related. Consider urgent human legal advice.");
  }

  if (partial.noticeType === "debt_collector_letter") {
    flags.add("This appears to be a debt collector stage letter. Find the original PCN and check previous deadlines.");
  }

  flags.add("The discounted payment window may be affected by making an appeal. Check the notice terms.");
  partial.redFlags?.forEach((flag) => flags.add(flag));
  return Array.from(flags);
}
