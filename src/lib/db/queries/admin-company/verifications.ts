import { getRawSessionToken, getSession } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/app-error";
import { buildServiceUrl, serviceRequest } from "@/lib/http/service-client";
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
  VerificationRequestSummary,
  VerificationStatusSummary,
  VerificationTimelineItem,
} from "@/features/admin-company/verifications/types";

export async function getCompanyVerificationsQuery(
  companyId: number,
): Promise<CompanyVerificationData> {
  const payload = await serviceRequest<unknown>({
    service: "verifications",
    companyId,
    directPath: `/api/business/companies/${companyId}/verifications/overview`,
    gatewayPath: `/api/verifications/api/business/companies/${companyId}/verifications/overview`,
    errorCode: "VERIFICATIONS_SERVICE_ERROR",
    errorMessage: "No se pudo cargar el estado de verificación.",
  });

  const row = asRecord(payload);

  return {
    summary: normalizeSummary(
      pick(row, "summary", "status", "verificationSummary", "verification_summary") ?? row,
    ),
    request: normalizeRequest(pick(row, "request")),
    checks: unwrapList(row, "checks", "verificationChecks", "verification_checks").map(
      normalizeCheck,
    ),
    documents: unwrapList(
      row,
      "documents",
      "verificationDocuments",
      "verification_documents",
    ).map(normalizeDocument),
    contacts: unwrapList(
      row,
      "contacts",
      "verificationContacts",
      "verification_contacts",
    ).map(normalizeContact),
    addressMatches: unwrapList(
      row,
      "addressMatches",
      "address_matches",
      "addresses",
    ).map(normalizeAddressMatch),
    timeline: unwrapList(row, "timeline", "events", "history").map(
      normalizeTimelineItem,
    ),
  };
}

export async function requestCompanyVerificationQuery(
  companyId: number,
  input: { levelCode?: string; publicSummary?: string },
) {
  return serviceRequest<unknown, typeof input>({
    service: "verifications",
    companyId,
    directPath: `/api/business/companies/${companyId}/verifications/request`,
    gatewayPath: `/api/verifications/api/business/companies/${companyId}/verifications/request`,
    method: "POST",
    body: input,
    errorCode: "VERIFICATION_REQUEST_ERROR",
    errorMessage: "No se pudo iniciar la verificación.",
  });
}

export async function submitCompanyVerificationQuery(
  companyId: number,
  input: { publicSummary?: string },
) {
  return serviceRequest<unknown, typeof input>({
    service: "verifications",
    companyId,
    directPath: `/api/business/companies/${companyId}/verifications/submit`,
    gatewayPath: `/api/verifications/api/business/companies/${companyId}/verifications/submit`,
    method: "POST",
    body: input,
    errorCode: "VERIFICATION_SUBMIT_ERROR",
    errorMessage: "No se pudo enviar la verificación.",
  });
}

