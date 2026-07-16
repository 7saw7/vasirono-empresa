import { z } from "zod";

export const verificationStatusToneSchema = z.enum([
  "default",
  "success",
  "warning",
  "danger",
  "info",
]);

export const companyVerificationDataSchema = z.object({
  summary: z
    .object({
      level: z.string(),
      statusLabel: z.string(),
      statusCode: z.string(),
      statusTone: verificationStatusToneSchema,
      score: z.number(),
      lastReviewAt: z.string().nullable(),
      checksCompleted: z.number().int(),
      checksTotal: z.number().int(),
    })
    .nullable(),
  request: z
    .object({
      verificationRequestId: z.number().int(),
      statusName: z.string(),
      statusCode: z.string(),
      submittedAt: z.string().nullable(),
      reviewedAt: z.string().nullable(),
    })
    .nullable(),
  checks: z.array(
    z.object({
      id: z.number().int(),
      code: z.string(),
      label: z.string(),
      statusLabel: z.string(),
      statusTone: verificationStatusToneSchema,
      notes: z.string().nullable(),
      reviewedAt: z.string().nullable(),
    }),
  ),
  documents: z.array(
    z.object({
      id: z.number().int(),
      typeLabel: z.string(),
      fileName: z.string(),
      fileUrl: z.string(),
      statusLabel: z.string(),
      statusCode: z.string(),
      reviewNotes: z.string().nullable(),
      uploadedAt: z.string().nullable(),
    }),
  ),
  contacts: z.array(
    z.object({
      id: z.number().int(),
      contactType: z.string(),
      value: z.string(),
      sourceLabel: z.string(),
      matchesCompany: z.boolean(),
    }),
  ),
  addressMatches: z.array(
    z.object({
      id: z.number().int(),
      sourceLabel: z.string(),
      addressValue: z.string(),
      matchesCompany: z.boolean(),
      confidenceScore: z.number(),
      notes: z.string().nullable(),
    }),
  ),
  timeline: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      createdAt: z.string(),
      type: z.enum(["document", "review", "contact", "address", "system"]),
    }),
  ),
});

const nullableUploadText = (maxLength: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== "string") return value;
    const normalized = value.trim();
    return normalized || null;
  }, z.string().max(maxLength).nullable());

const nullablePositiveInt = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : value;
}, z.number().int().positive().nullable());

export const verificationDocumentTypeCodeSchema = z.enum([
  "ruc_certificate",
  "municipal_license",
  "utility_bill",
  "onsite_visit_act",
  "storefront_photo",
  "authorization_document",
  "other",
]);

export const verificationDocumentUploadFieldsSchema = z.object({
  documentTypeCode: verificationDocumentTypeCodeSchema,
  branchId: nullablePositiveInt,
  notes: nullableUploadText(1000),
  extractedAddress: nullableUploadText(500),
  extractedName: nullableUploadText(240),
  extractedDocumentNumber: nullableUploadText(120),
  extractedIssueDate: nullableUploadText(30),
});

export const requestVerificationSchema = z.object({
  levelCode: z.string().trim().min(1).max(50).optional(),
  publicSummary: z.string().trim().max(2000).optional(),
});

export const submitVerificationSchema = z.object({
  publicSummary: z.string().trim().max(2000).optional(),
});

export type CompanyVerificationDataSchema = z.infer<
  typeof companyVerificationDataSchema
>;
