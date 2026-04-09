import type {
  VerificationAddressMatchItem,
  VerificationCheckItem,
  VerificationContactItem,
  VerificationDocumentItem,
  VerificationOverview,
  VerificationStatusSummary,
  VerificationTimelineItem,
} from "./types";

export function mapVerificationOverview(raw: {
  summary: VerificationStatusSummary;
  timeline: VerificationTimelineItem[];
  checks: VerificationCheckItem[];
  documents: VerificationDocumentItem[];
  contacts: VerificationContactItem[];
  addressMatches: VerificationAddressMatchItem[];
}): VerificationOverview {
  return raw;
}