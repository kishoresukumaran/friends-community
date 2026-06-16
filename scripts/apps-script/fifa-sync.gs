/**
 * FIFA 2026 -> MongoDB sync (Google Apps Script).
 *
 * Reads the six tabs of the "Mirror sheet - FIFA 2026" spreadsheet and POSTs a
 * full snapshot to the Friends Community app, which stores it in MongoDB and
 * renders /fifa-2026. The Google Sheet stays the single source of truth for
 * points; the app only displays what the sheet computes.
 *
 * SETUP (see docs/fifa-sync-setup.md):
 *   1. In the spreadsheet: Extensions > Apps Script, paste this file.
 *   2. Project Settings > Script Properties, add:
 *        SYNC_URL    = https://YOUR-APP.vercel.app/api/fifa/sync
 *        SYNC_SECRET = (the same value as FIFA_SYNC_SECRET in the app env)
 *   3. Reload the sheet and use the "FIFA Sync" menu > "Install auto-sync",
 *      or run installTrigger() once. It then runs every 5 minutes.
 *   4. Use "FIFA Sync" > "Sync now" to push immediately and see a summary.
 *
 * Design notes (lessons carried over from the IPL sync):
 *   - Columns are detected by header NAME, so reordering/inserting columns
 *     won't break the sync.
 *   - This pushes a full snapshot that REPLACES the stored document, so edited
 *     and cleared cells are handled automatically (no stale rows to delete).
 *   - Because a replace is destructive, syncFifa() ABORTS if a read throws or
 *     if the sheet looks empty (no matches), so a transient glitch or the wrong
 *     spreadsheet can never wipe good data in the database.
 */

var SHEETS = {
  master: "Master",
  league: "League",
  knockout: "Knockout",
  trivia: "Trivia",
  preTournament: "Pre Tournament",
  leaderboard: "Leaderboard",
};

/* ------------------------------------------------------------------ */
/* Reading helpers                                                     */
/* ------------------------------------------------------------------ */

function getValues_(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('Sheet "' + sheetName + '" not found - treating as empty.');
    return [];
  }
  if (sheet.getLastRow() < 1 || sheet.getLastColumn() < 1) return [];
  return sheet.getDataRange().getValues();
}

function norm_(v) {
  return v == null ? "" : String(v).trim();
}

function toNumber_(v) {
  var n = Number(v);
  return isNaN(n) ? 0 : n;
}

function findCol_(header, names) {
  for (var i = 0; i < header.length; i++) {
    var h = norm_(header[i]).toLowerCase();
    for (var j = 0; j < names.length; j++) {
      if (h === names[j].toLowerCase()) return i;
    }
  }
  return -1;
}

/** Master tab -> array of match objects. */
function readMaster_() {
  var rows = getValues_(SHEETS.master);
  if (rows.length < 2) return [];
  var header = rows[0];

  var stageCol = findCol_(header, ["stage"]);
  var dateCol = findCol_(header, ["date & time (us edt/utc-4)", "date & time", "date"]);
  var team1Col = findCol_(header, ["team 1", "team1"]);
  var team2Col = findCol_(header, ["team 2", "team2"]);
  var matchNoCol = findCol_(header, ["match #", "match#", "match no", "match"]);
  var locationCol = findCol_(header, ["location"]);
  var powerCol = findCol_(header, ["is power match?", "is power match", "power match"]);
  var underdogCol = findCol_(header, ["underdog team", "underdog"]);
  var winnerCol = findCol_(header, ["winner"]);
  var qCol = findCol_(header, ["trivia question"]);
  var aCol = findCol_(header, ["trivia answer"]);

  var out = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    var matchNo = matchNoCol >= 0 ? toNumber_(row[matchNoCol]) : 0;
    if (!matchNo) continue; // skip blank/spacer rows
    out.push({
      matchNo: matchNo,
      stage: stageCol >= 0 ? norm_(row[stageCol]) : "",
      dateTime: dateCol >= 0 ? norm_(row[dateCol]) : "",
      team1: team1Col >= 0 ? norm_(row[team1Col]) : "",
      team2: team2Col >= 0 ? norm_(row[team2Col]) : "",
      location: locationCol >= 0 ? norm_(row[locationCol]) : "",
      isPowerMatch: powerCol >= 0 ? norm_(row[powerCol]) : "",
      underdogTeam: underdogCol >= 0 ? norm_(row[underdogCol]) : "",
      winner: winnerCol >= 0 ? norm_(row[winnerCol]) : "",
      triviaQuestion: qCol >= 0 ? norm_(row[qCol]) : "",
      triviaAnswer: aCol >= 0 ? norm_(row[aCol]) : "",
    });
  }
  return out;
}

