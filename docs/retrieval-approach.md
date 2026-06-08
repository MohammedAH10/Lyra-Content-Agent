# Retrieval Approach

## Media Recommendation: Keyword-Based Scoring (No Embeddings)

The media recommendation system does **not** use vector embeddings, semantic search, or any ML model. Instead, it uses a simple but effective **keyword overlap scoring** algorithm.

### Why Not Embeddings?

1. **No external vector DB** — the project has no Pinecone, Weaviate, or pgvector dependency
2. **No embedding API costs** — every embedding call would add latency and cost, contradicting the free-tier approach
3. **Sufficient for the use case** — file names and tags are short, human-curated text. Keyword overlap on curated tags is surprisingly effective when tags are well-maintained
4. **Architecture simplicity** — the entire scoring engine is ~80 lines of pure TypeScript with zero external dependencies

### Scoring Algorithm

```
Input: postContent = "Product launch marketing campaign for Q3"
       files[] = FileDocument array

Step 1: Extract keywords from postContent
  - Lowercase, split on non-alphanumeric
  - Filter out stopwords (300+ common English words)
  - Deduplicate
  → ["product", "launch", "marketing", "campaign", "q3"]

Step 2: For each file, build searchable text
  - Combine: fileName + " " + tags.join(" ") + " " + description + " " + fileType

Step 3: Compute overlap score
  - Score = matchedKeywordCount / totalPostKeywords
  - If score > 0, include result; otherwise filter out

Step 4: Sort descending by score, apply type filter + limit
```

### Example

**Post**: "Our new product launch event was a huge success with marketing"
**Keywords**: `product, launch, event, huge, success, marketing`

| File | Name | Tags | Matched | Score | Reason |
|------|------|------|---------|-------|--------|
| A | product-launch-photo.png | product, launch, event | 3/6 | 0.50 | Matches product, launch, event |
| B | team-office.jpg | team, office | 0/6 | 0.00 | No match (filtered out) |
| C | marketing-campaign.pdf | marketing, Q1 | 1/6 | 0.17 | Matches marketing |

### Strengths

- **Zero cold-start** — works immediately with any tagged file library
- **Deterministic** — same input always produces same output
- **Fast** — operates entirely in-memory on an already-loaded file set
- **Auditable** — the `reason` field explains exactly why each file matched
- **No ongoing costs** — no API calls, no embedding storage

### Limitations

- **Relies on quality of tags** — if files have no tags or bad tags, matching degrades
- **No semantic understanding** — "car" and "automobile" don't match each other
- **Keyword explosion** — very long post content produces many keywords, increasing false positive matches
- **No learning** — the algorithm doesn't improve over time from user feedback

### Recommendation Filtering

| Filter | Implementation |
|--------|---------------|
| **Approved only** | `File.find({ status: 'approved' })` — rejected and pending files never scored |
| **Type filter** | Client passes `type` param, files filtered before scoring |
| **Limit** | Client passes `limit` param (default 5), top N returned |
| **No result reasons** | Three distinct messages: empty library, no matching type, no content match |

### If This Were Production

For a production-grade retrieval system, the next step would be:
1. Add **vector embeddings** (OpenAI `text-embedding-3-small` or local `gte-small`)
2. Store embeddings in MongoDB Atlas Vector Search or pgvector
3. Replace keyword scoring with **cosine similarity search**
4. Add **hybrid search** (combine keyword + vector scores with weighted ranking)
5. Add **user feedback loop** (thumbs up/down on recommendations to refine ranking)
