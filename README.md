# Amiri Content Agent

## Agent Context

This README is the single source of truth for this project. Before writing any code, read this document in full. Every architectural decision, naming convention, constraint, and expected behaviour is defined here. Do not deviate from these specifications unless explicitly instructed.

---

## 1. Project Summary

Build a production-ready Node.js/Express REST API that powers two core systems:

1. **Files & Docs Module** — a media library with upload state tracking and strict moderation enforcement
2. **AI-Assisted Post Creation** — an LLM-backed system for generating post content, suggesting hashtags, and recommending relevant approved media assets

The frontend (React + TypeScript + TanStack Router + Zustand) is already built and will consume this API. You are responsible for the backend only.

### Backend Workflow System Context

In the production system, the file-processing workflow is already implemented on AWS. The development backend for this assessment must orchestrate and simulate the same workflow states and outcomes.

- File uploads are processed through AWS services: S3 for object storage, Lambda for processing, and Step Functions for moderation pipeline orchestration.
- Each uploaded file enters a moderation scan pipeline before it can be used by the Files & Docs module or AI-assisted media recommendation flow.
- The development backend must simulate the different workflow instances by creating and updating file records through the defined moderation states.
- Approved files become available in the Files & Docs module, asset picker, retrieval results, and AI media recommendations.
- Rejected files are not visible to users, are not eligible for recommendations, and must remain flagged with a `moderationReason` when available.

---

## 2. Core Functional Requirements

The backend must implement these six core functional requirements:

1. **Create file records**
   - `POST /files`
   - Simulate upload initiation with `status: "upload_initiated"`.

2. **List files with strict moderation filtering**
   - `GET /files`
   - User-facing results must only expose `status: "approved"` files unless explicitly using admin-style filters.

3. **Update file moderation status**
   - `PATCH /files/:id/status`
   - Simulate the moderation pipeline outcome by marking files as `approved` or `rejected`.

4. **Generate AI-assisted post content**
   - `POST /ai/generate-post`
   - Generate primary post copy, variations, and hashtags from a prompt.

5. **Recommend approved media for post content**
   - `POST /ai/recommend-media`
   - Match post content against approved file names/tags and return ranked recommendations.

6. **Suggest hashtags from post content**
   - `POST /ai/suggest-hashtags`
   - Generate hashtag suggestions from existing post text.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB (via Mongoose) |
| AI Integration | OpenAI API (or equivalent LLM) |
| API Protocol | REST |
| Config Management | dotenv |
| Validation | zod |
| Logging | winston or morgan |

---

## 4. Core Constraints (Read Before Writing Any Code)

These are non-negotiable requirements that must be enforced at every layer:

- **Only files with `status: "approved"` may appear in any recommendation, asset picker, or retrieval result.** Rejected or pending files must never leak into any response.
- **The backend must simulate the AWS S3/Lambda/Step Functions moderation workflow locally.** API actions should represent the same state transitions and final visibility rules used by the production workflow.
- **All logic must be separated by concern.** No business logic inside route files. No DB queries inside AI service files. See the project structure below.
- **All endpoints must handle failure gracefully.** AI timeouts, empty inputs, no matching files, and DB errors each have defined fallback behaviours.
- **No direct local file uploads in the asset picker flow.** Media attachment always goes through the Files & Docs library.

---

## 5. File Moderation States

Every file in the system has one of four statuses. The transition is one-directional and simulates an AWS Step Functions pipeline.

```
upload_initiated -> scan_in_progress -> approved
                                     -> rejected
```

| Status | Visible to user | Eligible for recommendations |
|---|---|---|
| `upload_initiated` | No | No |
| `scan_in_progress` | No | No |
| `approved` | Yes | Yes |
| `rejected` | No | No |

---

## 6. Project Structure

This is the required directory and file layout. Create all files and folders exactly as shown.

