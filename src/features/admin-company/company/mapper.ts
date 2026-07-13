// Los contratos externos de Companies y Media se agregan y normalizan en
// lib/db/queries/admin-company/company.ts. Este archivo se conserva para no
// romper imports históricos del módulo.
export {
  validateCompanyProfile as mapCompanyProfile,
  validateCompanyTaxonomy as mapCompanyTaxonomy,
} from "./schema";
