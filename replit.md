# ClearSpeak AI

Tools to help autistic teens understand figurative language, confusing conversations, and unclear social moments.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/clearspeak run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `GROQ_API_KEY` — Groq API key for AI-powered explanations (optional; app degrades gracefully without it)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + wouter routing
- API: Express 5
- AI: Groq API (llama-3.3-70b-versatile) via REST
- No database needed (stateless AI calls)

## Where things live

- `artifacts/clearspeak/src/pages/` — page components (home, literalizer, situations, conversation-helper)
- `artifacts/clearspeak/src/App.tsx` — wouter routing
- `artifacts/api-server/src/routes/llm.ts` — Groq LLM API route (`POST /api/llm`)
- `artifacts/api-server/src/routes/index.ts` — route registry

## Architecture decisions

- Next.js converted to Vite + React; `next/link` replaced with wouter `<Link>`; `next/image` not used in this project
- The original Next.js API route (`app/api/llm/route.ts`) is now an Express route at `/api/llm`
- Groq called via raw `fetch` (no SDK dependency on server) — keeps the bundle small
- App gracefully degrades if `GROQ_API_KEY` is not set — shows a helper message instead of crashing

## Product

Three AI-powered tools for autistic teens:
1. **Fill-in-the-Blank Literal Meaning Tool** — explains what figurative phrases actually mean
2. **Common Situations & Clear Explanations** — pre-loaded + custom social situation explanations
3. **Conversation Breakdown Helper** — breaks down confusing conversations by intent and emotion

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `GROQ_API_KEY` must be added as a Replit secret to enable real AI responses
- Do NOT run `pnpm dev` at workspace root — use `restart_workflow` or the workflow panel
- The `fullstack_copy_frontend.sh` script does not support Next.js `app/` directory layouts — port pages manually

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
