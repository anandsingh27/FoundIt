# FoundIt — Campus Lost & Found Portal

A full-stack lost & found board for a college campus: students post lost or
found items, browse/search the board, submit claims, and coordinate pickup
once a claim is approved. Includes an admin panel for moderation.

Built with Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS,
and SQLite (via `better-sqlite3`) — a single deployable app with no external
database or service to provision.

## Features

- Sign up / log in (session cookies, bcrypt-hashed passwords)
- Optional restriction of sign-ups to a college email domain
- Post a lost or found item with photo, category, location, and date
- Search and filter the board (lost/found, category, keyword)
- Submit a claim on an item; the poster approves or rejects it
- On approval, both people's contact info (email + optional phone) is
  revealed to each other on their dashboards
- Dashboard: your posts, claims received, claims you've submitted
- Admin panel: stats, moderate/resolve/delete any post, view all users
- Themed 404 and error pages, mobile-responsive design

## Local development

Requires Node.js 20.9+ (uses `better-sqlite3`, no other services needed).

```bash
npm install
cp .env.example .env
# edit .env: set SESSION_SECRET (openssl rand -base64 48), and anything else you want
npm run dev
```

Visit http://localhost:3000. Create your first admin account:

```bash
ADMIN_EMAIL=admin@example.edu ADMIN_PASSWORD=changeme123 npm run seed

# optionally add a demo user + a few sample posts to play with
npm run seed:demo
```

To promote an existing signed-up user to admin instead:

```bash
npm run make-admin -- someone@college.edu
```

## Building for production

```bash
npm run build   # also runs `postbuild`, which copies static assets into
                 # .next/standalone so the standalone server can find them
```

Because `next.config.ts` sets `output: "standalone"`, the real production
entrypoint is:

```bash
node .next/standalone/server.js
```

This is a minimal, self-contained server (its own pruned `node_modules`)
ideal for Docker or any plain VPS. `next start` still runs for a quick local
sanity check, but standalone mode is what you should actually deploy.

## Deploying

### Option A — Docker (recommended, works anywhere)

```bash
cp .env.example .env   # set SESSION_SECRET at minimum
docker compose up -d --build
```

The app runs on port 3000, with the SQLite database and uploaded photos
persisted in named Docker volumes (`lostfound-data`, `lostfound-uploads`) so
they survive container rebuilds/restarts. Create your admin account inside
the running container:

```bash
docker compose exec app node scripts/seed.mjs
# or with a specific email/password:
docker compose exec app env ADMIN_EMAIL=admin@yourcollege.edu ADMIN_PASSWORD=changeme123 node scripts/seed.mjs
```

### Option B — Render / Railway / Fly.io / any Node host

1. Build command: `npm install && npm run build`
2. Start command: `node .next/standalone/server.js`
3. Set environment variables: `SESSION_SECRET` (required), `ALLOWED_EMAIL_DOMAIN`
   (optional). Most hosts set `PORT` for you automatically.
4. **Attach a persistent disk/volume** covering `./data` (the SQLite file)
   and `./public/uploads` (photos), relative to wherever `server.js` runs —
   otherwise both are wiped on every redeploy. Render and Railway both
   support persistent disks/volumes; point one at the app's `/data` and
   `/public/uploads` paths (adjust to your host's checkout location).
5. After the first deploy, run the seed script once (via the host's shell/
   console feature) to create an admin account: `node scripts/seed.mjs`.

### Important: serverless platforms (e.g. Vercel) are not a good fit

This app uses a local SQLite file and local disk for photo uploads.
Serverless functions typically have an ephemeral, mostly-read-only
filesystem, so the database and uploaded photos would not persist between
requests. To deploy on a serverless platform you'd need to swap SQLite for a
hosted Postgres/MySQL database and photo storage for S3/Cloudinary/etc. The
app is structured so that's a contained change (see `src/lib/models/*.ts`
for the DB layer and `src/lib/storage.ts` for uploads), but it isn't done
out of the box — this app targets a normal long-running Node process
(Docker, a VPS, Render, Railway, Fly.io).

### Cookies over HTTP vs HTTPS

The session cookie is `httpOnly` + `SameSite=Lax` either way, and also
`Secure` (HTTPS-only) if you set `COOKIE_SECURE=true`. That's off by default
because most hosts (Render, Railway, Fly, a reverse proxy) terminate HTTPS
in front of Node, so Node itself only ever sees plain HTTP — if the cookie
defaulted to `Secure` based on `NODE_ENV`, sessions would silently break on
those hosts. Leave `COOKIE_SECURE` unset unless your Node process itself
terminates TLS directly (uncommon).

## Environment variables

See `.env.example` for the full list with explanations. The only one you
must set is `SESSION_SECRET`.

## Project structure

```
src/
  app/                 Pages (App Router) - home, login, signup, post,
                       items/[id], dashboard, admin
  actions/             Server Actions (signup, login, create item, claims)
  components/          UI components
  lib/
    db.ts              SQLite connection + schema
    models/            Query functions (users, items, claims)
    auth.ts            Password hashing, JWT sessions, cookies
    dal.ts             requireUser() / requireAdmin() - the real auth gate
    storage.ts         Image upload handling
    validation.ts      Zod schemas
  proxy.ts             Optimistic route-protection redirect (see note below)
scripts/
  seed.mjs             Create/promote an admin account (+ optional demo data)
  make-admin.mjs       Promote an existing user to admin by email
```

**A note on `src/proxy.ts`:** it only checks whether a session cookie is
*present*, not whether it's valid — Next.js's docs are explicit that Proxy
(formerly "Middleware") runs in an isolated context and shouldn't be relied
on for real security decisions. The actual, secure check (signature +
expiry + role) happens in `requireUser()`/`requireAdmin()` in
`src/lib/dal.ts`, which every protected page and Server Action calls
directly. Proxy just avoids flashing a protected page before redirecting.

## Known limitations / good next steps

- No email verification or password-reset flow — a real deployment for a
  college would likely want at least password reset.
- No rate limiting on login/signup — fine for a single-campus tool under
  normal usage, worth adding if opening this up more broadly.
- Photo storage is local disk, which is simple but means you need a real
  persistent volume in production (see deployment notes above) and doesn't
  horizontally scale past one instance without moving to object storage.
- No automated test suite is included in the repo (the app was verified
  manually end-to-end during development, covering signup, posting,
  claiming, approval, contact reveal, dashboard, and admin flows).