/**
 * Generic reader for League / Knockout / Trivia tabs. Columns whose header is a
 * number are match picks keyed by that number; Points / Bonus / Total columns
 * are detected by name. Rows without an email are skipped; blank picks are
 * omitted (not stored as empty strings).
 */
function readPredictionTab_(sheetName) {
  var rows = getValues_(sheetName);
  if (rows.length < 2) return [];
  var header = rows[0];

  var emailCol = findCol_(header, ["email", "email id"]);
  var nameCol = findCol_(header, ["player name"]);
  var pointsCol = findCol_(header, ["points"]);
  var bonusCol = findCol_(header, ["bonus points", "bonus point"]);
  var totalCol = findCol_(header, ["total"]);

  var matchCols = [];
  for (var c = 0; c < header.length; c++) {
    var n = Number(header[c]);
    if (norm_(header[c]) !== "" && !isNaN(n) && n > 0) {
      matchCols.push({ col: c, matchNo: n });
    }
  }

  var out = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    var email = emailCol >= 0 ? norm_(row[emailCol]) : "";
    if (!email) continue;
    var picks = {};
    for (var i = 0; i < matchCols.length; i++) {
      var val = norm_(row[matchCols[i].col]);
      if (val) picks[String(matchCols[i].matchNo)] = val;
    }
    out.push({
      email: email,
      name: nameCol >= 0 ? norm_(row[nameCol]) : "",
      picks: picks,
      points: pointsCol >= 0 ? toNumber_(row[pointsCol]) : 0,
      bonusPoints: bonusCol >= 0 ? toNumber_(row[bonusCol]) : 0,
      total: totalCol >= 0 ? toNumber_(row[totalCol]) : 0,
    });
  }
  return out;
}

/** Pre Tournament tab. */
function readPreTournament_() {
  var rows = getValues_(SHEETS.preTournament);
  if (rows.length < 2) return [];
  var header = rows[0];
  var emailCol = findCol_(header, ["email", "email id"]);
  var nameCol = findCol_(header, ["player name"]);
  var top4Col = findCol_(header, ["top 4"]);
  var finalistsCol = findCol_(header, ["finalists"]);
  var championCol = findCol_(header, ["champion"]);
  var aTop4Col = findCol_(header, ["actual top 4"]);
  var aFinalistsCol = findCol_(header, ["actual finalists"]);
  var aChampionCol = findCol_(header, ["actual champion"]);
  var pointsCol = findCol_(header, ["points"]);

  var out = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    var email = emailCol >= 0 ? norm_(row[emailCol]) : "";
    if (!email) continue;
    out.push({
      email: email,
      name: nameCol >= 0 ? norm_(row[nameCol]) : "",
      top4: top4Col >= 0 ? norm_(row[top4Col]) : "",
      finalists: finalistsCol >= 0 ? norm_(row[finalistsCol]) : "",
      champion: championCol >= 0 ? norm_(row[championCol]) : "",
      actualTop4: aTop4Col >= 0 ? norm_(row[aTop4Col]) : "",
      actualFinalists: aFinalistsCol >= 0 ? norm_(row[aFinalistsCol]) : "",
      actualChampion: aChampionCol >= 0 ? norm_(row[aChampionCol]) : "",
      points: pointsCol >= 0 ? toNumber_(row[pointsCol]) : 0,
    });
  }
  return out;
}

/** Leaderboard tab — only the first block (Email..Total Points). */
function readLeaderboard_() {
  var rows = getValues_(SHEETS.leaderboard);
  if (rows.length < 2) return [];
  var header = rows[0];
  var emailCol = findCol_(header, ["email", "email id"]);
  var nameCol = findCol_(header, ["player name"]);
  var leagueCol = findCol_(header, ["league"]);
  var knockoutCol = findCol_(header, ["knockout"]);
  var preCol = findCol_(header, ["pre tournament", "pre-tournament"]);
  var triviaCol = findCol_(header, ["trivia"]);
  var totalCol = findCol_(header, ["total points", "total"]);

  var out = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    var email = emailCol >= 0 ? norm_(row[emailCol]) : "";
    if (!email) continue;
    out.push({
      email: email,
      name: nameCol >= 0 ? norm_(row[nameCol]) : "",
      league: leagueCol >= 0 ? toNumber_(row[leagueCol]) : 0,
      knockout: knockoutCol >= 0 ? toNumber_(row[knockoutCol]) : 0,
      preTournament: preCol >= 0 ? toNumber_(row[preCol]) : 0,
      trivia: triviaCol >= 0 ? toNumber_(row[triviaCol]) : 0,
      total: totalCol >= 0 ? toNumber_(row[totalCol]) : 0,
    });
  }
  return out;
}

