# FIFA 2026 sheet -> app sync setup

The FIFA 2026 standings on the site are populated from the "Mirror sheet - FIFA 2026"
Google Sheet. A Google Apps Script reads all six tabs every 5 minutes and POSTs a
snapshot to the app, which stores it in MongoDB and renders `/fifa-2026`.

The Google Sheet remains the single source of truth for all points — the app only
displays what the sheet computes.

## One-time setup

### 1. Set the app secret

Pick a long random string and set it as `FIFA_SYNC_SECRET`:

- Local: it's in `.env.local` (`FIFA_SYNC_SECRET=...`).
- Production: Vercel project > Settings > Environment Variables > add `FIFA_SYNC_SECRET`
  with the same value, then redeploy.

### 2. Add the Apps Script

1. Open the **Mirror sheet - FIFA 2026** spreadsheet.
2. **Extensions > Apps Script**.
3. Replace the default `Code.gs` contents with
   [`scripts/apps-script/fifa-sync.gs`](../scripts/apps-script/fifa-sync.gs) and Save.

### 3. Configure Script Properties

In the Apps Script editor: **Project Settings (gear icon) > Script Properties > Add property**:

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| `SYNC_URL`    | `https://YOUR-APP.vercel.app/api/fifa/sync`      |
| `SYNC_SECRET` | the same value as `FIFA_SYNC_SECRET` in the app  |

(For local testing you can point `SYNC_URL` at a tunnel to `http://localhost:3000/api/fifa/sync`,
since Apps Script can't reach `localhost` directly.)

### 4. Authorize + schedule

1. Reload the spreadsheet. A **FIFA Sync** menu appears (added by `onOpen`).
2. **FIFA Sync > Install auto-sync (every 5 min)** and approve the authorization
   prompt (it needs to read the sheet and make external requests). This creates a
   time-based trigger that runs `syncFifa()` every 5 minutes.
   - Equivalent: select `installTrigger` in the editor and **Run**.
3. **FIFA Sync > Sync now** to push immediately; you'll get a popup summary
   (matches / leaderboard / picks counts). Trigger runs log the same summary
   under **Executions**.

### Safety behavior

- The sync pushes a full snapshot that **replaces** the stored document, so edited
  and cleared cells are reflected automatically (no stale rows to clean up).
- Because that replace is destructive, `syncFifa()` **aborts without posting** if a
  read throws or if the **Master** tab has no matches (e.g. wrong spreadsheet or a
  renamed tab) - so a transient glitch can't wipe saved standings.

## Tab expectations

The script auto-detects columns by header name, so column order can change as long as headers stay:

- **Master**: `Stage, Date & Time, Team 1, Team 2, Match #, Location, Is Power Match?, Underdog Team, Winner, Trivia Question, Trivia Answer` (Match # and Winner drive everything).
- **League / Knockout / Trivia**: `Email, Player name`, numeric match-number columns, then `Points` (+ optional `Bonus points`, `Total`).
- **Pre Tournament**: `Email, Player name, Top 4, Finalists, Champion, Actual Top 4, Actual Finalists, Actual Champion, Points`.
- **Leaderboard**: `Email, Player name, League, Knockout, Pre tournament, Trivia, Total Points` (the sorted duplicate block to the right is ignored; the app sorts).

## Security notes

- The endpoint only accepts requests carrying the bearer secret; without it, it returns `401`.
- Player emails are sent only as a stable identity key and are never shown in the UI.
