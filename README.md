# ParkPal

ParkPal is an AI-powered parking notice action agent for UK parking notices. It turns an intimidating parking notice into a structured case workspace with extracted details, deadlines, evidence prompts, appeal grounds, draft letters, calendar reminders, and exportable appeal packs.

The product is designed as a polished hackathon MVP and demo prototype. It is not a legal advice product and should not be used as a substitute for qualified legal advice.

## What ParkPal Does

ParkPal helps a user move from a confusing notice to practical next steps:

1. Upload or paste a parking notice.
2. Extract issuer, reference, vehicle, amount, location, dates, and route links.
3. Classify the notice as a council PCN, private parking charge, Notice to Keeper, debt collector letter, legal/court document, scam-like notice, or unknown.
4. Build deadline cards for appeal, payment, discount risk, evidence, and escalation where available.
5. Generate `.ics` calendar reminders.
6. Retrieve relevant guidance from a local knowledge base.
7. Suggest cautious appeal grounds and required evidence.
8. Track evidence notes and uploaded evidence metadata.
9. Draft editable short and formal appeal letters.
10. Export a printable/downloadable appeal pack as HTML or PDF.
11. Analyse a rejection letter and suggest the next escalation route.

## Product Positioning

**Your AI parking notice action agent.**

Upload a parking notice. ParkPal reads it, finds the deadlines, checks appeal routes, builds an evidence checklist, drafts your challenge, and keeps you on track.

ChatGPT can explain how to appeal. ParkPal helps you actually act correctly and on time.

## Key Features

- Notice upload and paste flow
- Demo notice flow for presentations
- Basic text and PDF embedded-text extraction
- Image upload placeholder with clear MVP warning
- Rule-based notice field extraction
- Notice type classification
- Deadline dashboard with reminder chips
- `.ics` calendar export
- Configurable RAG retrieval from `knowledge_base/` (`RAG_MODE=keyword|local|openai`)
- Appeal grounds ranking
- Evidence checklist and evidence strength meter
- Local evidence file storage for demo case memory
- Editable appeal draft with tone options
- Appeal pack export as HTML and lightweight PDF
- Rejection analyzer for POPLA, IAS, tribunal, court, and deadline clues
- Risk Guard warnings for missing evidence, low confidence, debt/court wording, and deadline uncertainty
- Warm/vivid theme toggle with `localStorage` persistence
- Responsive, polished frontend for demo use

## Tech Stack

- **Framework:** Next.js 16 App Router
- **UI:** React 19, TypeScript, Tailwind CSS
- **Icons:** Lucide React
- **Storage:** Local JSON files under `data/`
- **Knowledge base:** Local markdown files under `knowledge_base/`
- **Exports:** `.ics`, downloadable HTML, lightweight generated PDF
- **LLM layer:** Provider abstraction with deterministic demo fallback

## Architecture Overview

ParkPal uses a multi-agent style architecture. The current MVP keeps the agents deterministic so demos remain reliable without API keys.

| Agent | Responsibility |
| --- | --- |
| Notice Reader Agent | Extracts structured notice fields from pasted/uploaded text. |
| Issuer Classification Agent | Classifies the notice route and flags suspicious or urgent wording. |
| Deadline Agent | Builds appeal, payment, discount, evidence, and escalation deadlines. |
| RAG Knowledge Agent | Retrieves relevant local knowledge-base snippets via `RAG_MODE` (keyword, local lexical, or OpenAI embeddings). |
| Appeal Grounds Agent | Suggests possible appeal grounds and evidence requirements. |
| Evidence Checklist Agent | Converts grounds into evidence tasks. |
| Evidence Update Agent | Updates evidence status and stores evidence metadata. |
| Appeal Drafting Agent | Creates short and formal editable appeal drafts. |
| Risk Guard Agent | Flags missing evidence, deadline risks, low confidence, debt/court escalation, and unsafe assumptions. |
| Action Agent | Produces next actions and supports calendar/export workflows. |
| Rejection Analyzer Agent | Extracts rejection reason, deadline clues, escalation route, and a next draft. |

## Frontend Experience

The frontend has been redesigned as a premium legal-tech product experience:

- Sticky glass navigation
- ParkPal wordmark and product navigation
- Warm brown default theme
- Vivid fuchsia/orchid alternate theme
- Theme toggle persisted with `localStorage` key `parkpal-theme`
- Product-story hero section
- Animated case preview and agent workflow visualisation
- Premium upload/scanning UI
- Dashboard-first case workspace
- Prominent deadline/calendar UI
- Evidence checklist cards and strength meter
- Appeal grounds as ranked cards
- Tabbed appeal draft editor
- Rejection escalation workspace
- Professional disclaimer and risk guard presentation

## Project Structure

