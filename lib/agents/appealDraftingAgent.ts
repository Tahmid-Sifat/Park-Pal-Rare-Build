import { AppealGround, CaseFile } from "@/lib/types/caseTypes";

export function draftAppeal(caseFile: CaseFile, selectedGroundIds?: string[], tone = "Calm and factual") {
  const selected = caseFile.appealGrounds.filter((ground) => !selectedGroundIds?.length || selectedGroundIds.includes(ground.id));
  const evidence = caseFile.evidenceItems.filter((item) => item.status === "uploaded").map((item) => item.name);
  const fields = caseFile.noticeFields;
  const groundText = selected
    .map((ground) => `- ${ground.title}: ${ground.whyItMayApply}`)
    .join("\n");
  const evidenceText = evidence.length ? evidence.map((item) => `- ${item}`).join("\n") : "- Evidence still to be attached or confirmed.";
  const introTone = tone === "Very concise" ? "I challenge this Parking Charge Notice." : "I am challenging this parking notice based on the facts and evidence currently available.";
  const guidanceNotes = guidanceFromContext(caseFile.retrievedContext, caseFile.retrievedSources.map((s) => s.document));

  const full = `Dear Sir/Madam,

Reference: ${fields.noticeReference}
Vehicle registration: ${fields.vehicleRegistration}
Issuer: ${fields.issuerName}
Location: ${fields.location}

${introTone} This appeal is provided on an informational basis and the details should be checked against the original notice.

Factual summary
The notice appears to relate to ${fields.reason || "the parking event described in the notice"} on ${fields.contraventionDate} at ${fields.contraventionTime}. Based on the user's account, the vehicle stopped briefly in connection with a pharmacy collection.

Possible appeal grounds
${groundText || "- No appeal grounds selected yet."}

Evidence referenced
${evidenceText}
${guidanceNotes}

Requested outcome
Please review the evidence and cancel the notice. If you do not cancel it, please provide a clear explanation addressing each point and confirm the available escalation route and deadline.

Yours faithfully`;

  const short = `I challenge notice ${fields.noticeReference} for vehicle ${fields.vehicleRegistration}. The vehicle stopped briefly for a pharmacy collection, and the available evidence may support unclear signage and short-stay/grace-period points. Evidence: ${evidence.length ? evidence.join(", ") : "to be confirmed"}. Please cancel the notice or explain the escalation route and deadline.`;

  return {
    draftShort: short.slice(0, 1000),
    draftFull: full
  };
}

function guidanceFromContext(retrievedContext: string | undefined, sourceDocs: string[]) {
  if (!retrievedContext?.trim() || !sourceDocs.length) return "";
  const firstSnippet = retrievedContext.split("\n\n")[0]?.replace(/^[^:]+:\s*/, "").trim();
  if (!firstSnippet) return "";
  return `
Relevant guidance considered
- Sources: ${sourceDocs.join(", ")}
- Note: ${firstSnippet.slice(0, 280)}${firstSnippet.length > 280 ? "…" : ""}
`;
}
