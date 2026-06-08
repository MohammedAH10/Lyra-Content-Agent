# Production-Readiness Assessment

## TL;DR

Lyra is an **architecturally complete prototype** that works end-to-end with real AI calls, real database storage, and a real frontend. It is **not production-ready** — it was built as a technical assessment to demonstrate system design capability. This document identifies exactly what would need to change.

## Most Fragile Part of the Solution

**The free-tier OpenRouter model (`gpt-oss-120b:free`).** It has no SLA, no predictable latency, questionable output quality, and could be deprecated tomorrow. The fallback chain masks failures but doesn't solve the quality problem. If the model goes down or starts producing gibberish, users get draft-quality output with `[AI generation unavailable]` markers.

Second most fragile: the **keyword-based recommendation engine**. It's entirely dependent on tag quality. If files are uploaded without tags or with inconsistent tags, recommendations become useless. There is no graceful degradation for this — users just get empty results.

## What to Monitor First

| Signal | How to Monitor | Alert Threshold |
|--------|---------------|-----------------|
| AI success rate | `AiLog.success` field | < 90% over 5 minutes |
| AI latency P95 | `AiLog.latencyMs` aggregated | > 10s |
| Fallback rate | `AiLog.fallbackUsed` ratio | > 10% |
| Empty recommendations | `recommendMediaForPost` returning `noResultReason != null` | User-facing metric |
| Model availability | Direct health check on OpenRouter API | Any failure |

The `GET /admin/logs/ai` endpoint already provides the raw data for all AI metrics. A production system would add a scheduled job to aggregate these into time-series metrics.

## What to Improve Before Production

### Required (blocking)

1. **Upgrade AI model** — Switch from free-tier to GPT-4o-mini or Claude 3.5 Haiku. The free model is not reliable enough for production user-facing content.
2. **Add authentication** — Currently no auth; userId is an optional body field. Add JWT, OAuth (NextAuth is already a dependency), or session-based auth.
3. **Add rate limiting** — No protection against abuse. Add `express-rate-limit` per endpoint, especially on AI routes.
4. **Add input sanitization** — Prompt injection protection. The current system passes user input directly to the LLM prompt. A production system needs guardrails.
5. **HTTPS enforcement** — Vercel handles this at the edge, but if self-hosting, HTTP→HTTPS redirect is needed.

### Strongly Recommended

6. **Replace keyword scoring with vector search** — Tag-based matching is fragile. MongoDB Atlas Vector Search or pgvector would give semantic matching.
7. **Add CI/CD pipeline** — Currently no automated testing in CI. GitHub Actions running `vitest` + `tsc --noEmit` on every PR.
8. **Add error alerting** — No notification when AI calls fail. Integrate Sentry or similar for error tracking.
9. **Add request ID tracing** — Every request should have a traceable ID for debugging across the stack.
10. **Add database indexing** — `AiLog.createdAt`, `File.status`, `PostDraft.userId` should be indexed for query performance.

### Nice to Have

11. **WebSocket for real-time generation status** — Currently the user waits for the HTTP response. A streaming approach would feel faster.
12. **Background job queue** — AI calls block the HTTP response. For longer generation, use a job queue (Bull/BullMQ + Redis) with webhook callbacks.
13. **Draft versioning** — Currently overwrites the draft content. Version history would let users revert.

## Assumptions Made

| Assumption | Risk if Wrong |
|------------|---------------|
| OpenRouter API uses OpenAI-compatible schema | Low — it does, and has for years |
| File tags are meaningful and human-curated | High — if tags are bad, recommendations fail |
| MongoDB Atlas connection is stable | Medium — serverless can cold-start slowly |
| Users have valid content to generate | Low — the form validates non-empty input |
| Frontend runs on modern browsers | Low — Tailwind + Next.js targets modern browsers |
| The `/ai/regenerate-post` endpoint receives the previous content | Low — the frontend sends it explicitly |
| Free OpenRouter model will be available during demo | Medium — observed intermittent unavailability |

## Key Understanding for Another Engineer

To work effectively on this codebase, an engineer should start with:

1. **`src/services/modelRouter.service.ts`** — Understands the primary → fallback → deterministic chain
2. **`src/services/ai.service.ts`** — All prompt builders and the AI orchestration logic
3. **`src/services/keywordScoring.service.ts`** — The keyword extraction and scoring algorithm (entirely self-contained, ~80 lines)
4. **`src/routes/ai.routes.ts`** — The Zod validation schemas defining the API contract
5. **`frontend/src/app/generate-post/page.tsx`** — The main user-facing flow

