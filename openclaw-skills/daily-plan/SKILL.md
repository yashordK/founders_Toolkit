---
name: daily-plan
description: "Generate and send the morning briefing: open tasks, follow-ups/birthdays due, and standing priorities. Trigger: the morning cron job, or an on-demand 'what's my plan today' request."
allowed-tools: ["bash"]
user-invocable: true
---

# Daily plan

docs/PRD.md item 12 (must-build core): scheduled morning `recall()` across
open tasks, due nudges, and stated priorities, synthesized and sent via
WhatsApp. Also shown on the dashboard (dashboard reads Cognee directly --
this skill doesn't need to know about that surface, per CLAUDE.md's "the
dashboard is read-mostly" rule).

## Trigger

- Morning cron/heartbeat tick (primary).
- On-demand: user asks "what's my plan today" / "what do I have going on".

## Workflow

1. Run:
   ```
   node scripts/synthesize_daily_plan.mjs
   ```
   Prints a ready-to-send briefing synthesized from Cognee via `recall()` --
   see the script for the exact prompt.
2. On-demand trigger: reply with the text directly.
3. Cron trigger: deliver it via WhatsApp. This can be wired two ways:
   - As a `--command` cron job whose fallback delivery sends the script's
     stdout directly (no LLM turn needed just to relay text):
     ```
     openclaw cron add --name daily-plan \
       --cron "0 8 * * *" --tz "<your timezone>" \
       --command "node openclaw-skills/daily-plan/scripts/synthesize_daily_plan.mjs" \
       --command-cwd "<path to this repo>" \
       --announce --channel whatsapp --to "<your E.164 number>"
     ```
   - Or as an agent-message job (`--message "run the daily-plan skill and
     send it"`) if you want the agent to reformat/react to the content
     before sending, at the cost of an extra LLM call.
   The actual cron registration and the `HEARTBEAT.md` reference to this
   skill live in the private OpenClaw workspace (see
   `openclaw-reference.md` -- "treat the workspace as private... not the
   same repo as the project"), not in this repo.

## Notes

- If `recall()` returns nothing interesting for a section, the script's
  system prompt tells it to omit that section rather than pad with "nothing
  to report" -- don't add filler on top of it.
- **Fabrication risk -- see openclaw-skills/warm-intro/SKILL.md for the full
  story.** Short version: most of what first looked like model hallucination
  here was actually cognee's session-turn logic misfiring because the script
  didn't pass a `session_id` -- fixed by adding `sessionId:
  crypto.randomUUID()` to the recall() call. A smaller residual risk of minor
  ungrounded embellishments remains even with that fixed, which is what the
  `verifyAgainstGraph()` call below is for: it blocks sending (exits 1,
  prints nothing to stdout) if the synthesized plan contains a claim not
  backed by the actual graph.
