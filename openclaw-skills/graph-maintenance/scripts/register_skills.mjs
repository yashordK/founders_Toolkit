#!/usr/bin/env node
// One-time (or re-run-when-skills-change) setup: registers every SKILL.md
// under openclaw-skills/ as a Skill node in Cognee, via content_type=skills.
// Required before log_feedback.mjs can reference a skill by name --
// SkillRunEntry validates selected_skill_id against an actually-registered
// Skill node, found the hard way (a 400 "Skill 'X' was not found or is not
// visible in dataset" until this was run first).
//
// Usage:
//   node register_skills.mjs
//
// Env overrides:
//   COGNEE_BASE_URL   default http://localhost:8000
//   COGNEE_DATASET    default founders_second_brain

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_ROOT = path.join(__dirname, "..", "..");

const COGNEE_BASE_URL = process.env.COGNEE_BASE_URL || "http://localhost:8000";
const DATASET_NAME = process.env.COGNEE_DATASET || "founders_second_brain";

async function main() {
  const entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMdPath = path.join(SKILLS_ROOT, entry.name, "SKILL.md");
    let text;
    try {
      text = await readFile(skillMdPath, "utf8");
    } catch {
      continue; // not every dir under openclaw-skills/ need be a skill
    }

    const form = new FormData();
    form.set("datasetName", DATASET_NAME);
    form.set("content_type", "skills");
    form.set("skills_text", text);
    form.set("skill_name", entry.name);
    form.set("run_in_background", "false");

    const resp = await fetch(`${COGNEE_BASE_URL}/api/v1/remember`, { method: "POST", body: form });
    const body = await resp.text();
    if (!resp.ok) {
      console.error(`failed to register ${entry.name}: ${resp.status} ${body}`);
      continue;
    }
    console.log(`registered ${entry.name}`);
  }
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(1);
});
