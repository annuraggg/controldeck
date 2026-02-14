export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { destroySession, parseCookies } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/sessionConstants";

export async function POST(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE];
  const secureCookies = process.env.NODE_ENV === "production";

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies,
    expires: new Date(0),
    path: "/",
  });

  await destroySession(token);
  return res;
}
