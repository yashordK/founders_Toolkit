# Founder's Second Brain

A founder/multitasker's second brain, reachable by text or voice from a phone, that remembers every person met, every meeting held, and every intention stated — well enough to plan the next day and surface the right connection at the right moment.

- **Memory:** self-hosted Cognee hybrid graph-vector store (Postgres profile)
- **Messaging & automation:** OpenClaw (WhatsApp/Telegram/WebChat, browser tool, cron)
- **Dashboard:** Next.js, dark/glass theme, read-mostly surface over Cognee's API

## Setup

```bash
git clone <this-repo>
cd founders_Toolkit

# Cognee
git clone https://github.com/topoteretes/cognee
cp .env.template .env   # set LLM_API_KEY
docker compose --profile postgres up
```

