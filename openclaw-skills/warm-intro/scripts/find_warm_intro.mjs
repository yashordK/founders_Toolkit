#!/usr/bin/env node
// Warm-intro finder: recall() with a system_prompt that asks the LLM to rank
// candidates by relevance + recency + relationship strength.
//
// IMPORTANT CAVEAT (see SKILL.md): this ranks via LLM synthesis over Cognee's
// GRAPH_COMPLETION context, not a deterministic scoring function over raw
// node fields (last_interaction_date, feedback_weight, importance_weight).
// Cognee's postgres graph provider doesn't support raw Cypher/SQL-free graph
// queries through the documented API, so there's no clean way to pull those
// numeric fields out and rank client-side without querying Cognee's internal
// Postgres tables directly (an undocumented, version-fragile path -- not
// attempted here). Flag this as a draft for the "both, paired" review docs/
// TEAM_SPLIT.md calls for on this feature.
//
// Usage:
//   node find_warm_intro.mjs --need "an intro to seed-stage VCs"
//   node find_warm_intro.mjs --need "who could help with pricing" --from "Aria Chen"
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain
//   VERIFY_LLM_API_KEY (and friends) -- see agent/verify/verify_recall.mjs

import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// openclaw skills install COPIES this directory rather than symlinking it, so
// a static relative import of ../../../agent/verify/verify_recall.mjs only
// works running directly from the founders_Toolkit checkout, not from the
// installed copy under ~/.openclaw/workspace/skills/. Resolve dynamically via
// FOUNDERS_TOOLKIT_ROOT instead -- see remember_contact.mjs for the same fix.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = process.env.FOUNDERS_TOOLKIT_ROOT || path.join(__dirname, "..", "..", "..");
const { verifyAgainstGraph } = await import(
  pathToFileURL(path.join(REPO_ROOT, "agent", "verify", "verify_recall.mjs")).href
);

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

const RANKING_SYSTEM_PROMPT = `You are ranking people in the user's network who
could help with a stated need. Using only the provided context:
1. List candidates who plausibly help with the need, most useful first.
2. Rank by: (a) how directly their expertise/how_they_help matches the need,
   (b) how recently the user interacted with them (last_interaction_date, more
   recent ranks higher), (c) relationship strength if evident from interaction
   history (more meetings/notes together ranks higher).
3. For each candidate: name, one-line reason, and how they were met/connected
   if relevant to a warm intro.
4. If nobody in the context plausibly helps, say so plainly -- do not invent a
   candidate.`;

function parseArgs(argv) {
  const args = { need: null, from: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--need") args.need = argv[++i];
    else if (argv[i] === "--from") args.from = argv[++i];
  }
  return args;
}

async function main() {
  const { need, from } = parseArgs(process.argv.slice(2));
  if (!need) {
    console.error('usage: find_warm_intro.mjs --need "<what help is needed>" [--from "<person name>"]');
    process.exit(1);
  }

  const query = from
    ? `Starting from ${from}, who in the network could help with: ${need}?`
    : `Who in the network could help with: ${need}?`;

  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/recall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      datasets: [DATASET_NAME],
      searchType: "GRAPH_COMPLETION",
      systemPrompt: RANKING_SYSTEM_PROMPT,
      topK: 25,
      // A fresh session per call, not omitted. Cognee's session-turn logic
      // (see cognee/infrastructure/session/session_turn.py) treats an
      // omitted session_id as an ongoing default session and can short-circuit
      // a query that looks like a repeat of a recent one with a bare "Got
      // it." instead of actually answering -- confirmed by reproducing it
      // during testing. This skill's calls are one-shot asks, not turns in a
      // conversation, so each should look like a brand new session.
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
  console.log(JSON.stringify({ answer, verified, verdict }, null, 2));
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
