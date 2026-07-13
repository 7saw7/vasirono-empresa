import { z } from "zod";
import { AppError } from "@/lib/errors/app-error";
import type { DashboardData } from "./types";

const isoDateTimeSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Debe ser una fecha ISO válida.",
  });

const nullableIsoDateTimeSchema = isoDateTimeSchema.nullable();
const scoreSchema = z.number().finite().min(0).max(100);
const nonNegativeNumberSchema = z.number().finite().min(0);

const trendSchema = z
  .object({
    value: z.string().trim().min(1).max(64),
    direction: z.enum(["up", "down", "neutral"]),
  })
  .strict();

const kpiSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(120),
    value: z.string().trim().min(1).max(64),
    helper: z.string().trim().max(240).optional(),
    trend: trendSchema.optional(),
  })
  .strict();

const activitySchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(500),
    createdAt: isoDateTimeSchema,
    type: z.enum([
      "review",
      "verification",
      "branch",
      "analytics",
      "company",
      "system",
    ]),
  })
  .strict();

const companyScoreSchema = z
  .object({
    finalScore: scoreSchema,
    popularityScore: scoreSchema,
    engagementScore: scoreSchema,
    conversionScore: scoreSchema,
    trustScore: scoreSchema,
    freshnessScore: scoreSchema,
    calculatedAt: isoDateTimeSchema,
  })
  .strict();

const verificationSummarySchema = z
  .object({
    level: z.string().trim().min(1).max(120),
    statusLabel: z.string().trim().min(1).max(120),
    statusTone: z.enum(["default", "success", "warning", "danger", "info"]),
    score: scoreSchema,
    lastReviewAt: nullableIsoDateTimeSchema.optional(),
    checksCompleted: z.number().int().min(0),
    checksTotal: z.number().int().min(0),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.checksCompleted > value.checksTotal) {
      context.addIssue({
        code: "custom",
        path: ["checksCompleted"],
        message: "No puede superar checksTotal.",
      });
    }
  });

const branchPerformanceSchema = z
  .object({
    branchId: z.number().int().positive(),
    branchName: z.string().trim().min(1).max(160),
    districtName: z.string().trim().min(1).max(160),
    finalScore: scoreSchema,
    visits30d: nonNegativeNumberSchema,
    reviews90d: nonNegativeNumberSchema,
    avgRating90d: z.number().finite().min(0).max(5),
    isMain: z.boolean(),
  })
  .strict();

const syncSchema = z
  .object({
    status: z.enum(["synced", "partial"]),
    fetchedAt: isoDateTimeSchema,
    analyticsGeneratedAt: isoDateTimeSchema,
    analyticsDataUpdatedAt: nullableIsoDateTimeSchema,
    analyticsCompanyScoreCalculatedAt: nullableIsoDateTimeSchema,
    analyticsFunnelCalculatedAt: nullableIsoDateTimeSchema,
    analyticsLatestEventAt: nullableIsoDateTimeSchema,
    analyticsReviewsUpdatedAt: nullableIsoDateTimeSchema,
    services: z
      .object({
        companies: z.literal("available"),
        analytics: z.literal("available"),
        verifications: z.enum(["available", "empty", "unavailable"]),
      })
      .strict(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.status === "synced" && value.services.verifications === "unavailable") {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "Debe ser partial cuando Verifications no está disponible.",
      });
    }

    const generatedAt = Date.parse(value.analyticsGeneratedAt);
    const fetchedAt = Date.parse(value.fetchedAt);

    if (generatedAt > fetchedAt + 5 * 60 * 1000) {
      context.addIssue({
        code: "custom",
        path: ["analyticsGeneratedAt"],
        message: "No puede estar varios minutos en el futuro respecto a fetchedAt.",
      });
    }
  });

const dashboardSchema = z
  .object({
    companyName: z.string().trim().min(1).max(180),
    kpis: z.array(kpiSchema).min(1).max(20),
    recentActivity: z.array(activitySchema).max(50),
    companyScore: companyScoreSchema.nullable(),
    verificationSummary: verificationSummarySchema.nullable(),
    branchPerformance: z.array(branchPerformanceSchema).max(50),
    sync: syncSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const kpiIds = value.kpis.map((item) => item.id);
    if (new Set(kpiIds).size !== kpiIds.length) {
      context.addIssue({
        code: "custom",
        path: ["kpis"],
        message: "Los identificadores de KPI deben ser únicos.",
      });
    }

    const branchIds = value.branchPerformance.map((item) => item.branchId);
    if (new Set(branchIds).size !== branchIds.length) {
      context.addIssue({
        code: "custom",
        path: ["branchPerformance"],
        message: "Las sucursales no deben repetirse.",
      });
    }
  });

export function validateDashboardData(input: unknown): DashboardData {
  const parsed = dashboardSchema.safeParse(input);

  if (parsed.success) return parsed.data;

  const details: Record<string, string[]> = {};

  for (const issue of parsed.error.issues) {
    const path = issue.path.join(".") || "root";
    details[path] = [...(details[path] ?? []), issue.message];
  }

  throw new AppError(
    "VALIDATION_ERROR",
    "El dashboard recibido no cumple el contrato esperado.",
    422,
    details
  );
}
