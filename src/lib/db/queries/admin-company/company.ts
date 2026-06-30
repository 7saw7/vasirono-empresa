import { getDb } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import { mapCompanyProfile } from "@/features/admin-company/company/mapper";
import {
  validateCompanyProfile,
  validateUpdateCompanyProfileInput,
} from "@/features/admin-company/company/schema";
import type { UpdateCompanyProfileInput } from "@/features/admin-company/company/types";

type RawCompanyRow = {
  company_id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  verification_status: string | null;
  price_label: string | null;
};

export async function getCompanyProfileQuery(companyId: number) {
  const db = getDb();

  const rows = await db.query<RawCompanyRow>(
    `
      select
        c.id as company_id,
        c.name,
        c.description,
        c.address,
        c.phone,
        c.email,
        c.website,
        c.verification_status,
        c.price_label
      from companies c
      where c.id = $1
      limit 1
    `,
    [companyId]
  );

  const company = rows[0];

  if (!company) {
    throw new AppError(
      "NOT_FOUND",
      "No se encontró el perfil del negocio.",
      404
    );
  }

  const profile = mapCompanyProfile({
    ...company,
    media: [],
    contacts: [],
    categories: [],
  });

  return validateCompanyProfile(profile);
}

export async function updateCompanyProfileQuery(
  companyId: number,
  input: UpdateCompanyProfileInput
) {
  const db = getDb();
  const parsed = validateUpdateCompanyProfileInput(input);

  const rows = await db.query<RawCompanyRow>(
    `
      update companies
      set
        name = $2,
        description = $3,
        address = $4,
        phone = $5,
        email = $6,
        website = $7,
        updated_at = now()
      where id = $1
      returning
        id::text as company_id,
        name,
        description,
        address,
        phone,
        email,
        website,
        verification_status,
        price_label
    `,
    [
      companyId,
      parsed.name,
      parsed.description,
      parsed.address,
      parsed.phone,
      parsed.email,
      parsed.website || null,
    ]
  );

  const company = rows[0];

  if (!company) {
    throw new AppError(
      "NOT_FOUND",
      "No se encontró el negocio a actualizar.",
      404
    );
  }

  const profile = mapCompanyProfile({
    ...company,
    media: [],
    contacts: [],
    categories: [],
  });

  return validateCompanyProfile(profile);
}