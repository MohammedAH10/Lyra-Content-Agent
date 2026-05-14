# Lyra Content Agent — Frontend README

## Overview

The Lyra Content Agent frontend is a **Next.js 14** application that consumes the Lyra Content Agent REST API. It provides an intuitive interface for:

- Generating AI-assisted social media posts
- Suggesting hashtags from post content
- Recommending approved media files to accompany posts
- Managing the file/media library with moderation filtering
- Connecting and publishing to **Twitter (X), Instagram, and LinkedIn**

---

## API Endpoints the Frontend Connects To

All requests are sent to the backend base URL configured via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000`).

---

### 1. Health Check

Used by the dashboard to verify API availability.

| Method | Endpoint | Source Page |
|---|---|---|
| `GET` | `/health` | `/` (Dashboard) |

**Request:** None

**Response:**
```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

### 2. Generate Post

| Method | Endpoint | Source Page |
|---|---|---|
| `POST` | `/ai/generate-post` | `/generate-post` |

**Request Body (sent from frontend):**
```json
{
  "prompt": "Write a post about our new AI-powered analytics dashboard for marketers",
  "tone": "professional",
  "variations": 3
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | Yes | Content description (min 10 chars) |
| `tone` | string | No | `professional` (default), `casual`, or `excited` |
| `variations` | number | No | Number of variations (default 3, max 5) |

**Response (received by frontend):**
```json
{
  "success": true,
  "data": {
    "primary": "We're excited to introduce our new AI-powered analytics dashboard...",
    "variations": [
      "Meet the future of marketing analytics...",
      "Unlock your marketing potential with AI-driven insights..."
    ],
    "hashtags": ["#AIAnalytics", "#MarketingTech", "#DataDriven"]
  }
}
```

**Error Responses the Frontend Must Handle:**
- `400` — Prompt too short → show inline validation error
- `503` — AI unavailable → show "Content generation is temporarily unavailable" banner
- `504` — AI timeout → show "Request took too long, please try again" message

---

### 3. Suggest Hashtags

| Method | Endpoint | Source Page |
|---|---|---|
| `POST` | `/ai/suggest-hashtags` | `/suggest-hashtags` |

**Request Body (sent from frontend):**
```json
{
  "postContent": "We are launching a revolutionary new cloud platform that helps teams collaborate in real-time with AI-powered insights"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `postContent` | string | Yes | Post text to extract hashtags from (min 1 char) |

**Response (received by frontend):**
```json
{
  "success": true,
  "data": {
    "hashtags": ["#CloudPlatform", "#AICollaboration", "#RealTimeTeamwork", "#TechInnovation"]
  }
}
```

**Error Responses the Frontend Must Handle:**
- `400` — Empty post content → inline validation
- `503` — AI unavailable → fallback message
- `504` — AI timeout → retry suggestion

---

### 4. Recommend Media

| Method | Endpoint | Source Page |
|---|---|---|
| `POST` | `/ai/recommend-media` | `/recommend-media` |

**Request Body (sent from frontend):**
```json
{
  "postContent": "Product launch marketing campaign announcement for new cloud platform"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `postContent` | string | Yes | Post content to match against files (min 10 chars) |

**Response (received by frontend) — With matches:**
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
          "uploadDate": "2026-04-30T10:00:00.000Z",
          "status": "approved",
          "moderationReason": null,
          "createdAt": "2026-04-30T10:00:00.000Z",
          "updatedAt": "2026-04-30T10:00:00.000Z"
        },
        "score": 4,
        "matchReason": "File tags/name match post keywords: product, launch, marketing, campaign"
      }
    ],
    "totalMatched": 1
  }
}
```

**Response — No approved files in library:**
```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "message": "No approved media files are available in the library."
  }
}
```

**Response — No relevant matches:**
```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "message": "No files matched the content of this post."
  }
}
```

**Frontend Display Rules:**
- Show a "No approved media available" empty state when `message` is the library-empty message
- Show a "No relevant matches" empty state when `message` is the no-match message
- Show a ranked grid with cards when `recommendations` is non-empty
- Each card shows file thumbnail, name, type, tags, match score, and match reason

---

### 5. List Files

| Method | Endpoint | Source Page |
|---|---|---|
| `GET` | `/files?type=image&status=approved` | `/files` |

**Query Parameters (sent from frontend):**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | Optional filter: `image`, `video`, `audio`, `document` |
| `status` | string | Optional filter: moderation status. Omit for approved-only view |

**Response (received by frontend):**
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
      "uploadDate": "2026-04-30T10:00:00.000Z",
      "status": "approved",
      "moderationReason": null,
      "createdAt": "2026-04-30T10:00:00.000Z",
      "updatedAt": "2026-04-30T10:00:00.000Z"
    }
  ],
  "count": 12
}
```

**Frontend Display Rules:**
- Default view shows only approved files (no `status` param sent)
- Admin filter bar allows adding `?status=rejected` or `?status=pending`
- Each file row shows status badge (color-coded), name, type, size, upload date
- Clicking a file row navigates to `/files/[id]`

---

### 6. Create File Record

| Method | Endpoint | Source Page |
|---|---|---|
| `POST` | `/files` | `/files/create` |

**Request Body (sent from frontend):**
```json
{
  "name": "product-launch.png",
  "type": "image",
  "size": 204800,
  "url": "https://s3.example.com/files/product-launch.png",
  "tags": ["product", "launch", "marketing"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Original filename |
| `type` | string | Yes | `image`, `video`, `audio`, or `document` |
| `size` | number | Yes | File size in bytes (non-negative) |
| `url` | string | Yes | Storage URL (must be valid URL) |
| `tags` | string[] | No | Tags for recommendation matching |

**Response (received by frontend):**
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
    "moderationReason": null,
    "uploadDate": "2026-04-30T10:00:00.000Z",
    "createdAt": "2026-04-30T10:00:00.000Z",
    "updatedAt": "2026-04-30T10:00:00.000Z"
  }
}
```

**Frontend Notes:**
- File enters with `upload_initiated` status automatically
- No actual file upload — this simulates an S3 upload record
- After creation, redirect to `/files/[id]` to view detail

---

### 7. Update File Moderation Status

| Method | Endpoint | Source Page |
|---|---|---|
| `PATCH` | `/files/:id/status` | `/files/[id]` |

**Request Body (sent from frontend) — Approve:**
```json
{
  "status": "approved"
}
```

**Request Body (sent from frontend) — Reject:**
```json
{
  "status": "rejected",
  "moderationReason": "Content violates community guidelines"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | string | Yes | `approved` or `rejected` |
| `moderationReason` | string | Required if rejected | Reason for rejection |

**Response (received by frontend):**
```json
{
  "success": true,
  "data": {
    "id": "69f...",
    "status": "approved",
    "...": "..."
  }
}
```

**Frontend Notes:**
- Show moderation action buttons (Approve / Reject) on file detail page
- If Reject is clicked, show a modal/prompt for `moderationReason`
- Disable buttons after action is taken

---

## Social Media Integration

### Connection Flow (OAuth 2.0)

The frontend uses **NextAuth.js** to handle OAuth 2.0 authentication for Twitter (X), Instagram, and LinkedIn.

```
User clicks "Connect {Platform}"
        │
        ▼
Frontend triggers NextAuth signIn("{provider}")
        │
        ▼
User redirected to platform's OAuth consent screen
        │
        ▼
User authorizes → Platform redirects back to NextAuth callback
        │
        ▼
NextAuth exchanges code for access token
        │
        ▼
Token stored in session/JWT
        │
        ▼
Frontend shows "Connected" status with account info
```

### Supported Providers

| Platform | OAuth Flow | Scopes Required |
|---|---|---|
| **Twitter (X)** | OAuth 2.0 PKCE | `tweet.read`, `tweet.write`, `users.read` |
| **Instagram** | OAuth 2.0 (Facebook Graph API) | `instagram_basic`, `instagram_content_publish` |
| **LinkedIn** | OAuth 2.0 | `openid`, `profile`, `w_member_social` |

### Publish Flow

```
User writes/composes post on /generate-post
        │
        ▼
User clicks "Publish to Social"
        │
        ▼
Navigated to /social/publish
        │
        ▼
PlatformSelector shows connected accounts
        │
        ▼
User selects target platforms, reviews post preview
        │
        ▼
User clicks "Publish"
        │
        ▼
Frontend calls social.service.ts for each selected platform:
  - POST to Twitter API (tweets endpoint)
  - POST to Instagram Graph API (media publish)
  - POST to LinkedIn API (ugcPosts)
        │
        ▼
Results displayed per-platform (success / failure)
```

### Data Passing Between Frontend and Social APIs

**From Frontend → Social Platform API:**

| Platform | Endpoint | Payload |
|---|---|---|
| Twitter (X) | `POST https://api.twitter.com/2/tweets` | `{ "text": "Post content with hashtags" }` |
| Instagram | `POST https://graph.facebook.com/v18.0/{ig-id}/media` | `{ "caption": "Post content", "media_type": "IMAGE", "media_url": "..." }` |
| LinkedIn | `POST https://api.linkedin.com/v2/ugcPosts` | `{ "author": "urn:li:person:{id}", "lifecycleState": "PUBLISHED", "specificContent": { "com.linkedin.ugc.ShareContent": { "shareCommentary": { "text": "..." }, "shareMediaCategory": "NONE" } } }` |

> **Note:** The social platform APIs are called **directly from the frontend** (or optionally proxied through the backend). The Lyra backend itself does not include social publishing endpoints — social integration lives entirely in the frontend layer using NextAuth-managed tokens.

---

## Frontend Service Layer (Axios)

All API calls to the Lyra backend go through `src/services/api.ts`:

```typescript
// Base Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Response interceptor — unwraps data, normalizes errors
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const errorResponse = err.response?.data || {
      success: false,
      error: { code: 'NETWORK_ERROR', message: err.message },
    };
    return Promise.reject(errorResponse);
  }
);
```

### Service Methods

| Service File | Function | HTTP Call |
|---|---|---|
| `ai.service.ts` | `generatePost(prompt, tone?, variations?)` | `POST /ai/generate-post` |
| `ai.service.ts` | `suggestHashtags(postContent)` | `POST /ai/suggest-hashtags` |
| `ai.service.ts` | `recommendMedia(postContent)` | `POST /ai/recommend-media` |
| `files.service.ts` | `fetchFiles(params?)` | `GET /files?type=&status=` |
| `files.service.ts` | `createFile(data)` | `POST /files` |
| `files.service.ts` | `updateFileStatus(id, status, reason?)` | `PATCH /files/:id/status` |

---

## Error Handling Strategy (Frontend)

| Scenario | Frontend Behaviour |
|---|---|
| `400 VALIDATION_ERROR` | Show inline form validation error with the message from backend |
| `404 NOT_FOUND` | Show "Resource not found" alert on the page |
| `503 AI_UNAVAILABLE` | Show warning banner with "Content generation unavailable" |
| `504 AI_TIMEOUT` | Show "Request timed out" with a retry button |
| `500 INTERNAL_ERROR` | Show generic "Something went wrong" with a contact-support message |
| Network error | Show "Cannot reach server" with retry button |
| Rate limiting | Show "Too many requests, please wait" message |

---

## TypeScript Types (Shared Between Frontend & Backend)

### API Response Envelope

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### File

```typescript
type FileType = 'image' | 'video' | 'audio' | 'document';
type FileStatus = 'upload_initiated' | 'scan_in_progress' | 'approved' | 'rejected';

interface FileRecord {
  id: string;
  name: string;
  type: FileType;
  size: number;
  url: string;
  tags: string[];
  uploadDate: string;
  status: FileStatus;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Post Generation

```typescript
type Tone = 'professional' | 'casual' | 'excited';

interface GeneratePostRequest {
  prompt: string;
  tone?: Tone;
  variations?: number;
}

interface GeneratePostResult {
  primary: string;
  variations: string[];
  hashtags: string[];
}
```

### Media Recommendation

```typescript
interface MediaRecommendation {
  file: FileRecord;
  score: number;
  matchReason: string;
}

interface RecommendMediaResult {
  recommendations: MediaRecommendation[];
  totalMatched: number;
  message?: string;
}
```

### Hashtags

```typescript
interface SuggestHashtagsRequest {
  postContent: string;
}

interface SuggestHashtagsResult {
  hashtags: string[];
}
```

### Social

```typescript
type SocialPlatform = 'twitter' | 'instagram' | 'linkedin';

interface ConnectedAccount {
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  avatarUrl?: string;
  connectedAt: string;
}

interface PublishRequest {
  content: string;
  mediaUrls?: string[];
  platforms: SocialPlatform[];
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API URL (e.g., `http://localhost:3000` or Vercel URL) |
| `NEXTAUTH_URL` | Yes | Frontend deployment URL for NextAuth callbacks |
| `NEXTAUTH_SECRET` | Yes | Encryption secret for NextAuth JWT |
| `TWITTER_CLIENT_ID` | Conditionally | Twitter/X OAuth 2.0 client ID |
| `TWITTER_CLIENT_SECRET` | Conditionally | Twitter/X OAuth 2.0 client secret |
| `INSTAGRAM_CLIENT_ID` | Conditionally | Instagram OAuth client ID |
| `INSTAGRAM_CLIENT_SECRET` | Conditionally | Instagram OAuth client secret |
| `LINKEDIN_CLIENT_ID` | Conditionally | LinkedIn OAuth client ID |
| `LINKEDIN_CLIENT_SECRET` | Conditionally | LinkedIn OAuth client secret |

---

## Quick Start

```bash
# 1. Create the Next.js project
npx create-next-app@latest lyra-frontend --typescript --tailwind --app

# 2. Install additional dependencies
npm install axios zustand next-auth
npm install -D @types/node

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL and social auth keys

# 4. Build folder structure as defined in FrontendStructure.md

# 5. Run development server
npm run dev
# Frontend starts at http://localhost:3001
```
