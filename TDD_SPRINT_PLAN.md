# TDD Sprint Plan

This project will be implemented using test-driven development. Each sprint must follow the same sequence:

1. Write or update the failing test first.
2. Run the targeted test and confirm it fails for the expected reason.
3. Implement the smallest production code needed to pass.
4. Run the targeted test and confirm it passes.
5. Run the broader test suite for regression confidence.
6. Refactor only after the test is green.
7. Do not move to the next sprint until the sprint confirmation gate is satisfied.

---

## Sprint 1: Project Scaffold and Health Check

### Goal
Create the Node.js, Express, TypeScript, and test foundation required for the backend API.

### Test First
Add an integration test for:

- `GET /health`
- Expected response:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

### Implementation
Create the required base structure:

- `package.json`
- `tsconfig.json`
- `.env.example`
- `src/app.ts`
- `src/server.ts`
- `src/middleware/errorHandler.ts`
- `src/utils/logger.ts`
- test configuration

### Confirmation Gate

- `GET /health` test passes.
- Test runner can execute TypeScript tests.
- App can be imported without starting the HTTP server.

---

## Sprint 2: File Model, Constants, and Database Setup

### Goal
Define the MongoDB file document shape and shared constants.

### Test First
Add model/unit tests that verify:

- A valid file document can be created.
- `status` only accepts:
  - `upload_initiated`
  - `scan_in_progress`
  - `approved`
  - `rejected`
- `type` only accepts:
  - `image`
  - `video`
  - `audio`
  - `document`
- Rejected files may store `moderationReason`.

### Implementation
Create:

- `src/config/db.ts`
- `src/models/File.ts`
- `src/utils/constants.ts`
- `src/types/index.ts`

### Confirmation Gate

- File model validation tests pass.
- Invalid statuses and invalid file types are rejected.

---

## Sprint 3: Validation and Standard Error Handling

### Goal
Create reusable validation and error handling before adding business endpoints.

### Test First
Add tests that verify:

- Invalid request bodies return the standard error shape.
- Validation errors use `VALIDATION_ERROR`.
- Unknown errors use `INTERNAL_ERROR`.

Expected error shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {}
  }
}
```

### Implementation
Create:

- `src/middleware/validate.ts`
- shared application error type/helper
- global `errorHandler`

### Confirmation Gate

- Validation middleware tests pass.
- Error responses consistently match the README contract.

---

## Sprint 4: Create File Records

### Goal
Implement `POST /files` to simulate upload initiation.

### Test First
Add integration tests for:

- Valid file creation returns `201`.
- Created file always has `status: "upload_initiated"`.
- Missing or invalid fields return `400`.
- A provided status in the request body is ignored or rejected so clients cannot bypass moderation.

### Implementation
Create:

- `src/routes/files.routes.ts`
- `src/controllers/files.controller.ts`
- `src/services/files.service.ts`
- create-file validation schema

### Confirmation Gate

- `POST /files` tests pass.
- Created files cannot start as `approved`.

---

## Sprint 5: List Files with Moderation Filtering

### Goal
Implement `GET /files` with strict approved-only behavior by default.

### Test First
Seed test data with approved, rejected, upload-initiated, and scan-in-progress files. Add integration tests that verify:

- `GET /files` returns only approved files by default.
- Non-approved files never leak into normal user-facing responses.
- `type` query filters approved files by file type.
- Admin-style `status` query can filter by moderation state when explicitly supplied.

### Implementation
Update:

- `files.service.ts`
- `files.controller.ts`
- `files.routes.ts`

### Confirmation Gate

- Default list response includes only `approved` files.
- Audit logging occurs when non-approved files are filtered out.

---

## Sprint 6: Update File Moderation Status

### Goal
Implement `PATCH /files/:id/status` to simulate moderation pipeline outcomes.

### Test First
Add integration tests that verify:

- Existing files can be updated to `approved`.
- Existing files can be updated to `rejected`.
- `moderationReason` is required when status is `rejected`.
- Unsupported statuses return `400`.
- Unknown file IDs return `404`.

### Implementation
Update:

- file status validation schema
- `files.service.ts`
- `files.controller.ts`
- `files.routes.ts`

### Confirmation Gate

- Status update tests pass.
- Status update events are logged.

---

## Sprint 7: Recommendation Keyword Engine

### Goal
Implement approved-media recommendation without AI dependency.

### Test First
Add service tests that verify:

- Keywords are extracted from post content.
- Stopwords are removed.
- Only approved files are considered.
- Files are scored by overlap with file name and tags.
- Results are sorted by descending score.
- No approved files returns the required empty-library message.
- Approved files with no relevant matches return the required no-match message.

### Implementation
Create:

- `src/services/recommendation.service.ts`

### Confirmation Gate

- Recommendation service tests pass.
- Rejected and pending files are never included in recommendations.

---

## Sprint 8: Recommend Media Endpoint

### Goal
Expose the recommendation engine through `POST /ai/recommend-media`.

### Test First
Add integration tests for:

- Valid post content returns ranked recommendations.
- Empty or weak post content returns `400`.
- No approved media returns:

```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "message": "No approved media files are available in the library."
  }
}
```

- No relevant matches returns:

```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "message": "No files matched the content of this post."
  }
}
```

### Implementation
Create or update:

- `src/routes/ai.routes.ts`
- `src/controllers/ai.controller.ts`
- request validation schemas

### Confirmation Gate

- `POST /ai/recommend-media` tests pass.
- Response never contains non-approved files.

---

## Sprint 9: AI Service, Post Generation, and Hashtags

### Goal
Implement LLM prompt orchestration behind a service boundary.

### Test First
Add unit and integration tests that verify:

- Controllers never call the AI client directly.
- `POST /ai/generate-post` validates prompt length.
- Short prompt returns:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Prompt is too short to generate meaningful content. Please provide more detail.",
    "details": {}
  }
}
```

