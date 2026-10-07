import { NextResponse } from "next/server";

function allowedOrigins(): Set<string> {
  const raw =
    process.env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://localhost:3001";
  return new Set(
    raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && allowedOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

export function applyCors(res: NextResponse, req: Request): NextResponse {
  const headers = corsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }
  return res;
}

export function preflight(req: Request): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  return applyCors(res, req);
}

export function errorResponse(req: Request, status: number, error: string) {
  return applyCors(NextResponse.json({ ok: false, error }, { status }), req);
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}
