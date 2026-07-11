import { AppealGround, NoticeFields, NoticeType, RetrievedSource } from "@/lib/types/caseTypes";

export function suggestAppealGrounds(fields: NoticeFields, noticeType: NoticeType, sources: RetrievedSource[], demoEvidence = false): AppealGround[] {
  const raw = fields.rawText.toLowerCase();
  const hasShortStayEvidence = demoEvidence && raw.includes("pharmacy");
  const hasPaymentEvidence = /payment confirmation|bank transaction|parking app|pay and display|valid ticket/.test(raw);
  const grounds: AppealGround[] = [
    {
      id: "unclear-signage",
      title: "Unclear signage",
      description: "Parking terms may not have been clear or prominent at the location.",
      whyItMayApply: raw.includes("sign") || demoEvidence ? "The case mentions unclear signage, which may support a factual challenge." : "This may apply if signs were hard to see or read.",
      requiredEvidence: ["Signage photo", "Wider location photo"],
      availableEvidence: demoEvidence ? ["Unclear signage photo description", "Wider location photo"] : [],
      strength: demoEvidence ? "strong" : "possible",
      confidence: demoEvidence ? 0.82 : 0.58,
      sourceRefs: refs(sources, ["appeal_grounds.md", "private_parking_overview.md"]),
      warnings: demoEvidence ? [] : ["Upload clear photos before relying on this ground."]
    },
    {
      id: "short-stay",
      title: "Short stay or grace period",
      description: "A short stop may be relevant depending on the site terms, grace period, and evidence.",
      whyItMayApply: raw.includes("12") || raw.includes("brief") || hasShortStayEvidence ? "The case describes a short visit that should be checked against the site terms and timing evidence." : "Only use this if the timing can be supported.",
      requiredEvidence: ["Timestamped receipt", "ANPR times", "User timeline"],
      availableEvidence: hasShortStayEvidence ? ["Pharmacy receipt", "Short stay explanation"] : [],
      strength: hasShortStayEvidence ? "strong" : "weak",
      confidence: hasShortStayEvidence ? 0.8 : 0.42,
      sourceRefs: refs(sources, ["appeal_grounds.md", "evidence_checklists.md"]),
      warnings: ["Check whether the notice alleges no payment, overstay, or stopping where not permitted."]
    },
    {
      id: "incorrect-details",
      title: "Incorrect notice details",
      description: "Errors in registration, date, location, or event details can matter.",
      whyItMayApply: "ParkPal extracted fields that should be manually confirmed before appeal.",
      requiredEvidence: ["Notice copy", "Vehicle records", "Location evidence"],
      availableEvidence: [],
      strength: fields.vehicleRegistration === "Needs confirmation" ? "possible" : "weak",
      confidence: 0.46,
      sourceRefs: refs(sources, ["appeal_grounds.md"]),
      warnings: ["Do not assert an error unless you can point to the exact inconsistency."]
    },
    {
      id: "keeper-driver",
      title: "Keeper or driver issue",
      description: "For private notices, the route may depend on whether the notice is to the driver or keeper.",
      whyItMayApply: noticeType === "notice_to_keeper" || noticeType === "private_parking_charge" ? "Private parking notices can raise keeper/driver process questions." : "Less relevant for council PCNs.",
      requiredEvidence: ["Notice wording", "Envelope dates if available"],
      availableEvidence: [],
      strength: noticeType === "private_parking_charge" || noticeType === "notice_to_keeper" ? "possible" : "not_recommended",
      confidence: 0.44,
      sourceRefs: refs(sources, ["private_parking_overview.md", "appeal_grounds.md"]),
      warnings: ["Avoid accidentally admitting facts that have not been confirmed."]
    }
  ];

  if (hasPaymentEvidence) {
    grounds.splice(2, 0, {
      id: "payment-or-permit-evidence",
      title: "Payment or permit evidence",
      description: "Payment, permit or session records may not match the allegation on the notice.",
      whyItMayApply: "The case includes payment or permit evidence that should be compared with the issuer's records and allegation.",
      requiredEvidence: ["Payment or permit record", "Notice copy", "Issuer evidence if available"],
      availableEvidence: demoEvidence ? ["Payment confirmation", "Bank transaction", "Parking app record"] : [],
      strength: demoEvidence ? "strong" : "possible",
      confidence: demoEvidence ? 0.8 : 0.56,
      sourceRefs: refs(sources, ["evidence_checklists.md", "council_pcn_overview.md", "private_parking_overview.md"]),
      warnings: ["Check that the payment or permit matches the vehicle, date, location and alleged parking period."]
    });
  }

  return grounds;
}

function refs(sources: RetrievedSource[], wanted: string[]) {
  // Only cite documents that were actually retrieved for this case.
  return sources.filter((source) => wanted.includes(source.document)).map((source) => source.document);
}
