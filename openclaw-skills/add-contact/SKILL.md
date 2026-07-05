---
name: add-contact
description: "Capture a new contact from a name + LinkedIn URL (+ optional context) and remember them in Cognee. Trigger: user sends a contact to add, e.g. 'add contact', 'met someone', a name with a linkedin.com URL."
allowed-tools: ["browser", "bash"]
user-invocable: true
---

# Add contact

Turns "I met someone" into a structured Person node in Cognee. Two paths to the
same result: automated LinkedIn lookup, or manual paste when that fails. Build
and use both -- never skip straight to asking for a manual paste without trying
the browser first, and never block on the browser path if it fails.

## Trigger

A message naming a person, optionally with a `linkedin.com/in/...` URL and
free-form context (where met, what they do, how they can help).

## Workflow

1. **Parse the message.** Extract: name (required), LinkedIn URL (optional),
   free-text context (optional) -- where/when met, what they do, how they help.
2. **If a LinkedIn URL is present:** use the browser tool to open it and read
   the visible profile text (name, headline, about, experience).
   - Logged-out wall, CAPTCHA, layout cognee can't parse, or any navigation
     error -> do **not** retry or scrape around it. Immediately fall back to
     step 3 (manual paste). This is a hard rule, not a last resort -- see
     docs/PRD.md Section 3 ("No mass/background LinkedIn scraping" / "build
     this fallback path early, not as an afterthought").
3. **Manual fallback:** ask the user to paste whatever profile text or context
   they have (bio, About section, a couple of sentences). Proceed with
   whatever text is available -- don't require LinkedIn at all if the user
   never sent a URL.
4. **Structure the fields** from whatever text you have (LinkedIn read, manual
   paste, or the original message alone) into: `expertise` (list of topics),
   `background`, `how_they_help`, `met_at` (event/context string, if
   mentioned), `met_date`, `birthday` (if mentioned), `tags` (list). Don't
   invent facts that aren't in the source text -- leave a field empty rather
   than guess.
5. **Compose a short natural-language paragraph** from those fields (not raw
   JSON -- Cognee's extraction step reads free text) and run:
   ```
   node scripts/remember_contact.mjs --name "<name>" --text "<paragraph>"
   ```
   See `scripts/remember_contact.mjs` for the full contract; it posts to
   Cognee's `/api/v1/remember` using the shared Person graph model in
   `../../agent/schema/generated/person.schema.json` so the extracted node
   matches docs/TRD.md Section 5 exactly (don't pass a different schema).
6. **Confirm back to the user** in one short line: name captured + one
   distinguishing fact (e.g. "Added Aria Chen (fundraising, met at TechCrunch
   Disrupt) to your contacts.").

## Notes

- One contact per trigger. Never loop over multiple LinkedIn URLs or profiles
  in a single run -- per docs/PRD.md Section 3, every lookup is user-triggered,
  one contact at a time.
- If Cognee's remember call fails (see script exit code/stderr), tell the user
  it failed and why -- don't silently drop the contact or retry indefinitely.
