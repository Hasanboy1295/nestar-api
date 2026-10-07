# Nestar API

Real-estate platform REST API — Nestar. Auth, listings, favorites, admin members.

## Stack

- **Next.js 16** (App Router route handlers) + **TypeScript**
- **MongoDB Atlas** via mongoose (collections: `listings`, `members`, `favorites`)
- **jose** (JWT) + **bcryptjs** (password hashing), httpOnly cookie auth, rate-limited login/register

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3001
```

## Environment variables

Set in `.env.local` for local dev and in **Vercel → Project → Settings → Environment Variables** for production. Never hardcode them in source.

| Variable | Purpose |
| --- | --- |
| `MONGO_DEV` | MongoDB connection string used in development |
| `MONGO_PROD` | MongoDB connection string used when `NODE_ENV=production` |
| `SECRET_TOKEN` | JWT signing secret |
| `ALLOWED_ORIGINS` | Comma separated CORS whitelist (frontend URLs) |

## .env security

- `.env*` is **gitignored** — real secrets are never committed.
- Only `.env.example` (placeholder values) is tracked by git.
- Real values live only in your local `.env.local` and the Vercel environment.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
node scripts/seed.mjs   # idempotent seed: 12 listings with property images
```

## API endpoints

- `GET /api/health`
- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/logout`
- `GET|PATCH /api/auth/me`
- `GET /api/properties` (filters: `q`, `city`, `type`, `purpose`, `featured`, `sort`, `limit`)
- `GET /api/properties/[id]`
- `GET /api/favorites` · `POST /api/favorites/[id]` (toggle)
- `GET /api/members` (admin only)

## Deploy

Connected to Vercel: https://nestar-api.vercel.app

Branches: `master` (production) and `develop` (integration).
