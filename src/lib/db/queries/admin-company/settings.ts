import { serviceRequestOptional } from "@/lib/http/service-client";
import {
  asRecord,
  pick,
  toBoolean,
  toNumber,
  toStringValue,
} from "@/lib/http/service-data";
import type {
  CompanySettings,
  NotificationPreferences,
  SecuritySettings,
  UpdateNotificationPreferencesInput,
} from "@/features/admin-company/settings/types";

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  emailNotifications: true,
  reviewAlerts: true,
  verificationAlerts: true,
  weeklySummary: true,
};

export async function getCompanySettingsQuery(
  companyId: number
): Promise<CompanySettings> {
  const [notificationsPayload, authPayload] = await Promise.all([
    serviceRequestOptional<unknown>({
      service: "notifications",
      directPath: "/api/app/notification-preferences",
      gatewayPath: "/api/notifications/api/app/notification-preferences",
    }),
    serviceRequestOptional<unknown>({
      service: "auth",
      directPath: "/api/auth/me/security",
      gatewayPath: "/api/auth/me/security",
    }),
  ]);

  return {
    companyId,
    notifications: normalizeNotificationPreferences(notificationsPayload),
    security: normalizeSecuritySettings(authPayload),
  };
}

export async function updateNotificationPreferencesQuery(
  companyId: number,
  input: UpdateNotificationPreferencesInput
): Promise<CompanySettings> {
  const current = await serviceRequestOptional<unknown>({
    service: "notifications",
    directPath: "/api/app/notification-preferences",
    gatewayPath: "/api/notifications/api/app/notification-preferences",
  });

  const body = buildNotificationPreferencesPatch(input, current);

  const notifications =
    (await serviceRequestOptional<unknown, typeof body>({
      service: "notifications",
      directPath: "/api/app/notification-preferences",
      gatewayPath: "/api/notifications/api/app/notification-preferences",
      method: "PATCH",
      body,
    })) ?? body;

  return {
    companyId,
    notifications: normalizeNotificationPreferences(notifications),
    security: normalizeSecuritySettings(null),
  };
}

function normalizeNotificationPreferences(value: unknown): NotificationPreferences {
  const row = asRecord(value);

  if (!Object.keys(row).length) return DEFAULT_NOTIFICATIONS;

  return {
    emailNotifications: toBoolean(
      pick(row, "emailNotifications", "email_notifications", "notificationsEnabled", "notifications_enabled"),
      DEFAULT_NOTIFICATIONS.emailNotifications
    ),
    reviewAlerts: readNotificationDetail(row, ["review", "reseña", "resenia"], DEFAULT_NOTIFICATIONS.reviewAlerts),
    verificationAlerts: readNotificationDetail(row, ["verification", "verificación", "verificacion"], DEFAULT_NOTIFICATIONS.verificationAlerts),
    weeklySummary: readNotificationDetail(row, ["weekly", "summary", "resumen"], DEFAULT_NOTIFICATIONS.weeklySummary),
  };
}

function readNotificationDetail(
  row: Record<string, unknown>,
  keywords: string[],
  fallback: boolean
): boolean {
  const directValue = pick(
    row,
    keywords.includes("review") ? "reviewAlerts" : "__none__",
    keywords.includes("verification") ? "verificationAlerts" : "__none__",
    keywords.includes("weekly") ? "weeklySummary" : "__none__"
  );

  if (directValue !== undefined) return toBoolean(directValue, fallback);

  const details = Array.isArray(row.details) ? row.details : [];
  const match = details.find((item) => {
    const detail = asRecord(item);
    const name = toStringValue(
      pick(detail, "notificationTypeName", "notification_type_name", "name", "code"),
      ""
    ).toLowerCase();

    return keywords.some((keyword) => name.includes(keyword));
  });

  if (!match) return fallback;

  return toBoolean(pick(asRecord(match), "enabled"), fallback);
}

function buildNotificationPreferencesPatch(
  input: UpdateNotificationPreferencesInput,
  current: unknown
) {
  const currentRow = asRecord(current);
  const details = Array.isArray(currentRow.details) ? currentRow.details : [];
  const mappedDetails = [
    mapNotificationDetailPatch(details, ["review", "reseña", "resenia"], input.reviewAlerts),
    mapNotificationDetailPatch(details, ["verification", "verificación", "verificacion"], input.verificationAlerts),
    mapNotificationDetailPatch(details, ["weekly", "summary", "resumen"], input.weeklySummary),
  ].filter((item): item is { notificationTypeId: number; enabled: boolean } => Boolean(item));

  return {
    notificationsEnabled: input.emailNotifications,
    ...(mappedDetails.length ? { details: mappedDetails } : {}),
  };
}

function mapNotificationDetailPatch(
  details: unknown[],
  keywords: string[],
  enabled: boolean
): { notificationTypeId: number; enabled: boolean } | null {
  const match = details.find((item) => {
    const detail = asRecord(item);
    const name = toStringValue(
      pick(detail, "notificationTypeName", "notification_type_name", "name", "code"),
      ""
    ).toLowerCase();

    return keywords.some((keyword) => name.includes(keyword));
  });

  if (!match) return null;

  const notificationTypeId = toNumber(
    pick(asRecord(match), "notificationTypeId", "notification_type_id")
  );

  if (!notificationTypeId) return null;

  return { notificationTypeId, enabled };
}

function normalizeSecuritySettings(value: unknown): SecuritySettings {
  const row = asRecord(value);

  return {
    lastPasswordChangeAt:
      toStringValue(
        pick(row, "lastPasswordChangeAt", "last_password_change_at"),
        ""
      ) || null,
    twoFactorEnabled: toBoolean(pick(row, "twoFactorEnabled", "two_factor_enabled"), false),
    activeSessionsCount: toNumber(
      pick(row, "activeSessionsCount", "active_sessions_count"),
      1
    ),
  };
}
