import { NextResponse, type NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";
import { applyCors, errorResponse, preflight } from "@/lib/http";
import { MemberModel } from "@/models/Member";
import { PropertyModel } from "@/models/Property";

type Params = { params: Promise<{ id: string }> };

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse(req, 404, "Property not found");
    }

    const token = req.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      return errorResponse(req, 401, "Sign in to save favorites");
    }

    await connectDB();

    const property = await PropertyModel.findById(id).select("_id").lean();
    if (!property) {
      return errorResponse(req, 404, "Property not found");
    }

    const member = await MemberModel.findById(payload.sub);
    if (!member || member.memberStatus === "BLOCKED") {
      return errorResponse(req, 401, "Not authenticated");
    }

    const favorites = member.memberFavorites ?? [];
    const alreadyFavorite = favorites.some(
      (favoriteId) => String(favoriteId) === id,
    );

    if (alreadyFavorite) {
      member.memberFavorites = favorites.filter(
        (favoriteId) => String(favoriteId) !== id,
      );
    } else {
      member.memberFavorites = [...favorites, new Types.ObjectId(id)];
    }
    await member.save();

    return applyCors(
      NextResponse.json({ ok: true, favorite: !alreadyFavorite }),
      req,
    );
  } catch (error) {
    console.error("[favorite toggle]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