function buildPayload_() {
  return {
    matches: readMaster_(),
    leaderboard: readLeaderboard_(),
    leaguePredictions: readPredictionTab_(SHEETS.league),
    knockoutPredictions: readPredictionTab_(SHEETS.knockout),
    triviaPredictions: readPredictionTab_(SHEETS.trivia),
    preTournament: readPreTournament_(),
  };
}

/* ------------------------------------------------------------------ */
/* Sync                                                                */
/* ------------------------------------------------------------------ */

/** Main entry point: reads the sheet and POSTs the snapshot to the app. */
function syncFifa() {
  try {
    var props = PropertiesService.getScriptProperties();
    var url = props.getProperty("SYNC_URL");
    var secret = props.getProperty("SYNC_SECRET");
    if (!url || !secret) {
      showToast_("Config needed", "Set SYNC_URL and SYNC_SECRET in Script Properties first.");
      return;
    }

    // If any read throws, this bubbles up to the catch and we DO NOT post -
    // so a transient error can never overwrite the DB with partial data.
    var payload = buildPayload_();

    // Safety guard: the Master tab always has matches once the contest exists.
    // An empty matches read means a missing/renamed tab or the wrong
    // spreadsheet, so skip the POST rather than wipe good data.
    if (payload.matches.length === 0) {
      showToast_(
        "Skipped",
        "No matches found in the Master tab - skipping sync to avoid overwriting saved data. Check that this is the FIFA 2026 sheet."
      );
      return;
    }

    var res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + secret },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    var code = res.getResponseCode();
    var text = res.getContentText();
    Logger.log("FIFA sync -> HTTP %s\n%s", code, text);

    if (code >= 200 && code < 300) {
      var summary = "";
      try {
        var body = JSON.parse(text);
        var c = body.counts || {};
        summary =
          "Matches: " + (c.matches || 0) +
          "\nLeaderboard: " + (c.leaderboard || 0) +
          "\nLeague picks: " + (c.leaguePredictions || 0) +
          "\nKnockout picks: " + (c.knockoutPredictions || 0) +
          "\nTrivia: " + (c.triviaPredictions || 0) +
          "\nPre-tournament: " + (c.preTournament || 0);
      } catch (e) {
        summary = text.substring(0, 200);
      }
      showToast_("Sync complete", summary);
    } else {
      showToast_("Sync failed", "HTTP " + code + "\n" + text.substring(0, 200));
    }
    return code;
  } catch (error) {
    Logger.log("FIFA sync error: " + error);
    showToast_("Error", String(error));
  }
}

/* ------------------------------------------------------------------ */
/* Triggers + menu                                                     */
/* ------------------------------------------------------------------ */

/** Run once to schedule syncFifa() every 5 minutes. */
function installTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "syncFifa") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("syncFifa").timeBased().everyMinutes(5).create();
  showToast_("Auto-sync installed", "syncFifa() will run every 5 minutes.");
}

/** Adds a "FIFA Sync" menu when the spreadsheet opens. */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("FIFA Sync")
      .addItem("Sync now", "syncFifa")
      .addItem("Install auto-sync (every 5 min)", "installTrigger")
      .addToUi();
  } catch (e) {
    // No UI context; ignore.
  }
}

/**
 * Notify the operator. Menu runs have a UI (modal alert); time-driven triggers
 * have none, so fall back to a toast and always write to the execution log.
 */
function showToast_(title, message) {
  Logger.log("[" + title + "] " + message);
  var ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    ui = null;
  }
  if (ui) {
    try {
      ui.alert(title + "\n\n" + message);
      return;
    } catch (e2) {
      // fall through to toast
    }
  }
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title, 6);
  } catch (e3) {
    // Logging above is enough.
  }
}
