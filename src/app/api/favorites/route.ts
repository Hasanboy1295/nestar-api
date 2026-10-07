import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";
import { applyCors, errorResponse, preflight } from "@/lib/http";
import { MemberModel } from "@/models/Member";
import { PropertyModel, safeProperty } from "@/models/Property";

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

    const member = await MemberModel.findById(payload.sub)
      .select("memberFavorites memberStatus")
      .lean();

    if (!member || member.memberStatus === "BLOCKED") {
      return errorResponse(req, 401, "Not authenticated");
    }

    const favorites = member.memberFavorites ?? [];
    const properties = favorites.length
      ? await PropertyModel.find({ _id: { $in: favorites } })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    return applyCors(
      NextResponse.json({
        ok: true,
        properties: properties.map((property) =>
          safeProperty(property as never),
        ),
      }),
      req,
    );
  } catch (error) {
    console.error("[favorites]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
