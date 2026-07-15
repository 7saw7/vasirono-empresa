import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  notificationsEnabled: z.boolean(),
  reviewAlerts: z.boolean(),
  verificationAlerts: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "La nueva contraseña debe ser distinta a la actual.",
  });

export type NotificationPreferencesSchema = z.infer<
  typeof notificationPreferencesSchema
>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
