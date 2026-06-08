# Model Cost Reflection

## Current State: Free Tier

As of this submission, Lyra uses **free OpenRouter models** exclusively:

| Role | Model | Provider | Cost |
|------|-------|----------|------|
| Primary | `openai/gpt-oss-120b:free` | OpenRouter (free) | $0.00 |
| Fallback | `gpt-oss-20b:free` | OpenRouter (free) | $0.00 |

**This is a deliberate choice**, not a cost-optimization done afterward. The project was built to prove the architecture works with real AI calls — not to simulate them with canned responses. Every endpoint makes a genuine HTTP request to a real LLM provider and processes the response.

The cost of running this project indefinitely at free tier is **$0.00**, but this comes with trade-offs that make it unsuitable for production.

## What Free Tier Gets You

| Aspect | Free Tier Reality |
|--------|------------------|
| Model quality | Noticeably worse than GPT-4/Claude — more hallucinations, less coherence |
| Availability | No SLA — model can be deprecated or throttled at any time |
| Rate limits | Unknown, capped, and unadvertised |
| Latency | Highly variable: 2–15s with occasional timeouts |
| Context window | Typically 4k–8k tokens, limiting prompt complexity |
| Data privacy | Prompts may be used for model training (no data protection agreement) |

## Estimated Costs in Production

### AI Generation (per 1,000 requests)

| Model | Input (500 tok) | Output (500 tok) | Total/1k req | Monthly (10k req) |
|-------|----------------|-----------------|-------------|-------------------|
| GPT-4o-mini | $0.075 | $0.30 | $0.375 | $3.75 |
| GPT-4o | $1.25 | $5.00 | $6.25 | $62.50 |
| Claude 3.5 Haiku | $0.125 | $0.50 | $0.625 | $6.25 |
| Claude 3.5 Sonnet | $1.50 | $7.50 | $9.00 | $90.00 |
| **Current (free tier)** | **$0.00** | **$0.00** | **$0.00** | **$0.00** |

### MongoDB Atlas (Serverless)

| Tier | Storage | Cost |
|------|---------|------|
| Serverless (current) | 5GB included | ~$0.10/read-unit, ~$1.00/write-unit |
| M0 Free (dev/test) | 512MB | $0.00 |
| M10 (production) | 2GB | ~$57/mo |

### Hosting (Vercel)

| Tier | Features | Cost |
|------|----------|------|
| Hobby (current) | 100GB bandwidth, 10d logs | $0.00 |
| Pro | More bandwidth, 0d SLA | $20/mo |

### Estimated Total Monthly (Production, Light Usage)

| Component | Low (1k req/mo) | Medium (10k req/mo) | High (100k req/mo) |
|-----------|----------------|--------------------|--------------------|
| AI (GPT-4o-mini) | $0.38 | $3.75 | $37.50 |
| MongoDB Atlas (M10) | $57.00 | $57.00 | $57.00 |
| Vercel Pro | $20.00 | $20.00 | $20.00 |
| **Total** | **~$77/mo** | **~$81/mo** | **~$115/mo** |

## Cost Optimization Strategies

### 1. Model Tiering by Task

Not every request needs a powerful model:
- **Generate post**, **regenerate**: GPT-4o-mini (quality matters)
- **Hashtag suggestions**: Cheaper/smaller model (keyword extraction is easy)
- **Improvements**, **related ideas**: GPT-4o-mini or smaller
- **Media recommendations**: Already zero-cost (keyword scoring, no LLM)

### 2. Caching

Identical inputs produce approximately the same output. A simple content-addressable cache (Redis or in-memory with TTL) could eliminate 20–30% of API calls for repeated topics.

### 3. Prompt Compression

Long prompts cost more. The current `buildGeneratePostPrompt` includes detailed format instructions. These can be shortened or moved to the system message to reduce token usage.

### 4. Batch Processing

If users generate multiple posts at once, they can be batched into a single LLM call requesting N outputs, rather than N individual calls.

## Recommendation: GPT-4o-mini as First Paid Upgrade

For a real production deployment, the single highest-impact change would be switching from `gpt-oss-120b:free` to **GPT-4o-mini** (`gpt-4o-mini-2024-07-18` via OpenRouter at ~$0.60/M tokens). Benefits:

- Dramatically better output quality and coherence
- Reliable availability (OpenRouter paid tier)
- Context window of 128k tokens
- Data not used for training
- Cost still under $5/mo for moderate usage (10k requests)

This alone would eliminate most of the quality caveats in the current system.