export async function uploadCompanyVerificationDocumentQuery(
  companyId: number,
  input: {
    file: File;
    documentTypeCode: string;
    branchId?: number | null;
    notes?: string | null;
    extractedAddress?: string | null;
    extractedName?: string | null;
    extractedDocumentNumber?: string | null;
    extractedIssueDate?: string | null;
  },
) {
  const formData = new FormData();
  formData.set("file", input.file);
  formData.set("documentTypeCode", input.documentTypeCode);
  if (input.branchId) formData.set("branchId", String(input.branchId));
  if (input.notes) formData.set("notes", input.notes);
  if (input.extractedAddress) formData.set("extractedAddress", input.extractedAddress);
  if (input.extractedName) formData.set("extractedName", input.extractedName);
  if (input.extractedDocumentNumber) {
    formData.set("extractedDocumentNumber", input.extractedDocumentNumber);
  }
  if (input.extractedIssueDate) {
    formData.set("extractedIssueDate", input.extractedIssueDate);
  }

  const url = buildServiceUrl({
    service: "verifications",
    directPath: `/api/business/companies/${companyId}/verifications/documents`,
    gatewayPath: `/api/verifications/api/business/companies/${companyId}/verifications/documents`,
  });
  const token = await getRawSessionToken();
  const session = await getSession();

  const response = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(session
        ? {
            "x-user-id": session.userId,
            "x-user-email": session.email,
            "x-user-role": session.role,
            "x-role-name": session.role,
            "x-portal": "company",
            "x-company-id": String(companyId),
            "x-company-ids": String(companyId),
            "x-user-permissions": [
              "verifications.business.read_own",
              "verifications.business.request",
              "verifications.business.submit",
            ].join(","),
          }
        : {}),
    },
    body: formData,
  });

  const text = await response.text();
  const payload = safeJson(text);

  if (!response.ok) {
    const error = asRecord(pick(asRecord(payload), "error"));
    throw new AppError(
      toStringValue(pick(error, "code"), "VERIFICATION_DOCUMENT_UPLOAD_ERROR"),
      toStringValue(
        pick(error, "message"),
        "No se pudo cargar el documento de verificación.",
      ),
      response.status || 502,
    );
  }

  return pick(asRecord(payload), "data") ?? payload;
}

export async function getCompanyVerificationDocumentViewUrlQuery(
  companyId: number,
  documentId: number,
): Promise<{ url: string; fileName: string; expiresIn: number }> {
  const payload = await serviceRequest<unknown>({
    service: "verifications",
    companyId,
    directPath: `/api/business/companies/${companyId}/verifications/documents/${documentId}/view-url`,
    gatewayPath: `/api/verifications/api/business/companies/${companyId}/verifications/documents/${documentId}/view-url`,
    errorCode: "VERIFICATION_DOCUMENT_VIEW_ERROR",
    errorMessage: "No se pudo abrir el documento.",
  });
  const row = asRecord(payload);

  return {
    url: toStringValue(pick(row, "url"), ""),
    fileName: toStringValue(pick(row, "fileName", "file_name"), "documento"),
    expiresIn: toNumber(pick(row, "expiresIn", "expires_in"), 300),
  };
}

function normalizeSummary(value: unknown): VerificationStatusSummary | null {
  const row = asRecord(value);
  if (!Object.keys(row).length) return null;

  const request = asRecord(pick(row, "request"));

  return {
    level: toStringValue(
      pick(row, "level", "verificationLevel", "verification_level"),
      "Pendiente",
    ),
    statusLabel: toStringValue(
      pick(
        row,
        "statusLabel",
        "status_label",
        "statusName",
        "status_name",
        "requestStatusName",
        "request_status_name",
      ) ?? pick(request, "statusName", "status_name"),
      "Sin revisión",
    ),
    statusCode: toStringValue(
      pick(row, "statusCode", "status_code", "requestStatusCode", "request_status_code") ??
        pick(request, "statusCode", "status_code"),
      "unknown",
    ),
    statusTone: toTone(pick(row, "statusTone", "status_tone")),
    score: toNumber(pick(row, "score", "verificationScore", "verification_score")),
    lastReviewAt: nullableString(
      pick(
        row,
        "lastReviewAt",
        "last_review_at",
        "reviewedAt",
        "reviewed_at",
        "verifiedAt",
        "verified_at",
      ),
    ),
    checksCompleted: toNumber(pick(row, "checksCompleted", "checks_completed")),
    checksTotal: toNumber(pick(row, "checksTotal", "checks_total")),
  };
}

function normalizeRequest(value: unknown): VerificationRequestSummary | null {
  const row = asRecord(value);
  if (!Object.keys(row).length) return null;

  const id = toNumber(
    pick(row, "verificationRequestId", "verification_request_id", "id"),
  );
  if (!id) return null;

  return {
    verificationRequestId: id,
    statusName: toStringValue(pick(row, "statusName", "status_name"), "Sin estado"),
    statusCode: toStringValue(pick(row, "statusCode", "status_code"), "unknown"),
    submittedAt: nullableString(pick(row, "submittedAt", "submitted_at")),
    reviewedAt: nullableString(pick(row, "reviewedAt", "reviewed_at")),
  };
}

