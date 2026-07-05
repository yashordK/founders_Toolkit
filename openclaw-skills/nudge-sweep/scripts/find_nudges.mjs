#!/usr/bin/env node
// recall()-based periodic nudge sweep: stale-contact follow-ups and upcoming
// birthdays. Context-triggered nudges ("you're discussing pricing -- here's
// who could help") are NOT this script's job -- those happen inline during a
// live conversation via the main agent's own recall(), not on a sweep
// schedule. See SKILL.md.
//
// Same unattended-cron failure behavior as daily-plan: an unverified answer
// prints nothing to stdout and exits non-zero, so it doesn't get delivered.
//
// Usage:
//   node find_nudges.mjs
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain
//   VERIFY_LLM_API_KEY (and friends) -- see agent/verify/verify_recall.mjs

import { verifyAgainstGraph } from "../../../agent/verify/verify_recall.mjs";

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

const SYSTEM_PROMPT = `You are sweeping a founder's network for two kinds of
nudges, using only the provided context:
1. Follow-up nudges: people whose last_interaction_date is more than ~3 weeks
   old relative to today, or otherwise clearly stale.
2. Birthday nudges: people whose birthday falls within the next 14 days.
List each nudge as one short line: who, why now, and (for follow-ups) how
long it has been. If there is nothing to nudge about, say exactly "No nudges
today." -- do not invent a nudge to have something to say.`;

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/recall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `Today is ${today}. Which contacts need a follow-up nudge, and whose birthday is coming up in the next 14 days?`,
      datasets: [DATASET_NAME],
      searchType: "GRAPH_COMPLETION",
      systemPrompt: SYSTEM_PROMPT,
      topK: 30,
      // See openclaw-skills/warm-intro/scripts/find_warm_intro.mjs for why.
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
    console.error(`nudge-sweep failed verification, not sending:\n${verdict}`);
    process.exit(1);
  }

  console.log(answer);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
