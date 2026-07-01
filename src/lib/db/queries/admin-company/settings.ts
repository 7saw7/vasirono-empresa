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
      directPath: "/api/company/notification-preferences",
      gatewayPath: "/api/notifications/api/company/notification-preferences",
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
  const notifications =
    (await serviceRequestOptional<unknown, UpdateNotificationPreferencesInput>({
      service: "notifications",
      directPath: "/api/company/notification-preferences",
      gatewayPath: "/api/notifications/api/company/notification-preferences",
      method: "PUT",
      body: input,
    })) ?? input;

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
      pick(row, "emailNotifications", "email_notifications"),
      DEFAULT_NOTIFICATIONS.emailNotifications
    ),
    reviewAlerts: toBoolean(
      pick(row, "reviewAlerts", "review_alerts"),
      DEFAULT_NOTIFICATIONS.reviewAlerts
    ),
    verificationAlerts: toBoolean(
      pick(row, "verificationAlerts", "verification_alerts"),
      DEFAULT_NOTIFICATIONS.verificationAlerts
    ),
    weeklySummary: toBoolean(
      pick(row, "weeklySummary", "weekly_summary"),
      DEFAULT_NOTIFICATIONS.weeklySummary
    ),
  };
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
