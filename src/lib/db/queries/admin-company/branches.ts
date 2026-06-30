import { AppError } from "@/lib/errors/app-error";
import { getDb } from "@/lib/db/server";
import { withTransaction } from "@/lib/db/transaction";
import {
  mapBranchDetail,
  mapBranchListItem,
} from "@/features/admin-company/branches/mapper";
import {
  validateBranchDetail,
  validateBranchList,
  validateUpsertBranchInput,
} from "@/features/admin-company/branches/schema";
import type {
  BranchListFilters,
  UpsertBranchInput,
} from "@/features/admin-company/branches/types";

export async function listBranchesQuery(
  companyId: number,
  filters: BranchListFilters = {}
) {
  const db = getDb();

  const rows = await db.query<{
    branch_id: number;
    company_id: number;
    name: string;
    description?: string | null;
    address: string;
    phone?: string | null;
    email?: string | null;
    district_id?: number | null;
    district_name: string;
    is_main: boolean;
    is_active: boolean;
    final_score?: number | null;
    visits_30d?: number | null;
    avg_rating_90d?: number | null;
  }>(
    `
      select
        b.branch_id,
        b.company_id as company_id,
        b.name,
        b.description,
        b.address,
        b.phone,
        b.email,
        b.district_id,
        coalesce(d.name, 'Sin distrito') as district_name,
        coalesce(b.is_main, false) as is_main,
        coalesce(b.is_active, false) as is_active,
        coalesce(b.final_score, 0) as final_score,
        coalesce(b.visits_30d, 0) as visits_30d,
        coalesce(b.avg_rating_90d, 0) as avg_rating_90d
      from company_branches b
      left join districts d
        on d.district_id = b.district_id
      where b.company_id = $1
        and (
          $2::text is null
          or b.name ilike '%' || $2 || '%'
          or b.address ilike '%' || $2 || '%'
          or coalesce(d.name, '') ilike '%' || $2 || '%'
        )
        and (
          $3::text is null
          or ($3 = 'active' and coalesce(b.is_active, false) = true)
          or ($3 = 'inactive' and coalesce(b.is_active, false) = false)
        )
        and (
          $4::int is null
          or b.district_id = $4
        )
      order by coalesce(b.is_main, false) desc, b.name asc
    `,
    [
      companyId,
      filters.search?.trim() || null,
      filters.status?.trim() || null,
      filters.districtId ?? null,
    ]
  );

  return validateBranchList(rows.map(mapBranchListItem));
}

export async function getBranchByIdQuery(companyId: number, branchId: number) {
  const db = getDb();

  const rows = await db.query<{
    branch_id: number;
    company_id: number;
    name: string;
    description?: string | null;
    address: string;
    phone?: string | null;
    email?: string | null;
    district_id?: number | null;
    district_name: string;
    is_main: boolean;
    is_active: boolean;
    final_score?: number | null;
    visits_30d?: number | null;
    avg_rating_90d?: number | null;
    lat?: number | null;
    lon?: number | null;
  }>(
    `
      select
        b.branch_id,
        b.company_id as company_id,
        b.name,
        b.description,
        b.address,
        b.phone,
        b.email,
        b.district_id,
        coalesce(d.name, 'Sin distrito') as district_name,
        coalesce(b.is_main, false) as is_main,
        coalesce(b.is_active, false) as is_active,
        coalesce(b.final_score, 0) as final_score,
        coalesce(b.visits_30d, 0) as visits_30d,
        coalesce(b.avg_rating_90d, 0) as avg_rating_90d,
        b.lat,
        b.lon
      from company_branches b
      left join districts d on d.district_id = b.district_id
      where b.company_id = $1
        and b.branch_id = $2
      limit 1
    `,
    [companyId, branchId]
  );

  const branch = rows[0];

  if (!branch) {
    throw new AppError("NOT_FOUND", "Sucursal no encontrada.", 404);
  }

  const schedules = await db.query<{
    schedule_id: number;
    day_name: string;
    opening?: string | null;
    closing?: string | null;
    shift_number: number;
  }>(
    `
      select
        s.id as schedule_id,
        s.day_name,
        s.opening,
        s.closing,
        coalesce(s.shift_number, 1) as shift_number
      from branch_schedules s
      where s.branch_id = $1
      order by s.day_order asc, s.shift_number asc
    `,
    [branchId]
  );

  const services = await db.query<{
    service_id: number;
    code: string;
    name: string;
    is_available: boolean;
  }>(
    `
      select
        bs.service_id,
        srv.code,
        srv.name,
        coalesce(bs.is_available, true) as is_available
      from branch_services bs
      inner join services srv on srv.id = bs.service_id
      where bs.branch_id = $1
      order by srv.name asc
    `,
    [branchId]
  );

  const contacts = await db.query<{
    contact_id: number;
    type_label: string;
    value: string;
    label?: string | null;
    is_primary: boolean;
    is_public: boolean;
  }>(
    `
      select
        c.id as contact_id,
        c.type_label,
        c.value,
        c.label,
        coalesce(c.is_primary, false) as is_primary,
        coalesce(c.is_public, false) as is_public
      from branch_contacts c
      where c.branch_id = $1
      order by c.is_primary desc, c.id asc
    `,
    [branchId]
  );

  const media = await db.query<{
    media_id: number;
    type_label: string;
    url: string;
  }>(
    `
      select
        m.id as media_id,
        m.type_label,
        m.url
      from branch_media m
      where m.branch_id = $1
      order by m.id asc
    `,
    [branchId]
  );

  return validateBranchDetail(
    mapBranchDetail({
      ...branch,
      schedules,
      services,
      contacts,
      media,
    })
  );
}

