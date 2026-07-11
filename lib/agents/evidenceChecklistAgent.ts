import { AppealGround, EvidenceItem } from "@/lib/types/caseTypes";

export function buildEvidenceChecklist(grounds: AppealGround[], demoEvidence = false): EvidenceItem[] {
  const base: EvidenceItem[] = [
    {
      id: "signage-photo",
      name: "Photo of the parking sign",
      whyNeeded: "Shows whether parking terms were prominent and readable.",
      status: demoEvidence ? "uploaded" : "missing",
      relatedGroundId: "unclear-signage",
      example: "Close-up and wider photo showing where the sign sits."
    },
    {
      id: "receipt",
      name: "Receipt proving legitimate visit",
      whyNeeded: "Supports the reason for stopping and the short factual timeline.",
      status: demoEvidence ? "uploaded" : "missing",
      relatedGroundId: "short-stay",
      example: "Pharmacy receipt with date and time."
    },
    {
      id: "payment-proof",
      name: "Parking app or payment screenshot",
      whyNeeded: "Useful if payment was made or an app/machine issue occurred.",
      status: "optional",
      relatedGroundId: "payment-made",
      example: "App session, bank entry, or machine fault photo."
    },
    {
      id: "wider-location",
      name: "Wider photo of sign placement",
      whyNeeded: "Shows visibility from the place where the vehicle stopped.",
      status: demoEvidence ? "uploaded" : "missing",
      relatedGroundId: "unclear-signage"
    },
    {
      id: "blue-badge",
      name: "Blue Badge or disability-related evidence",
      whyNeeded: "Only relevant where disability or reasonable adjustment circumstances apply.",
      status: "optional",
      relatedGroundId: "disability"
    }
  ];

  const relevantIds = new Set(grounds.flatMap((ground) => [ground.id, ...ground.requiredEvidence.map((e) => e.toLowerCase())]));
  return base.map((item) => ({
    ...item,
    status: item.status === "optional" || relevantIds.size === 0 || (item.relatedGroundId && relevantIds.has(item.relatedGroundId)) ? item.status : "optional"
  }));
}
