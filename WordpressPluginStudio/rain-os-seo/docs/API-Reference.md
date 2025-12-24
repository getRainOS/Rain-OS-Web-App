# Rain OS SEO Analyzer - API Reference

This document describes the API endpoints and response formats used by the Rain OS SEO Analyzer WordPress plugin.

## Authentication

All API requests require authentication via the `X-API-Key` header:

```
X-API-Key: rain_os_key_xxxxxxxxxxxx
```

## Endpoints

### POST /analyze

Performs full AEO/GEO content analysis.

**Request Body:**
```json
{
  "content": "The content to analyze...",
  "industry": "Technology"
}
```

**Response:**
```json
{
  "overallScore": 78,
  "pillarScores": {
    "aiReadability": 82,
    "digitalAuthority": 75,
    "conversionReadiness": 77
  },
  "subScores": [
    { "category": "Semantic Clarity", "score": 85 },
    { "category": "Logical Structure", "score": 78 },
    { "category": "Descriptive Metadata", "score": 72 }
  ],
  "recommendations": [
    "Add more structured headings to improve AI parsing",
    "Include FAQ schema for question-answer patterns"
  ],
  "keywords": ["AI optimization", "content analysis", "SEO"],
  "authorship": {
    "hash": "sha256:a1b2c3d4e5f6...",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "verified"
  }
}
```

### POST /suggest-titles

Generates AI-optimized title suggestions.

**Request Body:**
```json
{
  "content": "The content to analyze..."
}
```

**Response:**
```json
{
  "titles": [
    "10 Essential Tips for AI-Ready Content",
    "How to Optimize Your Content for Answer Engines",
    "The Complete Guide to AEO in 2024"
  ]
}
```

### POST /generate-description

Creates an optimized meta description.

**Request Body:**
```json
{
  "content": "The content to analyze..."
}
```

**Response:**
```json
{
  "description": "Learn how to optimize your content for AI assistants and answer engines with our comprehensive guide to AEO best practices."
}
```

### POST /summarize

Generates a concise content summary.

**Request Body:**
```json
{
  "content": "The content to summarize..."
}
```

**Response:**
```json
{
  "summary": "This article covers key strategies for optimizing content for AI search engines, including semantic structure, entity recognition, and citation readiness."
}
```

### POST /rewrite

Rewrites a sentence for improved clarity.

**Request Body:**
```json
{
  "sentence": "The sentence to rewrite..."
}
```

**Response:**
```json
{
  "rewritten": "The improved and clearer version of the sentence."
}
```

## Response Headers

### X-Usage-Info

All API responses include usage information in the `X-Usage-Info` header:

```json
{
  "used": 45,
  "limit": 100,
  "plan": "pro"
}
```

This enables real-time usage tracking without additional API calls.

## Score Metrics

### Overall Score (0-100)
- **80-100**: Excellent - Content is well-optimized for AI
- **60-79**: Good - Minor improvements recommended
- **40-59**: Needs Work - Several areas need attention
- **0-39**: Poor - Significant improvements required

### Pillar Scores

1. **AI Readability**: How easily AI systems can parse and understand your content
2. **Digital Authority**: Trust signals, citations, and authoritative content markers
3. **Conversion Readiness**: How well content drives action and engagement

### Sub-Scores

| Category | Description |
|----------|-------------|
| Semantic Clarity | Clear communication of meaning for AI systems |
| Logical Structure | Organization and flow of content |
| Descriptive Metadata | Quality of meta descriptions and structured data |
| Entity Recognition | Identification of people, places, organizations |
| Citation Readiness | Quotable facts and authoritative statements |
| AEO Alignment | Overall answer engine optimization alignment |
| Readability | Ease of reading and comprehension |
| Schema Extraction | Structured data markup quality |
| QA-format Detection | Question-answer pattern presence |

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Invalid or missing API key |
| 402 | Subscription inactive or expired |
| 429 | Rate limit exceeded |
| 500 | Server error |

## WordPress Integration

### AJAX Actions

The plugin registers these WordPress AJAX actions:

- `rain_os_analyze_content` - Full content analysis
- `rain_os_suggest_titles` - Title suggestions
- `rain_os_generate_description` - Meta description generation
- `rain_os_summarize_content` - Content summarization
- `rain_os_rewrite_sentence` - Sentence rewriting
- `rain_os_save_provenance` - Save authorship data to post meta

### Post Meta Keys

When provenance saving is enabled, the following post meta keys are used:

- `_rainos_authorship_hash` - Content hash
- `_rainos_authorship_timestamp` - Analysis timestamp
- `_rainos_authorship_status` - Verification status