export async function createBranchQuery(
  companyId: number,
  input: UpsertBranchInput
) {
  const parsed = validateUpsertBranchInput(input);

  return withTransaction(async (tx) => {
    if (parsed.isMain) {
      await tx.query(
        `
          update company_branches
          set is_main = false
          where company_id = $1
        `,
        [companyId]
      );
    }

    const rows = await tx.query<{
      branch_id: number;
      company_id: number;
      name: string;
      description?: string | null;
      address: string;
      phone?: string | null;
      email?: string | null;
      district_id?: number | null;
      district_name: string;
      is_main: boolean;
      is_active: boolean;
      final_score?: number | null;
      visits_30d?: number | null;
      avg_rating_90d?: number | null;
    }>(
      `
        insert into company_branches (
          company_id,
          name,
          description,
          address,
          phone,
          email,
          district_id,
          is_main,
          is_active
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning
          branch_id,
          company_id as company_id,
          name,
          description,
          address,
          phone,
          email,
          district_id,
          '' as district_name,
          is_main,
          is_active,
          coalesce(final_score, 0) as final_score,
          coalesce(visits_30d, 0) as visits_30d,
          coalesce(avg_rating_90d, 0) as avg_rating_90d
      `,
      [
        companyId,
        parsed.name,
        parsed.description,
        parsed.address,
        parsed.phone || null,
        parsed.email || null,
        parsed.districtId,
        parsed.isMain,
        parsed.isActive,
      ]
    );

    const created = rows[0];

    if (!created) {
      throw new AppError(
        "INTERNAL_ERROR",
        "No se pudo crear la sucursal.",
        500
      );
    }

    const districtRows = await tx.query<{ name: string }>(
      `select name from districts where id = $1 limit 1`,
      [created.district_id ?? null]
    );

    return mapBranchListItem({
      ...created,
      district_name: districtRows[0]?.name ?? "Sin distrito",
    });
  });
}

export async function listBranchDistrictOptionsQuery(companyId: number) {
  const db = getDb();

  const rows = await db.query<{
    district_id: number;
    district_name: string;
  }>(
    `
      select distinct
        d.district_id,
        d.name as district_name
      from company_branches b
      inner join districts d
        on d.district_id = b.district_id
      where b.company_id = $1
      order by d.name asc
    `,
    [companyId]
  );

  return rows.map((row) => ({
    id: row.district_id,
    name: row.district_name,
  }));
}

export async function updateBranchQuery(
  companyId: number,
  branchId: number,
  input: UpsertBranchInput
) {
  const parsed = validateUpsertBranchInput(input);

  return withTransaction(async (tx) => {
    const existingRows = await tx.query<{ branch_id: number }>(
      `
        select branch_id
        from company_branches
        where company_id = $1
          and branch_id = $2
        limit 1
      `,
      [companyId, branchId]
    );

    if (!existingRows[0]) {
      throw new AppError("NOT_FOUND", "Sucursal no encontrada.", 404);
    }

    if (parsed.isMain) {
      await tx.query(
        `
          update company_branches
          set is_main = false
          where company_id = $1
            and branch_id <> $2
        `,
        [companyId, branchId]
      );
    }

    const rows = await tx.query<{
      branch_id: number;
      company_id: number;
      name: string;
      description?: string | null;
      address: string;
      phone?: string | null;
      email?: string | null;
      district_id?: number | null;
      district_name: string;
      is_main: boolean;
      is_active: boolean;
      final_score?: number | null;
      visits_30d?: number | null;
      avg_rating_90d?: number | null;
    }>(
      `
        update company_branches
        set
          name = $3,
          description = $4,
          address = $5,
          phone = $6,
          email = $7,
          district_id = $8,
          is_main = $9,
          is_active = $10,
          updated_at = now()
        where company_id = $1
          and branch_id = $2
        returning
          branch_id,
          company_id as company_id,
          name,
          description,
          address,
          phone,
          email,
          district_id,
          '' as district_name,
          is_main,
          is_active,
          coalesce(final_score, 0) as final_score,
          coalesce(visits_30d, 0) as visits_30d,
          coalesce(avg_rating_90d, 0) as avg_rating_90d
      `,
      [
        companyId,
        branchId,
        parsed.name,
        parsed.description,
        parsed.address,
        parsed.phone || null,
        parsed.email || null,
        parsed.districtId,
        parsed.isMain,
        parsed.isActive,
      ]
    );

    const updated = rows[0];

    if (!updated) {
      throw new AppError(
        "INTERNAL_ERROR",
        "No se pudo actualizar la sucursal.",
        500
      );
    }

    const districtRows = await tx.query<{ name: string }>(
      `select name from districts where id = $1 limit 1`,
      [updated.district_id ?? null]
    );

    return mapBranchListItem({
      ...updated,
      district_name: districtRows[0]?.name ?? "Sin distrito",
    });
  });
}