```text
app/
  api/                    API routes for analysis, calendar, pack export, evidence, rejection
  case/[id]/              Case dashboard and workflow pages
  upload/                 Notice upload page
components/               Frontend UI components
  AppNav.tsx              Shared navigation and CTA shell
  ThemeToggle.tsx         Warm/vivid theme switcher
  LandingHero.tsx         Landing/product story page
  UploadNotice.tsx        Notice upload and scan UI
  CaseHero.tsx            Case dashboard hero summary
  AgentWorkflow.tsx       Agent activity panel
lib/
  agents/                 Deterministic agent pipeline
  calendar/               ICS generation
  llm/                    Model provider abstraction
  ocr/                    MVP file text extraction helpers
  pdf/                    HTML and PDF appeal pack generation
  rag/                    Local retrieval over markdown knowledge base
  storage/                Local case and evidence file storage
  types/                  Shared TypeScript types
knowledge_base/           Local markdown guidance snippets
data/                     Local demo data and generated case storage
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

If Windows/npm reports certificate issues, you can retry with:

```bash
npm install --strict-ssl=false
```

### 2. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

To run on a different port:

```bash
npm run dev -- -p 3001
```

### 3. Build for production

```bash
npm run build
```

### 4. Start production build

```bash
npm run start
```

## Environment Variables

Copy `.env.example` to `.env.local` if you want to configure model providers.

```bash
cp .env.example .env.local
```

Important defaults:

```env
DEMO_MODE=true
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
RAG_MODE=keyword
EMBEDDING_PROVIDER=none
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

When `DEMO_MODE=true` or no provider key is configured, ParkPal uses deterministic fallback behaviour. This keeps the demo reliable without external services.

RAG modes:
- `keyword` — term overlap over `knowledge_base/*.md` (no API)
- `local` (alias `embedding`) — bag-of-words cosine similarity, no API
- `openai` — OpenAI embeddings; set `EMBEDDING_PROVIDER=openai` and `OPENAI_API_KEY`
- `ollama` — local (or remote) Ollama `/api/embed`; set `OLLAMA_EMBED_BASE_URL` (default `http://127.0.0.1:11434`) and `OLLAMA_EMBEDDING_MODEL` (e.g. `nomic-embed-text`). Chat can still use Ollama Cloud via `OLLAMA_BASE_URL=https://ollama.com`.

Rejection analysis also runs RAG retrieval and can draft an escalation paragraph with the configured chat model.

Provider failures fall back to `local` lexical retrieval.

Supported provider configuration placeholders include OpenAI, Anthropic, Gemini, OpenRouter, Groq, Fireworks, DeepSeek, LM Studio, and Ollama. The current agent flow remains deterministic unless you wire provider calls into specific agents.

## Demo Flow

A good two-minute demo path:

1. Open the landing page.
2. Toggle between Warm and Vivid themes.
3. Click **View demo case** or go to `/upload?demo=true`.
4. Analyse the demo notice.
5. Show the case dashboard:
   - Notice type
   - Agent activity
   - Deadline cards
   - Calendar export
   - Risk Guard
   - Evidence checklist
   - Appeal grounds
6. Open the appeal draft page and show tone/tabs/copy.
7. Export the appeal pack as HTML or PDF.
8. Open the rejection analyzer and load the demo rejection.

## Data and Storage

This MVP uses local file storage:

- Case files are stored in `data/cases.json`.
- Demo notice data lives in `data/demoNotice.txt`.
- Demo rejection data lives in `data/demoRejection.txt`.
- Uploaded evidence files are stored under `data/evidence/<caseId>/`.

This is suitable for a local demo. It is not production storage.

## Outputs

ParkPal can generate:

- Calendar reminders via `.ics`
- Editable appeal draft
- Printable appeal pack page
- Downloadable HTML appeal pack
- Lightweight PDF appeal pack
- Rejection escalation draft

## Current MVP Limitations

ParkPal is intentionally scoped for a reliable demo:

- OCR is lightweight. Text upload and pasted text are the most reliable paths.
- PDF extraction only attempts basic embedded text extraction.
- Image OCR is represented as a placeholder warning.
- Deadline calculations may use cautious fallback estimates when explicit dates are missing.
- RAG retrieval is local and lightweight, not a production vector database.
- Evidence upload stores local files for demo memory, not secure production evidence storage.
- No appeal is submitted automatically.
- No Google Calendar OAuth is implemented.
- No complete UK-wide council/operator database is included.
- ParkPal provides informational support only, not legal advice.

## Legal Disclaimer

ParkPal is a hackathon prototype for demonstration purposes only. It does not provide formal legal advice and should not be relied on as a substitute for advice from a qualified legal professional.

Users should always verify deadlines, appeal rules, notice details, and legal information with official sources or a qualified adviser before taking action.

## Future Improvements

- Production OCR pipeline
- Secure evidence storage
- Real vector database retrieval
- Official source citation layer
- Google/Outlook calendar integration
- POPLA/IAS form assistant
- Council/operator routing database
- Email deadline scanner
- Fleet or multi-case mode
- Lawyer/human review handoff
- Production authentication and user accounts

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Build production app
npm run start    # Start production server
```

## Repository

GitHub remote:

```text
https://github.com/Tahmid-Sifat/Park_Pal.git
```
