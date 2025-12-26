# Rain OS AEO Analyzer - WordPress Plugin

## Overview

Rain OS AEO Analyzer is a WordPress plugin that provides AI-powered content analysis for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). The plugin analyzes content through three pillars: AI Readability, Digital Authority, and Conversion Readiness. It integrates with an external Rain OS API backend to perform content analysis and provides Pro features including title suggestions, meta description generation, content summarization, and sentence rewriting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Plugin Structure
The plugin follows WordPress plugin architecture standards with a modular class-based design:

- **Main plugin file** (`rain-os-seo.php`): Handles plugin initialization, hooks registration, and WordPress integration
- **Admin class** (`includes/class-rain-os-admin.php`): Manages admin menus, meta boxes for the post editor, and asset enqueuing
- **API class** (`includes/class-rain-os-api.php`): Handles all communication with the external Rain OS backend API
- **Settings class** (`includes/class-rain-os-settings.php`): Manages plugin settings storage and AJAX handlers

### Frontend Architecture
- **Templates**: PHP template files in `templates/` directory for dashboard, settings, and post editor meta box
- **Assets**: CSS with dark theme and glassmorphism effects, jQuery-based JavaScript for interactions
- **Editor Integration**: Supports both Gutenberg block editor and Classic editor through meta boxes

### Three Pillars Scoring System
1. **AI Readability** (Cyan theme) - Measures semantic clarity, logical structure, and readability
2. **Digital Authority** (Green theme) - Evaluates credibility signals and citation readiness
3. **Conversion Readiness** - Assesses user engagement and action-driving effectiveness

### Pro Features
- Quick Tools panel with micro-actions (suggest titles, generate descriptions, summarize, rewrite)
- Authorship/Provenance tracking with hash verification
- Detailed sub-score breakdowns with drilldown drawers
- Usage quota tracking via API response headers

### API Communication Pattern
All analysis requests go through the Rain OS API class:
- Endpoint: Configurable base URL + `/api/analyze`
- Authentication: Bearer token via `Authorization` header
- Actions: `full_analysis`, `suggest_titles`, `generate_description`, `summarize_content`, `rewrite_sentence`
- Usage tracking: Parsed from `X-Usage-Info` response headers

### Data Storage
- Plugin settings stored in WordPress options table via Settings API
- Analysis results cached in post meta
- Provenance data optionally stored in post meta keys (`_rainos_authorship_*`)

## External Dependencies

### Required External Services
- **Rain OS API Backend**: Node.js/Express server that performs actual content analysis (not included in plugin)
  - Base URL and API key configured in plugin settings
  - Requires valid API subscription for usage quota

### WordPress Dependencies
- WordPress 5.8+ (tested up to 6.4)
- PHP 7.4+ (tested up to 8.2)
- PHP extensions: curl, json, mbstring

### Frontend Libraries
- jQuery (bundled with WordPress)
- Google Fonts: Roboto (loaded via CSS import)

### Preview System
A standalone preview system exists in `preview/` directory for demonstration purposes. This is separate from the actual plugin and simulates the WordPress admin environment for design previews.

## Recent Changes (December 2024)

### Pro Features Implementation
- **Tabbed Meta-box Interface**: Analysis tab and Quick Tools (Pro) tab
- **Quick Tools Panel**: Suggest Titles, Generate Meta Description, Summarize Content, Rewrite Sentence
- **Score Breakdown Section**: SubScores grid with clickable items for detailed drilldown panel
- **Authorship/Provenance Card**: Displays hash, timestamp, status with copy and save-to-post functionality
- **Live Usage Tracking**: Real-time updates from X-Usage-Info response headers
- **Pro CSS Styles**: Complete styling for all Pro components with light theme support
- **Documentation**: Added `docs/API-Reference.md` and `docs/Pro-Features.md`

### Security Enhancements
- All AJAX handlers verify nonces with check_ajax_referer()
- Provenance saving requires edit_posts + edit_post capability hierarchy
- Post ID sanitization with absint()

### Developer Documentation (December 2024)
- **TypeScript Reference**: `services/clientSideAnalysis.ts` - Typed implementation for client-side analysis logic
- **Client-Side Guide**: `includes/client-side-logic-guide.md` - Comprehensive documentation of client-side architecture
- **API Reference**: `docs/API-Reference.md` - External API endpoint documentation
- **Pro Features Guide**: `docs/Pro-Features.md` - Pro feature implementation details

### React Dashboard Preview (December 2024)
Location: `WordpressPluginStudio/dashboard-preview/`

**Navigation Pages:**
- **Dashboard**: Full analytics view with KPI cards, performance history chart, pillar breakdown pie chart, category bar chart, and content signals scatter plot
- **Content Analyzer**: WordPress-style Post Editor with collapsible AEO Analysis sidebar
- **Settings**: API configuration and analysis preferences
- **Documentation**: Guide listing with links
- **Upgrade**: Pro pricing comparison page

**Post Editor Features (Content Analyzer):**
- Split view layout: Editor (left) + Analysis Sidebar (right, 400px collapsible)
- Toolbar with: Edit Post label, Draft badge, AI Heatmap toggle, Save/Publish buttons, sidebar toggle
- ContentEditable editor with serif title and prose body
- 4-Tab Analysis Sidebar:
  1. **Overview**: Circular progress score (react-circular-progressbar), 3 pillar cards, critical issues list
  2. **Metrics**: Horizontal bar chart (Recharts) with color-coded scores, Authorship Provenance card
  3. **Actions**: 2x2 grid of Quick Tools buttons, Usage Quota progress bar
  4. **History**: Previous analysis entries with score deltas
