---
name: research
description: "Pull existing memory on a topic, research it further on the web, and offer to save findings back into memory. Trigger: 'research X', 'look into X'."
allowed-tools: ["bash", "browser"]
user-invocable: true
---

# Research mode

docs/PRD.md item 5 (build if time allows -- cheap, same `recall()` pattern as
core features).

**Deliberate simplification vs. a literal reading of docs/PRD.md item 5:**
the PRD describes "opens Perplexity pre-loaded" -- a dedicated web-research
product. OpenClaw has no bundled Perplexity/web-search skill (checked: the
closest bundled skills are `browser`, for page navigation, and `summarize`,
for a *specific known* URL/video/PDF -- neither is a general search API), and
per CLAUDE.md/openclaw-reference.md this project only uses custom,
minimal-permission skills, not community ones. This skill instead uses the
`browser` tool directly for the actual research step. Revisit if a real
search API becomes available and is worth the added dependency.

## Trigger

"Research X", "look into X", "what's out there on X".

## Workflow

1. Run:
   ```
   node scripts/fetch_context.mjs --topic "<the topic>"
   ```
   Same contract as `brainstorm`'s script -- returns `{ context, verified,
   verdict }`. Surfaces what's already known so the research step doesn't
   waste time re-discovering it.
2. Use the `browser` tool to research the topic on the web (search, read
   pages) -- this is genuinely new information gathering, not something
   `recall()` can provide.
3. Summarize findings for the user.
4. **Offer to save findings back into memory** (docs/PRD.md item 5's explicit
   ask) -- if the user says yes, treat it as a `quick-note` classified as
   `topic` (a durable fact/standing context worth keeping, not a task):
   ```
   node ../quick-note/scripts/remember_note.mjs --kind topic --text "<summarized findings>"
   ```
   Don't save automatically without asking -- research findings are more
   speculative than a direct user statement, and shouldn't silently become
   "memory" the same way a quick-note does.

## Notes

- Steps 2-3 depend entirely on the `browser` tool's actual capabilities in
  this OpenClaw installation, which weren't tested here (this pass only
  exercised the `recall()`/`remember()` half against the live Cognee
  instance, not the browser tool) -- verify the browser tool works as
  expected before relying on this in a demo.
