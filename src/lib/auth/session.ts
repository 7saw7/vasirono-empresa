import crypto from "node:crypto";
import { cookies } from "next/headers";
import { AppError } from "@/lib/errors/app-error";
import { ALL_STAFF_ROLES, type AppRole } from "@/lib/constants/roles";

export const SESSION_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME?.trim() || "access_token";

const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type SessionUser = {
  userId: string;
  name: string;
  email: string;
  companyId: number | null;
  role: AppRole;
};

type JwtPayload = {
  iss: string;
  aud: string;
  sub: string;
  name: string;
  email: string;
  company_id: number | null;
  role: AppRole;
  iat: number;
  nbf: number;
  exp: number;
  jti: string;
};

type AccessTokenInput = {
  sub: string;
  name: string;
  email: string;
  company_id: number | null;
  role: AppRole;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    name: payload.name,
    email: payload.email,
    companyId: payload.company_id,
    role: payload.role,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    throw new AppError("UNAUTHORIZED", "No autorizado.", 401);
  }

  return session;
}

export function createAccessToken(input: AccessTokenInput): string {
  const secret = getJwtSecret();
  const issuer = getJwtIssuer();
  const audience = getJwtAudience();
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload: JwtPayload = {
    iss: issuer,
    aud: audience,
    sub: input.sub,
    name: input.name,
    email: input.email,
    company_id: input.company_id,
    role: input.role,
    iat: now,
    nbf: now,
    exp: now + SESSION_TTL_SECONDS,
    jti: crypto.randomUUID(),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signToken(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

function verifyAccessToken(token: string): JwtPayload | null {
  const secret = getJwtSecretOrNull();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signToken(
    `${encodedHeader}.${encodedPayload}`,
    secret
  );

  const providedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<JwtPayload>;

    if (!isValidPayload(payload)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.iss !== getJwtIssuer()) return null;
    if (payload.aud !== getJwtAudience()) return null;
    if (payload.nbf > now) return null;
    if (payload.exp <= now) return null;

    return payload;
  } catch {
    return null;
  }
}

  function isValidPayload(payload: Partial<JwtPayload>): payload is JwtPayload {
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.iss !== "string" ||
      typeof payload.aud !== "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      (
        payload.company_id !== undefined &&
        payload.company_id !== null &&
        (!Number.isInteger(payload.company_id) || payload.company_id <= 0)
      ) ||
      typeof payload.role !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.nbf !== "number" ||
      typeof payload.exp !== "number" ||
      typeof payload.jti !== "string"
    ) {
      return false;
    }

    return ALL_STAFF_ROLES.includes(payload.role as AppRole);
  }

function signToken(value: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function getJwtSecret(): string {
  const secret = getJwtSecretOrNull();

  if (!secret) {
    throw new AppError(
      "SERVER_CONFIG_ERROR",
      "Falta configurar JWT_SECRET.",
      500
    );
  }

  return secret;
}

function getJwtSecretOrNull(): string | null {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || secret.length < 32) {
    return null;
  }

  return secret;
}

function getJwtIssuer(): string {
  return process.env.JWT_ISSUER?.trim() || "vasirono-auth";
}

function getJwtAudience(): string {
  return process.env.JWT_AUDIENCE?.trim() || "vasirono-admin-company";
}