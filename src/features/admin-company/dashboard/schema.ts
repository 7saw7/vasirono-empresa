import { AppError } from "@/lib/errors/app-error";
import type { DashboardData } from "./types";

function isTrendDirection(value: unknown): value is "up" | "down" | "neutral" {
  return value === "up" || value === "down" || value === "neutral";
}

function isStatusTone(
  value: unknown
): value is "default" | "success" | "warning" | "danger" | "info" {
  return (
    value === "default" ||
    value === "success" ||
    value === "warning" ||
    value === "danger" ||
    value === "info"
  );
}

export function validateDashboardData(input: unknown): DashboardData {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "El dashboard recibido no es válido.",
      422
    );
  }

  const data = input as DashboardData;

  if (typeof data.companyName !== "string") {
    throw new AppError(
      "VALIDATION_ERROR",
      "companyName es requerido.",
      422
    );
  }

  if (!Array.isArray(data.kpis)) {
    throw new AppError("VALIDATION_ERROR", "kpis debe ser un arreglo.", 422);
  }

  if (!Array.isArray(data.recentActivity)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "recentActivity debe ser un arreglo.",
      422
    );
  }

  if (!Array.isArray(data.branchPerformance)) {
    throw new AppError(
      "VALIDATION_ERROR",
      "branchPerformance debe ser un arreglo.",
      422
    );
  }

  for (const item of data.kpis) {
    if (
      typeof item.id !== "string" ||
      typeof item.label !== "string" ||
      typeof item.value !== "string"
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Un KPI del dashboard es inválido.",
        422
      );
    }

    if (item.trend) {
      if (
        typeof item.trend.value !== "string" ||
        !isTrendDirection(item.trend.direction)
      ) {
        throw new AppError(
          "VALIDATION_ERROR",
          "La tendencia de un KPI es inválida.",
          422
        );
      }
    }
  }

  for (const item of data.recentActivity) {
    if (
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.description !== "string" ||
      typeof item.createdAt !== "string" ||
      typeof item.type !== "string"
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Un item de actividad reciente es inválido.",
        422
      );
    }
  }

  if (data.companyScore) {
    if (
      typeof data.companyScore.finalScore !== "number" ||
      typeof data.companyScore.popularityScore !== "number" ||
      typeof data.companyScore.engagementScore !== "number" ||
      typeof data.companyScore.conversionScore !== "number" ||
      typeof data.companyScore.trustScore !== "number" ||
      typeof data.companyScore.freshnessScore !== "number" ||
      typeof data.companyScore.calculatedAt !== "string"
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "companyScore es inválido.",
        422
      );
    }
  }

  if (data.verificationSummary) {
    if (
      typeof data.verificationSummary.level !== "string" ||
      typeof data.verificationSummary.statusLabel !== "string" ||
      !isStatusTone(data.verificationSummary.statusTone) ||
      typeof data.verificationSummary.score !== "number" ||
      typeof data.verificationSummary.checksCompleted !== "number" ||
      typeof data.verificationSummary.checksTotal !== "number"
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "verificationSummary es inválido.",
        422
      );
    }
  }

  for (const item of data.branchPerformance) {
    if (
      typeof item.branchId !== "number" ||
      typeof item.branchName !== "string" ||
      typeof item.districtName !== "string" ||
      typeof item.finalScore !== "number" ||
      typeof item.visits30d !== "number" ||
      typeof item.reviews90d !== "number" ||
      typeof item.avgRating90d !== "number" ||
      typeof item.isMain !== "boolean"
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Un item de branchPerformance es inválido.",
        422
      );
    }
  }

  return data;
}