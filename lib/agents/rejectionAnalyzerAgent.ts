import { RejectionAnalysis } from "@/lib/types/caseTypes";

export function analyzeRejectionText(text: string): RejectionAnalysis {
  const lower = text.toLowerCase();
  const popla = lower.includes("popla");
  const ias = lower.includes("ias");
  const council = /council|tribunal|formal representation|notice of rejection/.test(lower);
  const court = /court|claim|legal proceedings/.test(lower);
  const deadlineMatch = text.match(/(?:by|before|within)\s+([0-9]{1,2}[\/\-. ][0-9]{1,2}[\/\-. ][0-9]{2,4}|\d+\s+days)/i);

  return {
    rejectionReason: lower.includes("sign") ? "The rejection appears to rely on signage or displayed terms." : "The rejection reason needs manual confirmation from the letter.",
    newDeadline: deadlineMatch?.[1] || null,
    escalationRoute: court
      ? "Urgent human/legal review recommended."
      : popla
        ? "Potential POPLA escalation route. Check the rejection code and deadline."
        : ias
          ? "Potential IAS escalation route. Check the official deadline."
          : council
            ? "Potential council formal representation or tribunal route. Check the notice stage and stated deadline."
            : "Check whether the operator or council has provided a formal escalation route.",
    evidenceAddressed: lower.includes("evidence") || lower.includes("receipt") || lower.includes("photo") ? "Some evidence appears to be mentioned." : "The letter may not clearly address the user's evidence.",
    nextRecommendedAction: court ? "Do not ignore the letter. Consider qualified legal support urgently." : "Prepare an escalation bundle and verify the deadline from the rejection letter.",
    escalationDraft: "I am escalating this matter because the rejection does not appear to fully address the evidence and appeal grounds already provided. Please review the attached evidence bundle and confirm the applicable deadline and route.",
    riskFlags: court ? ["Court/legal wording detected. Human review recommended."] : ["Verify the new deadline and appeal body against the rejection letter."]
  };
}
