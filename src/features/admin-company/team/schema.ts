import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const addTeamMemberSchema = z
  .object({
    userId: z.string().uuid().optional(),
    userEmail: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase())
      .optional(),
    roleId: positiveInt,
  })
  .refine((value) => Boolean(value.userId || value.userEmail), {
    message: "Debes enviar userId o userEmail.",
    path: ["userEmail"],
  });

export const updateTeamMemberRoleSchema = z.object({
  roleId: positiveInt,
});

export const setTeamMemberActiveSchema = z.object({
  active: z.boolean(),
});

export const teamMemberParamsSchema = z.object({
  userId: z.string().uuid(),
});

export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
