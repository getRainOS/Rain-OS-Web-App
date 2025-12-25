# Rain OS SEO Analyzer - WordPress Plugin

## Overview

Rain OS SEO Analyzer is a WordPress plugin that provides AI-powered content analysis for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). The plugin analyzes content through three pillars: AI Readability, Digital Authority, and Conversion Readiness. It integrates with an external Rain OS API backend to perform content analysis and provides Pro features including title suggestions, meta description generation, content summarization, and sentence rewriting.

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