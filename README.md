# Friends Community 🤝

A mobile-first, fun social hub for our globally scattered WhatsApp crew — tracking prediction contests, movie ratings, and bragging rights.

- **Step 1** — landing page (hero, Active Contests teaser, Movie Ratings teaser, mobile nav) + a shared group password gate.
- **Step 2** — MongoDB Atlas backend: data is stored in the DB and rendered on the page, plus an admin area to manage members and movies.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** for mobile-first styling
- **MongoDB Atlas** (free M0 tier) via the official `mongodb` driver
- Hosting target: **Vercel** (free Hobby plan)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Best previewed at a 375px mobile width; it scales up to tablet (768px+) and desktop. If the DB isn't configured, the public page falls back to seed data so it still renders.

## Environment variables

Set these in `.env.local` (local) and in Vercel project settings (production):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Atlas connection string, including `/friends_community` before the `?` |
| `MONGODB_DB` | Database name (defaults to `friends_community`) |
| `ADMIN_PASSWORD` | Password for the in-app admin area (`/admin`) |
| `SESSION_SECRET` | Long random string used to sign the admin session cookie |

## MongoDB Atlas setup (one time)

1. **Database user**: Atlas > Database & Network Access > add a user with "Read and write to any database".
2. **Network access**: add `0.0.0.0/0` (Vercel uses dynamic IPs).
3. **Connection string**: Cluster0 > Connect > Drivers > copy it, insert your password and the db name, and paste into `MONGODB_URI`.
4. **Seed the starter data**:

```bash
npm run seed
```

This loads the initial members, contests, and movies into the DB.

## Admin area

Visit `/admin`, log in with `ADMIN_PASSWORD`, and you can:

- Manage the fixed **members** list (the friends you assign ratings to).
- **Create/edit/delete movies** with title, language, genre, poster URL, and per-person star ratings. The group verdict (average) and vote count are computed automatically.

The group password gate is a client-side convenience (view access); the admin password is validated server-side (write access).

## Project structure

```
app/
  layout.tsx          # root layout, fonts, password gate, <Nav/>
  page.tsx            # landing page; fetches contests + movies from the DB
  admin/              # admin layout + dashboard (auth-gated)
  api/                # route handlers: admin login/logout, members, movies
components/
  Nav.tsx, Hero.tsx, QuickLinks.tsx
  PasswordGate.tsx    # shared group password gate
  ui/                 # Card, Badge, Stars
  contests/           # ContestsView (active/archived)
  fifa/               # FIFA dashboard: leaderboard, matches, players, insights
  movies/             # MoviesExplorer + cards/analytics
  admin/              # AdminLogin, MembersManager, MoviesManager, MovieForm
lib/
  mongodb.ts          # cached Atlas connection
  db/                 # data access: members, movies, contests
  content.ts          # DB reads with seed fallback
  data.ts             # seed + fallback data
  auth.ts             # admin session cookie (HMAC signed)
  types.ts, util.ts
scripts/
  seed.mjs            # npm run seed
docs/
  prompt-log.md       # running journal of build prompts
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is detected automatically.
3. Add the four environment variables above in the Vercel project settings.
4. Deploy.
