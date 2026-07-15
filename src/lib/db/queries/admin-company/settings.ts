import {
  serviceRequest,
  serviceRequestOptionalResult,
} from "@/lib/http/service-client";
import { asRecord, pick, toBoolean, toNumber, toStringValue } from "@/lib/http/service-data";
import type {
  ChangePasswordInput,
  CompanySettings,
  NotificationPreferences,
  SecuritySettings,
  UpdateNotificationPreferencesInput,
} from "@/features/admin-company/settings/types";

const DEFAULT_NOTIFICATIONS: Omit<NotificationPreferences, "available"> = {
  notificationsEnabled: true,
  reviewAlerts: true,
  verificationAlerts: true,
};

export async function getCompanySettingsQuery(
  companyId: number
): Promise<CompanySettings> {
  const [notificationsResult, authResult] = await Promise.all([
    serviceRequestOptionalResult<unknown>({
      service: "notifications",
      companyId,
      directPath: "/api/app/notification-preferences",
      gatewayPath: "/api/notifications/api/app/notification-preferences",
    }),
    serviceRequestOptionalResult<unknown>({
      service: "auth",
      directPath: "/api/auth/account/security",
      gatewayPath: "/api/auth/account/security",
      headers: {
        "x-auth-portal": "company",
        "x-company-id": String(companyId),
      },
    }),
  ]);

  return {
    companyId,
    notifications: normalizeNotificationPreferences(
      notificationsResult.data,
      notificationsResult.status === "available"
    ),
    security: normalizeSecuritySettings(
      authResult.data,
      authResult.status === "available"
    ),
  };
}

export async function updateNotificationPreferencesQuery(
  companyId: number,
  input: UpdateNotificationPreferencesInput
): Promise<CompanySettings> {
  const notifications = await serviceRequest<unknown, unknown>({
    service: "notifications",
    companyId,
    directPath: "/api/app/notification-preferences",
    gatewayPath: "/api/notifications/api/app/notification-preferences",
    method: "PATCH",
    body: {
      notificationsEnabled: input.notificationsEnabled,
      events: {
        review: input.reviewAlerts,
        verification: input.verificationAlerts,
      },
    },
    errorCode: "NOTIFICATION_PREFERENCES_UPDATE_FAILED",
    errorMessage: "No se pudieron guardar las preferencias de notificación.",
  });

  const authResult = await serviceRequestOptionalResult<unknown>({
    service: "auth",
    directPath: "/api/auth/account/security",
    gatewayPath: "/api/auth/account/security",
    headers: {
      "x-auth-portal": "company",
      "x-company-id": String(companyId),
    },
  });

  return {
    companyId,
    notifications: normalizeNotificationPreferences(notifications, true),
    security: normalizeSecuritySettings(
      authResult.data,
      authResult.status === "available"
    ),
  };
}

export async function changePasswordQuery(
  companyId: number,
  input: ChangePasswordInput
): Promise<{ changed: boolean; revokedSessions: boolean }> {
  return serviceRequest<
    { changed: boolean; revokedSessions: boolean },
    { currentPassword: string; newPassword: string }
  >({
    service: "auth",
    directPath: "/api/auth/session/change-password",
    gatewayPath: "/api/auth/session/change-password",
    method: "POST",
    headers: {
      "x-auth-portal": "company",
      "x-company-id": String(companyId),
    },
    body: {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    },
    errorCode: "PASSWORD_CHANGE_FAILED",
    errorMessage: "No se pudo cambiar la contraseña.",
  });
}

function normalizeNotificationPreferences(
  value: unknown,
  available: boolean
): NotificationPreferences {
  const row = asRecord(value);
  const events = asRecord(pick(row, "events"));

  return {
    available,
    notificationsEnabled: toBoolean(
      pick(row, "notificationsEnabled", "notifications_enabled"),
      DEFAULT_NOTIFICATIONS.notificationsEnabled
    ),
    reviewAlerts: toBoolean(
      pick(events, "review"),
      readLegacyNotificationDetail(row, "review", DEFAULT_NOTIFICATIONS.reviewAlerts)
    ),
    verificationAlerts: toBoolean(
      pick(events, "verification"),
      readLegacyNotificationDetail(
        row,
        "verification",
        DEFAULT_NOTIFICATIONS.verificationAlerts
      )
    ),
  };
}

function readLegacyNotificationDetail(
  row: Record<string, unknown>,
  code: string,
  fallback: boolean
): boolean {
  const details = Array.isArray(row.details) ? row.details : [];
  const match = details.find((item) => {
    const detail = asRecord(item);
    const name = toStringValue(
      pick(detail, "notificationTypeName", "notification_type_name", "name", "code"),
      ""
    )
      .trim()
      .toLowerCase();

    return name === code;
  });

  return match
    ? toBoolean(pick(asRecord(match), "enabled"), fallback)
    : fallback;
}

function normalizeSecuritySettings(
  value: unknown,
  available: boolean
): SecuritySettings {
  const row = asRecord(value);
  const twoFactor = asRecord(pick(row, "twoFactor", "two_factor"));

  return {
    available,
    lastPasswordChangeAt:
      toStringValue(
        pick(row, "lastPasswordChangeAt", "last_password_change_at"),
        ""
      ) || null,
    twoFactorAvailable: toBoolean(
      pick(twoFactor, "available", "isAvailable"),
      false
    ),
    twoFactorEnabled: toBoolean(
      pick(twoFactor, "enabled", "isEnabled"),
      false
    ),
    activeSessionsCount: available
      ? toNumber(pick(row, "activeSessionsCount", "active_sessions_count"), 0)
      : null,
  };
}
