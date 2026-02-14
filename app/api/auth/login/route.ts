export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import {
  SESSION_COOKIE,
  createSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { permissionsForRole } from "@/lib/rbac";
import type { Role } from "@/models/user";

type UserDoc = {
  _id: { toString(): string };
  username: string;
  role: Role;
  serviceScopes?: string[];
};

function serializeUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    serviceScopes: user.serviceScopes ?? [],
    permissions: permissionsForRole(user.role),
  };
}

export async function POST(req: Request) {
  const body = await req.json();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const secureCookies = process.env.NODE_ENV === "production";
  const usernamePattern = /^[a-zA-Z0-9._-]{3,32}$/;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  await connectDB();
  let user = await User.findOne({ username });

  if (!user) {
    const existingCount = await User.countDocuments();
    if (existingCount === 0) {
      if (!usernamePattern.test(username)) {
        return NextResponse.json(
          { error: "Username must be 3-32 characters (letters, numbers, . _ -)" },
          { status: 400 }
        );
      }
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters for the first admin" },
          { status: 400 }
        );
      }
      const passwordHash = await hashPassword(password);
      user = await User.create({
        username,
        passwordHash,
        role: "admin",
        serviceScopes: [],
      });
    }
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(user._id.toString());
  const res = NextResponse.json({ user: serializeUser(user) });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies,
    expires: expiresAt,
    path: "/",
  });
  return res;
}
