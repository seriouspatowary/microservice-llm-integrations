import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";


const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;

if (!JWT_ACCESS_SECRET || JWT_ACCESS_SECRET.length < 32) {
  throw new Error(
    "JWT_ACCESS_SECRET must contain at least 32 characters"
  );
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

// Generate short-lived access JWT
export function generateAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: "15m",
    issuer: "auth-service",
    audience: "microservices",
  });
}

// Generate a secure, opaque refresh token
export function generateRefreshToken(): string {
  return randomBytes(64).toString("base64url");
}

// Hash the refresh token before storing it in PostgreSQL
export function hashRefreshToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}
