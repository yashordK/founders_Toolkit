---
name: add-meeting
description: "Capture a meeting from a forwarded transcript, file, or voice memo and remember it in Cognee. Trigger: user forwards a call transcript, meeting notes, or an audio recording of a meeting."
allowed-tools: ["openai-whisper", "bash"]
user-invocable: true
---

# Add meeting

One pipeline for both cases docs/TRD.md Section 6 describes -- online meetings
(native platform transcript, forwarded as text) and offline meetings (a phone
voice memo) both end up as transcript text before anything else happens.

## Trigger

A forwarded transcript (text or file) from Zoom/Meet/Teams, typed meeting
notes, or an audio file/voice memo recorded during an in-person meeting.

## Workflow

1. **Get transcript text.**
   - Text/file input: use as-is.
   - Audio input: transcribe locally with the `openai-whisper` skill first:
     `whisper <file> --model medium --output_format txt --output_dir <tmp>`,
     then read the resulting `.txt`. If the `whisper` binary isn't installed
     (skill shows "needs setup"), tell the user audio capture isn't available
     yet and ask them to paste the notes as text instead -- don't fail
     silently.
2. **Do not pre-structure the transcript yourself.** Pass the raw (or
   transcribed) text straight through -- Cognee's own extraction step
   structures it against the Meeting schema during `remember()`. Pre-parsing
   here would just add a second, less reliable extraction pass.
3. Run:
   ```
   node scripts/remember_meeting.mjs --text "<transcript text>"
   ```
   See `scripts/remember_meeting.mjs`: posts to `/api/v1/remember` using the
   shared Meeting graph model in
   `../../agent/schema/generated/meeting.schema.json`, so extracted
   attendees/decisions/action_items/discussed-topics match docs/TRD.md
   Section 5. Attendees named in the transcript merge with existing Person
   nodes by name (see agent/schema/models.py identity_fields) -- new people
   mentioned only in a meeting still get a Person node created, per
   docs/TRD.md Section 6 ("creating new ones as needed").
4. **Confirm back to the user** in one short line: meeting title + attendee
   count + open action item count (e.g. "Logged 'Fundraising Strategy Sync'
   with Aria Chen -- 1 open action item.").

## Notes

- One meeting per trigger.
- If `remember()` fails, tell the user and don't retry silently -- same rule
  as add-contact.
- Very long transcripts: `remember_meeting.mjs` does not chunk or truncate:
  Cognee's own `chunk_size`/`chunks_per_batch` handle that server-side. If a
  transcript is large enough that the call is slow, that's expected, not a
  bug -- see `elapsed_seconds` in the response.
