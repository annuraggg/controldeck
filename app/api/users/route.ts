import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { hashPassword, requireApiAuth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { permissionsForRole } from "@/lib/rbac";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req, { permission: "users:manage" });
  if (auth.response) return auth.response;

  await connectDB();
  const users = await User.find().sort({ username: 1 }).lean();

  return NextResponse.json(
    users.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      role: u.role,
      serviceScopes: u.serviceScopes ?? [],
      permissions: permissionsForRole(u.role),
    }))
  );
}

export async function POST(req: Request) {
  const auth = await requireApiAuth(req, { permission: "users:manage" });
  if (auth.response) return auth.response;

  const settings = await getSettings();
  if (settings.readOnly) {
    return NextResponse.json(
      { error: "Read-only mode enabled" },
      { status: 403 }
    );
  }

  await connectDB();
  const body = await req.json();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const role = body.role;
  const serviceScopes: string[] = Array.isArray(body.serviceScopes)
    ? body.serviceScopes.map((s: string) => s.trim()).filter(Boolean)
    : [];

  if (!username || !password || !role) {
    return NextResponse.json(
      { error: "Username, password, and role are required" },
      { status: 400 }
    );
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return NextResponse.json({ error: "Username already exists" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ username, passwordHash, role, serviceScopes });

  return NextResponse.json({
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    serviceScopes: user.serviceScopes,
    permissions: permissionsForRole(user.role),
  });
}
