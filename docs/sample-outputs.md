# Sample Outputs

## 1. Generate Post

### Request
```json
POST /ai/generate-post
{
  "topic": "The impact of AI on modern marketing strategies",
  "tone": "professional",
  "format": "short"
}
```

### Response (AI generated)
```json
{
  "success": true,
  "data": {
    "content": "AI is reshaping modern marketing by enabling hyper-personalization, predictive analytics, and automated content creation at scale. Marketers who leverage AI tools can analyze customer behavior in real time, optimize campaign spend, and deliver tailored experiences that drive engagement and ROI. As algorithms grow more sophisticated, the competitive advantage will belong to teams that integrate human creativity with machine intelligence.",
    "variations": [
      {
        "label": "Short",
        "content": "AI is reshaping marketing through hyper-personalization, predictive analytics, and automation. Marketers using AI tools gain real-time customer insights, optimize spend, and boost ROI. The future belongs to teams blending human creativity with machine intelligence."
      },
      {
        "label": "Professional",
        "content": "Artificial intelligence is fundamentally transforming marketing strategy by enabling data-driven personalization, predictive customer analytics, and scalable content automation. Organizations that integrate AI capabilities into their marketing operations can achieve measurable improvements in campaign efficiency, customer engagement, and return on investment."
      },
      {
        "label": "Engaging",
        "content": "Imagine knowing exactly what your customer wants before they do. That's the power of AI in marketing. From personalized recommendations to automated content creation, AI is turning marketing from guesswork into science. The question isn't whether to adopt AI — it's how fast you can."
      }
    ],
    "improvements": [
      "Consider adding a specific statistic about AI-driven marketing ROI (e.g., 'Companies using AI see a 20% increase in conversion rates').",
      "Include a concrete example of an AI marketing tool (e.g., Jasper, HubSpot's AI features, or ChatGPT for copywriting)."
    ],
    "relatedIdeas": [
      "How small businesses can leverage AI tools to compete with enterprise marketing teams",
      "The ethical implications of AI-generated advertising content and consumer trust"
    ],
    "fallbackUsed": false
  }
}
```

### Response (fallback — AI unavailable)
```json
{
  "success": true,
  "data": {
    "content": "[Draft — AI generation unavailable] Here is a draft post about 'The impact of AI on modern marketing strategies' in a professional tone (short format). Please review and refine as needed.",
    "variations": [
      { "label": "Short", "content": "[Draft — AI unavailable] Short variant for: The impact of AI on modern marketing strategies." },
      { "label": "Professional", "content": "[Draft — AI unavailable] Professional variant for: The impact of AI on modern marketing strategies." },
      { "label": "Engaging", "content": "[Draft — AI unavailable] Engaging variant for: The impact of AI on modern marketing strategies." }
    ],
    "improvements": [
      "AI generation unavailable — review content manually",
      "Consider adding specific examples or data points"
    ],
    "relatedIdeas": [
      "Exploring 'The impact of AI on modern marketing strategies' further",
      "Related topics to expand your content library"
    ],
    "fallbackUsed": true
  }
}
```

---

## 2. Regenerate Post

### Request
```json
POST /ai/regenerate-post
{
  "previousContent": "AI is reshaping marketing through hyper-personalization...",
  "topic": "The impact of AI on modern marketing strategies",
  "tone": "casual",
  "format": "bullet",
  "additionalInstructions": "Add a call to action at the end"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "content": "AI is changing the game for marketers, and here's how:\n\n• Hyper-personalization — send the right message to the right person at the right time\n• Predictive analytics — know what your audience wants before they ask\n• Content automation — let AI handle the repetitive stuff so you can focus on strategy\n• Real-time optimization — tweak campaigns on the fly based on live data\n\nReady to level up your marketing? Start by exploring one AI tool this week.",
    "variations": [
      {
        "label": "Short",
        "content": "AI is changing marketing: hyper-personalization, predictive analytics, and content automation. The data is clear — teams using AI see better results. Try one AI tool this week!"
      },
      {
        "label": "Professional",
        "content": "Artificial intelligence offers marketers three key advantages: hyper-personalization at scale, predictive customer analytics, and automated content workflows. Integrating these capabilities drives measurable improvements in campaign performance."
      },
      {
        "label": "Engaging",
        "content": "Want to know the secret weapon of top marketing teams? AI. It's personalizing experiences, predicting trends, and automating the boring stuff. Don't get left behind — start your AI journey today!"
      }
    ],
    "improvements": [],
    "relatedIdeas": [],
    "fallbackUsed": false
  }
}
```

---

## 3. Suggest Hashtags

