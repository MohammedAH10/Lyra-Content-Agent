# Lyra Content Agent — API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:3000` (default)
**Protocol:** REST / JSON
**Authentication:** None (assessment scope)

---

## Overview

The Lyra Content Agent API provides two core systems:

1. **Files & Docs Module** — A media library with upload tracking and content moderation
2. **AI-Assisted Content Creation** — LLM-powered post generation, hashtag suggestions, and media recommendations

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file from the template:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lyra_content
OPENAI_API_KEY=your_openrouter_api_key
AI_TIMEOUT_MS=15000
MAX_RECOMMENDATIONS=5
NODE_ENV=development
```

> **Note:** The API uses OpenRouter as the LLM gateway. Set `OPENAI_API_KEY` to your OpenRouter API key. The default model is `openai/gpt-oss-120b:free`. You can override it with `AI_MODEL=your-model-id`.

### 3. Seed the database (optional)

```bash
npm run seed
```

This populates 12 sample file records across all moderation statuses for testing.

### 4. Start the server

```bash
npm run dev     # Development with hot reload
npm start       # Production from compiled output
```

---

## Files & Docs Module

All endpoints return a standard response shape:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { }
  }
}
```

### Create File

Initiates a file upload record. The file enters the moderation pipeline with status `upload_initiated`.

```
POST /files
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Original filename |
| `type` | string | Yes | One of: `image`, `video`, `audio`, `document` |
| `size` | number | Yes | File size in bytes (minimum 0) |
| `url` | string | Yes | Storage URL (simulated S3 path) |
| `tags` | string[] | No | Array of tags for recommendation matching |

**Example:**
```bash
curl -X POST http://localhost:3000/files \
  -H "Content-Type: application/json" \
  -d '{
    "name": "product-launch.png",
    "type": "image",
    "size": 204800,
    "url": "https://s3.example.com/files/product-launch.png",
    "tags": ["product", "launch", "marketing"]
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "69f...",
    "name": "product-launch.png",
    "type": "image",
    "size": 204800,
    "url": "https://s3.example.com/files/product-launch.png",
    "tags": ["product", "launch", "marketing"],
    "status": "upload_initiated",
    "createdAt": "2026-04-30T10:00:00.000Z",
    "updatedAt": "2026-04-30T10:00:00.000Z"
  }
}
```

> **Note:** Clients cannot set the `status` field. All new files start as `upload_initiated` to prevent moderation bypass.

---

### List Files

Returns a list of files with moderation filtering.

```
GET /files
```

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | Filter by file type: `image`, `video`, `audio`, `document` |
| `status` | string | Filter by moderation status. **Omit this for user-facing calls** to get only approved files. |

**Default behavior (no status param):** Returns only `approved` files.

**Example — User-facing (approved only):**
```bash
curl "http://localhost:3000/files"
```

**Example — Filter by type:**
```bash
curl "http://localhost:3000/files?type=image"
```

**Example — Admin view (all statuses):**
```bash
curl "http://localhost:3000/files?status=approved"
curl "http://localhost:3000/files?status=rejected"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "69f...",
      "name": "product-launch.png",
      "type": "image",
      "size": 204800,
      "url": "https://s3.example.com/files/product-launch.png",
      "tags": ["product", "launch", "marketing"],
      "status": "approved",
      "createdAt": "2026-04-30T10:00:00.000Z",
      "updatedAt": "2026-04-30T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Update File Status

Simulates a moderation pipeline outcome. Transitions a file from `upload_initiated` or `scan_in_progress` to `approved` or `rejected`.

```
PATCH /files/:id/status
```

**URL parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | string | MongoDB ObjectId of the file |

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | string | Yes | One of: `approved`, `rejected` |
| `moderationReason` | string | Required if rejected | Reason for rejection |

**Example — Approve:**
```bash
curl -X PATCH http://localhost:3000/files/69f.../status \
  -H "Content-Type: application/json" \
  -d '{ "status": "approved" }'
```

**Example — Reject:**
```bash
curl -X PATCH http://localhost:3000/files/69f.../status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "moderationReason": "Content violates community guidelines"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "69f...",
    "name": "product-launch.png",
    "status": "approved",
    ...
  }
}
```

**Errors:**
- `404 NOT_FOUND` — File ID does not exist
- `400 VALIDATION_ERROR` — Missing `moderationReason` when status is `rejected`, or invalid status value

---

## AI Module

### Generate Post

Generates social media post content from a user prompt using LLM.

```
POST /ai/generate-post
```

**Request body:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `prompt` | string | Yes | — | Content description (minimum 10 characters) |
| `tone` | string | No | `professional` | One of: `professional`, `casual`, `excited` |
| `variations` | number | No | `3` | Number of variations to generate (max 5) |