function normalizeCheck(row: AnyRecord): VerificationCheckItem {
  return {
    id: toNumber(
      pick(
        row,
        "id",
        "checkId",
        "check_id",
        "verificationCheckId",
        "verification_check_id",
      ),
    ),
    code: toStringValue(pick(row, "code", "methodCode", "method_code"), ""),
    label: toStringValue(
      pick(row, "label", "name", "methodName", "method_name"),
      "Revisión",
    ),
    statusLabel: toStringValue(
      pick(row, "statusLabel", "status_label", "statusName", "status_name"),
      "Pendiente",
    ),
    statusTone: toTone(pick(row, "statusTone", "status_tone")),
    notes: nullableString(pick(row, "notes")),
    reviewedAt: nullableString(
      pick(row, "reviewedAt", "reviewed_at", "verifiedAt", "verified_at"),
    ),
  };
}

function normalizeDocument(row: AnyRecord): VerificationDocumentItem {
  const id = toNumber(
    pick(
      row,
      "id",
      "documentId",
      "document_id",
      "verificationDocumentId",
      "verification_document_id",
    ),
  );

  return {
    id,
    typeLabel: toStringValue(
      pick(row, "typeLabel", "type_label", "documentType", "document_type"),
      "Documento",
    ),
    fileName: toStringValue(pick(row, "fileName", "file_name", "name"), "archivo"),
    fileUrl: `/api/admin-company/verifications/documents/${id}/view-url`,
    statusLabel: toStringValue(
      pick(row, "statusLabel", "status_label", "status", "reviewStatus", "review_status"),
      "Pendiente",
    ),
    statusCode: toStringValue(
      pick(row, "statusCode", "status_code", "reviewStatusCode", "review_status_code"),
      "pending",
    ),
    reviewNotes: nullableString(pick(row, "reviewNotes", "review_notes")),
    uploadedAt: nullableString(
      pick(row, "uploadedAt", "uploaded_at", "createdAt", "created_at"),
    ),
  };
}

function normalizeContact(row: AnyRecord): VerificationContactItem {
  return {
    id: toNumber(pick(row, "id", "contactId", "contact_id")),
    contactType: toStringValue(
      pick(row, "contactType", "contact_type", "type"),
      "contacto",
    ),
    value: toStringValue(pick(row, "value"), ""),
    sourceLabel: toStringValue(
      pick(row, "sourceLabel", "source_label", "source"),
      "Fuente",
    ),
    matchesCompany: toBoolean(pick(row, "matchesCompany", "matches_company"), false),
  };
}

function normalizeAddressMatch(row: AnyRecord): VerificationAddressMatchItem {
  return {
    id: toNumber(pick(row, "id", "addressVerificationId", "address_verification_id")),
    sourceLabel: toStringValue(
      pick(row, "sourceLabel", "source_label", "source"),
      "Fuente",
    ),
    addressValue: toStringValue(
      pick(row, "addressValue", "address_value", "address"),
      "",
    ),
    matchesCompany: toBoolean(pick(row, "matchesCompany", "matches_company"), false),
    confidenceScore: toNumber(
      pick(row, "confidenceScore", "confidence_score"),
      0,
    ),
    notes: nullableString(pick(row, "notes")),
  };
}

function normalizeTimelineItem(
  row: AnyRecord,
  index: number,
): VerificationTimelineItem {
  return {
    id: toStringValue(
      pick(row, "id", "auditLogId", "audit_log_id"),
      `timeline-${index}`,
    ),
    title: toStringValue(pick(row, "title", "action"), "Evento de verificación"),
    description: toStringValue(
      pick(row, "description"),
      "Se registró una actualización en el proceso.",
    ),
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

function nullableString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function safeJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
