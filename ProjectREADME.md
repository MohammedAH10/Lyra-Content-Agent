# T-World AI-Powered Files, Docs & Smart Posting System

This README structures the Tongston AI Engineering assessment into a practical build plan. It covers the full project architecture, implementation flow, and 15 achievable sprints for satisfying the requirements in both assessment documents.

## Recommended Project Shape

Build a small full-stack app:

```txt
t-world-ai-assistant/
  backend/
    src/
      app.ts
      server.ts
      config/
        env.ts
        openai.ts
        database.ts
      routes/
        ai.routes.ts
        files.routes.ts
        posts.routes.ts
        workflow.routes.ts
      controllers/
        ai.controller.ts
        files.controller.ts
        posts.controller.ts
        workflow.controller.ts
      services/
        ai/
          aiOrchestrator.service.ts
          promptBuilder.service.ts
          modelRouter.service.ts
          outputParser.service.ts
        retrieval/
          mediaRecommendation.service.ts
          keywordScoring.service.ts
          semanticScoring.service.ts
        files/
          file.service.ts
          moderation.service.ts
          s3Reference.service.ts
        posts/
          postDraft.service.ts
        logging/
          auditLog.service.ts
      models/
        FileAsset.ts
        PostDraft.ts
        AiLog.ts
        UserContext.ts
      validators/
        ai.validator.ts
        file.validator.ts
      middleware/
        error.middleware.ts
        requestLogger.middleware.ts
        timeout.middleware.ts
      utils/
        safeJson.ts
        text.ts
        scoring.ts
    tests/
    package.json
    README.md

  frontend/
    src/
      main.tsx
      routes/
      stores/
        usePostComposerStore.ts
        useFilesStore.ts
      api/
        aiApi.ts
        filesApi.ts
      components/
        PostComposer/
        AssetPicker/
        FilesModule/
        AiSuggestions/
    package.json

  docs/
    architecture.md
    ai-workflow.md
    model-cost-reflection.md
    production-readiness.md
    sample-outputs.md
```

Use:

- Backend: Node.js, Express, TypeScript
- Database: MongoDB / Mongoose
- Frontend: React, TypeScript, TanStack Router, Zustand
- AI: OpenAI API or compatible provider
- Retrieval: keyword scoring first, optional embeddings later
- AWS simulation: store S3 object keys, bucket names, moderation workflow status, Lambda/Step Function callback simulation

## Core System Flow

```txt
User writes topic/partial post
  -> POST /ai/generate-post
  -> validate input
  -> fetch user context + approved file context
  -> model router chooses cheap/default/premium/fallback model
  -> prompt builder injects context
  -> AI service calls LLM with timeout
  -> parser validates structured JSON output
  -> audit log written
  -> response returned to frontend

User clicks Attach Media
  -> frontend opens Files & Docs asset picker
  -> GET /files?status=approved
  -> POST /ai/recommend-media
  -> retrieval service filters approved files only
  -> keyword/semantic ranking
  -> recommendations returned with reasons
```

## 15 Achievable Sprints

### Sprint 1: Requirement Mapping & Scope Lock

Goal: Convert the assessment into a clear implementation checklist.

Status: Completed. See `docs/requirements-checklist.md` and `docs/architecture.md`.

Tasks:

- Extract all mandatory requirements.
- Separate must-have from bonus.
- Define MVP scope:
  - Files & Docs backend
  - moderation states
  - approved-only asset picker
  - AI post generation
  - media recommendation
  - hashtag suggestions
  - logging
  - fallback behavior
  - documentation

Deliverables:

- `docs/requirements-checklist.md`
- `docs/architecture.md` draft

Acceptance check:

- Every item in both assessment docs has a planned place in the code or docs.

### Sprint 2: Backend Project Setup

Goal: Create a clean Express backend.

Tasks:

- Initialize backend with TypeScript.
- Add Express, Mongoose, dotenv, cors, zod/joi, OpenAI SDK.
- Add folder structure.
- Add health endpoint.

Endpoints:

```txt
GET /health
```

Deliverables:

- Backend runs locally.
- Clean route/controller/service separation.

Acceptance check:

- `npm run dev` starts backend.
- `/health` returns service status.

### Sprint 3: MongoDB Models

Goal: Define data structures early.

Models:

```ts
FileAsset {
  name,
  type: "image" | "video" | "audio" | "document",
  mimeType,
  size,
  tags,
  description,
  status: "upload_initiated" | "scan_in_progress" | "approved" | "rejected" | "pending_review",
  moderationReason,
  s3Key,
  s3Bucket,
  s3Url,
  ownerId,
  visibility,
  createdAt,
  updatedAt
}
```

```ts
PostDraft {
  userId,
  inputText,
  generatedContent,
  selectedVariation,
  acceptedOutput,
  attachedFileIds,
  status
}
```