The key architectural insight is that **every AI endpoint has the same pattern**: build prompt → call router → parse JSON → validate shape → log → return. Understanding one endpoint means understanding them all.

## Most Expensive Part at Scale

**AI model API calls.** At 100k requests/month with GPT-4o-mini (~$0.60/M input tokens), the AI cost would be ~$37.50/mo. If using GPT-4o (~$10/M input tokens), it jumps to ~$625/mo.

The keyword-based media recommender costs **$0.00** since it's pure computation. This is a major advantage of the current approach, even if it's less sophisticated than vector search.

## Closed Model vs Open-Source Model Decision

**Current choice**: Closed model via OpenRouter (OpenAI-compatible API).

**Rationale**: OpenRouter provides a single API that can route to dozens of models. This lets us change models without code changes — just update the model name in `.env`. For an assessment project, this is the right trade-off.

**For production**, the choice depends on requirements:

| Factor | Closed (GPT-4o-mini) | Open-Source (Llama 3 70B) |
|--------|---------------------|---------------------------|
| Quality | Excellent | Good |
| Cost per token | ~$0.60/M input | $0.00 (self-hosted) or ~$0.20/M (API) |
| Latency | Fast (500ms–2s) | Slower (2–10s on consumer GPU) |
| Data privacy | Model provider sees prompts | Full control |
| Maintenance | Zero | GPU cluster, model updates |
| Compliance | Possible restrictions | Full control |

For a content-generation tool handling non-sensitive marketing content, **GPT-4o-mini via OpenRouter** is the pragmatic choice. If the tool ever handled sensitive client data, a self-hosted open-source model would be necessary.

## Routing / Fallback Logic Location

The fallback chain lives in **`src/services/modelRouter.service.ts`**:

```
callWithFallback(systemPrompt)
  └─ callSingleModel("openai/gpt-oss-120b:free")    // primary
      └─ on failure → callSingleModel("gpt-oss-20b:free")  // fallback
          └─ on failure → return null                        // caller handles
```

Each AI service method (e.g., `generatePost` in `ai.service.ts`) handles the `null` case by calling the corresponding deterministic template (e.g., `fallbackGeneratePost`).

This means the **routing logic is centralized** in one file, while the **fallback content logic** is in another (`deterministicTemplates.ts`). This separation is intentional — the router knows *how* to call models, the templates know *what* to return when models fail.

## What Must Change Before Merging Into a Real Codebase

1. **Remove or replace the `Filess.ts` model** — Appears to be a legacy/duplicate model file. Either consolidate or remove.
2. **Add proper environment variable validation** — `envalid` or similar to validate all env vars at startup.
3. **Add database migrations** — Mongoose schema changes should be tracked. Currently schema is applied on startup.
4. **Add request logging middleware** — The current `logger.info('Incoming request', ...)` is minimal. Structured request logging with response times would help debugging.
5. **Move S3 operations to a real S3 client** — `s3Reference.service.ts` is a stub. Replace with `@aws-sdk/client-s3`.
6. **Add security headers** — `helmet` middleware should be added.
7. **Add CORS configuration** — Currently wide-open. Lock down to specific origins.
8. **Add health check depth** — Current `/health` just returns OK. Add database ping + AI API health check.
9. **Remove assessment artifacts** — `TongstonAssessment.md`, `T-worldAssessment.md`, `ProjectREADME.md`, `TDD_SPRINT_PLAN.md` and other planning docs should be archived.
10. **Add end-to-end tests** — Currently 20 test files with 178 tests covering unit + integration. Add Cypress or Playwright for frontend e2e.

## Summary

| Domain | Score (1-5) | Notes |
|--------|------------|-------|
| Architecture | 4 | Clean separation, good patterns, centralized routing |
| Reliability | 3 | Fallback chain helps, but free model is a single point of failure |
| Observability | 3 | Audit logging exists but needs aggregation/dashboard |
| Security | 1 | No auth, no rate limiting, no input sanitization |
| Test Coverage | 3 | 108 passing tests, but MongoMemoryServer segfaults in CI |
| Documentation | 4 | SPRINT15 provides comprehensive docs |
| Cost Efficiency | 5 | $0.00 to run (free tier) |
| Production Readiness | 2 | Solid architecture but needs auth, model upgrade, and hardening |

**Overall**: A well-architected prototype that demonstrates the full stack works. Approximately 2–4 weeks of engineering effort to reach production quality, primarily in auth, model upgrade, and security hardening.
