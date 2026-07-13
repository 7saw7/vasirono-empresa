import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const updateGalleryMediaSchema = z
  .object({
    altText: z.string().trim().max(500).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) => Object.prototype.hasOwnProperty.call(value, "altText") || typeof value.isActive === "boolean",
    "Debes enviar al menos un cambio.",
  );

export const reorderBranchMediaSchema = z
  .object({
    items: z
      .array(
        z.object({
          mediaId: positiveInt,
          sortOrder: positiveInt,
        }),
      )
      .min(1)
      .max(100),
  })
  .superRefine((value, ctx) => {
    const ids = value.items.map((item) => item.mediaId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", path: ["items"], message: "No se permiten mediaId duplicados." });
    }
  });
