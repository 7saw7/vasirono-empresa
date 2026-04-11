import { getDb } from "@/lib/db/server";
import type { CompanyVerificationData } from "@/features/admin-company/verifications/types";

export async function getCompanyVerificationsQuery(
  companyId: number
): Promise<CompanyVerificationData> {
  const db = getDb();

  const [summaryRows, checkRows, documentRows, contactRows, addressRows, timelineRows] =
    await Promise.all([
      db.query<{
        level: string;
        status_label: string;
        status_tone: "default" | "success" | "warning" | "danger" | "info";
        score: number;
        last_review_at: string | null;
        checks_completed: number;
        checks_total: number;
      }>(
        `
          select
            coalesce(v.level, 'Pendiente') as level,
            coalesce(v.status_label, 'Sin revisión') as status_label,
            coalesce(v.status_tone, 'default') as status_tone,
            coalesce(v.score, 0) as score,
            v.last_review_at::text as last_review_at,
            coalesce(v.checks_completed, 0) as checks_completed,
            coalesce(v.checks_total, 0) as checks_total
          from company_verification_summary v
          where v.company_id = $1
          limit 1
        `,
        [companyId]
      ),

      db.query<{
        id: number;
        code: string;
        label: string;
        status_label: string;
        status_tone: "default" | "success" | "warning" | "danger" | "info";
        notes: string | null;
        reviewed_at: string | null;
      }>(
        `
          select
            cvc.id,
            cvc.code,
            cvc.label,
            coalesce(cvc.status_label, 'Pendiente') as status_label,
            coalesce(cvc.status_tone, 'default') as status_tone,
            cvc.notes,
            cvc.reviewed_at::text as reviewed_at
          from company_verification_checks cvc
          where cvc.company_id = $1
          order by cvc.id asc
        `,
        [companyId]
      ),

      db.query<{
        id: number;
        type_label: string;
        file_name: string;
        file_url: string;
        status_label: string;
        uploaded_at: string | null;
      }>(
        `
          select
            cvd.id,
            cvd.type_label,
            cvd.file_name,
            cvd.file_url,
            coalesce(cvd.status_label, 'Pendiente') as status_label,
            cvd.uploaded_at::text as uploaded_at
          from company_verification_documents cvd
          where cvd.company_id = $1
          order by cvd.uploaded_at desc nulls last, cvd.id desc
        `,
        [companyId]
      ),

      db.query<{
        id: number;
        contact_type: string;
        value: string;
        source_label: string;
        matches_company: boolean;
      }>(
        `
          select
            cvc.id,
            cvc.contact_type,
            cvc.value,
            cvc.source_label,
            coalesce(cvc.matches_company, false) as matches_company
          from company_verification_contacts cvc
          where cvc.company_id = $1
          order by cvc.id asc
        `,
        [companyId]
      ),

      db.query<{
        source_label: string;
        address_value: string;
        matches_company: boolean;
      }>(
        `
          select
            cva.source_label,
            cva.address_value,
            coalesce(cva.matches_company, false) as matches_company
          from company_verification_address_matches cva
          where cva.company_id = $1
          order by cva.id asc
        `,
        [companyId]
      ),

      db.query<{
        id: string;
        title: string;
        description: string;
        created_at: string;
        type: "document" | "review" | "contact" | "address" | "system";
      }>(
        `
          select
            cvt.id::text as id,
            cvt.title,
            cvt.description,
            cvt.created_at::text as created_at,
            cvt.type
          from company_verification_timeline cvt
          where cvt.company_id = $1
          order by cvt.created_at desc
          limit 20
        `,
        [companyId]
      ),
    ]);

  const summary = summaryRows[0]
    ? {
        level: summaryRows[0].level,
        statusLabel: summaryRows[0].status_label,
        statusTone: summaryRows[0].status_tone,
        score: summaryRows[0].score,
        lastReviewAt: summaryRows[0].last_review_at,
        checksCompleted: summaryRows[0].checks_completed,
        checksTotal: summaryRows[0].checks_total,
      }
    : null;

  return {
    summary,
    checks: checkRows.map((row) => ({
      id: row.id,
      code: row.code,
      label: row.label,
      statusLabel: row.status_label,
      statusTone: row.status_tone,
      notes: row.notes,
      reviewedAt: row.reviewed_at,
    })),
    documents: documentRows.map((row) => ({
      id: row.id,
      typeLabel: row.type_label,
      fileName: row.file_name,
      fileUrl: row.file_url,
      statusLabel: row.status_label,
      uploadedAt: row.uploaded_at,
    })),
    contacts: contactRows.map((row) => ({
      id: row.id,
      contactType: row.contact_type,
      value: row.value,
      sourceLabel: row.source_label,
      matchesCompany: row.matches_company,
    })),
    addressMatches: addressRows.map((row) => ({
      sourceLabel: row.source_label,
      addressValue: row.address_value,
      matchesCompany: row.matches_company,
    })),
    timeline: timelineRows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      createdAt: row.created_at,
      type: row.type,
    })),
  };
}