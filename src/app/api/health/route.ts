import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse, applyCors } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const res = NextResponse.json({
      ok: true,
      service: "nestar-api",
      db: "connected",
      time: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    });
    return applyCors(res, req);
  } catch (error) {
    console.error("[health]", error);
    return errorResponse(req, 503, "Database unavailable");
  }
}
