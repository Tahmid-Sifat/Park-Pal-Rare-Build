import { CaseFile, NoticeType } from "@/lib/types/caseTypes";
import type { Prisma } from "@/lib/generated/prisma/client";

export type AiAnalysisJson = {
  ticketType: string;
  confidence: number;
  grounds: string[];
  recommendedEvidence: string[];
  nextStep: string;
  /** Full in-memory case snapshot so the existing UI can round-trip unchanged. */
  caseSnapshot: CaseFile;
};

const TICKET_TYPE_LABELS: Record<NoticeType, string> = {
  council_pcn: "Council PCN",
  private_parking_charge: "Private Parking Charge",
  notice_to_keeper: "Notice to Keeper",
  debt_collector_letter: "Debt Collector Letter",
  court_claim_or_legal_document: "Court Claim / Legal Document",
  possible_scam: "Possible Scam",
  unknown: "Unknown"
};

export function buildAiAnalysis(caseFile: CaseFile): AiAnalysisJson {
  return {
    ticketType: TICKET_TYPE_LABELS[caseFile.noticeType] || caseFile.noticeType,
    confidence: caseFile.noticeFields.confidence,
    grounds: caseFile.appealGrounds.map((ground) => ground.title),
    recommendedEvidence: caseFile.evidenceItems.map((item) => item.name),
    nextStep: caseFile.nextActions[0] || "Appeal",
    caseSnapshot: caseFile
  };
}

export function parseFlexibleDate(value: string | null | undefined): Date | null {
  if (!value || value === "Needs confirmation") return null;

  const iso = Date.parse(value);
  if (!Number.isNaN(iso)) return new Date(iso);

  const uk = value.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (uk) {
    const day = Number(uk[1]);
    const month = Number(uk[2]);
    let year = Number(uk[3]);
    if (year < 100) year += 2000;
    const date = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function caseFileToDbFields(caseFile: CaseFile, options: { uploadedImageUrl?: string | null } = {}) {
  const appealDeadline =
    caseFile.deadlines.find((d) => d.type === "appeal" || d.id === "appeal")?.date ||
    caseFile.noticeFields.appealDeadline;

  return {
    pcnNumber: emptyToNull(caseFile.noticeFields.noticeReference),
    vehicleRegistration: emptyToNull(caseFile.noticeFields.vehicleRegistration),
    issuer: emptyToNull(caseFile.noticeFields.issuerName),
    ticketType: caseFile.noticeType,
    issueDate: parseFlexibleDate(caseFile.noticeFields.issueDate),
    appealDeadline: parseFlexibleDate(appealDeadline),
    status: caseFile.status,
    location: emptyToNull(caseFile.noticeFields.location),
    uploadedImageUrl: options.uploadedImageUrl ?? null
  };
}

export function buildAnalysisCreate(caseFile: CaseFile) {
  const analysis = buildAiAnalysis(caseFile);
  return {
    confidenceScore: caseFile.noticeFields.confidence,
    analysisJson: analysis as unknown as Prisma.InputJsonValue
  };
}

export function buildEvidenceCreates(caseFile: CaseFile) {
  const fromAttachments =
    caseFile.evidenceAttachments?.map((item) => ({
      imageUrl: item.storedName ? `local://evidence/${caseFile.id}/${item.storedName}` : null,
      description: item.fileName,
      uploadedAt: parseFlexibleDate(item.uploadedAt) ?? new Date()
    })) ?? [];

  if (fromAttachments.length) return fromAttachments;

  return caseFile.evidenceItems
    .filter((item) => item.status === "uploaded")
    .map((item) => ({
      imageUrl: null as string | null,
      description: `${item.name}${item.example ? ` — ${item.example}` : ""}`,
      uploadedAt: new Date()
    }));
}

export function buildReminderCreates(caseFile: CaseFile): Array<{
  reminderDate: Date;
  reminderType: string;
  completed: boolean;
}> {
  const rows: Array<{ reminderDate: Date; reminderType: string; completed: boolean }> = [];
  for (const deadline of caseFile.deadlines) {
    const reminderDate = parseFlexibleDate(deadline.date);
    if (!reminderDate) continue;
    rows.push({
      reminderDate,
      reminderType: deadline.type,
      completed: false
    });
  }
  return rows;
}

export function dbCaseToCaseFile(analysisJson: unknown): CaseFile | null {
  if (!analysisJson || typeof analysisJson !== "object") return null;
  const snapshot = (analysisJson as AiAnalysisJson).caseSnapshot;
  if (!snapshot?.id || !snapshot.noticeFields) return null;
  return snapshot;
}

function emptyToNull(value: string | null | undefined) {
  if (!value || value === "Needs confirmation" || value === "Not detected yet") return null;
  return value;
}
