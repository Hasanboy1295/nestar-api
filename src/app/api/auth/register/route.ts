import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  AUTH_COOKIE,
  authCookieOptions,
  hashPassword,
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(`register:${ip}`, 10, 60_000)) {
      return errorResponse(req, 429, "Too many attempts. Try again later.");
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return errorResponse(req, 400, "Invalid request body");
    }

    const memberFullName = String(body.memberFullName ?? "").trim();
    const memberNick = String(body.memberNick ?? "").trim().toLowerCase();
    const memberEmail = String(body.memberEmail ?? "").trim().toLowerCase();
    const memberPassword = String(body.memberPassword ?? "");

    if (memberNick.length < 3 || memberNick.length > 30) {
      return errorResponse(
        req,
        400,
        "Nickname must be between 3 and 30 characters",
      );
    }
    if (!/^[a-z0-9._]+$/.test(memberNick)) {
      return errorResponse(
        req,
        400,
        "Nickname may only contain letters, numbers, dots and underscores",
      );
    }
    if (!EMAIL_RE.test(memberEmail)) {
      return errorResponse(req, 400, "Please enter a valid email address");
    }
    if (memberPassword.length < 6) {
      return errorResponse(
        req,
        400,
        "Password must be at least 6 characters long",
      );
    }

    await connectDB();

    const existing = await MemberModel.findOne({
      $or: [{ memberEmail }, { memberNick }],
    })
      .select("_id")
      .lean();

    if (existing) {
      return errorResponse(req, 409, "Email or nickname is already taken");
    }

    const totalMembers = await MemberModel.countDocuments();

    const member = await MemberModel.create({
      memberNick,
      memberEmail,
      memberFullName,
      memberPassword: await hashPassword(memberPassword),
      memberType: totalMembers === 0 ? "ADMIN" : "USER",
      memberAuthType: "EMAIL",
    });

    const token = await signToken({
      sub: String(member._id),
      memberNick: member.memberNick,
      memberEmail: member.memberEmail,
      memberType: member.memberType,
      memberFullName: member.memberFullName,
    });

    const res = NextResponse.json(
      { ok: true, member: safeMember(member) },
      { status: 201 },
    );
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions);
    return applyCors(res, req);
  } catch (error) {
    console.error("[register]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
