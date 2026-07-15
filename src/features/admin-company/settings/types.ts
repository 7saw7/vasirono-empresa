export type NotificationPreferences = {
  available: boolean;
  notificationsEnabled: boolean;
  reviewAlerts: boolean;
  verificationAlerts: boolean;
};

export type SecuritySettings = {
  available: boolean;
  lastPasswordChangeAt: string | null;
  twoFactorAvailable: boolean;
  twoFactorEnabled: boolean;
  activeSessionsCount: number | null;
};

export type CompanySettings = {
  companyId: number;
  notifications: NotificationPreferences;
  security: SecuritySettings;
};

export type UpdateNotificationPreferencesInput = Omit<
  NotificationPreferences,
  "available"
>;

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
