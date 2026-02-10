import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/session";
import User from "@/models/user";
import {
  AuthUser,
  Permission,
  hasPermission,
  isServiceAllowed,
  permissionsForRole,
} from "./rbac";
import { randomHex, sha256Hex } from "./cryptoUtils";

export const SESSION_COOKIE = "cd.session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

async function hashToken(token: string) {
  return sha256Hex(token);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function parseCookies(header: string | null) {
  if (!header) return {};
  const entries: [string, string][] = [];

  for (const c of header.split(";")) {
    const [k, ...rest] = c.trim().split("=");
    try {
      entries.push([decodeURIComponent(k), decodeURIComponent(rest.join("="))]);
    } catch {
      continue;
    }
  }

  return Object.fromEntries(entries);
}

export async function getUserForSessionToken(
  token?: string | null
): Promise<AuthUser | null> {
  if (!token) return null;

  await connectDB();
  const tokenHash = await hashToken(token);
  const session = await Session.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!session) return null;

  const userDoc = await User.findById(session.userId).lean();
  if (!userDoc) return null;

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await Session.updateOne({ _id: session._id }, { $set: { expiresAt } });

  return {
    id: userDoc._id.toString(),
    username: userDoc.username,
    role: userDoc.role,
    serviceScopes: userDoc.serviceScopes ?? [],
    permissions: permissionsForRole(userDoc.role),
  };
}

export async function getAuthUser(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"));
  return getUserForSessionToken(cookies[SESSION_COOKIE]);
}

export async function createSession(userId: string) {
  const token = randomHex(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await connectDB();
  const tokenHash = await hashToken(token);
  await Session.create({
    tokenHash,
    userId,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function destroySession(token?: string | null) {
  if (!token) return;
  await connectDB();
  const tokenHash = await hashToken(token);
  await Session.deleteOne({ tokenHash });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function requireApiAuth(
  req: Request,
  options?: { permission?: Permission; serviceName?: string }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return { response: unauthorized() };
  }

  if (options?.permission && !hasPermission(user, options.permission)) {
    return { response: forbidden() };
  }

  if (options?.serviceName && !isServiceAllowed(user, options.serviceName)) {
    return { response: forbidden() };
  }

  return { user };
}
