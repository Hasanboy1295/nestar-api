import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const AUTH_COOKIE = "nestar_token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface TokenPayload {
  sub: string;
  memberNick: string;
  memberEmail: string;
  memberType: string;
  memberFullName?: string;
}

function secretKey(): Uint8Array {
  const secret = process.env.SECRET_TOKEN;
  if (!secret) {
    throw new Error("Missing SECRET_TOKEN environment variable");
  }
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifyToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify<TokenPayload>(token, secretKey());
    if (!payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: TOKEN_MAX_AGE,
};
