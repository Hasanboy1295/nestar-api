import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  AUTH_COOKIE,
  authCookieOptions,
  comparePassword,
  signToken,
} from "@/lib/auth";
import {
  applyCors,
  clientIp,
  errorResponse,
  preflight,
  rateLimit,
} from "@/lib/http";
import { MemberModel, safeMember } from "@/models/Member";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return errorResponse(req, 400, "Invalid request body");
    }

    const identifier = String(body.identifier ?? "")
      .trim()
      .toLowerCase();
    const memberPassword = String(body.memberPassword ?? "");

    if (!identifier || !memberPassword) {
      return errorResponse(req, 400, "Enter your credentials");
    }

    const ip = clientIp(req);
    if (!rateLimit(`login:${ip}:${identifier}`, 10, 60_000)) {
      return errorResponse(req, 429, "Too many attempts. Try again later.");
    }

    await connectDB();

    const member = await MemberModel.findOne({
      $or: [{ memberEmail: identifier }, { memberNick: identifier }],
    }).select("+memberPassword");

    if (!member) {
      return errorResponse(req, 401, "Invalid email/nickname or password");
    }

    const valid = await comparePassword(memberPassword, member.memberPassword);
    if (!valid) {
      return errorResponse(req, 401, "Invalid email/nickname or password");
    }

    if (member.memberStatus === "BLOCKED") {
      return errorResponse(req, 403, "This account has been blocked");
    }

    const token = await signToken({
      sub: String(member._id),
      memberNick: member.memberNick,
      memberEmail: member.memberEmail,
      memberType: member.memberType,
      memberFullName: member.memberFullName,
    });

    const res = NextResponse.json({
      ok: true,
      member: safeMember(member),
    });
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions);
    return applyCors(res, req);
  } catch (error) {
    console.error("[login]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
