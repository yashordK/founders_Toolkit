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
    }),
  });

  const body = await resp.text();
  if (!resp.ok) {
    console.error(`recall() failed: ${resp.status} ${body}`);
    process.exit(1);
  }

  console.log(body);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
