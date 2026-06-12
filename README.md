# Friends Community 🤝

A mobile-first, fun social hub for our globally scattered WhatsApp crew — tracking prediction contests, movie ratings, and bragging rights.

> Step 1 ships the **landing page** (hero, Active Contests teaser, Movie Ratings teaser, mobile nav) using hardcoded placeholder data. MongoDB Atlas + dynamic contest/voting logic come in later steps.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** for mobile-first styling
- Hosting target: **Vercel** (free Hobby plan)
- Database (later): **MongoDB Atlas** (free M0 tier)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Best previewed at a 375px mobile width; it scales up to tablet (768px+) and desktop.

## Project structure

```
app/
  layout.tsx     # root layout, fonts, metadata, <Nav/>
  page.tsx       # composes the landing sections
  globals.css    # Tailwind layers + theme utilities
components/
  Nav.tsx                    # mobile-first nav w/ hamburger
  Hero.tsx                   # hero section
  ActiveContestsPreview.tsx  # FIFA 2026 featured card + archive teaser
  MovieRatingsPreview.tsx    # movie star verdicts
  SectionHeading.tsx
  ui/                        # Card, Badge, Stars
lib/
  data.ts        # hardcoded placeholder data (typed)
docs/
  prompt-log.md  # running journal of build prompts
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is detected automatically, no config needed.
3. Deploy. (No environment variables required yet.)
