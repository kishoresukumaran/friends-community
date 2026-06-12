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

## [Entry #5] — 2026-06-12 23:38
**Prompt:**
> add a first page which should be asking password with the landing page blurred behind. This will be a common password , for now set it as <password> , idea is passwor dcommaon shared with all and each use this to login

**Summary of action taken:**
Added a client-side password gate overlay (shared password "<password>") that blurs the landing page behind it until the correct password is entered; the unlock state is remembered in localStorage.

---

## [Entry #6] — 2026-06-12 23:42
**Prompt:**
> remove that line "one password, shared with whole crew"

**Summary of action taken:**
Removed the "One password, shared with the whole crew." helper text from the password gate card.

---

## [Entry #7] — 2026-06-12 23:44
**Prompt:**
> implement a timeout for this logging in, right now how does this work? what is the best way efficient for this

**Summary of action taken:**
Explained the existing localStorage unlock (never expired) and replaced it with a timestamp-based expiry (7-day timeout) stored in localStorage, including an in-session timer that auto-re-locks the gate when the expiry passes.

---

## [Entry #8] — 2026-06-12 23:44
**Prompt:**
> and also add a logout button, pressing which it logs out and then asks for password again to login

**Summary of action taken:**
Exposed a logout action from the password gate via a small auth context and added a Logout button to the nav (desktop + mobile menu) that clears the unlock and re-shows the password screen.

---

## [Entry #9] — 2026-06-13 00:00
**Prompt:**
> Friends Community — Step 2: MongoDB Backend + Admin
>
> Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.
>
> To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

**Summary of action taken:**
Implemented the MongoDB backend: added the mongodb driver + connection helper, a data-access layer (movies/members/contests), a seed script, DB-driven landing page reads with poster thumbnails and per-person rating breakdowns, admin cookie-session auth, and an admin area to manage members and create/edit movies.

---

## [Entry #10] — 2026-06-13 00:13
**Prompt:**
> I created this, "mongodb+srv://fc_app:<db_password>@cluster0.gfpztae.mongodb.net/?appName=Cluster0" , should we create e env variable for the db password? let me know and I can paste the password there
>
> And then shuold we implement phase 1 in the plan or ist that done?
>
> Also the admin login is it auto-detected based on the password used? admin password is <password>

**Summary of action taken:**
Explained that the full connection string (password inline) goes in the single MONGODB_URI env var; pre-filled .env.local with the cluster URI (db name added) plus the admin password and a random SESSION_SECRET; confirmed Phase 1 is already done and that admin login is a separate server-validated gate at /admin.

---

## [Entry #11] — 2026-06-13 00:15
**Prompt:**
> i entered the password and saved the file

**Summary of action taken:**
Ran `npm run seed` to populate MongoDB with members/contests/movies, restarted the dev server to pick up the new env, and verified the live data flow (public page + admin API reading from the DB).

---

## [Entry #12] — 2026-06-13 00:17
**Prompt:**
> passwrod is <password>

**Summary of action taken:**
Corrected the password in MONGODB_URI (URL-encoded a special character), re-ran the seed successfully, restarted the dev server, and verified live data from MongoDB.

---

## [Entry #13] — 2026-06-13 00:21
**Prompt:**
> in the docs or logger I think lastly I discussed about passwords, can you remove if password is mentioned anywhere in the prompt logger and instead replace it with <password>

**Summary of action taken:**
Redacted all actual password values in this prompt log (group password, admin password, and the database password), replacing each with the placeholder <password>.

---

## [Entry #14] — 2026-06-13 00:22
**Prompt:**
> I tried to login as admin using <password> but that didn't work

**Summary of action taken:**
Found that /admin was sitting behind the client-side group-password gate, so the admin password was being typed into the group-password box. Exempted /admin routes from the group gate in PasswordGate (via usePathname), and also fixed a serialization warning by stringifying movie rating memberIds in the DB mapper.

---

## [Entry #15] — 2026-06-13 00:26
**Prompt:**
> remove mention of any password from prompt logger , includeing this admin password

**Summary of action taken:**
Redacted the remaining admin password value in the log (Entry #14), replacing it with the <password> placeholder, so no real password values remain anywhere in the prompt log.

---

## [Entry #16] — 2026-06-13 00:27
**Prompt:**
> is database and tables has been created on the mongodb side?

**Summary of action taken:**
Queried MongoDB Atlas to confirm the friends_community database and its collections (members, contests, movies) exist with the seeded document counts.

---

## [Entry #17] — 2026-06-13 00:30
**Prompt:**
> I created a vercel project, how to deploy this in vercel now? if you need to commit and push code to github, make sure any file does not contain the passsword or any critical secure information

**Summary of action taken:**
Verified .env.local is gitignored/untracked and scanned the repo for secrets, committed and pushed the Step 2 backend + admin work to GitHub, and provided step-by-step Vercel deployment instructions including the required environment variables.

---

## [Entry #18] — 2026-06-13 00:32
**Prompt:**
> no need to push those csv files to github

**Summary of action taken:**
Untracked the Google_sheet CSVs (which contained members' email addresses), added Google_sheet/ to .gitignore, amended the unpushed commit to exclude them, then pushed the clean commit to GitHub.

---
