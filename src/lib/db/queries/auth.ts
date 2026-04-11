import crypto from "node:crypto";
import { getDb } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import { createAccessToken } from "@/lib/auth/session";
import type { AppRole } from "@/lib/constants/roles";
import type { LoginInput, LoginResult } from "@/features/auth/types";

type AuthRow = {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: AppRole;
  company_id: number;
  is_active: boolean;
};

const DUMMY_STORED_HASH = buildDummyStoredHash();

export async function loginWithCredentialsQuery(
  input: LoginInput
): Promise<LoginResult> {
  const db = getDb();

  const rows = await db.query<AuthRow>(
    `
      select
        u.id::text as user_id,
        u.name,
        lower(u.email) as email,
        u.password_hash,
        u.role,
        uc.company_id as company_id,
        coalesce(u.is_active, true) as is_active
      from users u
      inner join user_companies uc on uc.user_id = u.id
      where lower(u.email) = lower($1)
      limit 1
    `,
    [input.email]
  );

  const user = rows[0];

  if (!user) {
    verifyPassword(input.password, DUMMY_STORED_HASH);

    throw new AppError(
      "INVALID_CREDENTIALS",
      "Correo o contraseña incorrectos.",
      401
    );
  }

  if (!user.is_active) {
    throw new AppError(
      "ACCOUNT_DISABLED",
      "Tu cuenta está deshabilitada.",
      403
    );
  }

  const validPassword = verifyPassword(input.password, user.password_hash);

  if (!validPassword) {
    throw new AppError(
      "INVALID_CREDENTIALS",
      "Correo o contraseña incorrectos.",
      401
    );
  }

  const accessToken = createAccessToken({
    sub: user.user_id,
    name: user.name,
    email: user.email,
    company_id: user.company_id,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      companyId: user.company_id,
      role: user.role,
    },
  };
}

function verifyPassword(plain: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) return false;

  const candidateHash = crypto
    .pbkdf2Sync(plain, salt, 100000, 64, "sha512")
    .toString("hex");

  const candidateBuffer = Buffer.from(candidateHash, "hex");
  const originalBuffer = Buffer.from(originalHash, "hex");

  if (candidateBuffer.length !== originalBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuffer, originalBuffer);
}

function buildDummyStoredHash(): string {
  const salt = "vasirono_dummy_salt";
  const hash = crypto
    .pbkdf2Sync("vasirono_dummy_password", salt, 100000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
}