```ts
AiLog {
  userId,
  requestType,
  inputSummary,
  modelUsed,
  latencyMs,
  success,
  fallbackUsed,
  errorMessage,
  tokenEstimate,
  createdAt
}
```

Deliverables:

- Mongoose schemas.
- Database connection helper.

Acceptance check:

- Can create/read seed file records.

### Sprint 4: Files & Docs API

Goal: Implement the Files module backend.

Endpoints:

```txt
GET /files
GET /files?type=image
GET /files?status=approved
GET /files/:id
POST /files
PATCH /files/:id/status
```

Important rule:

- Asset picker and recommendation flows must only use approved files.
- Admin/workflow endpoints may query other statuses.

Deliverables:

- File controller.
- File service.
- Validation for file creation/status updates.

Acceptance check:

- Rejected files can exist in DB.
- Rejected files do not appear in normal approved asset flows.

### Sprint 5: AWS/S3 Workflow Simulation

Goal: Show AWS awareness without needing real AWS deployment.

Tasks:

- Add simulated upload initiation.
- Store `s3Bucket`, `s3Key`, `s3Url`.
- Simulate moderation status callback from Lambda/Step Functions.

Endpoints:

```txt
POST /files/initiate-upload
PATCH /workflow/files/:id/moderation-result
```

Example states:

```txt
upload_initiated -> scan_in_progress -> approved
upload_initiated -> scan_in_progress -> rejected
```

Deliverables:

- `s3Reference.service.ts`
- `moderation.service.ts`
- Workflow callback endpoint.

Acceptance check:

- A file can move through moderation states.
- Only approved files become available for asset selection.

### Sprint 6: AI Provider & Model Router

Goal: Avoid making the solution look like a simple OpenAI wrapper.

Tasks:

- Create `aiOrchestrator.service.ts`.
- Create `modelRouter.service.ts`.
- Add timeout handling.
- Add fallback mode when AI fails.

Routing example:

```txt
Weak/simple task -> cheaper model
Structured post generation -> default model
High-quality rewrite or long post -> premium model
AI unavailable -> deterministic fallback template
```

Deliverables:

- AI service abstraction.
- Model routing comments/documentation.
- Timeout and fallback logic.

Acceptance check:

- AI calls are isolated from controllers.
- Backend can return fallback response if AI provider fails.

### Sprint 7: Prompt Design & Structured Output

Goal: Generate useful post content with predictable JSON output.

Endpoint:

```txt
POST /ai/generate-post
```

Input:

```json
{
  "topic": "education entrepreneurship in Africa",
  "tone": "professional",
  "format": "short",
  "userId": "demo-user"
}
```

Output:

```json
{
  "content": "...",
  "variations": [
    { "label": "Short", "content": "..." },
    { "label": "Professional", "content": "..." },
    { "label": "Engaging", "content": "..." }
  ],
  "improvements": ["..."],
  "relatedIdeas": ["..."],
  "fallbackUsed": false
}
```

Deliverables:

- Prompt builder.
- Output parser.
- Validation for malformed AI response.

Acceptance check:

- Empty input returns a clear validation error.
- Malformed AI response does not crash the app.

### Sprint 8: Regenerate, Edit, Accept Flow

Goal: Show product workflow, not just generation.

Endpoints:

```txt
POST /ai/regenerate-post
POST /posts/drafts
PATCH /posts/drafts/:id
POST /posts/drafts/:id/accept
```

Tasks:

- Save generated drafts.
- Allow edited content.
- Track accepted output.
- Log selected AI output.

Deliverables:

- Post draft model/service.
- Accept/regenerate flow.

Acceptance check:

- User can generate, edit, regenerate, and accept a post draft.

### Sprint 9: Keyword-Based Media Recommendation

Goal: Implement safe retrieval.

Endpoint:

```txt
POST /ai/recommend-media
```

Inputs:

```json
{
  "postContent": "We are launching a program for student entrepreneurs",
  "type": "image",
  "limit": 5
}
```

Retrieval logic:

- Fetch only `status = approved`.
- Match post text against:
  - file name
  - tags
  - description
  - type
- Score each file.
- Return ranked list with reasons.

Output:

```json
{
  "recommendations": [
    {
      "fileId": "...",
      "name": "student-workshop.jpg",
      "type": "image",
      "score": 0.87,
      "reason": "Matches student, workshop, entrepreneurship"
    }
  ],
  "noResultReason": null
}
```

Deliverables:

- `mediaRecommendation.service.ts`
- `keywordScoring.service.ts`

Acceptance check:

- Rejected files never appear.
- Low-score results are filtered out.
- If no match exists, return an empty list with a clear reason.

### Sprint 10: Hashtags, Improvements & Related Ideas

Goal: Complete the AI recommendation enhancements.

Endpoints:

