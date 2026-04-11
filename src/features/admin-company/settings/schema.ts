import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  reviewAlerts: z.boolean(),
  verificationAlerts: z.boolean(),
  weeklySummary: z.boolean(),
});

export type NotificationPreferencesSchema = z.infer<
  typeof notificationPreferencesSchema
>;