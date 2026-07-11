import { NoticeFields, NoticeType } from "@/lib/types/caseTypes";

export function classifyIssuer(fields: NoticeFields) {
  const text = fields.rawText.toLowerCase();
  let classification: NoticeType = "unknown";
  let likelyRoute = "Confirm the issuer and follow the official instructions shown on the notice.";
  const redFlags: string[] = [];

  if (/county court|claim form|particulars of claim|court/i.test(text)) {
    classification = "court_claim_or_legal_document";
    likelyRoute = "Urgent human or legal review recommended before responding.";
    redFlags.push("This appears court-related. Consider urgent human legal advice.");
  } else if (/debt collector|debt recovery|final demand|letter before claim/i.test(text)) {
    classification = "debt_collector_letter";
    likelyRoute = "Check the original notice, prior appeal windows, and whether legal action is threatened.";
    redFlags.push("This appears to be later-stage correspondence, not the original notice.");
  } else if (/penalty charge notice|council|traffic management act|civil enforcement/i.test(text)) {
    classification = "council_pcn";
    likelyRoute = "Challenge through the issuing council first. If rejected, follow the formal representation or tribunal route for the stage.";
  } else if (/notice to keeper/i.test(text)) {
    classification = "notice_to_keeper";
    likelyRoute = "Appeal to the operator first. Escalation may depend on the operator trade association.";
  } else if (/parking charge notice|private parking|operator|popla|ias/i.test(text)) {
    classification = "private_parking_charge";
    likelyRoute = "Appeal to the operator first. If rejected, escalation may depend on trade association, such as POPLA or IAS.";
  }

  if (/bank transfer|crypto|gift card|whatsapp/i.test(text)) {
    classification = "possible_scam";
    redFlags.push("Unusual payment instructions detected. Verify independently using official channels.");
  }

  return {
    classification,
    confidence: classification === "unknown" ? 0.38 : 0.82,
    reason: `Classified from wording in the notice and issuer route signals as ${classification.replaceAll("_", " ")}.`,
    likelyRoute,
    redFlags
  };
}
