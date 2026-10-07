const endpoints = [
  { method: "GET", path: "/api/health", desc: "Service + database health check" },
  {
    method: "POST",
    path: "/api/auth/register",
    desc: "Create account — the first user becomes ADMIN",
  },
  {
    method: "POST",
    path: "/api/auth/login",
    desc: "Sign in with email/nickname + password (sets httpOnly cookie)",
  },
  { method: "POST", path: "/api/auth/logout", desc: "Clear the session cookie" },
  { method: "GET", path: "/api/auth/me", desc: "Current session member" },
  { method: "PATCH", path: "/api/auth/me", desc: "Update profile or change password" },
  {
    method: "GET",
    path: "/api/properties",
    desc: "List properties — search, city, type, purpose, featured filters",
  },
  { method: "GET", path: "/api/properties/:id", desc: "Property detail (+ view counter)" },
  { method: "GET", path: "/api/favorites", desc: "My saved properties (auth)" },
  { method: "POST", path: "/api/favorites/:id", desc: "Toggle favorite (auth)" },
  { method: "GET", path: "/api/members", desc: "List members — ADMIN only" },
];

const styles: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
          REST API
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          nestar-api
        </h1>
        <p className="mt-4 text-zinc-400">
          Next.js Route Handlers + MongoDB (mongoose) + JWT httpOnly cookies.
          Endpoints below accept JSON and return{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em]">
            {"{ ok, ... }"}
          </code>
          .
        </p>

        <ul className="mt-10 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.03]">
          {endpoints.map((endpoint) => (
            <li
              key={endpoint.path}
              className="flex items-start gap-4 px-5 py-4"
            >
              <span
                className={`mt-0.5 w-16 shrink-0 rounded-md border px-2 py-0.5 text-center text-[11px] font-bold ${styles[endpoint.method]}`}
              >
                {endpoint.method}
              </span>
              <div>
                <p className="font-mono text-sm text-zinc-100">
                  {endpoint.path}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{endpoint.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-zinc-600">
          Auth cookie: <span className="font-mono">nestar_token</span> · 7 days
          · httpOnly · sameSite=lax
        </p>
      </main>
    </div>
  );
}
