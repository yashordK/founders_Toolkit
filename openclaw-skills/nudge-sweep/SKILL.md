---
name: nudge-sweep
description: "Periodically check for stale-contact follow-ups and upcoming birthdays and send nudges. Trigger: the periodic nudge-sweep cron job."
allowed-tools: ["bash"]
user-invocable: false
---

# Nudge sweep

docs/PRD.md item 13 (must-build core), the periodic half of it: "haven't
followed up with X in 3 weeks" and "Y's birthday tomorrow". The third example
in that item -- "you're discussing pricing, here's who could help" -- is
context-triggered mid-conversation, not sweep-based, so it's the main agent's
job (via `recall()` in the moment), not this skill's. Don't try to make this
skill detect conversation topics; that's a different mechanism.

## Trigger

Periodic cron/heartbeat tick only -- not user-invocable, there's no useful
"run a nudge sweep right now" user-facing action distinct from just asking
`warm-intro` or `daily-plan` directly.

## Workflow

1. Run:
   ```
   node scripts/find_nudges.mjs
   ```
2. If it prints "No nudges today.", do not send anything -- a cron job that
   always messages the user even with nothing to say trains them to ignore
   it.
3. Otherwise deliver the nudges via WhatsApp. Same two wiring options as
   `daily-plan` (`--command` cron job with `--announce`/`--to`, or an
   agent-message job) -- see that skill's SKILL.md for the exact cron
   example. Suggested cadence: a few times a day (e.g. every 6h) rather than
   once, since a missed birthday nudge is more costly than a duplicate.

## Notes

- **Fabrication risk -- see openclaw-skills/warm-intro/SKILL.md.** Same
  session_id fix and same `verifyAgainstGraph()` guard as `daily-plan` apply
  here (same pipeline). Residual risk is smaller than first measured, but
  spot-check a few runs before enabling this against a real contact list
  unattended.
- **Separate, structural limitation found in testing: date-arithmetic
  errors slip past the verifier.** In one run the model claimed a contact's
  last interaction was "over three weeks ago" when the actual date in the
  graph was 3 days prior -- the individual dates cited were real (in the
  graph), so `verifyAgainstGraph()` correctly passed it (it only checks
  whether cited facts exist, not whether conclusions drawn from them are
  arithmetically correct). This category of error needs a different fix --
  e.g. computing "is this stale/is this birthday soon" in code from the raw
  `last_interaction_date`/`birthday` fields (already available via `GET
  /api/v1/datasets/{id}/graph`) instead of asking the model to do date math --
  not attempted here for time.
- The registered cron job and any `HEARTBEAT.md` reference to this skill live
  in the private OpenClaw workspace, not in this repo.
