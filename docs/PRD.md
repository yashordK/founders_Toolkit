# Founder's Second Brain — PRD

**Event:** The Hangover Part AI: Where's My Context? — WeMakeDevs × Cognee Hackathon
**Track:** Best Use of Open Source (self-hosted Cognee)
**Team size:** 2
**Timeline:** Jun 29 – Jul 5, 2026

---

## 1. Vision

A founder/multitasker's second brain, reachable by text or voice from a phone, that remembers every person they meet, every meeting they have, and every intention they state — well enough to plan their next day and surface the right connection at the right moment. Memory is a self-hosted Cognee hybrid graph-vector store. Messaging, automation, and browser actions run through OpenClaw. A custom dashboard is the visual home.

**One-line pitch:** *OpenClaw is the nervous system — it hears you. Cognee, our schema, and our reasoning are the brain — they understand, connect, and remember like a person would. The dashboard is the face.*

**The problem it solves:** Founders meet dozens of people at events and forget who they were within days. Meetings produce decisions and action items that evaporate the moment the call ends. Context gets rebuilt from scratch in every new AI chat. This is the "AI amnesia" problem the hackathon theme is built around, applied to a founder's actual daily life instead of a generic chatbot.

---

## 2. What we ARE building (in scope)

### A. Capture channels (via OpenClaw — WhatsApp/voice, minimal user effort)
1. **Add contact** — user texts a name + LinkedIn URL (+ optional context: where met, what they do). Skill opens the profile via browser tool, extracts visible info, an LLM structures it into `expertise`, `background`, `how_they_help`, links it to the relevant event.
2. **Add meeting** — user forwards a transcript (from Zoom/Meet/Teams native transcription) or a voice memo recorded during an offline meeting. Skill extracts agenda, decisions, action items, and "remember this later" notes, and links every attendee to their Person node (creating new ones as needed).
3. **Quick note** — freeform text/voice dump stored as memory, auto-tagged to relevant person/topic if mentioned ("remind me to wish Aria happy birthday," "we're prioritizing enterprise this quarter").
4. **Brainstorm mode** — "brainstorm about X" pulls relevant context via `recall()` and opens Claude pre-loaded with it.
5. **Research mode** — "research X" pulls context, opens Perplexity pre-loaded, offers to save findings back into memory.

### B. Memory (Cognee graph — self-hosted, Postgres profile)
6. Person nodes — expertise, background, how they can help, where/when met, birthday, last-interaction date.
7. Meeting nodes — agenda, decisions, action items, notes — linked to attendees.
8. Topic/Decision nodes — standing priorities, past decisions + reasoning (decision journal).
9. Task/reminder nodes — action items and follow-ups with due dates.
10. `improve()` loop — track which nudges/suggestions get acted on vs dismissed; reweight future recall accordingly.
11. `forget()` rules — auto-prune contacts with no interaction in N months, resolved tasks, expired reminders.

### C. Proactive output
12. **Daily plan generation** — scheduled morning `recall()` across open tasks, due nudges, and stated priorities, synthesized into a prioritized message sent via WhatsApp and shown on the dashboard.
13. **Nudges** — "haven't followed up with X in 3 weeks," "Y's birthday tomorrow," "you're discussing pricing — here's who could help."
14. **Warm-intro finder** — on-demand or context-triggered graph traversal, ranked by relevance to the current need + recency + relationship strength.
15. **Ad-hoc chat recall** — ask anything about your own history, anytime, from any channel OpenClaw reaches.

### D. Dashboard (custom web app, dark/glass theme)
16. Today view — date/time/weather, schedule, next-up, open nudges.
17. Quick actions — "Anything to remember?" / "Anything to brainstorm/research?"
18. Connections directory — browsable/filterable list of all Person nodes.
19. Connection profile page — structured info, interaction history, notes, "find who could help with X starting from this person" action.
20. Upcoming events — birthdays, follow-ups due.

**Priority tiers:**
- **Must-build (core, protect this at all costs):** 1, 2, 3, 6, 7, 9, 10, 11, 12, 13, 14, 16, 18, 19
- **Build if time allows:** 4, 5, 8, 15 (cheap — same `recall()` pattern as core features), 17, 20

---

## 3. What we are NOT building (explicitly out of scope)

- **No live meeting bot joining calls in real time.** Too much integration risk (Zoom/Meet/Teams bot SDKs, real-time transcription infra) for the time available. We consume transcripts/recordings *after* the meeting, from native platform transcription or a phone voice memo.
- **No mass/background LinkedIn scraping.** Every profile lookup is user-triggered, one contact at a time, off the back of an explicit user message. We are not building a crawler or a lead-gen scraping product. If the browser tool can't get a clean read (logged-out wall, layout change), fall back to manual paste — build this fallback path early, not as an afterthought.
- **No true "always-on" passive observation of the user's screen/system.** All capture is triggered by an explicit user action (a message, a forwarded transcript, a voice note). We are not building OS-level surveillance. Passive capture is future-work, not MVP.
- **No native iOS/Android app.** OpenClaw's existing WhatsApp/Telegram/WebChat channels are the phone interface. Building a separate mobile app is out of scope and unnecessary.
- **No rebuilding of messaging/channel infrastructure.** OpenClaw is deliberately used as the "body" (channels, browser tool, cron, skill loading) so build time goes into memory schema, ranking logic, and reasoning — the parts that are actually judged.
- **No community/third-party OpenClaw skills.** Only custom-written, minimal-permission skills for this project, to avoid the documented prompt-injection/exfiltration risk in unvetted third-party skills.
- **No multi-tenant/enterprise auth system.** This is a single-user (or small-team) personal tool for the demo. Don't build account systems, orgs, or role-based access — out of scope for a hackathon MVP.
