# T-World AI-Powered Social Posting System

A full-stack AI-powered social posting system with content generation, moderation guardrails, file management, and media recommendation.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB on `mongodb://127.0.0.1:27017`)
- OpenRouter API key (or OpenAI-compatible endpoint)

### Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and OPENAI_API_KEY
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The backend starts on port 4000 and frontend on port 5173. The frontend proxies `/api` requests to the backend.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/t-world` | MongoDB connection string |
| `OPENAI_API_KEY` | Yes | — | OpenRouter API key (sk-or-v1-...) |
| `PORT` | No | `4000` | Backend server port |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | No | `development` | Environment mode |

### Running Tests

```bash
cd backend
npm test
```

All 260+ tests run sequentially across 15 sprint directories.

## API Overview

See `ProjectREADME.md` for the full API list. Key endpoints:

- `GET /files` — list files (with type/status filters)
- `POST /ai/generate-post` — generate social post
- `POST /ai/recommend-media` — recommend media for a post
- `POST /posts/drafts` — create post draft
- `POST /posts/drafts/:id/accept` — accept draft
- `GET /admin/logs/ai` — view AI audit logs

## Architecture

See `docs/architecture.md` for the full architecture breakdown.

## Sprint Plan

### Sprint 1: Requirement Mapping & Scope Lock

Status: Completed. See `docs/requirements-checklist.md` and `docs/architecture.md` for the full scope definition, architecture, and requirement traceability.

### Sprint 2: Health endpoint & Automated Tests

Basic health check endpoint and sprint-specific test patterns.

### Sprint 3-11: Backend Implementation

Models, CRUD APIs, AI integration, retrieval, logging, and moderation guardrails.

### Sprint 12-13: Frontend Implementation

React SPA with post composer, asset picker, and admin views.

### Sprint 14: Asset Picker UI

Asset picker modal with categories, AI recommendations, and file attachment.

### Sprint 15: Guardrails & Documentation

Input/output/file moderation guardrails, 7 documentation files, and final testing.

---

## Assessment Requirements

The system fulfills all assessment requirements including:
1. Files CRUD API with moderation workflow
2. AI-powered post generation with structured output
3. Media recommendation using metadata-based keyword scoring
4. AI timeout and fallback handling
5. Hashtag suggestion with keyword fallback
6. Audit logging for every AI action
7. Moderation guardrails (input, output, file)
8. React frontend with post composer and asset picker
9. Comprehensive test coverage
