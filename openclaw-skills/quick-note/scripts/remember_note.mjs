#!/usr/bin/env node
// Deterministic Cognee call for the quick-note skill. Same pattern as
// add-contact/add-meeting's scripts, parameterized over which root schema
// (Task or Topic) to use.
//
// Usage:
//   node remember_note.mjs --kind task --text "<note text>"
//   node remember_note.mjs --kind topic --text "<note text>"
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// See remember_contact.mjs for why this isn't a bare relative walk-up --
// openclaw skills install copies this directory rather than symlinking it.
const REPO_ROOT = process.env.FOUNDERS_TOOLKIT_ROOT || path.join(__dirname, "..", "..", "..");
const SCHEMA_DIR = path.join(REPO_ROOT, "agent", "schema", "generated");

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";
const VALID_KINDS = new Set(["task", "topic"]);

function parseArgs(argv) {
  const args = { kind: null, text: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--kind") args.kind = argv[++i];
    else if (argv[i] === "--text") args.text = argv[++i];
  }
  return args;
}

async function main() {
  const { kind, text } = parseArgs(process.argv.slice(2));
  if (!kind || !VALID_KINDS.has(kind) || !text) {
    console.error('usage: remember_note.mjs --kind task|topic --text "<note text>"');
    process.exit(1);
  }

  const schema = JSON.parse(await readFile(path.join(SCHEMA_DIR, `${kind}.schema.json`), "utf8"));

  const form = new FormData();
  form.set("datasetName", DATASET_NAME);
  form.set("graph_model", JSON.stringify(schema));
  form.set("run_in_background", "false");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  form.set("data", new Blob([text], { type: "text/plain" }), `note-${kind}-${timestamp}.txt`);

  const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/remember`, {
    method: "POST",
    body: form,
  });

  const body = await resp.text();
  if (!resp.ok) {
    console.error(`remember() failed: ${resp.status} ${body}`);
    process.exit(1);
  }

  console.log(body);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
