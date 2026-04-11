export type NotificationPreferences = {
  emailNotifications: boolean;
  reviewAlerts: boolean;
  verificationAlerts: boolean;
  weeklySummary: boolean;
};

export type SecuritySettings = {
  lastPasswordChangeAt: string | null;
  twoFactorEnabled: boolean;
  activeSessionsCount: number;
};

export type CompanySettings = {
  companyId: number;
  notifications: NotificationPreferences;
  security: SecuritySettings;
};

export type UpdateNotificationPreferencesInput = NotificationPreferences;