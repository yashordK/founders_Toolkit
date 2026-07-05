# Open Items — Founder's Second Brain

To resolve before Day 5:

- [ ] Exact submission deadline time (not just date) — check Discord/registration form.
- [ ] **BLOCKING:** Cognee's LLM (xAI/Grok, LLM_PROVIDER=custom) returns `permission-denied: team has no credits or licenses` on every call, and the OpenAI key used for embeddings returns `insufficient_quota` (429). Confirmed 2026-07-05 via a direct `litellm.acompletion`/`litellm.aembedding` call from inside the running `cognee` container — not a cognee bug. Every `remember()`/`cognify()` call needs both a working LLM and a working embedding provider, so no schema validation, skill work, or demo data can be ingested until credits are added on console.x.ai and the OpenAI billing/plan issue is resolved. (Separately: `cognee/.env` was also missing `LLM_ENDPOINT`, required for `LLM_PROVIDER="custom"` — fixed, unrelated to the credits issue, kept regardless.)
- [ ] Decide final demo script: which contact gets added live, which meeting transcript is pre-seeded vs added live.
- [ ] Confirm Whisper (or alternative STT) integration path for offline meeting voice memos.
