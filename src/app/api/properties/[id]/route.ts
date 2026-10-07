import { NextResponse, type NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { applyCors, errorResponse, preflight } from "@/lib/http";
import { PropertyModel, safeProperty } from "@/models/Property";

type Params = { params: Promise<{ id: string }> };

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse(req, 404, "Property not found");
    }

    await connectDB();

    const property = await PropertyModel.findOneAndUpdate(
      { _id: id, status: "ACTIVE" },
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!property) {
      return errorResponse(req, 404, "Property not found");
    }

    return applyCors(
      NextResponse.json({ ok: true, property: safeProperty(property) }),
      req,
    );
  } catch (error) {
    console.error("[property detail]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
