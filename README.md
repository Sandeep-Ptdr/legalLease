# LegalLease

A small React and Express assistant for Indian rental and lease questions. It uses a local JSON knowledge base and offline embeddings first, then runs a web search when local matches are insufficient. Groq can optionally turn retrieved passages into a conversational answer; without Groq, the app returns the supporting excerpts directly. MongoDB is optional and is only used to save chat history.

## Run

Install dependencies once in each application folder:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed by the frontend. The API listens on port 5000 by default. Set `VITE_API_URL` in `frontend/.env` only when the API is hosted elsewhere.

## Knowledge and integrations

Add structured entries to `backend/data/knowledge-base.json` or place plain-text `.txt` files in `backend/data/documents`. Both sources are chunked and embedded when you run `npm run rebuild` from `backend`; the generated index is saved to `backend/data/embeddings/embeddings.json`.

Live web fallback uses DuckDuckGo HTML search and needs an internet connection. Search results and snippets are shown as links and are not treated as verified legal advice. Set `GROQ_API_KEY` in `backend/.env` to enable optional Groq-generated answers; the app remains usable without it. Set `MONGODB_URI` to save chat history; if MongoDB is unavailable, chat still works without history.

API endpoints: `GET /api/health`, `GET /api/rag/status`, `POST /api/rag/rebuild`, and `POST /api/chat`.

## Checks

```powershell
cd backend
npm test
```

```powershell
cd frontend
npm run lint
npm run build
```

All answers are general educational information, not legal advice. Tenancy, registration, stamp duty, notice, and deposit rules depend on current law and the property's jurisdiction; verify consequential matters with official sources or a qualified local lawyer.
