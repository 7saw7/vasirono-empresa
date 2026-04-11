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
      statusTone: verificationStatusToneSchema,
      score: z.number(),
      lastReviewAt: z.string().nullable(),
      checksCompleted: z.number().int(),
      checksTotal: z.number().int(),
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
    })
  ),
  documents: z.array(
    z.object({
      id: z.number().int(),
      typeLabel: z.string(),
      fileName: z.string(),
      fileUrl: z.string(),
      statusLabel: z.string(),
      uploadedAt: z.string().nullable(),
    })
  ),
  contacts: z.array(
    z.object({
      id: z.number().int(),
      contactType: z.string(),
      value: z.string(),
      sourceLabel: z.string(),
      matchesCompany: z.boolean(),
    })
  ),
  addressMatches: z.array(
    z.object({
      sourceLabel: z.string(),
      addressValue: z.string(),
      matchesCompany: z.boolean(),
    })
  ),
  timeline: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      createdAt: z.string(),
      type: z.enum(["document", "review", "contact", "address", "system"]),
    })
  ),
});

export type CompanyVerificationDataSchema = z.infer<
  typeof companyVerificationDataSchema
>;