# Implementation Plan — Founder's Second Brain

**Step 1 — Schema lock (both, ~2-3 hrs):** Finalize TRD.md Section 5's schema before writing code.

**Step 2 — Cognee self-host (Owner: memory/agent lead):**
```bash
git clone https://github.com/topoteretes/cognee
cp .env.template .env   # set LLM_API_KEY
docker compose --profile postgres up
```
Validate remember()/recall() round trip before proceeding.

**Step 3 — OpenClaw setup (Owner: memory/agent lead):**
- Install OpenClaw, connect WhatsApp with `allowFrom` locked to team numbers.
- Wire the Cognee-OpenClaw plugin as the memory backend.
- Write custom skills: `add-contact`, `add-meeting`, `quick-note`, `brainstorm`, `research`.
- Set up cron triggers: daily plan (morning), nudge sweep, weekly improve()/forget() pass.

**Step 4 — Contact capture pipeline (Owner: memory/agent lead, Day 2):**
- `add-contact`: parse message → browser tool opens LinkedIn URL → extract visible info → LLM structures fields → `remember()` linked to event.
- Build manual-paste fallback immediately, not later.

**Step 5 — Meeting pipeline (Owner: memory/agent lead, Day 2-3):**
- `add-meeting`: accept text/file/audio → (Whisper if audio) → LLM extraction → attendee matching → `remember()`.

**Step 6 — Warm-intro + daily plan logic (both, pair — Day 3, hero features):**
- Warm-intro: `recall()` graph traversal + custom ranking (relevance + recency + interaction strength).
- Daily plan: scheduled `recall()` across open tasks/nudges/priorities → LLM synthesis into a prioritized message.

**Step 7 — Dashboard (Owner: UI lead, Day 2-4, parallel):**
- Next.js, dark/glass theme, reads Cognee API directly.
- Today view, connections directory + profile pages, upcoming events, quick actions.

**Step 8 — improve()/forget() loop (Owner: memory/agent lead, Day 4):**
- Log accept/dismiss on nudges/intros → feed `improve()` weighting.
- Weekly `forget()` sweep for stale contacts/resolved tasks.

**Step 9 — Integration, seed data, polish (both, Day 4-5):**
- Seed realistic demo data: several contacts, 2-3 meetings, a few standing priorities.
- Rehearse the live demo: text a new contact from a phone on stage → show it land in dashboard → ask for a warm intro → show the daily plan.

**Step 10 — Submission (Day 5):**
- README: problem → solution → impact, explicit breakdown of Cognee usage, AI-tool disclosure, self-host setup instructions.
- Record a demo video as backup in case live WhatsApp demo has network issues during judging.
- **Confirm the exact submission deadline time (not just the date) before this day — see OPEN_ITEMS.md.**
