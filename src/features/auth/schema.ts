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