```txt
POST /ai/suggest-hashtags
POST /ai/suggest-improvements
POST /ai/related-post-ideas
```

Tasks:

- Use structured prompts.
- Keep outputs short and frontend-friendly.
- Add fallback hashtag generation from keywords.

Deliverables:

- AI enhancement routes.
- Fallback logic.

Acceptance check:

- Hashtags still work if AI fails, using keyword fallback.

### Sprint 11: Logging, Traceability & Operational Awareness

Goal: Demonstrate production thinking.

Tasks:

- Log AI generation requests.
- Log recommendation requests.
- Log fallback events.
- Log provider timeout/failure.
- Log accepted post output and selected media.

Endpoints:

```txt
GET /admin/logs/ai
```

Optional if you do not want an admin route:

- Store logs internally and document how they are used.

Deliverables:

- `auditLog.service.ts`
- Logs in MongoDB.

Acceptance check:

- Every AI and recommendation request creates a trace record.

### Sprint 12: Frontend Shell

Goal: Build the React app structure.

Tasks:

- Set up Vite React TypeScript.
- Add TanStack Router.
- Add Zustand stores.
- Create routes:
  - `/`
  - `/composer`
  - `/files`

Deliverables:

- Working frontend.
- API client helpers.

Acceptance check:

- Frontend can call backend health/files endpoints.

### Sprint 13: Post Composer UI

Goal: Implement the main AI-assisted post creation experience.

UI sections:

- Topic/partial text input.
- Tone selector.
- Format selector.
- Generate button.
- Generated content area.
- Variations.
- Improvements.
- Related ideas.
- Regenerate/Edit/Accept actions.

State handling:

- Loading state.
- Error state.
- Fallback state.
- Empty input state.

Deliverables:

- `PostComposer` feature.
- Zustand post composer store.

Acceptance check:

- User can generate post content and accept a draft.

### Sprint 14: Files Module + Asset Picker UI

Goal: Replace direct local upload with Files & Docs picker.

UI sections:

- File categories:
  - All
  - Images
  - Videos
  - Audio
  - Documents
- Approved assets only in picker.
- AI recommended assets panel.
- Attach selected files to post.

Important:

- Do not allow direct upload in post composer.
- Show rejected files only in admin/files workflow view if needed, not in picker.

Deliverables:

- `FilesModule`
- `AssetPicker`
- Recommended assets UI.

Acceptance check:

- Clicking "Attach Media" opens asset picker.
- Asset picker only displays approved files.
- AI recommendations are shown separately or pinned at top.

### Sprint 15: Testing, Documentation & Final Handover

Goal: Make the submission review-ready.

Tests to include:

- Empty input returns validation error.
- Rejected file never appears in recommendations.
- Approved files appear.
- No relevant files returns empty recommendations.
- AI failure returns fallback response.
- Malformed AI output is handled.
- File status update flow works.

Required docs:

```txt
README.md
docs/architecture.md
docs/ai-workflow.md
docs/retrieval-approach.md
docs/model-cost-reflection.md
docs/production-readiness.md
docs/sample-outputs.md
```

Production-readiness note should answer:

- Most fragile part of the solution.
- What to monitor first.
- What to improve before production.
- Assumptions made.
- What another engineer needs to understand first.
- Most expensive part at scale.
- Closed model vs open-source model decision.
- Where routing/fallback logic sits.
- What must change before merging into a real codebase.

Acceptance check:

- Reviewer can run the project from README.
- Sample outputs are included.
- Assessment requirements are explicitly mapped.

## Recommended API List

Files:

```txt
GET    /files
GET    /files/:id
POST   /files
POST   /files/initiate-upload
PATCH  /files/:id/status
PATCH  /workflow/files/:id/moderation-result
```

AI:

```txt
POST /ai/generate-post
POST /ai/regenerate-post
POST /ai/recommend-media
POST /ai/suggest-hashtags
POST /ai/suggest-improvements
POST /ai/related-post-ideas
```

Posts:

```txt
POST  /posts/drafts
GET   /posts/drafts/:id
PATCH /posts/drafts/:id
POST  /posts/drafts/:id/accept
POST  /posts/drafts/:id/attach-files
```

Logs:

```txt
GET /admin/logs/ai
```

## Minimum Strong MVP

If time becomes tight, prioritize these:

1. Files API with moderation states.
2. Approved-only retrieval boundary.
3. AI post generation with structured output.
4. Media recommendation using metadata ranking.
5. Hashtag suggestions.
6. AI timeout/fallback handling.
7. Logging.
8. React post composer.
9. Asset picker using approved files only.
10. Clear documentation and sample outputs.

The strongest thing you can do is make the reviewer see that your system has boundaries: controllers do not contain business logic, AI does not bypass moderation, recommendation only sees approved files, fallbacks are explicit, and every AI action is traceable.

## AI and File Moderation Guardrails

