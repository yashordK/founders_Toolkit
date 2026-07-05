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

**Confirmed hallucination, not just a risk.** During testing,
`openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` fabricated specific,
detailed facts (a meeting name+date, tasks, a standing priority) that did not
exist anywhere in the dataset -- proven via `GET
/api/v1/datasets/{id}/graph`, which returned the actual node list and showed
none of it was there. This happened on more than one call, unprompted, with
enough specificity that it looked real until checked against raw graph data.
This is not a Cognee bug -- it's the model. For a memory product whose entire
value proposition is factual recall, this is a serious, demo-threatening risk,
not a nice-to-flag edge case. Do not trust a `recall()` answer at face value
for anything demo-critical -- cross-check it against `GET
/api/v1/datasets/{id}/graph` or `/data` first. Longer-term this needs either a
more reliable model or a different verification step before answers reach the
user.
