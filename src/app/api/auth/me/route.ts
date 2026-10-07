import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";
import { applyCors, errorResponse, preflight } from "@/lib/http";
import { MemberModel, safeMember } from "@/models/Member";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      return errorResponse(req, 401, "Not authenticated");
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return errorResponse(req, 401, "Session expired. Please sign in again.");
    }

    await connectDB();
    const member = await MemberModel.findById(payload.sub);

    if (!member || member.memberStatus === "BLOCKED") {
      const res = errorResponse(req, 401, "Session expired. Please sign in again.");
      res.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }

    return applyCors(
      NextResponse.json({ ok: true, member: safeMember(member) }),
      req,
    );
  } catch (error) {
    console.error("[me]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
