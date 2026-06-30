import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .max(160, "El correo no debe superar los 160 caracteres.")
    .email("El correo no es válido.")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no debe superar los 128 caracteres."),
  companyId: z.coerce.number().int().positive().optional(),
});

export const recoverPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .max(160, "El correo no debe superar los 160 caracteres.")
    .email("El correo no es válido.")
    .transform((value) => value.toLowerCase()),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RecoverPasswordSchema = z.infer<typeof recoverPasswordSchema>;

const businessInvitationTokenSchema = z
  .string()
  .trim()
  .min(32, "El enlace de invitación no es válido.")
  .max(512, "El enlace de invitación no es válido.");

const businessPasswordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(128, "La contraseña no debe superar los 128 caracteres.")
  .regex(/[a-z]/, "La contraseña debe incluir una minúscula.")
  .regex(/[A-Z]/, "La contraseña debe incluir una mayúscula.")
  .regex(/[0-9]/, "La contraseña debe incluir un número.");

export const businessInvitationPreviewSchema = z.object({
  token: businessInvitationTokenSchema,
});

export const businessInvitationAcceptSchema = z
  .object({
    token: businessInvitationTokenSchema,
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120, "El nombre no debe superar los 120 caracteres.")
      .optional(),
    phone: z
      .string()
      .trim()
      .max(20, "El teléfono no debe superar los 20 caracteres.")
      .optional()
      .transform((value) => value || undefined),
    password: businessPasswordSchema.optional(),
    confirmPassword: z.string().optional(),
    acceptTerms: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.password && value.confirmPassword && value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden.",
      });
    }
  });

export type BusinessInvitationPreviewSchema = z.infer<
  typeof businessInvitationPreviewSchema
>;

export type BusinessInvitationAcceptSchema = z.infer<
  typeof businessInvitationAcceptSchema
>;
