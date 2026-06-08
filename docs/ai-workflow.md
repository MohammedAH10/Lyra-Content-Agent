# AI Workflow

## Overview

AI content generation follows a three-stage pipeline: **prompt construction** → **model routing with fallback** → **response parsing and validation**.

Every request is logged to the `AiLog` collection for auditability, and every failure path produces useful output — never a silent crash.

## Flow Diagram

```
Client Request
      │
      ▼
  ┌──────────────┐     Zod validation   ┌──────────────┐
  │  Route/Validation │ ───────────────→ │  Controller   │
  └────────────────┘                    └──────┬───────┘
                                               │
                                               ▼
                                   ┌───────────────────────┐
                                   │   AI Service Method    │
                                   │  (buildGeneratePost)   │
                                   └──────┬────────────────┘
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │   Model Router        │
                              │   callWithFallback()  │
                              └──────────┬───────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
            ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
            │ Primary Model │   │Fallback Model│   │ Deterministic    │
            │  (120b:free)  │   │  (20b:free)  │   │ Template (final) │
            └──────┬───────┘   └──────┬───────┘   └────────┬─────────┘
                   │                  │                    │
                   ▼                  ▼                    ▼
              ┌──────────────────────────────────────────────┐
              │   parseAiJson() — strict JSON validation     │
              └──────────────────┬───────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────────────────┐
              │   Service applies additional validation      │
              │   (isValidGeneratePostResult, etc.)          │
              └──────────────────┬───────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────────────────┐
              │   Audit log entry created (AiLog.create)     │
              │   Fields: model, latency, success, fallback  │
              └──────────────────┬───────────────────────────┘
                                 │
                                 ▼
                          Response to client
```

## Prompt Design

Each AI endpoint has a dedicated prompt builder function:

| Endpoint | Builder | Output Shape |
|----------|---------|-------------|
| `generate-post` | `buildGeneratePostPrompt(topic, tone, format)` | `{content, variations[{label,content}], improvements[], relatedIdeas[]}` |
| `regenerate-post` | `buildRegeneratePrompt(previousContent, topic, tone, format, additionalInstructions)` | Same shape as generate |
| `suggest-hashtags` | `buildHashtagPrompt(postContent)` | `{hashtags[]}` |
| `suggest-improvements` | `buildImprovementsPrompt(postContent)` | `{improvements[]}` |
| `related-post-ideas` | `buildRelatedIdeasPrompt(postContent)` | `{relatedIdeas[]}` |

All prompts instruct the model to return **valid JSON only**, with no markdown code fences, no extra text.

### Tone Customization

The `tone` parameter modifies the system-level style instruction:
- **professional**: Formal vocabulary, data-driven, structured
- **casual**: Conversational, approachable, simple sentences
- **excited**: Enthusiastic, energetic, exclamation points

### Format Customization

The `format` parameter controls structure:
- **short**: 2–3 sentence, social-media ready
- **long**: Paragraph form, expanded explanation
- **bullet**: Key points as a bulleted list

## Fallback Chain

When the primary model fails (timeout, unavailable, empty response, invalid JSON), the system attempts:

1. **Primary model** (`openai/gpt-oss-120b:free`) — real API call with 30s timeout
2. **Fallback model** (`gpt-oss-20b:free`) — same timeout, different (cheaper/faster) model
3. **Deterministic templates** (`deterministicTemplates.ts`) — no API call, returns hardcoded structured output with `fallbackUsed: true` and `[Draft — AI generation unavailable]` markers

This guarantees the frontend always receives a parsable response with the expected shape.

## LLM Evaluation & Monitoring

### Current Monitoring (built-in)

Every AI call is logged to the `AiLog` collection:

```json
{
  "requestType": "generate-post",
  "modelUsed": "openai/gpt-oss-120b:free",
  "latencyMs": 4820,
  "success": true,
  "fallbackUsed": false,
  "inputSummary": "Generate: \"Product launch marketing strategy\"...",
  "createdAt": "2026-06-08T..."
}
```

The `GET /admin/logs/ai` endpoint provides:
- **Pagination** via `limit`/`offset` query params
- **Filter by** `userId`, `requestType`
- **Sort by** any field (default `-createdAt`)

This enables basic observability: average latency per model, fallback rate, error rate, and request volume.

### What Should Be Added for Production

| Metric | How to Measure | Why |
|--------|---------------|-----|
| Response quality score | Human eval or LLM-as-judge on a sample of outputs | Current monitoring logs existence, not quality |
| Hallucination rate | Factual consistency checks on outputs | Free models are more prone to hallucination |
| Cost per request | Track tokens used + model price | Currently not tracked (free tier has no cost data) |
| Latency P50/P95/P99 | Aggregate `latencyMs` from logs | Already have raw data, need percentile queries |
| Fallback rate trend | `fallbackUsed` count over time | Sudden spike indicates primary model degradation |
| Empty/refusal rate | Check for `"I cannot..."` or empty content responses | Free models occasionally refuse or give non-answers |
| Input/output token ratio | Track token usage per prompt/response | Helps optimize prompt length to reduce costs |

### Suggested Dashboard

In production, these metrics would feed a Grafana or equivalent dashboard:

```
┌─────────────────────────────────────────────────────────────┐
│  AI Service Health Dashboard                                │
│                                                             │
│  Requests/min (last 1h)  ████████████ 142                   │
│  Success rate             ████████████ 97.2%                 │
│  Avg latency              ██████░░░░░░ 4.2s                 │
│  P95 latency              ████████████ 8.7s                  │
│  Fallback rate            ██░░░░░░░░░░ 2.1%                  │
│  Primary model            gpt-oss-120b:free  ✅              │
│  Cost this hour           $0.00 (free tier)                  │
└─────────────────────────────────────────────────────────────┘
```

### Free Model Caveats

The current free-tier OpenRouter models (`gpt-oss-120b:free`, `gpt-oss-20b:free`) have significant limitations:
- **Rate limits**: Unknown, may throttle after burst usage
- **Availability**: No SLA — the model can be deprecated or removed at any time
- **Quality**: Output quality is noticeably lower than GPT-4 or Claude 3.5; hallucinations are more frequent
- **Latency**: Highly variable (2–15s observed), with occasional timeouts

**These models are deliberately used to prove the architecture works with real AI calls, not to meet production quality thresholds.** Switching to a paid model (GPT-4o-mini at ~$0.15/M input tokens) would immediately resolve most quality concerns.
