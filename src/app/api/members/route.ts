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
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      return errorResponse(req, 401, "Not authenticated");
    }

    await connectDB();

    const authMember = await MemberModel.findById(payload.sub);
    if (!authMember || authMember.memberStatus === "BLOCKED") {
      return errorResponse(req, 401, "Not authenticated");
    }
    if (authMember.memberType !== "ADMIN") {
      return errorResponse(req, 403, "Admin privileges required");
    }

    const members = await MemberModel.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return applyCors(
      NextResponse.json({
        ok: true,
        total: await MemberModel.countDocuments(),
        members: members.map((member) => safeMember(member as never)),
      }),
      req,
    );
  } catch (error) {
    console.error("[members]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
