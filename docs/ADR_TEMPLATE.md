# ADR-NNN: [Short title of the decision]

**Status:** Proposed / Accepted / Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Owner:** [who made/owns this decision]

---

## Context
What problem are we solving? What forces (technical, time, team, hackathon rules) are at play?

## Decision
What are we doing, stated in one or two clear sentences.

## Alternatives considered
- **Option A** — pros / cons
- **Option B** — pros / cons

## Consequences
- What gets easier
- What gets harder
- What we're explicitly giving up

## Revisit when
Condition under which this decision should be re-examined (e.g. "if user base > X", "if Cognee Cloud pricing changes", "if team grows past 2").

---

### Example (delete before use)

# ADR-001: Use self-hosted Cognee over Cognee Cloud

**Status:** Accepted
**Date:** 2026-06-29
**Owner:** Memory & Agent Lead

## Context
Hackathon track judged "Best Use of Open Source." Also want to avoid demo dependency on an external service's uptime during judging.

## Decision
Self-host Cognee via `docker compose --profile postgres up`, single Postgres instance for graph, vectors, sessions, metadata.

## Alternatives considered
- **Cognee Cloud** — faster setup, but no open-source track eligibility, demo depends on external uptime.

## Consequences
- More setup time before feature work starts
- Full control over data, no external outage risk during demo
- Track eligibility for Best Use of Open Source

## Revisit when
If scaling beyond a single-user/small-team demo, or if self-hosted ops burden becomes too high.
