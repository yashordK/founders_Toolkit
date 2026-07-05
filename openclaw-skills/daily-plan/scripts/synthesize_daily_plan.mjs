#!/usr/bin/env node
// recall()-based synthesis for the morning daily-plan heartbeat. Prints a
// ready-to-send message; this script does not send anything itself -- the
// calling skill/heartbeat hands the text to OpenClaw's own message-sending
// capability (see SKILL.md).
//
// This script is meant to run unattended (cron), so unlike warm-intro's
// pass-through-with-verdict behavior, an unverified answer here is treated as
// a hard failure: nothing is printed to stdout, so a `--command` cron job
// wired with `--announce` won't deliver anything to the user. See SKILL.md.
//
// Usage:
//   node synthesize_daily_plan.mjs
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain
//   VERIFY_LLM_API_KEY (and friends) -- see agent/verify/verify_recall.mjs

import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// See openclaw-skills/warm-intro/scripts/find_warm_intro.mjs for why this is
// a dynamic import resolved via FOUNDERS_TOOLKIT_ROOT rather than a static
// relative one -- openclaw skills install copies this directory.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = process.env.FOUNDERS_TOOLKIT_ROOT || path.join(__dirname, "..", "..", "..");
const { verifyAgainstGraph } = await import(
  pathToFileURL(path.join(REPO_ROOT, "agent", "verify", "verify_recall.mjs")).href
);

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

const SYSTEM_PROMPT = `You are writing a founder's morning briefing from their
own knowledge graph. Using only the provided context, produce a short
WhatsApp-ready message with three sections, each omitted entirely if empty:
1. "Open tasks" -- open, unresolved Task nodes, most overdue/urgent first.
2. "Follow-ups & birthdays" -- people not interacted with in a while, and any
   birthdays coming up soon.
3. "Standing priorities" -- current Topic-level priorities/decisions worth
   keeping in mind today.
Keep it tight -- bullets, no preamble, no closing pleasantries. If there is
truly nothing to report in a section, omit the section rather than writing
"nothing to report".`;

async function main() {
  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/recall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        "What open tasks, overdue follow-ups, upcoming birthdays, and standing priorities should today's plan cover?",
      datasets: [DATASET_NAME],
      searchType: "GRAPH_COMPLETION",
      systemPrompt: SYSTEM_PROMPT,
      topK: 30,
      // See find_warm_intro.mjs for why this is required, not optional: an
      // omitted session_id lets cognee's session-turn logic treat this as a
      // continuation of a previous turn and short-circuit with "Got it."
      // instead of an actual answer -- each cron run is its own turn.
      sessionId: crypto.randomUUID(),
    }),
  });

  if (!resp.ok) {
    console.error(`recall() failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const results = await resp.json();
  const answer = results[0]?.text ?? "";

  const { verified, verdict } = await verifyAgainstGraph({ datasetName: DATASET_NAME, claim: answer });
  if (!verified) {
    console.error(`daily-plan failed verification, not sending:\n${verdict}`);
    process.exit(1);
  }

  console.log(answer);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
