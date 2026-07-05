---
name: graph-maintenance
description: "Log accept/dismiss feedback on suggestions, and report (not auto-delete) stale contacts/resolved tasks for review. Trigger: after a nudge/warm-intro/daily-plan suggestion gets a user response, or the weekly maintenance cron job."
allowed-tools: ["bash"]
user-invocable: false
---

# Graph maintenance (improve/forget)

docs/PRD.md items 10 and 11 (must-build core). Two independent halves --
they use different Cognee mechanisms and run on different triggers.

## One-time setup

`log_feedback.mjs` references skills by name (`--skill warm-intro`), and
Cognee validates that name against an actually-registered `Skill` node --
found out via a `400 Skill 'X' was not found` error before this was run.
Register every `SKILL.md` under `openclaw-skills/` once (and again whenever a
`SKILL.md` changes):
```
node scripts/register_skills.mjs
```

## Part 1: feedback logging (the "improve()" loop)

**Trigger:** immediately after the user responds to a nudge, warm-intro
suggestion, or daily-plan item with a clear accept or dismiss (e.g. "yes send
it", "not now", ignoring it entirely for N hours counts as an implicit
dismiss if you want to track that -- not required for MVP).

**Workflow:**
```
node scripts/log_feedback.mjs --skill warm-intro --task "intro to a seed-stage VC" --outcome accepted
node scripts/log_feedback.mjs --skill nudge-sweep --task "follow up with Diego Ramirez" --outcome dismissed
```
This uses `SkillRunEntry` via `POST /api/v1/remember/entry` -- **not**
`/api/v1/improve`, which is a different thing entirely (re-running
enrichment/extraction tasks over existing data, not an accept/dismiss
signal). Whether Cognee's own internals actually reweight future `recall()`
ranking from accumulated `SkillRunEntry` signals wasn't verified end-to-end
here (would need a longer-running test than time allowed this pass) -- this
skill's job is to log the signal correctly and consistently; treat the
reweighting effect itself as unconfirmed until observed.

## Part 2: stale-item review (the "forget()" loop)

**Trigger:** weekly cron/heartbeat tick (registration lives in the private
OpenClaw workspace, same as `daily-plan`/`nudge-sweep`).

**Workflow:**
```
node scripts/find_stale_items.mjs --stale-months 3
```
Prints a report of Person nodes with no interaction in the last N months and
Task nodes with a non-"open" status. **This only reports -- it does not
delete anything.** Relay the report to the user for a explicit decision
(e.g. via WhatsApp: "3 contacts haven't been touched in 3+ months: X, Y, Z --
forget any of them?").

If the user says yes to a specific contact:
```
node scripts/forget_item.mjs --document-name contact-diego-ramirez --confirm
```
`--confirm` is mandatory and this is never run without an explicit user
decision on that specific item.

## Why this doesn't auto-delete (read before changing that)

`POST /api/v1/forget` deletes at dataset or data-item granularity (a whole
dataset, or the memory derived from one originally-uploaded document) -- not
at individual graph-node granularity. A Person who was only ever mentioned in
one `remember()` call (e.g. `add-contact`, never mentioned again in any
meeting) maps cleanly to one data item, so `forget_item.mjs` deleting that
item's memory really does remove just that Person. But an actively-engaged
contact who's come up in several meetings and notes does **not** map to a
single deletable item -- there's no documented Cognee API to remove just
their node while keeping everything else. Auto-deleting on a schedule risked
silently doing the wrong thing in exactly the case where it matters most
(an active relationship), so this stops at reporting + an explicit,
one-item-at-a-time confirm step instead of the fully automatic sweep
docs/PRD.md item 11 describes. Revisit if/when there's a reliable way to
identify "this Person's only source is this one document."
