#!/usr/bin/env node
// Deterministic Cognee call for the add-contact skill. Kept as a script rather
// than trusting the agent to hand-build the multipart request each time --
// the graph_model payload is finicky (see agent/schema/models.py) and this is
// the same shape proven by agent/schema/validate_schema.py.
//
// Usage:
//   node remember_contact.mjs --name "Aria Chen" --text "<one paragraph of everything known about them>"
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "agent",
  "schema",
  "generated",
  "person.schema.json",
);

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

function parseArgs(argv) {
  const args = { name: null, text: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--name") args.name = argv[++i];
    else if (argv[i] === "--text") args.text = argv[++i];
  }
  return args;
}

async function main() {
  const { name, text } = parseArgs(process.argv.slice(2));
  if (!name || !text) {
    console.error("usage: remember_contact.mjs --name <name> --text <paragraph>");
    process.exit(1);
  }

  const personSchema = JSON.parse(await readFile(SCHEMA_PATH, "utf8"));

  const form = new FormData();
  form.set("datasetName", DATASET_NAME);
  form.set("graph_model", JSON.stringify(personSchema));
  form.set("run_in_background", "false");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  form.set("data", new Blob([text], { type: "text/plain" }), `contact-${slug}.txt`);

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
