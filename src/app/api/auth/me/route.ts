import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AUTH_COOKIE, hashPassword, comparePassword, verifyToken } from "@/lib/auth";
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

async function requireMember(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return null;

  await connectDB();
  const member = await MemberModel.findById(payload.sub).select(
    "+memberPassword",
  );
  if (!member || member.memberStatus === "BLOCKED") return null;
  return member;
}

export async function PATCH(req: NextRequest) {
  try {
    const member = await requireMember(req);
    if (!member) {
      return errorResponse(req, 401, "Not authenticated");
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return errorResponse(req, 400, "Invalid request body");
    }

    const hasName = typeof body.memberFullName === "string";
    const hasDesc = typeof body.memberDesc === "string";
    const hasPassword =
      typeof body.newPassword === "string" || typeof body.currentPassword === "string";

    if (!hasName && !hasDesc && !hasPassword) {
      return errorResponse(req, 400, "Nothing to update");
    }

    if (hasName) {
      const name = String(body.memberFullName).trim();
      if (name.length > 80) {
        return errorResponse(req, 400, "Name is too long");
      }
      member.memberFullName = name;
    }

    if (hasDesc) {
      const desc = String(body.memberDesc).trim();
      if (desc.length > 500) {
        return errorResponse(req, 400, "Description is too long");
      }
      member.memberDesc = desc;
    }

    if (hasPassword) {
      const currentPassword = String(body.currentPassword ?? "");
      const newPassword = String(body.newPassword ?? "");

      if (!currentPassword || !newPassword) {
        return errorResponse(req, 400, "Enter current and new password");
      }
      if (newPassword.length < 6) {
        return errorResponse(
          req,
          400,
          "Password must be at least 6 characters long",
        );
      }

      const valid = await comparePassword(currentPassword, member.memberPassword);
      if (!valid) {
        return errorResponse(req, 403, "Current password is incorrect");
      }

      member.memberPassword = await hashPassword(newPassword);
      member.memberAuthType = "EMAIL";
    }

    await member.save();

    return applyCors(
      NextResponse.json({ ok: true, member: safeMember(member) }),
      req,
    );
  } catch (error) {
    console.error("[me patch]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
