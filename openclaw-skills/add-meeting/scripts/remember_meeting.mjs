#!/usr/bin/env node
// Deterministic Cognee call for the add-meeting skill. See
// openclaw-skills/add-contact/scripts/remember_contact.mjs for the sibling
// version of this same pattern.
//
// Usage:
//   node remember_meeting.mjs --text "<full transcript text>"
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
const SCHEMA_PATH = path.join(REPO_ROOT, "agent", "schema", "generated", "meeting.schema.json");

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

function parseArgs(argv) {
  const args = { text: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--text") args.text = argv[++i];
  }
  return args;
}

async function main() {
  const { text } = parseArgs(process.argv.slice(2));
  if (!text) {
    console.error("usage: remember_meeting.mjs --text <transcript>");
    process.exit(1);
  }

  const meetingSchema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));

  const form = new FormData();
  form.set("datasetName", DATASET_NAME);
  form.set("graph_model", JSON.stringify(meetingSchema));
  form.set("run_in_background", "false");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  form.set("data", new Blob([text], { type: "text/plain" }), `meeting-${timestamp}.txt`);

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
