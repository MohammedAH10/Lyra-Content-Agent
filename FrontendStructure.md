# Lyra Content Agent — Frontend Project Structure

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Mgmt | Zustand |
| HTTP Client | Axios |
| Social Auth | NextAuth.js |

---

## Project Structure

```
lyra-frontend/
├── .env.local                         # Environment variables (API base URL, social keys)
├── .env.example                       # Template for required env vars
├── next.config.ts                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies and scripts
├── postcss.config.js                  # PostCSS config for Tailwind
│
├── public/
│   ├── favicon.ico
│   └── images/
│       ├── logo.svg
│       └── placeholder-media.svg      # Fallback image for media items
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (providers, navigation shell)
│   │   ├── page.tsx                   # Landing / Dashboard page
│   │   ├── globals.css                # Global styles + Tailwind directives
│   │   │
│   │   ├── generate-post/
│   │   │   └── page.tsx               # POST /ai/generate-post interface
│   │   │
│   │   ├── suggest-hashtags/
│   │   │   └── page.tsx               # POST /ai/suggest-hashtags interface
│   │   │
│   │   ├── recommend-media/
│   │   │   └── page.tsx               # POST /ai/recommend-media interface
│   │   │
│   │   ├── files/
│   │   │   ├── page.tsx               # GET /files (file library grid/table)
│   │   │   ├── create/
│   │   │   │   └── page.tsx           # POST /files form
│   │   │   └── [id]/
│   │   │       └── page.tsx           # File detail + PATCH /files/:id/status
│   │   │
│   │   ├── social/
│   │   │   ├── page.tsx               # Social accounts dashboard
│   │   │   ├── connect/
│   │   │   │   └── page.tsx           # OAuth connection flow
│   │   │   └── publish/
│   │   │       └── page.tsx           # Review & publish post to connected accounts
│   │   │
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts       # NextAuth.js handler for social OAuth
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Left navigation sidebar
│   │   │   ├── Header.tsx             # Top header bar
│   │   │   ├── AppShell.tsx           # Combines Sidebar + Header + main area
│   │   │   └── MobileNav.tsx          # Bottom nav for mobile screens
│   │   │
│   │   ├── post/
│   │   │   ├── PostGeneratorForm.tsx  # Prompt, tone, variations input form
│   │   │   ├── PostResultCard.tsx     # Primary post display card
│   │   │   ├── VariationCard.tsx      # Single variation display
│   │   │   ├── HashtagList.tsx        # Renders hashtag chips
│   │   │   └── PostPreview.tsx        # Social-media-style post preview
│   │   │
│   │   ├── hashtag/
│   │   │   ├── HashtagInputForm.tsx   # Post content input
│   │   │   └── HashtagCloud.tsx       # Visual tag cloud of suggestions
│   │   │
│   │   ├── media/
│   │   │   ├── MediaRecommenderForm.tsx   # Post content input for matching
│   │   │   ├── MediaRecommendationGrid.tsx # Grid of recommended files
│   │   │   ├── MediaCard.tsx          # Single media file card (image/doc/etc)
│   │   │   └── MediaDetailModal.tsx   # Enlarged view of a media item
│   │   │
│   │   ├── files/
│   │   │   ├── FileUploadForm.tsx     # Create file record form
│   │   │   ├── FileTable.tsx          # Tabular view of all files
│   │   │   ├── FileRow.tsx            # Single file table row
│   │   │   ├── FileStatusBadge.tsx    # Colored badge for moderation status
│   │   │   └── FileFilterBar.tsx      # Type/status filter controls
│   │   │
│   │   ├── social/
│   │   │   ├── SocialConnectPanel.tsx # OAuth connect buttons per platform
│   │   │   ├── ConnectedAccountCard.tsx # Displays connected account info
│   │   │   ├── PlatformSelector.tsx   # Toggle which platforms to publish to
│   │   │   └── PublishButton.tsx      # Triggers post publish workflow
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx             # Reusable button component
│   │       ├── Input.tsx              # Styled input field
│   │       ├── Select.tsx             # Styled dropdown
│   │       ├── TextArea.tsx           # Styled textarea
│   │       ├── Modal.tsx              # Generic modal wrapper
│   │       ├── Spinner.tsx            # Loading indicator
│   │       ├── EmptyState.tsx         # No-results placeholder
│   │       ├── ErrorAlert.tsx         # Error message display
│   │       ├── SuccessAlert.tsx       # Success message display
│   │       └── Card.tsx               # Generic card container
│   │
│   ├── services/
│   │   ├── api.ts                     # Axios instance + base config
│   │   ├── files.service.ts          # File API calls (CRUD + status update)
│   │   ├── ai.service.ts             # AI API calls (generate, hashtags, recommend)
│   │   └── social.service.ts         # Social media publish API integration
│   │
│   ├── store/
│   │   ├── postStore.ts              # Zustand store for post generation state
│   │   ├── hashtagStore.ts           # Zustand store for hashtag suggestions
│   │   ├── mediaStore.ts             # Zustand store for media recommendations
│   │   ├── fileStore.ts              # Zustand store for file library
│   │   └── socialStore.ts            # Zustand store for social connections
│   │
│   ├── types/
│   │   ├── api.ts                    # API response/request TypeScript types
│   │   ├── file.ts                   # File-related types
│   │   ├── post.ts                   # Post generation types
│   │   ├── hashtag.ts                # Hashtag types
│   │   └── social.ts                 # Social account types
│   │
│   └── utils/
│       ├── constants.ts              # Enums, tone options, status labels
│       ├── formatters.ts             # Date, file size, text formatting
│       └── validators.ts             # Client-side form validation helpers
│
└── __tests__/
    ├── components/
    │   ├── PostGeneratorForm.test.tsx
    │   ├── HashtagCloud.test.tsx
    │   └── MediaCard.test.tsx
    ├── services/
    │   ├── ai.service.test.ts
    │   └── files.service.test.ts
    └── store/
        └── postStore.test.ts
```

