import { CaseFile } from "@/lib/types/caseTypes";

export function buildNextActions(caseFile: CaseFile) {
  const actions = [
    "Confirm extracted notice details against the original document.",
    "Download calendar reminders for the appeal deadline and discount risk date.",
    "Collect missing evidence before relying on the suggested grounds.",
    "Review and edit the appeal draft before submitting it through the official route.",
    "Export the appeal pack for records."
  ];

  if (caseFile.noticeType === "court_claim_or_legal_document") {
    actions.unshift("Seek urgent human legal review before taking action.");
  }

  return actions;
}
