# Deploying Lyra as One Vercel App

The app now deploys as a single Vercel project:

- Next.js frontend is served from `frontend/`
- Express API is served from `api/index.ts`
- Frontend calls the backend through same-origin `/api`
- `/health` is kept as a direct health-check route

## Required Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```bash
MONGODB_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-oss-120b:free
BLOB_READ_WRITE_TOKEN=your_vercel_blob_read_write_token
AI_TIMEOUT_MS=15000
MAX_RECOMMENDATIONS=5
NODE_ENV=production
```

Do not set `NEXT_PUBLIC_API_BASE_URL` on Vercel unless you intentionally want the frontend to call a different API. By default it uses `/api`.

## Vercel Settings

1. Import this Git repository into Vercel.
2. Keep the project root as the repository root, not `frontend/`.
3. Leave Framework Preset as `Other`; `vercel.json` defines both builders.
4. Add the environment variables above for Production, Preview, and Development as needed.
5. Deploy.

## Runtime URLs

Frontend pages:

```text
/
/files
/files/create
/generate-post
/suggest-hashtags
/recommend-media
```

API endpoints in the full-stack deployment:

```text
/api/files
/api/files/:id
/api/files/:id/status
/api/ai/generate-post
/api/ai/suggest-hashtags
/api/ai/recommend-media
/health
```

## Upload Approval Flow

1. User selects a local file, enters a new stored name, and adds tags.
2. The frontend keeps the original file extension and file size.
3. The selected media is uploaded to Vercel Blob.
4. The file is created with `upload_initiated`.
5. The user approves or rejects it.
6. Only approved files are listed by default and used for media recommendations.