### Request
```json
POST /ai/suggest-hashtags
{
  "postContent": "Exploring new AI-powered marketing strategies for small business growth in 2026"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "hashtags": [
      "#AIMarketing",
      "#SmallBusinessGrowth",
      "#MarketingStrategy",
      "#BusinessTips",
      "#DigitalMarketing",
      "#GrowthHacking",
      "#FutureOfMarketing",
      "#AITools"
    ]
  }
}
```

---

## 4. Suggest Improvements

### Request
```json
POST /ai/suggest-improvements
{
  "postContent": "AI is changing marketing. It helps with personalization and analytics. Marketers should use it."
}
```

### Response
```json
{
  "success": true,
  "data": {
    "improvements": [
      "Add specific data or statistics to strengthen your claims (e.g., '82% of marketers report improved ROI with AI').",
      "Include a concrete example of AI in action, such as a tool or case study your audience can relate to.",
      "End with a clear call-to-action to engage your readers (e.g., 'Which AI tool will you try this week?')."
    ]
  }
}
```

---

## 5. Related Post Ideas

### Request
```json
POST /ai/related-post-ideas
{
  "postContent": "How to build a personal brand on LinkedIn in 2026"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "relatedIdeas": [
      "The ultimate LinkedIn content calendar: what to post every day for 30 days",
      "5 AI tools that will 10x your LinkedIn content creation workflow"
    ]
  }
}
```

---

## 6. Recommend Media

### Request
```json
POST /ai/recommend-media
{
  "postContent": "Product launch event for our new AI-powered analytics platform",
  "type": "image",
  "limit": 3
}
```

### Response (with matches)
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "fileId": "abc123",
        "name": "product-launch-stage.png",
        "type": "image",
        "url": "https://cdn.example.com/product-launch-stage.png",
        "size": 245000,
        "tags": ["product", "launch", "event"],
        "uploadDate": "2026-05-15T10:30:00.000Z",
        "score": 0.43,
        "reason": "Matches product, launch, event"
      },
      {
        "fileId": "def456",
        "name": "analytics-dashboard.png",
        "type": "image",
        "url": "https://cdn.example.com/analytics-dashboard.png",
        "size": 180000,
        "tags": ["analytics", "dashboard", "AI"],
        "uploadDate": "2026-05-10T08:15:00.000Z",
        "score": 0.29,
        "reason": "Matches analytics, AI"
      }
    ],
    "noResultReason": null
  }
}
```

### Response (no matches — empty library)
```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "noResultReason": "No approved media files are available in the library."
  }
}
```

### Response (no relevant matches)
```json
{
  "success": true,
  "data": {
    "recommendations": [],
    "noResultReason": "No files matched the content of this post."
  }
}
```

---

## 7. Validation Error

### Request
```json
POST /ai/generate-post
{
  "topic": "",
  "tone": "professional"
}
```

### Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "issues": [
        {
          "message": "Topic is too short. Please provide more detail.",
          "path": "topic"
        }
      ]
    }
  }
}
```

---

## 8. Draft Lifecycle

### Create Draft
```json
POST /posts/drafts
{
  "userId": "web-user",
  "inputText": "AI marketing trends 2026",
  "tone": "professional",
  "format": "short",
  "generatedContent": { "content": "...", "variations": [], "improvements": [], "relatedIdeas": [], "fallbackUsed": false }
}
```

### Accept Draft
```json
POST /posts/drafts/<id>/accept
{
  "acceptedOutput": "AI marketing in 2026 is about hyper-personalization...",
  "selectedVariation": "Short",
  "userId": "web-user"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "draft_abc123",
    "status": "accepted",
    "inputText": "AI marketing trends 2026",
    "acceptedOutput": "AI marketing in 2026 is about hyper-personalization...",
    "selectedVariation": "Short"
  }
}
```

---

## 9. AI Audit Logs

### Request
```json
GET /admin/logs/ai?limit=5&sort=-createdAt
```

### Response (truncated)
```json
{
  "success": true,
  "data": [
    {
      "requestType": "generate-post",
      "modelUsed": "openai/gpt-oss-120b:free",
      "latencyMs": 4820,
      "success": true,
      "fallbackUsed": false,
      "inputSummary": "Generate: \"Product launch marketing strategy\"...",
      "createdAt": "2026-06-08T15:30:00.000Z"
    },
    {
      "requestType": "generate-post",
      "modelUsed": "gpt-oss-20b:free",
      "latencyMs": 12400,
      "success": true,
      "fallbackUsed": true,
      "inputSummary": "Generate: \"AI safety concerns\"...",
      "createdAt": "2026-06-08T15:28:00.000Z"
    }
  ]
}
```

---

## 10. Health Check

### Request
```json
GET /health
```

### Response
```json
{
  "success": true,
  "message": "API is healthy"
}
```
