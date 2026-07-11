import { AppealGround, CaseFile, Deadline, EvidenceItem, NoticeFields, NoticeType, RetrievedSource } from "./caseTypes";

export type AgentWarning = {
  code: string;
  message: string;
  severity: "info" | "warning" | "urgent";
};

export type NoticeReaderOutput = {
  rawText: string;
  extractedNoticeFields: NoticeFields;
  extractionConfidence: number;
  warnings: AgentWarning[];
};

export type IssuerClassificationOutput = {
  classification: NoticeType;
  confidence: number;
  reason: string;
  likelyRoute: string;
  redFlags: string[];
};

export type DeadlineAgentOutput = {
  deadlines: Deadline[];
};

export type RagAgentOutput = {
  retrievedContext: string;
  sourceDocuments: string[];
  relevantSnippets: RetrievedSource[];
  confidence: number;
};

export type AppealGroundsOutput = {
  appealGrounds: AppealGround[];
};

export type EvidenceChecklistOutput = {
  evidenceItems: EvidenceItem[];
};

export type RiskGuardOutput = {
  riskFlags: string[];
  safeToExport: boolean;
  recommendedUserConfirmationQuestions: string[];
  improvedDraftSuggestions: string[];
};

export type ActionAgentOutput = {
  caseFile: CaseFile;
  nextActions: string[];
};
