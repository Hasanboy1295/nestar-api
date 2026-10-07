import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { applyCors, errorResponse, preflight } from "@/lib/http";
import { PropertyModel, safeProperty } from "@/models/Property";

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { views: -1 },
};

export async function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const params = req.nextUrl.searchParams;
    const q = params.get("q")?.trim();
    const city = params.get("city");
    const type = params.get("type");
    const purpose = params.get("purpose");
    const featured = params.get("featured");
    const limit = Math.min(Number(params.get("limit")) || 50, 100);
    const sort = SORTS[params.get("sort") ?? "newest"] ?? SORTS.newest;

    const filter: Record<string, unknown> = { status: "ACTIVE" };

    if (q) {
      const rx = new RegExp(
        q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80),
        "i",
      );
      filter.$or = [
        { title: rx },
        { city: rx },
        { district: rx },
        { address: rx },
      ];
    }
    if (city) filter.city = city;
    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (featured === "true") filter.isFeatured = true;

    const [total, properties] = await Promise.all([
      PropertyModel.countDocuments(filter),
      PropertyModel.find(filter).sort(sort).limit(limit).lean(),
    ]);

    return applyCors(
      NextResponse.json({
        ok: true,
        total,
        properties: properties.map((property) =>
          safeProperty(property as never),
        ),
      }),
      req,
    );
  } catch (error) {
    console.error("[properties]", error);
    return errorResponse(req, 500, "Something went wrong. Please try again.");
  }
}
