# Rain OS SEO Analyzer - Pro Features

This document describes the Pro-tier features available in the Rain OS SEO Analyzer plugin.

## Quick Tools Panel

The Quick Tools panel provides instant access to AI-powered micro-actions directly from the post editor.

### Suggest Titles
Generates multiple SEO-optimized title suggestions based on your content. Each suggestion is optimized for:
- Answer engine visibility
- Click-through rate
- AI comprehension

**Usage:**
1. Click the "Suggest Titles" button
2. Review the generated suggestions
3. Click "Apply" to use a title, or "Copy" to copy to clipboard

### Generate Meta Description
Creates an optimized meta description (150-160 characters) that:
- Summarizes key content points
- Includes relevant keywords
- Appeals to both users and AI systems

### Summarize Content
Generates a concise summary of your content, useful for:
- Featured snippets
- Social media sharing
- Quick content overview

### Rewrite Sentence
Improves individual sentences for clarity and AI readability. Enter any sentence and receive an enhanced version that:
- Maintains original meaning
- Improves semantic clarity
- Uses more precise language

## Score Breakdown

The Score Breakdown section provides detailed sub-scores with drilldown capabilities.

### Sub-Score Categories

1. **Semantic Clarity** - How clearly your content communicates meaning to AI
2. **Logical Structure** - Organization and flow evaluation
3. **Descriptive Metadata** - Meta description and structured data quality
4. **Entity Recognition** - Connection to known entities
5. **Citation Readiness** - Quotable content and authoritative statements
6. **AEO Alignment** - Overall answer engine optimization
7. **Readability** - Content accessibility for humans and AI
8. **Schema Extraction** - Structured data markup presence
9. **QA-format Detection** - Question-answer pattern identification

### Drilldown Panel

Click any sub-score to open the detailed drilldown panel showing:
- Current score value
- Explanation of why the metric matters
- Specific recommendations for improvement

## Authorship / Provenance Card

Track content authenticity with the Authorship/Provenance card.

### Features

- **Content Hash**: SHA-256 hash of analyzed content
- **Timestamp**: When the analysis was performed
- **Status**: Verification status (verified, pending, etc.)

### Actions

- **Copy**: Copy provenance data to clipboard
- **Save to Post**: Toggle to automatically save provenance data to post meta

### Post Meta Storage

When enabled, provenance data is stored in these meta fields:
- `_rainos_authorship_hash`
- `_rainos_authorship_timestamp`
- `_rainos_authorship_status`

## Live Usage Tracking

Real-time usage tracking updates automatically with each API call.

### How It Works

1. Each API response includes usage data in the `X-Usage-Info` header
2. The usage widget updates immediately after any API call
3. No separate API calls needed for usage checks

### Usage Widget

The usage widget displays:
- Current usage count
- Monthly limit
- Visual progress bar

## Tabbed Interface

Pro features are organized in a clean tabbed interface:

### Analysis Tab
- Content analysis controls
- Score display
- Pillar scores
- Score breakdown (Pro)
- Authorship card (Pro)
- Recommendations
- Keywords

### Quick Tools Tab
- Suggest Titles button
- Generate Meta Description button
- Summarize button
- Rewrite Sentence input

## Best Practices

1. **Analyze First**: Run a full analysis before using quick tools
2. **Review Suggestions**: Always review AI suggestions before applying
3. **Save Provenance**: Enable provenance saving for content authenticity tracking
4. **Check Sub-Scores**: Use drilldown panels to identify specific improvement areas
5. **Monitor Usage**: Keep track of monthly usage in the widget