- Valid generation returns `primary`, `variations`, and `hashtags`.
- `variations` defaults to `3` and is capped at `5`.
- `POST /ai/suggest-hashtags` returns hashtag suggestions.

### Implementation
Create:

- `src/services/ai.service.ts`
- `src/utils/aiClient.ts`
- prompt builders:
  - `buildGeneratePostPrompt`
  - `buildHashtagPrompt`
  - `buildMediaRecommendationPrompt`

Use mocked AI responses in tests.

### Confirmation Gate

- AI endpoint tests pass with mocked AI client.
- No controller imports the OpenAI client.

---

## Sprint 10: AI Failure Handling, Seed Data, and Submission Artifacts

### Goal
Finish production-readiness requirements and sample outputs.

### Test First
Add tests that verify:

- AI unavailable returns `503` with `AI_UNAVAILABLE`.
- AI timeout returns `504` with `AI_TIMEOUT`.
- Retrieval succeeds but AI fails returns retrieval results with AI unavailable flagged.
- Database errors return `DB_ERROR` where applicable.
- Seed script creates at least 10 files across all file types and statuses.

### Implementation
Create or update:

- AI timeout wrapper using `AI_TIMEOUT_MS`
- service-level fallback responses
- `src/scripts/seed.ts`
- `SAMPLE_OUTPUTS.md`
- final README alignment if implementation details changed

### Confirmation Gate

- Full test suite passes.
- Seed script runs successfully.
- `SAMPLE_OUTPUTS.md` contains all required examples.
- README, implementation, and tests describe the same behavior.

---

## Sprint Tracking Checklist

- [x] Sprint 1: Project Scaffold and Health Check
- [ ] Sprint 2: File Model, Constants, and Database Setup
- [ ] Sprint 3: Validation and Standard Error Handling
- [ ] Sprint 4: Create File Records
- [ ] Sprint 5: List Files with Moderation Filtering
- [ ] Sprint 6: Update File Moderation Status
- [ ] Sprint 7: Recommendation Keyword Engine
- [ ] Sprint 8: Recommend Media Endpoint
- [ ] Sprint 9: AI Service, Post Generation, and Hashtags
- [ ] Sprint 10: AI Failure Handling, Seed Data, and Submission Artifacts
