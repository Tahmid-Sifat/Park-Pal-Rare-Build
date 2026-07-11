export type NoticeType =
  | "council_pcn"
  | "private_parking_charge"
  | "notice_to_keeper"
  | "debt_collector_letter"
  | "court_claim_or_legal_document"
  | "possible_scam"
  | "unknown";

export type DeadlineType = "appeal" | "discount" | "payment" | "evidence" | "escalation";
export type EvidenceStatus = "uploaded" | "missing" | "optional";
export type GroundStrength = "strong" | "possible" | "weak" | "not_recommended";

export type NoticeFields = {
  issuerName: string;
  noticeReference: string;
  vehicleRegistration: string;
  issueDate: string;
  contraventionDate: string;
  contraventionTime: string;
  location: string;
  amountDue: number | null;
  discountedAmount: number | null;
  paymentDeadline: string | null;
  appealDeadline: string | null;
  discountDeadline: string | null;
  appealUrl: string | null;
  paymentUrl: string | null;
  reason: string | null;
  rawText: string;
  confidence: number;
};

export type Deadline = {
  id: string;
  type: DeadlineType;
  title: string;
  date: string;
  confidence: number;
  sourceText: string;
  reminders: string[];
};

export type AppealGround = {
  id: string;
  title: string;
  description: string;
  whyItMayApply: string;
  requiredEvidence: string[];
  availableEvidence: string[];
  strength: GroundStrength;
  confidence: number;
  sourceRefs: string[];
  warnings: string[];
};

export type EvidenceItem = {
  id: string;
  name: string;
  whyNeeded: string;
  status: EvidenceStatus;
  relatedGroundId?: string;
  example?: string;
};

export type EvidenceAttachment = {
  id: string;
  fileName: string;
  storedName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
};

export type RetrievedSource = {
  document: string;
  snippet: string;
  score: number;
};

export type TimelineEvent = {
  id: string;
  label: string;
  detail: string;
  createdAt: string;
};

export type CaseFile = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "uploaded" | "analysed" | "evidence_needed" | "draft_ready" | "submitted" | "rejected" | "escalation_needed";
  noticeType: NoticeType;
  noticeFields: NoticeFields;
  classificationReason: string;
  likelyRoute: string;
  redFlags: string[];
  deadlines: Deadline[];
  evidenceItems: EvidenceItem[];
  evidenceSummary?: string;
  evidenceAttachments?: EvidenceAttachment[];
  appealGrounds: AppealGround[];
  draftShort: string;
  draftFull: string;
  riskFlags: string[];
  nextActions: string[];
  timeline: TimelineEvent[];
  retrievedSources: RetrievedSource[];
  rejectionAnalysis?: RejectionAnalysis;
};

export type RejectionAnalysis = {
  rejectionReason: string;
  newDeadline: string | null;
  escalationRoute: string;
  evidenceAddressed: string;
  nextRecommendedAction: string;
  escalationDraft: string;
  riskFlags: string[];
};