---

## Routing Map

| Route | Page / Feature | API Endpoint(s) |
|---|---|---|
| `/` | Dashboard — overview of all features | `GET /health` |
| `/generate-post` | Post generation form + results | `POST /ai/generate-post` |
| `/suggest-hashtags` | Hashtag suggestion form + cloud | `POST /ai/suggest-hashtags` |
| `/recommend-media` | Media recommendation form + grid | `POST /ai/recommend-media` |
| `/files` | File library with filters | `GET /files` |
| `/files/create` | Upload/create file record | `POST /files` |
| `/files/[id]` | File detail + moderation action | `PATCH /files/:id/status` |
| `/social` | Connected social accounts | NextAuth / OAuth |
| `/social/connect` | OAuth connection flow | NextAuth / OAuth |
| `/social/publish` | Review & publish post | Social platform APIs |

---

## Component Hierarchy

```
AppShell
├── Sidebar (nav links to all routes)
├── Header (page title, user indicator)
└── <Page Content>
    │
    ├── Dashboard (/)
    │   ├── StatsCards (total files, approved, etc.)
    │   ├── QuickActions (generate post, upload file)
    │   └── RecentActivity
    │
    ├── GeneratePost (/generate-post)
    │   ├── PostGeneratorForm
    │   │   ├── Input (prompt)
    │   │   ├── Select (tone)
    │   │   ├── Input (variations count)
    │   │   └── Button (submit)
    │   ├── Spinner (loading state)
    │   ├── PostResultCard (primary)
    │   ├── VariationCard[] (variations)
    │   └── HashtagList (hashtags)
    │
    ├── SuggestHashtags (/suggest-hashtags)
    │   ├── HashtagInputForm
    │   │   ├── TextArea (post content)
    │   │   └── Button (submit)
    │   ├── Spinner (loading state)
    │   └── HashtagCloud
    │       └── HashtagChip[]
    │
    ├── RecommendMedia (/recommend-media)
    │   ├── MediaRecommenderForm
    │   │   ├── TextArea (post content)
    │   │   └── Button (submit)
    │   ├── Spinner (loading state)
    │   ├── EmptyState (no library / no matches)
    │   └── MediaRecommendationGrid
    │       └── MediaCard[]
    │
    ├── FileLibrary (/files)
    │   ├── FileFilterBar
    │   │   ├── Select (type filter)
    │   │   ├── Select (status filter)
    │   │   └── Button (create new)
    │   ├── FileTable
    │   │   └── FileRow[]
    │   │       ├── FileStatusBadge
    │   │       └── ActionButtons
    │   └── EmptyState (no files)
    │
    ├── SocialDashboard (/social)
    │   ├── SocialConnectPanel
    │   │   ├── Button (Connect Twitter)
    │   │   ├── Button (Connect Instagram)
    │   │   └── Button (Connect LinkedIn)
    │   └── ConnectedAccountCard[]
    │       ├── PlatformIcon
    │       ├── AccountName
    │       └── DisconnectButton
    │
    └── SocialPublish (/social/publish)
        ├── PostPreview
        ├── PlatformSelector
        │   ├── Toggle (Twitter)
        │   ├── Toggle (Instagram)
        │   └── Toggle (LinkedIn)
        └── PublishButton
```

---

## Data Flow Architecture

```
User Action → React Component → Zustand Store Action
                                    ↓
                              Service Layer (Axios)
                                    ↓
                              Backend API (Express)
                                    ↓
                              Response → Store Update → Component Re-render
```

### State Management (Zustand Stores)

| Store | State | Actions |
|---|---|---|
| `postStore` | `prompt, tone, variations, result, loading, error` | `generatePost()` |
| `hashtagStore` | `postContent, hashtags, loading, error` | `suggestHashtags()` |
| `mediaStore` | `postContent, recommendations, totalMatched, message, loading, error` | `recommendMedia()` |
| `fileStore` | `files, count, filters, loading, error` | `fetchFiles(), createFile(), updateFileStatus()` |
| `socialStore` | `connectedAccounts, publishStatus, loading, error` | `connectAccount(), disconnectAccount(), publishPost()` |

---

## Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here

# Social OAuth Credentials
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

---

## Global Styles Structure (`globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes, animations, scrollbar styles */
```

---

## Key Implementation Notes

1. **Next.js App Router** — All pages use the `app/` directory with server/client component boundaries
2. **Client Components** — All interactive pages (`'use client'`) since they manage form state and API calls
3. **Axios Instance** — Centralized in `services/api.ts` with base URL from env, error interceptors, and response type mapping
4. **Zustand** — Lightweight stores per feature domain; no prop drilling needed
5. **Tailwind CSS** — All styling via utility classes; no CSS modules
6. **Responsive Design** — Mobile-first with sidebar collapsing to bottom nav on small screens
7. **Social OAuth** — NextAuth.js handles the 3-legged OAuth flows; tokens stored in session/JWT
8. **No SSR for Dashboard** — Dashboard data is fetched client-side since it depends on live API state
