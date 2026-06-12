# Friends Community — Prompt Log

A running log of every prompt used to build this project, for reference and reproducibility.

---

## [Entry #1] — 2026-06-12 22:57
**Prompt:**
> You are working in a directory called Friends-Community. We are building a mobile-first web app called Friends Community — a fun, social hub for a WhatsApp group of globally scattered friends connected through mutual friendships.
> About the group:
>
> The group runs friendly, low-stakes contests and activities purely for fun and engagement:
>
> Prediction contests — e.g. IPL match predictions (recently concluded), FIFA World Cup 2026 predictions (currently ongoing). Members predict outcomes; most correct predictions wins.
> Movie ratings — A poll is posted for a film, members vote on a star rating, and a group verdict (average stars) is declared.
>
> App overview:
>
> The app tracks all group contests and activities. It will have:
>
> 1. A landing/hero section with the group name and a fun, engaging identity
> 2. An Active Contests section showing ongoing contests (e.g. FIFA 2026)
> 3. An Archive section for past contests (e.g. IPL 2025)
> 4. A Movie Ratings section with group verdicts
>
> Device priority: Mobile-first, responsive design is essential — primarily used on mobile phones and iPads.
> Tech stack:
>
> 1. Frontend: [specify — e.g. React / Next.js / plain HTML]
> 2. Database: MongoDB Atlas (free M0 tier — 512 MB, never expires, no pausing)
> 3. Hosting: Vercel (free Hobby plan). All architecture decisions must stay within free tier limits. No paid services, no credit card required.
>
> Tone & personality: Casual, vibrant, and fun — this is a friend group, not a corporate product.
>
> 📋 Prompt Logging — Required on Every Interaction:
> Maintain a prompt journal at docs/prompt-log.md. Every time I give you a prompt or instruction, before doing anything else, append an entry to this file in the following format: [format spec omitted for brevity]
>
> Step 1 — Landing Page:
> Design and build the landing page only. It should include: a hero section, a preview/teaser of the Active Contests section, a preview/teaser of the Movie Ratings section, and mobile-friendly navigation.
> Design guidelines: Mobile-first (375px base), scales up to tablet (768px+) and desktop; energetic but not cluttered; bold typography and color; no login/auth needed.

**Summary of action taken:**
Confirmed the stack (Next.js + React + Tailwind, hardcoded data for Step 1) and produced a plan to scaffold the project and build the landing page with hero, active contests teaser, movie ratings teaser, and mobile navigation.

---

## [Entry #2] — 2026-06-12 23:00
**Prompt:**
> Friends Community — Step 1: Landing Page
>
> Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.
>
> To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

**Summary of action taken:**
Scaffolded a mobile-first Next.js + TypeScript + Tailwind app and built the landing page (mobile nav with hamburger, hero, Active Contests teaser featuring FIFA 2026, and Movie Ratings teaser with star verdicts) using hardcoded placeholder data.

---

## [Entry #3] — 2026-06-12 23:15
**Prompt:**
> commit all to
>
> git remote add origin git@github.com:kishoresukumaran/friends-community.git
> git branch -M main
> git push -u origin main

**Summary of action taken:**
Initialized a git repository, committed all project files, added the GitHub remote, renamed the branch to main, and pushed to origin.

---

## [Entry #4] — 2026-06-12 23:17
**Prompt:**
> kishore is username and email is kishore.sukumaran@gmail.com

**Summary of action taken:**
Set the local git identity (kishore / kishore.sukumaran@gmail.com), committed all files, and pushed to the main branch on origin.

---
