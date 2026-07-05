---
name: warm-intro
description: "Find who in the user's network could help with a stated need, ranked by relevance, recency, and relationship strength. Trigger: user asks for an intro, a contact, or 'who can help with X'."
allowed-tools: ["bash"]
user-invocable: true
---

# Warm-intro finder

docs/PRD.md item 14 (must-build core): on-demand graph traversal ranked by
relevance + recency + relationship strength. Also backs the connection
profile page's "find who could help with X starting from this person" action
(docs/PRD.md item 19).

**Status: draft.** docs/TEAM_SPLIT.md calls this a hero feature for both
teammates to review together -- treat this as a first pass, not final.

## Trigger

"Who can help me with X", "find me an intro to...", "who do I know that...".

## Workflow

1. Identify the need (e.g. "seed-stage VC intros", "pricing strategy advice")
   and, if the trigger came from a connection profile page action, the
   starting person's name.
2. Run:
   ```
   node scripts/find_warm_intro.mjs --need "<need>" [--from "<person name>"]
   ```
3. Relay the ranked list of candidates and reasons back to the user as-is --
   don't re-rank or filter further; the ranking already happened in the
   recall() call.
4. If the script says nobody plausibly helps, say so -- don't fabricate a
   candidate to be helpful.

## Known limitation (read before demoing)

This ranks via an LLM system prompt over Cognee's `GRAPH_COMPLETION` context,
**not** a deterministic score computed from raw node fields
(`last_interaction_date`, `feedback_weight`, `importance_weight` on the
`DataPoint` base class every Person/Topic node has). Cognee's `postgres` graph
provider doesn't support raw Cypher, and there's no documented API to pull
those numeric fields out directly for client-side ranking -- the only path
would be querying Cognee's internal Postgres graph tables directly, which is
undocumented and version-fragile, so it wasn't attempted here.

Practically: the ranking is usually reasonable (the LLM does use recency/
relationship cues visible in the synthesized context) but not guaranteed
stable or reproducible run-to-run. If the demo needs a specific ranking
order, verify it ahead of time rather than trusting it live.

**Fabrication risk -- real, but smaller than first measured.** Initial testing
seemed to show the model confidently fabricating entire meetings/tasks with no
basis in the graph. Root-caused: most of that was actually cognee's own
session-turn logic (`cognee/infrastructure/session/session_turn.py`), which
treats an *omitted* `session_id` as an ongoing default session and can
silently rewrite the effective query or short-circuit with a bare "Got it."
based on (in our case, irrelevant) prior-turn context -- confirmed by
reproducing both failure modes and then fixing them by passing a fresh
`sessionId: crypto.randomUUID()` per call (see `find_warm_intro.mjs`). That
was most of what looked like hallucination.

With session isolation in place, a **smaller** residual risk remains: the
model can still add a minor ungrounded embellishment on top of an otherwise
correct, well-grounded answer (e.g. "leverage their expertise for current
projects" when nothing about "current projects" exists anywhere) -- caught
and reproduced during testing even after the session fix. This is what
`agent/verify/verify_recall.mjs` exists for: it fetches `GET
/api/v1/datasets/{id}/graph` (real ground truth) and asks a second LLM call to
flag any claim not supported by it. Confirmed working: it let a correct answer
through and blocked one with a genuine unsupported addition, in back-to-back
runs. Still worth a spot-check before a live demo, but this is no longer the
"do not trust anything" situation the first pass suggested.
