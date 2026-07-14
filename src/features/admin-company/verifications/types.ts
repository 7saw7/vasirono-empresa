export type VerificationTone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type VerificationStatusSummary = {
  level: string;
  statusLabel: string;
  statusCode: string;
  statusTone: VerificationTone;
  score: number;
  lastReviewAt: string | null;
  checksCompleted: number;
  checksTotal: number;
};

export type VerificationRequestSummary = {
  verificationRequestId: number;
  statusName: string;
  statusCode: string;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type VerificationCheckItem = {
  id: number;
  code: string;
  label: string;
  statusLabel: string;
  statusTone: VerificationTone;
  notes: string | null;
  reviewedAt: string | null;
};

export type VerificationDocumentItem = {
  id: number;
  typeLabel: string;
  fileName: string;
  fileUrl: string;
  statusLabel: string;
  statusCode: string;
  reviewNotes: string | null;
  uploadedAt: string | null;
};

export type VerificationContactItem = {
  id: number;
  contactType: string;
  value: string;
  sourceLabel: string;
  matchesCompany: boolean;
};

export type VerificationAddressMatchItem = {
  id: number;
  sourceLabel: string;
  addressValue: string;
  matchesCompany: boolean;
  confidenceScore: number;
  notes: string | null;
};

export type VerificationTimelineItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: "document" | "review" | "contact" | "address" | "system";
};

export type CompanyVerificationData = {
  summary: VerificationStatusSummary | null;
  request: VerificationRequestSummary | null;
  checks: VerificationCheckItem[];
  documents: VerificationDocumentItem[];
  contacts: VerificationContactItem[];
  addressMatches: VerificationAddressMatchItem[];
  timeline: VerificationTimelineItem[];
};
