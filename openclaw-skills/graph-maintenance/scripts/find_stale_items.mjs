#!/usr/bin/env node
// Reports (does not delete) forget()-candidates per docs/PRD.md item 11:
// contacts with no interaction in N months, and resolved tasks.
//
// This only REPORTS. It deliberately does not auto-delete, because Cognee's
// /api/v1/forget operates at dataset/data-item granularity (a whole dataset,
// or one uploaded document's memory), not at individual-graph-node
// granularity -- see cognee's own ForgetPayloadDTO description. A Person who
// was only ever mentioned in one remember() call (e.g. add-contact, never
// mentioned in any meeting since) maps cleanly to one data item, so deleting
// that item's memory *would* remove just that Person. But a Person mentioned
// across multiple remember() calls (an active contact who's come up in
// several meetings) does not map to a single deletable item, and there's no
// documented way to remove just their node while keeping the rest of a
// dataset's memory. Auto-deleting here risked being wrong in exactly the
// cases (active contacts) where getting it wrong matters most, so this
// stops at reporting -- see forget_item.mjs for the explicit, opt-in
// single-item deletion this report can feed into.
//
// Usage:
//   node find_stale_items.mjs [--stale-months 3]
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

function parseArgs(argv) {
  const args = { staleMonths: 3 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--stale-months") args.staleMonths = Number(argv[++i]);
  }
  return args;
}

async function resolveDatasetId(datasetName) {
  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/datasets`);
  if (!resp.ok) throw new Error(`GET /datasets failed: ${resp.status}`);
  const datasets = await resp.json();
  const match = datasets.find((d) => d.name === datasetName);
  if (!match) throw new Error(`dataset not found: ${datasetName}`);
  return match.id;
}

async function main() {
  const { staleMonths } = parseArgs(process.argv.slice(2));
  const datasetId = await resolveDatasetId(DATASET_NAME);

  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/datasets/${datasetId}/graph`);
  if (!resp.ok) throw new Error(`GET /graph failed: ${resp.status}`);
  const { nodes } = await resp.json();

  const staleCutoff = new Date();
  staleCutoff.setMonth(staleCutoff.getMonth() - staleMonths);

  const staleContacts = (nodes || [])
    .filter((n) => n.type === "Person" && n.properties?.last_interaction_date)
    .filter((n) => new Date(n.properties.last_interaction_date) < staleCutoff)
    .map((n) => ({
      name: n.label,
      lastInteraction: n.properties.last_interaction_date,
    }));

  const resolvedTasks = (nodes || [])
    .filter((n) => n.type === "Task" && n.properties?.status && n.properties.status !== "open")
    .map((n) => ({
      description: n.properties.description,
      status: n.properties.status,
    }));

  console.log(
    JSON.stringify(
      {
        staleCutoffMonths: staleMonths,
        staleContacts,
        resolvedTasks,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
