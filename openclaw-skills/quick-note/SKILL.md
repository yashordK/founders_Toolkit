---
name: quick-note
description: "Capture a freeform text or voice note and remember it in Cognee, auto-tagged to whatever person/topic it mentions. Trigger: any short freeform note that isn't a contact or meeting, e.g. a reminder or a standing priority."
allowed-tools: ["bash"]
user-invocable: true
---

# Quick note

Freeform capture for the things that don't fit add-contact or add-meeting --
"remind me to wish Aria happy birthday", "we're prioritizing enterprise this
quarter". docs/TRD.md Section 5 doesn't define a generic "Note" node type, so
this skill doesn't invent one: every quick note is classified into one of the
two existing schema types that already fit, per CLAUDE.md's "don't invent new
node types ad hoc" rule.

## Trigger

A short freeform text or transcribed voice note that doesn't name a contact to
add or read like a meeting recap.

## Workflow

1. **Classify the note** as one of:
   - **`task`** -- it reads as an action/reminder/follow-up ("remind me to...",
     "follow up with...", "don't forget to..."). Most quick notes are this.
   - **`topic`** -- it reads as a standing priority, decision, or durable fact
     with no due date or action attached ("we're prioritizing enterprise this
     quarter", "our target market is fintech founders").
   When genuinely ambiguous, prefer `task` -- a due-dateless task is harmless,
   a dropped reminder isn't.
2. Run:
   ```
   node scripts/remember_note.mjs --kind task --text "<note text>"
   node scripts/remember_note.mjs --kind topic --text "<note text>"
   ```
   Uses the Task or Topic graph model from `../../agent/schema/generated/`
   (the same classes nested inside Meeting -- see agent/schema/models.py) so a
   note about a person or topic already in the graph merges rather than
   duplicating.
3. **Confirm back to the user** in one short line ("Noted -- follow up with
   Aria re: birthday." / "Noted as a standing priority.").

## Notes

- A note mentioning a person by name (e.g. "wish Aria happy birthday") is not
  guaranteed to link to that Person's existing node the same way an
  add-meeting attendee does -- neither Task nor Topic has a Person-reference
  field in docs/TRD.md Section 5 (Task's only ref is `linked_to`, to a
  Meeting/Note, which this skill doesn't populate -- see the note in
  agent/schema/models.py about relying on structural nesting instead). Cognee's
  own entity resolution may still connect them during extraction, but this is
  unverified -- flag it if a demo run shows the link isn't forming, don't
  assume it works.
- One note per trigger, same failure-handling rule as the other capture
  skills: tell the user if `remember()` fails, don't retry silently.
