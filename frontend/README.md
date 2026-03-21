# ArabaIQ Web

Next.js application for **car recommendations** and **compare** flows. It talks to the **ArabaIQ API** (`araba-iq-api/` in the repo root).

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Ensure the API is running and `NEXT_PUBLIC_ARABAIQ_API_URL` matches it (see root [`README.md`](../README.md)).

## i18n & UI notes

- Messages: `src/i18n/messages/tr.json`, `en.json` (includes the `arabaIq` namespace used by recommendations/compare).
- Developer notes: [`docs/araba-iq-ui-i18n.md`](docs/araba-iq-ui-i18n.md).

## Build

```bash
npm run build
```
