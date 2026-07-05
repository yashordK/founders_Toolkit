---
name: brainstorm
description: "Pull relevant memory on a topic and brainstorm about it. Trigger: 'brainstorm about X', 'help me think through X'."
allowed-tools: ["bash"]
user-invocable: true
---

# Brainstorm mode

docs/PRD.md item 4 (build if time allows -- cheap, same `recall()` pattern as
core features).

**Deliberate simplification vs. a literal reading of docs/PRD.md item 4:**
the PRD describes this as pulling context then "opening Claude pre-loaded
with it" -- i.e. handing off to a separate Claude session. This skill instead
has the OpenClaw agent itself (already an LLM) do the brainstorming directly,
using the recalled context. Reasoning: the agent already *is* an LLM
conversation; programmatically launching and relaying to a second, separate
Claude session for no capability gain is extra complexity/fragility with no
clear benefit over just continuing in the current one. Revisit if there's a
concrete reason the brainstorm needs to happen in an actually-separate Claude
context (e.g. a different system prompt/persona) that this project doesn't
have yet.

## Trigger

"Brainstorm about X", "help me think through X", "what are my options for X".

## Workflow

1. Run:
   ```
   node scripts/fetch_context.mjs --topic "<the topic>"
   ```
   Returns `{ context, verified, verdict }` -- if `verified` is false, mention
   the caveat in `verdict` before using the context (don't silently trust an
   unverified claim while brainstorming from it, per
   openclaw-skills/warm-intro/SKILL.md).
2. Use `context` as background, then just brainstorm with the user directly
   in the conversation -- no further tool calls needed for this skill.

## Notes

- This never writes to Cognee. If the brainstorm produces something worth
  keeping (a decision, a new priority), that's a `quick-note`, not this
  skill's job -- don't blur the two.
