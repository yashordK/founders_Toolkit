# Roadmap — Founder's Second Brain

Post-hackathon evolution plan. No fixed deadline — paced as an ongoing professional project.

---

## Phase 0 — Hackathon MVP (now → Jul 5)
Ship the compressed 48-hour build. See `IMPLEMENTATION_PLAN.md`. Don't gold-plate — submit, then move to Phase 1.

---

## Phase 1 — Stabilize (Week 1 post-hackathon)
Turn hackathon code into something production-worthy.

- [ ] Tests around the Cognee schema — `remember()`/`recall()` round trips are the riskiest surface
- [ ] Proper env config, secrets handling, `.env.example` cleaned up
- [ ] Error handling in skills (LinkedIn scrape fails, transcript malformed, audio unreadable, etc.)
- [ ] Basic CI — lint + test on push, even a single GitHub Action
- [ ] Write an ADR for the Cognee + OpenClaw decision (see `ADR_TEMPLATE.md`)

**Exit criteria:** you could hand this repo to a stranger and they could run it from README alone.

---

## Phase 2 — Complete the cut features (Weeks 2–3)
Bring back what got dropped for hackathon time pressure.

- [ ] `improve()` loop — accept/dismiss tracking, recall reweighting
- [ ] `forget()` loop — scheduled pruning of stale contacts/resolved tasks
- [ ] Nudges (follow-up reminders, birthdays, context-triggered suggestions)
- [ ] Brainstorm mode, research mode
- [ ] Voice memo pipeline (Whisper integration for offline meetings)

Each feature gets a short design note (1 page, in `/docs/decisions/`) before building — not a full ADR, just: what, why, how it touches the schema.

**Exit criteria:** every item originally in PRD.md Section 2 is live, not just "must-build core."

---

## Phase 3 — Product hardening (Weeks 3–5)
- [ ] Multi-user auth (only if going beyond personal use)
- [ ] Observability: logging, recall() quality metrics, LLM cost tracking
- [ ] Rate limiting / cost guardrails on LinkedIn scraping and LLM extraction
- [ ] Dashboard polish: loading states, error states, empty states
- [ ] Security review pass — re-check the "custom skills only, no community skills" posture still holds

**Exit criteria:** this could survive real daily use without you babysitting it.

---

## Phase 4 — Reusability layer (ongoing)
Goal: don't rebuild from zero for the next hackathon.

- [ ] Extract the OpenClaw + Cognee skill pattern (capture → extract → remember) into a small internal boilerplate
- [ ] Document the pattern once in `/docs/patterns/capture-extract-remember.md`
- [ ] Keep a running list of "things that took too long this time" to fix in the template

---

## Professional practices, starting Phase 1
- Git: feature branches, PRs even solo, meaningful commit messages
- One ADR per architectural decision — future you will thank present you
- Weekly check: "what's actually working end-to-end" — not a feature-count check
