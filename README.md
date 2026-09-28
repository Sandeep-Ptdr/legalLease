# Legal Lease RAG Assistant

A simple MERN minor-project assistant for rental and lease questions. React provides the chat interface, Node/Express runs the RAG pipeline, and MongoDB optionally stores chat history. MongoDB is never used to store embeddings or run vector search.

## Architecture

`Documents ? chunking ? local embeddings.json ? query embedding ? cosine similarity ? relevant context ? LLM answer`

This project intentionally has no vector database. With a small educational document collection, JSON embeddings on the local machine and direct cosine-similarity search are sufficient and easy to explain in a viva. The server loads the embedding file once at startup and generates only a query embedding for each question.

The included deterministic Node.js embedding function is offline-friendly for a college demo. It can later be replaced by a sentence-embedding provider without changing the local storage or retrieval design. The included documents are educational samples, not official law.

## Run

```bash
cd backend
npm install
copy .env.example .env
npm run rebuild
npm run dev

# In another terminal
cd frontend
npm install
npm run dev
```

Open the Vite URL. API endpoints: `GET /api/health`, `POST /api/chat`, `GET /api/rag/status`, and `POST /api/rag/rebuild`.

Set `MONGODB_URI` to persist questions and answers. Set `LLM_API_KEY`, `LLM_MODEL`, and optionally `LLM_BASE_URL` to enable an OpenAI-compatible LLM. Without an LLM key, the API returns a clearly labelled evidence-based local fallback response.

## Web fallback

When local retrieval has insufficient similarity, the API explicitly reports that it could not verify an answer from the local knowledge base. For production, integrate a configured search provider that returns official government, court, or legislation URLs; do not treat random web pages as legal authority.