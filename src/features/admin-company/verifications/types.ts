export type VerificationStatusSummary = {
  level: string;
  statusLabel: string;
  statusTone: "default" | "success" | "warning" | "danger" | "info";
  score: number;
  lastReviewAt: string | null;
  checksCompleted: number;
  checksTotal: number;
};

export type VerificationCheckItem = {
  id: number;
  code: string;
  label: string;
  statusLabel: string;
  statusTone: "default" | "success" | "warning" | "danger" | "info";
  notes: string | null;
  reviewedAt: string | null;
};

export type VerificationDocumentItem = {
  id: number;
  typeLabel: string;
  fileName: string;
  fileUrl: string;
  statusLabel: string;
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
  sourceLabel: string;
  addressValue: string;
  matchesCompany: boolean;
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
  checks: VerificationCheckItem[];
  documents: VerificationDocumentItem[];
  contacts: VerificationContactItem[];
  addressMatches: VerificationAddressMatchItem[];
  timeline: VerificationTimelineItem[];
};