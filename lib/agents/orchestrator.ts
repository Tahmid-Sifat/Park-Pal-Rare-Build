import { randomUUID } from "crypto";
import { readNotice } from "./noticeReaderAgent";
import { classifyIssuer } from "./issuerClassificationAgent";
import { buildDeadlines } from "./deadlineAgent";
import { retrieveRagContext } from "./ragKnowledgeAgent";
import { suggestAppealGrounds } from "./appealGroundsAgent";
import { buildEvidenceChecklist } from "./evidenceChecklistAgent";
import { draftAppeal } from "./appealDraftingAgent";
import { buildRiskFlags } from "./riskGuardAgent";
import { CaseFile } from "@/lib/types/caseTypes";
import { saveCase } from "@/lib/storage/caseStore";
import { buildNextActions } from "./actionAgent";

export async function analyzeNotice(rawText: string, options: { demoEvidence?: boolean } = {}) {
  const now = new Date().toISOString();
  const fields = readNotice(rawText);
  const classification = classifyIssuer(fields);
  const deadlines = buildDeadlines(fields);
  const rag = await retrieveRagContext(`${rawText} ${classification.classification} signage short stay evidence appeal`, 5);
  const sources = rag.relevantSnippets;
  const grounds = suggestAppealGrounds(fields, classification.classification, sources, options.demoEvidence);
  const evidence = buildEvidenceChecklist(grounds, options.demoEvidence);
  const partial = {
    noticeType: classification.classification,
    noticeFields: fields,
    deadlines,
    evidenceItems: evidence,
    redFlags: classification.redFlags
  };
  const riskFlags = buildRiskFlags(partial);

  const caseFile: CaseFile = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "analysed",
    noticeType: classification.classification,
    noticeFields: fields,
    classificationReason: classification.reason,
    likelyRoute: classification.likelyRoute,
    redFlags: classification.redFlags,
    deadlines,
    evidenceItems: evidence,
    appealGrounds: grounds,
    draftShort: "",
    draftFull: "",
    riskFlags,
    nextActions: [],
    timeline: [
      { id: "read", label: "Notice read", detail: "Structured fields extracted from pasted or uploaded text.", createdAt: now },
      { id: "classified", label: "Type classified", detail: classification.reason, createdAt: now },
      { id: "deadlines", label: "Deadlines extracted", detail: `${deadlines.length} deadline cards prepared with reminders.`, createdAt: now },
      { id: "sources", label: "Sources retrieved", detail: sources.map((source) => source.document).join(", "), createdAt: now },
      { id: "evidence", label: "Evidence checked", detail: `${evidence.length} evidence items generated.`, createdAt: now }
    ],
    retrievedSources: sources
  };

  const drafts = draftAppeal(caseFile);
  caseFile.draftShort = drafts.draftShort;
  caseFile.draftFull = drafts.draftFull;
  caseFile.nextActions = buildNextActions(caseFile);
  caseFile.timeline.push({ id: "drafted", label: "Appeal drafted", detail: "Short and full draft prepared for editing.", createdAt: now });
  caseFile.timeline.push({ id: "actions", label: "Actions prepared", detail: "Calendar, draft, checklist, and appeal pack actions are ready.", createdAt: now });
  caseFile.status = "draft_ready";

  await saveCase(caseFile);
  return caseFile;
}

export async function regenerateAppeal(caseFile: CaseFile, selectedGroundIds: string[], tone: string) {
  const drafts = draftAppeal(caseFile, selectedGroundIds, tone);
  const updated = {
    ...caseFile,
    ...drafts,
    nextActions: buildNextActions(caseFile),
    updatedAt: new Date().toISOString(),
    timeline: [
      ...caseFile.timeline,
      { id: `draft-${Date.now()}`, label: "Appeal drafted", detail: `${tone} version generated.`, createdAt: new Date().toISOString() }
    ]
  };
  await saveCase(updated);
  return updated;
}
