import { CaseFile, EvidenceItem } from "@/lib/types/caseTypes";
import { buildNextActions } from "./actionAgent";

export function updateEvidence(caseFile: CaseFile, evidenceText: string, uploadedFileNames: string[] = [], useDemoEvidence = false): CaseFile {
  const evidenceBlob = `${evidenceText} ${uploadedFileNames.join(" ")}`.toLowerCase();
  const updatedItems: EvidenceItem[] = caseFile.evidenceItems.map((item) => {
    const name = item.name.toLowerCase();
    const matched =
      useDemoEvidence ||
      uploadedFileNames.length > 0 ||
      (name.includes("sign") && /sign|signage|photo/.test(evidenceBlob)) ||
      (name.includes("receipt") && /receipt|pharmacy|prescription/.test(evidenceBlob)) ||
      (name.includes("payment") && /payment|app|machine|screenshot/.test(evidenceBlob)) ||
      (name.includes("badge") && /blue badge|disability|disabled/.test(evidenceBlob)) ||
      (name.includes("wider") && /wider|location|entrance|placement/.test(evidenceBlob));

    if (!matched || item.status === "optional") return item;
    return { ...item, status: "uploaded" };
  });

  const missingEvidence = updatedItems.some((item) => item.status === "missing");
  const riskFlags = new Set(caseFile.riskFlags);
  if (!missingEvidence) {
    riskFlags.delete("Some evidence is missing. The appeal should not rely on unsupported facts.");
  }

  const updated: CaseFile = {
    ...caseFile,
    evidenceSummary: evidenceText || (useDemoEvidence ? "Demo evidence added: pharmacy receipt, unclear signage photo, and short-stay explanation." : caseFile.evidenceSummary),
    evidenceItems: updatedItems,
    riskFlags: Array.from(riskFlags),
    status: missingEvidence ? caseFile.status : "draft_ready",
    nextActions: buildNextActions(caseFile),
    updatedAt: new Date().toISOString(),
    timeline: [
      ...caseFile.timeline,
      {
        id: `evidence-${Date.now()}`,
        label: "Evidence updated",
        detail: useDemoEvidence ? "Demo evidence attached to the case file." : `${updatedItems.filter((item) => item.status === "uploaded").length} evidence items marked uploaded.`,
        createdAt: new Date().toISOString()
      }
    ]
  };

  updated.nextActions = buildNextActions(updated);
  return updated;
}
