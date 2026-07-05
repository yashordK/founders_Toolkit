#!/usr/bin/env node
// Explicit, opt-in single-item forget(). Deletes the memory (graph + vector
// data) derived from one originally-ingested data item, by matching its
// document name (the filename each remember_*.mjs script uses, e.g.
// "contact-diego-ramirez" from add-contact). Does NOT delete the whole
// dataset -- see find_stale_items.mjs for why this only makes sense for a
// contact/note that was only ever mentioned in that one document; for
// anyone mentioned across multiple remember() calls, deleting one data item
// won't remove their (still cross-referenced) graph node.
//
// This never runs automatically -- always requires --confirm, and always
// requires a human (or an agent acting on an explicit human decision) to
// have picked the target from find_stale_items.mjs's report first.
//
// Usage:
//   node forget_item.mjs --document-name contact-diego-ramirez --confirm
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

function parseArgs(argv) {
  const args = { documentName: null, confirm: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--document-name") args.documentName = argv[++i];
    else if (argv[i] === "--confirm") args.confirm = true;
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
  const { documentName, confirm } = parseArgs(process.argv.slice(2));
  if (!documentName) {
    console.error("usage: forget_item.mjs --document-name <name> --confirm");
    process.exit(1);
  }
  if (!confirm) {
    console.error("refusing to delete without --confirm (this is destructive and irreversible)");
    process.exit(1);
  }

  const datasetId = await resolveDatasetId(DATASET_NAME);
  const dataResp = await fetch(`${COGNEE_BASE_URL}/api/v1/datasets/${datasetId}/data`);
  if (!dataResp.ok) throw new Error(`GET /data failed: ${dataResp.status}`);
  const items = await dataResp.json();
  const target = items.find((item) => item.name === documentName);
  if (!target) {
    console.error(`no data item named "${documentName}" found in dataset "${DATASET_NAME}"`);
    process.exit(1);
  }

  const forgetResp = await fetch(`${COGNEE_BASE_URL}/api/v1/forget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataset: DATASET_NAME, dataId: target.id }),
  });
  const body = await forgetResp.text();
  if (!forgetResp.ok) {
    console.error(`forget() failed: ${forgetResp.status} ${body}`);
    process.exit(1);
  }

  console.log(`forgot data item "${documentName}" (${target.id}): ${body}`);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
