#!/usr/bin/env node
// Logs accept/dismiss feedback on a nudge/warm-intro/daily-plan suggestion,
// per docs/PRD.md item 10 ("track which nudges/suggestions get acted on vs
// dismissed; reweight future recall accordingly").
//
// Uses SkillRunEntry via POST /api/v1/remember/entry, NOT /api/v1/improve.
// /api/v1/improve re-runs enrichment/extraction tasks over existing data --
// a different concept entirely, not an accept/dismiss feedback signal.
// SkillRunEntry is graph-backed and explicitly described (see cognee's own
// OpenAPI schema) as letting "agents report explicit skill quality signals
// through cognee.remember() without adding another public API surface" --
// exactly this use case. Every DataPoint (every Person/Meeting/Task/Topic
// node) already carries feedback_weight/importance_weight fields; whether
// cognee's own internals reweight recall() using accumulated SkillRunEntry
// signals wasn't verified here (would need a longer-running test than time
// allowed) -- this script's job is just to log the signal correctly.
//
// Usage:
//   node log_feedback.mjs --skill warm-intro --task "intro to a seed-stage VC" --outcome accepted
//   node log_feedback.mjs --skill nudge-sweep --task "follow up with Diego Ramirez" --outcome dismissed
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";

function parseArgs(argv) {
  const args = { skill: null, task: null, outcome: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--skill") args.skill = argv[++i];
    else if (argv[i] === "--task") args.task = argv[++i];
    else if (argv[i] === "--outcome") args.outcome = argv[++i];
  }
  return args;
}

async function main() {
  const { skill, task, outcome } = parseArgs(process.argv.slice(2));
  if (!skill || !task || !["accepted", "dismissed"].includes(outcome)) {
    console.error(
      'usage: log_feedback.mjs --skill <skill-name> --task "<what was suggested>" --outcome accepted|dismissed',
    );
    process.exit(1);
  }

  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/remember/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entry: {
        type: "skill_run",
        run_id: crypto.randomUUID(),
        selected_skill_id: skill,
        task_text: task,
        result_summary: outcome,
        feedback: outcome === "accepted" ? 1 : 0,
        node_set: "skills",
      },
      dataset_name: process.env.COGNEE_DATASET || "founders_second_brain",
    }),
  });

  const body = await resp.text();
  if (!resp.ok) {
    console.error(`remember/entry failed: ${resp.status} ${body}`);
    process.exit(1);
  }

  console.log(body);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
