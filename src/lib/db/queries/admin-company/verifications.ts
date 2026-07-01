import { serviceRequest, serviceRequestOptional } from "@/lib/http/service-client";
import {
  asRecord,
  pick,
  toBoolean,
  toIsoString,
  toNumber,
  toStringValue,
  toTone,
  unwrapList,
  type AnyRecord,
} from "@/lib/http/service-data";
import type {
  CompanyVerificationData,
  VerificationAddressMatchItem,
  VerificationCheckItem,
  VerificationContactItem,
  VerificationDocumentItem,
  VerificationStatusSummary,
  VerificationTimelineItem,
} from "@/features/admin-company/verifications/types";

export async function getCompanyVerificationsQuery(
  _companyId: number
): Promise<CompanyVerificationData> {
  const payload =
    (await serviceRequestOptional<unknown>({
      service: "verifications",
      directPath: "/api/business/verifications/overview",
      gatewayPath: "/api/verifications/api/business/verifications/overview",
    })) ??
    (await serviceRequest<unknown>({
      service: "verifications",
      directPath: "/api/business/verifications",
      gatewayPath: "/api/verifications/api/business/verifications",
      errorCode: "VERIFICATIONS_SERVICE_ERROR",
      errorMessage: "No se pudo cargar el estado de verificación.",
    }));

  const row = asRecord(payload);

  return {
    summary: normalizeSummary(pick(row, "summary", "status", "verificationSummary", "verification_summary")),
    checks: unwrapList(row, "checks", "verificationChecks", "verification_checks").map(normalizeCheck),
    documents: unwrapList(row, "documents", "verificationDocuments", "verification_documents").map(normalizeDocument),
    contacts: unwrapList(row, "contacts", "verificationContacts", "verification_contacts").map(normalizeContact),
    addressMatches: unwrapList(row, "addressMatches", "address_matches", "addresses").map(normalizeAddressMatch),
    timeline: unwrapList(row, "timeline", "events", "history").map(normalizeTimelineItem),
  };
}

function normalizeSummary(value: unknown): VerificationStatusSummary | null {
  const row = asRecord(value);

  if (!Object.keys(row).length) return null;

  return {
    level: toStringValue(pick(row, "level"), "Pendiente"),
    statusLabel: toStringValue(
      pick(row, "statusLabel", "status_label", "statusName", "status_name"),
      "Sin revisión"
    ),
    statusTone: toTone(pick(row, "statusTone", "status_tone")),
    score: toNumber(pick(row, "score")),
    lastReviewAt:
      pick(row, "lastReviewAt", "last_review_at") === undefined
        ? null
        : String(pick(row, "lastReviewAt", "last_review_at")),
    checksCompleted: toNumber(pick(row, "checksCompleted", "checks_completed")),
    checksTotal: toNumber(pick(row, "checksTotal", "checks_total")),
  };
}

function normalizeCheck(row: AnyRecord): VerificationCheckItem {
  return {
    id: toNumber(pick(row, "id", "checkId", "check_id")),
    code: toStringValue(pick(row, "code"), ""),
    label: toStringValue(pick(row, "label", "name"), "Revisión"),
    statusLabel: toStringValue(
      pick(row, "statusLabel", "status_label", "statusName", "status_name"),
      "Pendiente"
    ),
    statusTone: toTone(pick(row, "statusTone", "status_tone")),
    notes: pick(row, "notes") === undefined ? null : String(pick(row, "notes")),
    reviewedAt:
      pick(row, "reviewedAt", "reviewed_at") === undefined
        ? null
        : String(pick(row, "reviewedAt", "reviewed_at")),
  };
}

function normalizeDocument(row: AnyRecord): VerificationDocumentItem {
  return {
    id: toNumber(pick(row, "id", "documentId", "document_id")),
    typeLabel: toStringValue(
      pick(row, "typeLabel", "type_label", "documentType", "document_type"),
      "Documento"
    ),
    fileName: toStringValue(pick(row, "fileName", "file_name", "name"), "archivo"),
    fileUrl: toStringValue(pick(row, "fileUrl", "file_url", "url"), ""),
    statusLabel: toStringValue(
      pick(row, "statusLabel", "status_label", "status"),
      "Pendiente"
    ),
    uploadedAt:
      pick(row, "uploadedAt", "uploaded_at", "createdAt", "created_at") === undefined
        ? null
        : String(pick(row, "uploadedAt", "uploaded_at", "createdAt", "created_at")),
  };
}

function normalizeContact(row: AnyRecord): VerificationContactItem {
  return {
    id: toNumber(pick(row, "id", "contactId", "contact_id")),
    contactType: toStringValue(pick(row, "contactType", "contact_type", "type"), "contacto"),
    value: toStringValue(pick(row, "value"), ""),
    sourceLabel: toStringValue(pick(row, "sourceLabel", "source_label", "source"), "Fuente"),
    matchesCompany: toBoolean(
      pick(row, "matchesCompany", "matches_company"),
      false
    ),
  };
}

function normalizeAddressMatch(row: AnyRecord): VerificationAddressMatchItem {
  return {
    sourceLabel: toStringValue(pick(row, "sourceLabel", "source_label", "source"), "Fuente"),
    addressValue: toStringValue(
      pick(row, "addressValue", "address_value", "address"),
      ""
    ),
    matchesCompany: toBoolean(
      pick(row, "matchesCompany", "matches_company"),
      false
    ),
  };
}

function normalizeTimelineItem(row: AnyRecord, index: number): VerificationTimelineItem {
  return {
    id: toStringValue(pick(row, "id"), `timeline-${index}`),
    title: toStringValue(pick(row, "title"), "Evento de verificación"),
    description: toStringValue(pick(row, "description"), ""),
    createdAt: toIsoString(pick(row, "createdAt", "created_at")),
    type: normalizeTimelineType(pick(row, "type")),
  };
}

function normalizeTimelineType(value: unknown): VerificationTimelineItem["type"] {
  const type = toStringValue(value, "system");

  if (["document", "review", "contact", "address", "system"].includes(type)) {
    return type as VerificationTimelineItem["type"];
  }

  return "system";
}
