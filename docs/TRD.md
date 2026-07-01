# Founder's Second Brain — TRD

## 4. Architecture

```
        OpenClaw Gateway (WhatsApp/Telegram/WebChat, voice notes)
                    |                          |
           custom skills                 cron triggers
   (add-contact, add-meeting,      (daily plan, nudge sweep,
    quick-note, brainstorm,          weekly improve()/forget())
    research)
                    |                          |
                    v                          v
        Cognee (self-hosted, Postgres profile)
        remember() / recall() / improve() / forget()
                    |
                    v
        Web Dashboard (Next.js, dark/glass theme)
        reads directly from Cognee's API — separate,
        read-mostly surface, not part of the agent loop
```

**Deployment:** Cognee self-hosted via `docker compose --profile postgres up` — single Postgres instance handles graph, vectors (pgvector), sessions, and metadata. This targets the **Best Use of Open Source** track intentionally (see JUDGING_NOTES.md for reasoning).

**Security posture:** WhatsApp channel locked to team members' numbers via `channels.whatsapp.allowFrom`. Only custom, minimal-permission skills — no community skill installs. State this explicitly in the README as a deliberate trust/safety decision.

---

## 5. Data schema

```
Person
  - name
  - expertise: []
  - background
  - how_they_help
  - met_at (Event ref)
  - met_date
  - birthday
  - last_interaction_date
  - tags: []

Event / Meeting
  - title
  - date
  - agenda
  - decisions: []
  - action_items: []
  - notes
  - attendees: [Person refs]

Topic
  - name

Task
  - description
  - due_date
  - status
  - linked_to (Meeting/Note ref)

Relationships:
  Person --attended--> Meeting
  Person --expert_in--> Topic
  Meeting --discussed--> Topic
  Task --from--> Meeting/Note
```

Validate this schema with a trivial `remember()` → `recall()` round trip in self-hosted Cognee **before** building any skill or UI on top of it.

---

## 6. Meeting handling — the actual approach

We do not build live-call capture. Instead, one universal pipeline handles both cases:

- **Online meetings:** Zoom/Meet/Teams already generate transcripts natively. User forwards that transcript text/file to the WhatsApp bot after the call.
- **Offline meetings:** user records a voice memo during the meeting, sends the audio afterward. Pipeline runs it through speech-to-text (e.g. Whisper) first.
- **From there it's one path:** transcript text → LLM extraction (agenda, decisions, action items, notes-for-later) → match/create attendee Person nodes → `remember()`.

Live-join capture is explicitly named as future work in the README/demo — shows ambition without spending build time we don't have.
