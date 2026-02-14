export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { hashPassword, requireApiAuth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { permissionsForRole } from "@/lib/rbac";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
  const user = await User.findById(params.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const nextRole = body.role ?? user.role;
  const nextServiceScopes: string[] = Array.isArray(body.serviceScopes)
    ? body.serviceScopes.map((s: string) => s.trim()).filter(Boolean)
    : user.serviceScopes ?? [];

  if (body.username && body.username !== user.username) {
    const exists = await User.findOne({ username: body.username });
    if (exists) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }
    user.username = String(body.username).trim();
  }

  const isDemotingLastAdmin =
    user.role === "admin" &&
    nextRole !== "admin" &&
    (await User.countDocuments({ role: "admin", _id: { $ne: user._id } })) === 0;

  if (isDemotingLastAdmin) {
    return NextResponse.json(
      { error: "At least one admin must remain" },
      { status: 400 }
    );
  }

  user.role = nextRole;
  user.serviceScopes = nextServiceScopes;

  if (body.password) {
    user.passwordHash = await hashPassword(String(body.password));
  }

  await user.save();

  return NextResponse.json({
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    serviceScopes: user.serviceScopes,
    permissions: permissionsForRole(user.role),
  });
}
