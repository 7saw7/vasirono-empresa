import type { AppRole } from "@/lib/constants/roles";
import type { AuthUser } from "./types";

type RawAuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id?: number | null;
};

export function mapAuthUser(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role as AppRole,
    companyId: raw.company_id ?? null,
  };
}