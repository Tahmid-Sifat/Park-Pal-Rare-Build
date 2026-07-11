import { CaseFile } from "@/lib/types/caseTypes";
import {
  buildAnalysisCreate,
  buildEvidenceCreates,
  buildReminderCreates,
  caseFileToDbFields,
  dbCaseToCaseFile
} from "./mappers";
import { isDatabaseConfigured, prisma } from "./prisma";

const DEFAULT_USER_EMAIL = "demo@parkpal.local";
const DEFAULT_USER_NAME = "ParkPal Demo User";

const caseInclude = {
  user: true,
  aiAnalyses: { orderBy: { createdAt: "desc" as const } },
  evidence: true,
  appeals: { orderBy: { createdAt: "desc" as const } },
  reminders: true
};

export type CreateCaseInput = {
  caseFile: CaseFile;
  userId?: string;
  fileUrl?: string | null;
  ocrText?: string | null;
};

export type UpdateCaseInput = {
  caseFile: CaseFile;
  appealText?: string;
  submitted?: boolean;
  pdfUrl?: string | null;
};

/** Ensure a default demo user exists (no auth UI yet). */
export async function ensureDefaultUser() {
  return prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_USER_EMAIL,
      name: DEFAULT_USER_NAME
    }
  });
}

export async function createCase(input: CreateCaseInput) {
  const user = input.userId
    ? await prisma.user.findUniqueOrThrow({ where: { id: input.userId } })
    : await ensureDefaultUser();

  const fields = caseFileToDbFields(input.caseFile, { uploadedImageUrl: input.fileUrl });
  const appealText = input.caseFile.draftFull || input.caseFile.draftShort || "";
  const analysis = buildAnalysisCreate(input.caseFile);
  const evidenceRows = buildEvidenceCreates(input.caseFile);
  const reminderRows = buildReminderCreates(input.caseFile);

  // OCR text is retained inside analysisJson.caseSnapshot / noticeFields.rawText.
  void input.ocrText;

  return prisma.case.create({
    data: {
      id: input.caseFile.id,
      userId: user.id,
      ...fields,
      aiAnalyses: {
        create: [analysis]
      },
      evidence: evidenceRows.length ? { create: evidenceRows } : undefined,
      reminders: reminderRows.length
        ? {
            create: reminderRows
          }
        : undefined,
      appeals: appealText
        ? {
            create: [
              {
                appealText,
                pdfUrl: null,
                submitted: false,
                submittedAt: null
              }
            ]
          }
        : undefined
    },
    include: caseInclude
  });
}

export async function getCaseById(id: string) {
  return prisma.case.findUnique({
    where: { id },
    include: caseInclude
  });
}

export async function getCaseFileById(id: string): Promise<CaseFile | null> {
  const row = await getCaseById(id);
  if (!row) return null;
  const latestAnalysis = row.aiAnalyses[0];
  return latestAnalysis ? dbCaseToCaseFile(latestAnalysis.analysisJson) : null;
}

export async function listCases(options: { userId?: string; take?: number } = {}) {
  return prisma.case.findMany({
    where: options.userId ? { userId: options.userId } : undefined,
    orderBy: { updatedAt: "desc" },
    take: options.take ?? 50,
    include: caseInclude
  });
}

export async function updateCase(input: UpdateCaseInput) {
  const fields = caseFileToDbFields(input.caseFile);
  const appealText = input.appealText ?? input.caseFile.draftFull ?? input.caseFile.draftShort;
  const analysis = buildAnalysisCreate(input.caseFile);
  const evidenceRows = buildEvidenceCreates(input.caseFile);
  const reminderRows = buildReminderCreates(input.caseFile);

  const existing = await prisma.case.findUnique({
    where: { id: input.caseFile.id },
    include: { appeals: { orderBy: { createdAt: "desc" }, take: 1 } }
  });

  if (!existing) {
    return createCase({ caseFile: input.caseFile, ocrText: input.caseFile.noticeFields.rawText });
  }

  const latestAppeal = existing.appeals[0];
  const submitted = input.submitted ?? latestAppeal?.submitted ?? false;

  return prisma.$transaction(async (tx) => {
    await tx.aIAnalysis.create({
      data: {
        caseId: input.caseFile.id,
        ...analysis
      }
    });

    await tx.evidence.deleteMany({ where: { caseId: input.caseFile.id } });
    if (evidenceRows.length) {
      await tx.evidence.createMany({
        data: evidenceRows.map((row) => ({ ...row, caseId: input.caseFile.id }))
      });
    }

    await tx.reminder.deleteMany({ where: { caseId: input.caseFile.id } });
    if (reminderRows.length) {
      await tx.reminder.createMany({
        data: reminderRows.map((row) => ({
          caseId: input.caseFile.id,
          reminderDate: row.reminderDate,
          reminderType: row.reminderType,
          completed: row.completed
        }))
      });
    }

    if (latestAppeal) {
      await tx.appeal.update({
        where: { id: latestAppeal.id },
        data: {
          appealText,
          pdfUrl: input.pdfUrl ?? latestAppeal.pdfUrl,
          submitted,
          submittedAt: submitted ? latestAppeal.submittedAt ?? new Date() : null
        }
      });
    } else if (appealText) {
      await tx.appeal.create({
        data: {
          caseId: input.caseFile.id,
          appealText,
          pdfUrl: input.pdfUrl ?? null,
          submitted,
          submittedAt: submitted ? new Date() : null
        }
      });
    }

    return tx.case.update({
      where: { id: input.caseFile.id },
      data: fields,
      include: caseInclude
    });
  });
}

export async function deleteCase(id: string) {
  return prisma.case.delete({ where: { id } });
}

/** Upsert analysed CaseFile into PostgreSQL (create or update). */
export async function persistCaseFile(caseFile: CaseFile, options: { fileUrl?: string | null } = {}) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const existing = await prisma.case.findUnique({ where: { id: caseFile.id } });
  if (existing) {
    return updateCase({ caseFile });
  }
  return createCase({
    caseFile,
    fileUrl: options.fileUrl,
    ocrText: caseFile.noticeFields.rawText
  });
}

export async function createEvidence(
  caseId: string,
  data: { imageUrl?: string | null; description?: string | null }
) {
  return prisma.evidence.create({
    data: {
      caseId,
      imageUrl: data.imageUrl ?? null,
      description: data.description ?? null
    }
  });
}

export async function createAppeal(
  caseId: string,
  appealText: string,
  options: { submitted?: boolean; pdfUrl?: string | null } = {}
) {
  const submitted = options.submitted ?? false;
  return prisma.appeal.create({
    data: {
      caseId,
      appealText,
      pdfUrl: options.pdfUrl ?? null,
      submitted,
      submittedAt: submitted ? new Date() : null
    }
  });
}

export async function createReminder(
  caseId: string,
  data: { reminderDate: Date; reminderType: string; completed?: boolean }
) {
  return prisma.reminder.create({
    data: {
      caseId,
      reminderDate: data.reminderDate,
      reminderType: data.reminderType,
      completed: data.completed ?? false
    }
  });
}

export async function createAIAnalysis(
  caseId: string,
  data: { confidenceScore: number; analysisJson: PrismaJson }
) {
  return prisma.aIAnalysis.create({
    data: {
      caseId,
      confidenceScore: data.confidenceScore,
      analysisJson: data.analysisJson
    }
  });
}

type PrismaJson = ReturnType<typeof buildAnalysisCreate>["analysisJson"];
