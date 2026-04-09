export type VerificationStatusSummary = {
  levelLabel: string;
  statusLabel: string;
  statusTone: "default" | "success" | "warning" | "danger" | "info";
  score: number;
  verifiedAt: string | null;
  expiresAt: string | null;
};

export type VerificationTimelineItem = {
  id: string;
  title: string;
  description: string;
  date: string;
};

export type VerificationCheckItem = {
  id: number;
  methodName: string;
  statusLabel: string;
  statusTone: "default" | "success" | "warning" | "danger" | "info";
  score: number;
  confidenceScore: number;
  branchName: string | null;
  verifiedAt: string | null;
};

export type VerificationDocumentItem = {
  id: number;
  fileName: string;
  documentType: string;
  reviewStatusLabel: string;
  reviewStatusTone: "default" | "success" | "warning" | "danger" | "info";
  uploadedAt: string;
  extractedName: string | null;
  extractedAddress: string | null;
};

export type VerificationContactItem = {
  id: number;
  source: string;
  contactLabel: string | null;
  contactValue: string;
  matchedWithBranchContact: boolean;
  verifiedAt: string | null;
};

export type VerificationAddressMatchItem = {
  id: number;
  sourceType: string;
  declaredAddress: string;
  extractedAddress: string | null;
  branchAddress: string | null;
  matched: boolean;
  confidenceScore: number;
  distanceMeters: number | null;
};

export type VerificationOverview = {
  summary: VerificationStatusSummary;
  timeline: VerificationTimelineItem[];
  checks: VerificationCheckItem[];
  documents: VerificationDocumentItem[];
  contacts: VerificationContactItem[];
  addressMatches: VerificationAddressMatchItem[];
};