The system needs guardrails at two levels:

1. AI text generation guardrails
2. File upload / media moderation guardrails

The key rule is: AI output and uploaded files should never become visible or usable until they pass safety checks.

### AI Text Generation Guardrails

Before generating, validate the user input.

Reject or constrain prompts involving:

- Pornographic or explicit sexual content
- Graphic violence
- Hate speech or harassment
- Self-harm instructions
- Illegal activity
- Personal data extraction
- Medical/legal/financial advice beyond general info
- Political manipulation
- Prompt injection attempts like "ignore previous instructions"

Example flow:

```txt
User prompt
  -> input safety classifier
  -> if unsafe: reject with safe message
  -> if safe: generate post
  -> output safety classifier
  -> if unsafe: block or regenerate
  -> if safe: return to frontend
```

The AI should not only trust the prompt. The system should also validate the generated output before returning it.

Example response when blocked:

```json
{
  "success": false,
  "status": "blocked",
  "reason": "The request contains unsafe or sensitive content.",
  "safeAlternative": "Try reframing the post around a professional, educational, or informational topic."
}
```

### File Upload Moderation Guardrails

Uploaded files should go through a moderation pipeline before becoming approved.

File states:

```txt
upload_initiated
scan_in_progress
approved
rejected
pending_review
```

Upload flow:

```txt
User uploads file
  -> store file reference in S3
  -> create DB record with status = upload_initiated
  -> moderation scan starts
  -> status = scan_in_progress
  -> scan image/video/audio/document via Amazon Bedrock content filter
  -> if safety score >= 80 (e.g. nudity, sexual, graphic violence, hate):
       status = rejected (auto-blocked)
  -> if safety score 50-79:
       status = pending_review (flagged for admin decision — admin UI not in scope)
  -> if safety score < 50:
       status = approved (auto-approved)
```

**Scoring tiers:**

| Score Range | Result | Responsibility |
|---|---|---|
| >= 80 | Auto-rejected | System blocks immediately |
| 50 - 79 | Pending admin review | Flagged (admin UI out of scope) |
| < 50 | Auto-approved | Available in Files & Docs |

Sensitive/offensive file checks should include:

- Nudity or sexual content
- Graphic violence
- Weapons or dangerous content
- Hate symbols
- Harassment or abusive text
- Sensitive personal information
- Illegal or harmful content
- Malware or suspicious document content
- Copyright-sensitive or policy-restricted content, if relevant

For images/videos, possible moderation providers include:

- AWS Rekognition
- Google Cloud Vision SafeSearch
- Azure Content Safety
- OpenAI vision moderation, if available in the chosen stack

For text documents, extract text first, then moderate it:

```txt
PDF/DOCX/TXT
  -> extract text
  -> run text moderation
  -> approve/reject
```

For audio/video:

```txt
Audio/video
  -> transcribe speech
  -> moderate transcript
  -> optionally scan video frames
```

### Backend Safety Rule

The most important backend rule:

```ts
recommendations and asset picker must only query files where status === "approved"
```

Even if moderation fails or a bug creates bad metadata, the retrieval layer should still enforce this.

Example:

```ts
const approvedFiles = await FileAsset.find({
  status: "approved",
  ownerId: userId
});
```

Do not allow this:

```ts
FileAsset.find({ type: "image" });
```

Because that could accidentally return rejected or pending files.

### Recommended Safety Services

Add these services to the backend:

```txt
services/
  safety/
    inputModeration.service.ts
    outputModeration.service.ts
    fileModeration.service.ts
    documentTextExtraction.service.ts
    moderationPolicy.ts
```

The policy file should define blocked categories:

```ts
export const blockedCategories = [
  "sexual",
  "sexual_minors",
  "graphic_violence",
  "hate",
  "harassment",
  "self_harm",
  "illegal_activity",
  "malware",
  "personal_sensitive_data"
];
```

### Where Guardrails Fit in the Project

AI generation:

```txt
POST /ai/generate-post
  -> validate request
  -> moderate user input
  -> generate AI output
  -> moderate AI output
  -> save log
  -> return safe output
```

File upload:

```txt
POST /files/initiate-upload
  -> create file record
  -> status = upload_initiated

PATCH /workflow/files/:id/moderation-result
  -> receive moderation result
  -> approved or rejected
```

Asset picker:

```txt
GET /files?status=approved
```

Media recommendation:

```txt
POST /ai/recommend-media
  -> fetch approved files only
  -> rank safe files only
```

### Assessment Documentation Note

Use this explanation in the assessment documentation:

```txt
The system uses layered guardrails. User prompts are moderated before generation, AI outputs are moderated before returning to the frontend, and uploaded files are moderated before becoming available in Files & Docs. Rejected or pending files are never eligible for asset picker or media recommendation flows. The retrieval layer enforces approved-only access as a final backend boundary.
```