- AI Heatmap: Highlights keywords in content when enabled (semantic clarity, entity recognition, etc.)
- Slide-in animation for sidebar

**Dependencies:**
- react-circular-progressbar: Main score display
- recharts: All charts (LineChart, PieChart, BarChart, ScatterChart)
- lucide-react: Icons

**Workflows:**
- Dashboard Preview: `npm run dev` on port 5000
- PHP Plugin Preview: `php -S 0.0.0.0:8000` on port 8000

### Dashboard UX Improvements (December 2024)
- **Time Period Dropdown**: Global dropdown selector in dashboard header with options: Last 7 Days, Last 30 Days (default), Last 60 Days
- **Dynamic Data Filtering**: All charts and KPI cards filter data based on selected time period
- **EmptyState Component**: Displays friendly message when no data available for selected time range
- **KPI Card Context**: Total Analyses, Average Score, Content Health values update dynamically based on period selection

### Post-Level Analytics (December 2024)
- **Navigation Restructure**: Content Analyzer moved under AI Readability Dashboard as a sub-link
- **postsData Array**: Shared dataset with 12 sample posts including:
  - Post metadata: id, title, slug, author, publishDate, wordCount
  - Scores: overallScore, trend (delta)
  - Pillar scores: aiReadability, digitalAuthority, conversionReadiness
  - Category scores: semanticClarity, logicalStructure, citationReadiness, entityRecognition
- **Relative Date Helper**: `getRelativeDate(daysAgo)` generates dates relative to current date for proper filtering
- **Performance Page**: Post Performance table showing posts with Title, Author, Score (color-coded badge), Trend (arrows), Published date
- **Pillar Breakdown Page**: Each pillar card shows "TOP POSTS BY [PILLAR]" section with top 3 posts sorted by that pillar's score
- **Category Scores Page**: "Posts by Category" section with 2x2 grid showing 4 key categories with top 4 posts each
- **Content Signals Page**: Uses postsData for scatter chart and Content Analysis list with word count and scores
- **Time Period Filtering**: All post lists filter by publish date based on selected period (7/30/60 days)
- **ChartCard Component**: Accepts optional `period` prop for displaying time badges in chart headers
- **Built-in Optimization Tools**: Six non-API tools in Getting Started: Readability Calculator, Sentence Length Analyzer, Keyword Density Checker, Heading Structure Validator, Question Detection, Entity Highlighter
- **AI Messaging**: Documentation emphasizes "AI-powered analysis" and "advanced AI technology" without referencing specific AI providers
- **Documentation Navigation**: Restructured with sub-links (Getting Started, Troubleshooting, Learn About AI Readability, Improve Your Score)

### AEO Branding & UX Updates (December 2024)
- **SEO to AEO Rename**: All references changed from "SEO" to "AEO" (Answer Engine Optimization) throughout the codebase
- **Feedback Link**: Added "Send Feedback" link in sidebar footer below support email
- **Donut Chart Score Display**: Content Analyzer Overview tab now shows donut chart with 3 pillars (AI Readability cyan, Digital Authority green, Conversion Readiness purple) with center score and legend
- **Functional Save/Publish Buttons**: Save and Publish buttons in Content Analyzer toolbar now have click handlers with visual feedback (color change, status update from DRAFT to PUBLISHED)
- **Interactive Action Buttons**: Quick Tools buttons (Suggest Titles, Meta Description, Summarize, Rewrite Selection) now trigger alert dialogs explaining their function
- **Run Full Analysis Button**: Overview tab button is now clickable with alert feedback
- **Understanding Your Dashboard**: New documentation section in Getting Started explaining:
  - Performance History Chart (gradient area chart)
  - Baseline (70) - dashed line representing minimum recommended score
  - KPI Cards (Total Analyses, Average Score, Content Health, API Usage)
  - Pillar Breakdown (donut chart with 3 pillars)
  - Analysis Categories (vertical bar chart)
  - Post Performance Indicators (green/yellow/red lights based on score ranges)
- **Chart Colors**: AI Readability (#22d3ee cyan), Digital Authority (#10b981 green), Conversion Readiness (#a855f7 purple)
- **Score Thresholds**: Green ≥80, Yellow 65-79, Red <65

### Dashboard Interactivity Updates (December 2024)
- **Inline Search**: Dashboard search bar with real-time inline results dropdown filtering by title, slug, and author
- **Search Results**: Shows up to 5 matching posts with title, author, score; clicking navigates to Content Analyzer
- **Notification System**: Bell icon with unread count badge, dropdown showing notifications with read/unread states
- **Click-Outside Handling**: useEffect hook closes notification dropdown when clicking outside
- **Mark All Read**: Button to mark all notifications as read at once

### Content Analyzer Enhancements (December 2024)
- **AI Heatmap**: Highlights technology terms (cloud computing, infrastructure, database, security, microservices, etc.) with color-coded tooltips indicating pillar categories
- **Technology Content**: 8-paragraph cloud computing/infrastructure text (scalability, load balancing, container orchestration, zero-trust security, observability)
- **Metrics Tab**: 9 sub-categories with pillar-based coloring (added Readability Score and Metadata Audit)

### Data Updates (December 2024)
- **postsData**: All 12 posts now technology-focused (Cloud Computing, Database Optimization, Network Security, Microservices, DevOps Pipeline, API Gateway, Container Orchestration, RESTful API, Serverless Architecture, Data Pipeline, Load Balancing, Caching Mechanisms)
- **Post Fields**: Each post includes indexing and mobileUsability boolean fields for Category Scores table

### Pricing Updates (December 2024)
- **Upgrade Page**: Business $29.99/month (100 AI Optimizations), Pro $99.99/month (500 AI Optimizations with priority support)