**Example:**
```bash
curl -X POST http://localhost:3000/ai/generate-post \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a post about our new AI-powered product launch for small businesses",
    "tone": "professional",
    "variations": 2
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "primary": "We're excited to introduce our new AI-powered platform designed specifically for small businesses...",
    "variations": [
      "Meet the future of small business growth: our AI-driven tool automates routine tasks...",
      "Unlock your business potential with our latest AI-powered solution..."
    ],
    "hashtags": [
      "#AIforBusiness",
      "#SmallBizTech",
      "#Innovation",
      "#GrowthTools"
    ]
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` — Prompt is too short (less than 10 characters)
- `503 AI_UNAVAILABLE` — AI service is temporarily unavailable
- `504 AI_TIMEOUT` — The request took too long (default 15s timeout)

---

### Suggest Hashtags

Generates hashtag suggestions from existing post content.

```
POST /ai/suggest-hashtags
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `postContent` | string | Yes | The post text to extract hashtags from |

**Example:**
```bash
curl -X POST http://localhost:3000/ai/suggest-hashtags \
  -H "Content-Type: application/json" \
  -d '{
    "postContent": "We are launching a revolutionary new cloud platform that helps teams collaborate in real-time with AI-powered insights"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hashtags": [
      "#CloudPlatform",
      "#AICollaboration",
      "#RealTimeTeamwork",
      "#TechInnovation",
      "#FutureOfWork",
      "#AIInsights",
      "#CollaborationTools",
      "#CloudComputing"
    ]
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` — `postContent` is empty
- `503 AI_UNAVAILABLE` — AI service is temporarily unavailable
- `504 AI_TIMEOUT` — The request took too long

---

### Recommend Media

Returns a ranked list of approved media files relevant to a given post. Uses keyword matching between post content and file names/tags.

```
POST /ai/recommend-media
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `postContent` | string | Yes | The post content to match against (minimum 10 characters) |

**Example:**
```bash
curl -X POST http://localhost:3000/ai/recommend-media \
  -H "Content-Type: application/json" \
  -d '{
    "postContent": "Product launch marketing campaign announcement"
  }'
```

**Response (200) — Matched files:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "file": {
          "id": "69f...",
          "name": "product-launch-campaign.png",
          "type": "image",
          "size": 204800,
          "url": "https://s3.example.com/files/product-launch-campaign.png",
          "tags": ["product", "launch", "marketing", "campaign"],
          "status": "approved"
        },
        "score": 4,
        "matchReason": "File tags/name match post keywords: product, launch, marketing, campaign"
      }
    ],
    "totalMatched": 1
  }
}
```

**Response (200) — No approved files:**
```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "message": "No approved media files are available in the library."
  }
}
```

**Response (200) — No relevant matches:**
```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "message": "No files matched the content of this post."
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` — `postContent` is too short (less than 10 characters)

> **Note:** Only `approved` files are ever returned in recommendations. Rejected and pending files are excluded.

---

## Health Check

```
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

## Error Reference

| HTTP Code | Error Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid or missing request data |
| 404 | `NOT_FOUND` | Resource does not exist |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 500 | `DB_ERROR` | Database operation failed |
| 503 | `AI_UNAVAILABLE` | AI service temporarily unavailable |
| 504 | `AI_TIMEOUT` | AI request exceeded timeout |

---

## File Moderation States

| Status | Visible to user | Eligible for recommendations |
|---|---|---|
| `upload_initiated` | No | No |
| `scan_in_progress` | No | No |
| `approved` | Yes | Yes |
| `rejected` | No | No |

The moderation workflow is one-directional:

```
upload_initiated → scan_in_progress → approved
                                     → rejected
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Server port |
| `MONGODB_URI` | No | In-memory fallback | MongoDB connection string. Falls back to in-memory MongoDB if not set or unreachable |
| `OPENAI_API_KEY` | Yes | — | OpenRouter API key |
| `AI_MODEL` | No | `openai/gpt-oss-120b:free` | LLM model identifier |
| `AI_TIMEOUT_MS` | No | `15000` | AI request timeout in milliseconds |
| `MAX_RECOMMENDATIONS` | No | `5` | Maximum number of media recommendations to return |
| `NODE_ENV` | No | `development` | Node environment |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run the full test suite |
| `npm run seed` | Seed the database with sample files |
| `npm run test:watch` | Run tests in watch mode |

---

## Constraints

- Only files with `status: "approved"` appear in list responses, recommendations, and asset pickers
- Media attachment always goes through the Files & Docs library (no direct local uploads)
- AI calls are wrapped with a configurable timeout (default 15 seconds)
- All errors are handled gracefully with structured fallback responses
- Business logic is separated by concern (routes → controllers → services → models)
