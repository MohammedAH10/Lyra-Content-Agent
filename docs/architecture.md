# Architecture

## Overview

Lyra Content Agent is a full-stack monorepo: an Express + TypeScript API backend with MongoDB (Mongoose), and a Next.js 14 App Router frontend with Tailwind CSS (glassmorphism dark theme). The backend integrates with OpenRouter (OpenAI-compatible gateway) for LLM-powered content generation, keyword-based media recommendations, and a multi-stage fallback chain so it never silently fails.

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (serverless)                   │
│                                                         │
│  ┌─────────────────────────┐  ┌──────────────────────┐  │
│  │  Next.js 14 Frontend    │  │  Express API (api/)   │  │
│  │  (frontend/ directory)  │  │  (api/index.ts)       │  │
│  │                         │  │                       │  │
│  │  - Composer             │  │  - /ai/*              │  │
│  │  - Files library        │  │  - /files/*           │  │
│  │  - Hashtags             │  │  - /posts/drafts/*    │  │
│  │  - Media recommender    │  │  - /admin/logs/ai     │  │
│  │  - Asset picker         │  │  - /health            │  │
│  └──────────┬──────────────┘  └───────────┬───────────┘  │
│             │ HTTP/JSON                   │              │
│             └─────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   MongoDB Atlas       │
              │                      │
              │  - File documents    │
              │  - Post drafts       │
              │  - AI audit logs     │
              └──────────────────────┘

              ┌──────────────────────┐
              │   OpenRouter API     │
              │                      │
              │  gpt-oss-120b:free   │
              │  gpt-oss-20b:free    │
              │  (fallback)          │
              └──────────────────────┘
```

## Backend Layers

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| Routes | `src/routes/` | Zod validation schemas, request shape enforcement |
| Controllers | `src/controllers/` | Request/response handling, userId plumbing |
| Services | `src/services/` | Business logic, AI orchestration, scoring, auditing |
| Models | `src/models/` | Mongoose schemas (File, PostDraft, AiLog) |
| Utils | `src/utils/` | HTTP client, logger, constants, error classes |

### Route → Service mapping

| Endpoint | Controller | Service |
|----------|-----------|---------|
| `POST /ai/generate-post` | `ai.controller.generatePost` | `ai.service.generatePost` → `modelRouter.callWithFallback` |
| `POST /ai/regenerate-post` | `ai.controller.regeneratePost` | `ai.service.regeneratePost` |
| `POST /ai/suggest-hashtags` | `ai.controller.suggestHashtags` | `ai.service.suggestHashtags` |
| `POST /ai/suggest-improvements` | `ai.controller.suggestImprovements` | `ai.service.suggestImprovements` |
| `POST /ai/related-post-ideas` | `ai.controller.relatedPostIdeas` | `ai.service.relatedPostIdeas` |
| `POST /ai/recommend-media` | `ai.controller.recommendMedia` | `recommendation.service.recommendMediaForPost` → `keywordScoring.scoreFiles` |
| `POST /posts/drafts` | `drafts.controller.createDraft` | `postDraft.service.createDraft` |
| `GET /posts/drafts` | `drafts.controller.listDrafts` | `postDraft.service.listDrafts` |
| `PATCH /posts/drafts/:id` | `drafts.controller.updateDraft` | `postDraft.service.updateDraft` |
| `POST /posts/drafts/:id/accept` | `drafts.controller.acceptDraft` | `postDraft.service.acceptDraft` |
| `GET /admin/logs/ai` | `admin.controller.getAiLogs` | `auditLog.service.getAiLogs` |

## Frontend Architecture

- **Pages**: Next.js 14 App Router (`/generate-post`, `/files`, `/suggest-hashtags`, `/recommend-media`, `/files/create`, `/files/[id]`)
- **State**: Zustand store (`postComposer.store`) manages post composition flow
- **API layer**: Axios instance with response interceptor (unwraps `response.data`, normalizes errors)
- **UI primitives**: Card, Button, Input, Select, Spinner, EmptyState, ErrorAlert — all in glassmorphism style
- **Asset management**: AssetPicker modal for selecting approved media, FileTable + FilterBar for the Library page

## Data Models

### File
```
_id, name, type (image|video|audio|document), mimeType, size, url,
tags[], description, status (upload_initiated|scan_in_progress|approved|rejected),
moderationReason?, s3Key?, s3Bucket?, s3Url?, ownerId?, timestamps
```

### PostDraft
```
_id, userId, inputText, tone, format, generatedContent (mixed),
selectedVariation?, acceptedOutput?, attachedFileIds[], status (draft|accepted|discarded),
timestamps
```

### AiLog
```
_id, userId?, requestType, inputSummary, modelUsed, latencyMs,
success, fallbackUsed, errorMessage?, createdAt
```

## Key Design Decisions

1. **No real auth** — userId is passed as an optional request body field for audit tracing. Real auth (OAuth/JWT) would be added before production.
2. **Recommendations are keyword-based, not ML-based** — `extractKeywords()` + `scoreFiles()` do TF-style overlap scoring on file name, tags, and description. No embeddings or vector search.
3. **S3 workflow is simulated** — `s3Reference.service.ts` provides reference S3 operations but no real bucket is configured. File uploads go directly via `POST /files/upload` with `multer` + MongoDB (via base64 data URI).
4. **AI model is a free tier OpenRouter model** — `openai/gpt-oss-120b:free` with fallback to `gpt-oss-20b:free`. Not production-grade but functional for validation.
5. **Audit logging is synchronous** — `logAiRequest()` is called inside each service method for simplicity. In production, this would use a message queue.
