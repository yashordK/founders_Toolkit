#!/usr/bin/env node
// recall()-based synthesis for the morning daily-plan heartbeat. Prints a
// ready-to-send message; this script does not send anything itself -- the
// calling skill/heartbeat hands the text to OpenClaw's own message-sending
// capability (see SKILL.md).
//
// Usage:
//   node synthesize_daily_plan.mjs
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain

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
