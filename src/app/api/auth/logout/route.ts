import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth";
import { applyCors, errorResponse, preflight } from "@/lib/http";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ ok: true, message: "Logged out" });
    res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
    return applyCors(res, req);
  } catch (error) {
    console.error("[logout]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
