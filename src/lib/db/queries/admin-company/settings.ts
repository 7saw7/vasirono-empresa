import { getDb } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import type {
  CompanySettings,
  UpdateNotificationPreferencesInput,
} from "@/features/admin-company/settings/types";

export async function getCompanySettingsQuery(
  companyId: number
): Promise<CompanySettings> {
  const db = getDb();

  const settingsRows = await db.query<{
    company_id: number;
    email_notifications: boolean | null;
    review_alerts: boolean | null;
    verification_alerts: boolean | null;
    weekly_summary: boolean | null;
    last_password_change_at: string | null;
    two_factor_enabled: boolean | null;
    active_sessions_count: number | null;
  }>(
    `
      select
        cs.company_id as company_id,
        coalesce(cs.email_notifications, true) as email_notifications,
        coalesce(cs.review_alerts, true) as review_alerts,
        coalesce(cs.verification_alerts, true) as verification_alerts,
        coalesce(cs.weekly_summary, false) as weekly_summary,
        cs.last_password_change_at::text as last_password_change_at,
        coalesce(cs.two_factor_enabled, false) as two_factor_enabled,
        coalesce(cs.active_sessions_count, 1) as active_sessions_count
      from company_settings cs
      where cs.company_id = $1
      limit 1
    `,
    [companyId]
  );

  const row = settingsRows[0];

  if (!row) {
    return {
      companyId,
      notifications: {
        emailNotifications: true,
        reviewAlerts: true,
        verificationAlerts: true,
        weeklySummary: false,
      },
      security: {
        lastPasswordChangeAt: null,
        twoFactorEnabled: false,
        activeSessionsCount: 1,
      },
    };
  }

  return {
    companyId: row.company_id,
    notifications: {
      emailNotifications: row.email_notifications ?? true,
      reviewAlerts: row.review_alerts ?? true,
      verificationAlerts: row.verification_alerts ?? true,
      weeklySummary: row.weekly_summary ?? false,
    },
    security: {
      lastPasswordChangeAt: row.last_password_change_at,
      twoFactorEnabled: row.two_factor_enabled ?? false,
      activeSessionsCount: row.active_sessions_count ?? 1,
    },
  };
}

export async function updateNotificationPreferencesQuery(
  companyId: number,
  input: UpdateNotificationPreferencesInput
): Promise<CompanySettings> {
  const db = getDb();

  await db.query(
    `
      insert into company_settings (
        company_id,
        email_notifications,
        review_alerts,
        verification_alerts,
        weekly_summary
      )
      values ($1, $2, $3, $4, $5)
      on conflict (company_id)
      do update set
        email_notifications = excluded.email_notifications,
        review_alerts = excluded.review_alerts,
        verification_alerts = excluded.verification_alerts,
        weekly_summary = excluded.weekly_summary,
        updated_at = now()
    `,
    [
      companyId,
      input.emailNotifications,
      input.reviewAlerts,
      input.verificationAlerts,
      input.weeklySummary,
    ]
  );

  const updated = await getCompanySettingsQuery(companyId);

  if (!updated) {
    throw new AppError(
      "INTERNAL_ERROR",
      "No se pudo actualizar la configuración.",
      500
    );
  }

  return updated;
}