```
tongston-assessment/
├── src/
│   ├── config/
│   │   └── db.ts                    # MongoDB connection setup
│   │
│   ├── models/
│   │   └── File.ts                  # Mongoose schema for file documents
│   │
│   ├── routes/
│   │   ├── files.routes.ts          # Route definitions for /files
│   │   └── ai.routes.ts             # Route definitions for /ai/*
│   │
│   ├── controllers/
│   │   ├── files.controller.ts      # Request/response handling for file routes
│   │   └── ai.controller.ts         # Request/response handling for AI routes
│   │
│   ├── services/
│   │   ├── ai.service.ts            # All LLM prompt orchestration logic
│   │   ├── files.service.ts         # All file query and update logic
│   │   └── recommendation.service.ts # Media matching and ranking logic
│   │
│   ├── middleware/
│   │   ├── validate.ts              # Request body validation middleware (zod)
│   │   └── errorHandler.ts          # Global error handling middleware
│   │
│   ├── utils/
│   │   ├── logger.ts                # Logging utility (winston)
│   │   ├── aiClient.ts              # OpenAI client initialisation
│   │   └── constants.ts             # Shared enums and constants (e.g. FileStatus)
│   │
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript types and interfaces
│   │
│   └── app.ts                       # Express app setup, middleware registration
│
├── .env                             # Environment variables (never commit)
├── .env.example                     # Template for required env vars
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Data Model

### File Document (MongoDB)

```typescript
{
  _id: ObjectId,
  name: string,           // original filename
  type: "image" | "video" | "audio" | "document",
  size: number,           // in bytes
  url: string,            // storage URL (simulated S3 path)
  tags: string[],         // optional, used for recommendation matching
  uploadDate: Date,
  status: "upload_initiated" | "scan_in_progress" | "approved" | "rejected",
  moderationReason?: string,  // populated if rejected
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. API Endpoints

### Files Module

#### GET /files
Returns a list of files. Supports query filters.

Query params:
- `type` — filter by `image | video | audio | document`
- `status` — filter by moderation status (admin use; user-facing calls should always default to `approved`)

Response:
```json
{
  "success": true,
  "data": [ /* array of file objects */ ],
  "count": 12
}
```

#### PATCH /files/:id/status
Simulates an AWS moderation pipeline status update.

Request body:
```json
{
  "status": "approved" | "rejected",
  "moderationReason": "optional, required if rejected"
}
```

Response:
```json
{
  "success": true,
  "data": { /* updated file object */ }
}
```

#### POST /files
Simulates a file upload initiation. Creates a file record with `status: "upload_initiated"`.

Request body:
```json
{
  "name": "product-launch.png",
  "type": "image",
  "size": 204800,
  "url": "https://s3.example.com/files/product-launch.png",
  "tags": ["product", "launch", "marketing"]
}
```

---

### AI Module

#### POST /ai/generate-post

Generates post content from a user prompt.

Request body:
```json
{
  "prompt": "Write a post about our new product launch",
  "tone": "professional" | "casual" | "excited",   // optional, default: professional
  "variations": 3                                   // optional, default: 3, max: 5
}
```

Response:
```json
{
  "success": true,
  "data": {
    "primary": "We are thrilled to announce...",
    "variations": [
      "Exciting news — our new product...",
      "Today marks a new chapter for..."
    ],
    "hashtags": ["#ProductLaunch", "#Innovation"]
  }
}
```

Validation rules:
- `prompt` must be present and at least 10 characters
- If `prompt` is too short or empty, return a structured 400 with message: `"Prompt is too short to generate meaningful content. Please provide more detail."`

#### POST /ai/recommend-media

Returns a ranked list of approved files relevant to the given post content.

Request body:
```json
{
  "postContent": "We are launching a new product next week..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "file": { /* approved file object */ },
        "score": 0.87,
        "matchReason": "File tags match post keywords: product, launch"
      }
    ],
    "totalMatched": 4
  }
}
```

Edge case responses:
- No approved files in library: `{ "success": true, "data": { "recommendations": [], "message": "No approved media files are available in the library." } }`
- No relevant matches found: `{ "success": true, "data": { "recommendations": [], "message": "No files matched the content of this post." } }`

#### POST /ai/suggest-hashtags

Generates hashtag suggestions from post content.

Request body:
```json
{
  "postContent": "We are launching a new product next week..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "hashtags": ["#ProductLaunch", "#Innovation", "#NewRelease"]
  }
}
```

---

## 9. AI Service Design

All LLM calls live exclusively in `src/services/ai.service.ts`. Controllers must never call the OpenAI client directly.

### Prompt Orchestration Pattern

Each AI feature has its own prompt builder function that injects context before sending to the LLM:

```
buildGeneratePostPrompt(prompt, tone, variations) -> string
buildHashtagPrompt(postContent) -> string
buildMediaRecommendationPrompt(postContent, fileMetadataList) -> string
```

### Timeout Handling

All LLM calls must be wrapped with a timeout (default: 15 seconds). On timeout:
- Log the event with `logger.warn`
- Return a structured fallback response with `success: false` and a clear user-facing message
- Do not throw an unhandled error to the client

### Fallback Behaviour by Scenario

| Scenario | Expected Response |
|---|---|
| AI service unavailable | `503` with message: `"Content generation is temporarily unavailable. Please try again shortly."` |
| AI timeout | `504` with message: `"The request took too long. Please try again."` |
| Empty/weak user input | `400` with message describing why the input was insufficient |
| No files eligible to recommend | `200` with empty recommendations array and explanatory message |
| Retrieval succeeds but AI fails | Return retrieval results only, flag AI portion as unavailable |
| AI succeeds but no approved file matches | Return AI content, return empty recommendations with message |

---

## 10. Recommendation Logic

Located in `src/services/recommendation.service.ts`.

### Minimum Implementation (Required)

Keyword matching between post content and file metadata:

1. Extract keywords from `postContent` (tokenise, lowercase, strip stopwords)
2. Query MongoDB for all `status: "approved"` files
3. For each file, compute a match score based on keyword overlap with `name` and `tags`
4. Sort by score descending, return top results (default: top 5)

### Bonus Implementation

Replace or augment keyword matching with vector embeddings:

1. Generate an embedding for `postContent` using the OpenAI embeddings API
2. Store embeddings on file documents at upload time
3. Compute cosine similarity between post embedding and file embeddings
4. Rank and return top matches

---

## 11. Error Handling

All errors must flow through `src/middleware/errorHandler.ts`.

Standard error response shape:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Prompt is too short to generate meaningful content.",
    "details": {}
  }
}
```

Error codes to implement: `VALIDATION_ERROR`, `NOT_FOUND`, `AI_UNAVAILABLE`, `AI_TIMEOUT`, `DB_ERROR`, `INTERNAL_ERROR`

---

## 12. Logging

Use `src/utils/logger.ts` for all logging. Do not use `console.log` in production code paths.

Log the following events:
- Every incoming request (method, path, timestamp)
- Every LLM call (endpoint called, prompt length, response time)
- Every AI timeout or failure
- Every file status update
- Any case where a rejected/non-approved file was filtered out of results (for audit trail)

---

## 13. Environment Variables

Define all required variables in `.env.example`:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tongston_assessment
OPENAI_API_KEY=your_openai_api_key_here
AI_TIMEOUT_MS=15000
MAX_RECOMMENDATIONS=5
NODE_ENV=development
```

---

## 14. Seed Data

Provide a seed script at `src/scripts/seed.ts` that populates the database with at least 10 file documents across all types and statuses (including some rejected and some pending), so the recommendation and filtering logic can be tested immediately without manual setup.

---

## 15. Sample Outputs (Required for Submission)

Create a file at `SAMPLE_OUTPUTS.md` containing:

- At least 3 example prompts sent to `POST /ai/generate-post` and their full responses
- At least 2 examples of `POST /ai/recommend-media` with matching and non-matching scenarios
- At least 1 example of each edge case response (AI failure, empty input, no results)
