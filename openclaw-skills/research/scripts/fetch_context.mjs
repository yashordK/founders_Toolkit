#!/usr/bin/env node
// Same shape as brainstorm's fetch_context.mjs -- pulls what's already known
// on a topic before doing new research on it, so research doesn't duplicate
// existing memory. See that skill's SKILL.md for the verification note.
//
// Usage:
//   node fetch_context.mjs --topic "competitor pricing models"
//
// Env overrides:
//   COGNEE_BASE_URL, COGNEE_DATASET, VERIFY_LLM_API_KEY (and friends) --
//   see agent/verify/verify_recall.mjs

import { verifyAgainstGraph } from "../../../agent/verify/verify_recall.mjs";

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

function parseArgs(argv) {
  const args = { topic: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--topic") args.topic = argv[++i];
  }
  return args;
}

async function main() {
  const { topic } = parseArgs(process.argv.slice(2));
  if (!topic) {
    console.error('usage: fetch_context.mjs --topic "<what to research>"');
    process.exit(1);
  }

  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/recall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `What do I already know relevant to: ${topic}?`,
      datasets: [DATASET_NAME],
      searchType: "GRAPH_COMPLETION",
      topK: 25,
      sessionId: crypto.randomUUID(),
    }),
  });

  if (!resp.ok) {
    console.error(`recall() failed: ${resp.status} ${await resp.text()}`);
    process.exit(1);
  }
  const results = await resp.json();
  const context = results[0]?.text ?? "";

  const { verified, verdict } = await verifyAgainstGraph({ datasetName: DATASET_NAME, claim: context });
  console.log(JSON.stringify({ context, verified, verdict }, null, 2));
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
