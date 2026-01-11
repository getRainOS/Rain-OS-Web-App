# Rain OS AEO Analyzer - WordPress Plugin

## Overview
Rain OS AEO Analyzer is a WordPress plugin designed for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). It provides AI-powered content analysis across three pillars: AI Readability, Digital Authority, and Conversion Readiness. The plugin integrates with an external Rain OS API to offer advanced features such as title suggestions, meta description generation, content summarization, and sentence rewriting. Its primary purpose is to help users optimize their content for modern AI-driven search engines and enhance content performance and discoverability. The plugin aims to position itself as a critical tool for content creators and marketers in the evolving landscape of AI-powered content consumption.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The plugin follows WordPress plugin architecture standards, utilizing a modular, class-based design. It features an admin class for managing UI components, an API class for backend communication, and a settings class for configuration.

### UI/UX Decisions
- **Design Language**: Dark theme with glassmorphism effects, incorporating specific color themes for each analysis pillar (Cyan for AI Readability, Green for Digital Authority, Purple for Conversion Readiness).
- **Editor Integration**: Supports both Gutenberg and Classic editors via meta boxes.
- **Dashboard & Analytics**: Features a React-based dashboard preview with KPI cards, performance history charts, pillar breakdown pie charts, and content signals scatter plots.
- **Interactive Elements**: Uses `react-circular-progressbar`, `recharts`, and `lucide-react` for data visualization and iconography.
- **Branding**: Renamed all instances of "SEO" to "AEO" (Answer Engine Optimization) to align with the plugin's core focus.

### Technical Implementations
- **Three Pillars Scoring**: Content is analyzed and scored based on AI Readability (semantic clarity, structure), Digital Authority (credibility, citation readiness), and Conversion Readiness (engagement, calls to action).
- **Pro Features**: Includes a "Quick Tools" panel for micro-actions (title suggestions, meta descriptions, summarization, rewriting), authorship/provenance tracking, detailed sub-score breakdowns, and real-time usage quota tracking.
- **API Communication**: All analysis requests are routed through a dedicated API class, using a configurable base URL and API key for authentication via bearer tokens.
- **Data Storage**: Plugin settings are stored in WordPress options, while analysis results and provenance data are cached in post meta.
- **Local Content Audit**: Incorporates WordPress-powered checks for content quality that do not require API interaction (e.g., title presence, content length, image alt tags, internal/external links, heading structure).
- **AI Heatmap**: A feature within the Content Analyzer that highlights keywords and technology terms in content, color-coded by pillar categories, to indicate AI relevance.

### System Design Choices
- **Modular Class-Based Design**: Enhances maintainability and extensibility.
- **AJAX Handlers**: Utilizes WordPress AJAX for dynamic content loading and interactions, with robust nonce verification for security.
- **Client-Side Logic**: Employs JavaScript (jQuery for core plugin, React for dashboard preview) for interactive elements and an enhanced user experience.
- **AEO-Centric Metrics**: The entire system is built around AEO principles, influencing scoring, feature sets, and terminology.
- **Responsive Design**: Designed for optimal viewing across various devices, particularly within the WordPress admin environment.

## External Dependencies
- **Rain OS API Backend**: An external Node.js/Express service that performs the core AI-powered content analysis. This requires a valid API key and subscription.
- **WordPress**: Minimum version 5.8+.
- **PHP**: Minimum version 7.4+, with `curl`, `json`, and `mbstring` extensions.
- **jQuery**: Utilized for front-end interactions (bundled with WordPress).
- **Google Fonts**: Roboto, loaded via CSS import for consistent typography.

## Recent Updates

### Pillar Breakdown Page (December 2024)
- **Horizontal Bar Charts**: Replaced 9-ring concentric chart with horizontal bar visualization
  - Large overall score percentage displayed at top
  - Three sections (one per pillar) each with 3 subcategory horizontal bars
  - Distinctive colors per subcategory within each pillar
  - AI Readability: Semantic Clarity, Readability Score, Logical Structure (cyan shades)
  - Digital Authority: Entity Recognition, Citation Readiness, Schema Extraction (green shades)
  - Conversion Readiness: AEO Alignment, QA-Format, Metadata Audit (purple shades)

### Content Analyzer Updates (December 2024)
- **Enhanced Content Editor**: Robust editor with:
  - Toolbar with formatting buttons (B, I, U, H1, H2, H3, List, Link) - all functional
  - Word count display
  - Bordered container with rounded corners and shadow
  - Title input with separator line
  - Full-width layout with permanently visible analysis sidebar
- **Functional Formatting Toolbar**: 
  - Bold, Italic, Underline via document.execCommand
  - Heading levels (H1, H2, H3) for semantic structure
  - Unordered list creation
  - Link insertion with URL prompt
  - HTML content preserved when saving/publishing
- **Local Content Audit Repositioned**: Moved from sidebar to below content editor
  - 3-column grid layout for checklist items
  - Larger checkboxes with border indicators for pass/fail
  - More prominent styling with gradient background

### Post Performance Table (Category Scores)
- Shows Overall Score, AI Readability, Digital Authority, and Conversion columns
- All score badges use red/yellow/green coloring based on score thresholds (green ≥80, yellow 65-79, red <65)

### AI Readiness Backend Integration (January 2025)
- **New Headless AI Backend**: Added integration with new AI readiness backend API (v1/ai/*)
  - Feature-flagged with all features OFF by default for safe phased rollout
  - Capability detection via GET /v1/ai/site/llms before using new endpoints
  - Silent fallback to old backend if new backend unavailable
  - Dual backend support - old backend remains fully functional

- **AI Score Panel**: Passive numeric score panel in WordPress post editor
  - Collapsible meta box in sidebar showing 5 AI readiness scores:
    - Readability, Structure, Freshness, Citation Readiness, AI Visibility
  - AJAX-loaded from /v1/ai/content/{contentId}
  - WordPress transients caching (6+ hour TTL)
  - Color-coded score badges (green/yellow/red)

- **Content Normalization**: Async content normalization on post save
  - POST to /v1/ai/normalize with contentId, html, text, canonicalUrl
  - Non-blocking (blocking=false), does not affect save flow
  - Backend handles chunking

- **Feature Flags** (Settings > AI Readiness Backend):
  - `rain_os_ai_backend_enabled`: Master switch (default: OFF)
  - `rain_os_ai_score_panel`: Enable score panel in editor (default: OFF)
  - `rain_os_ai_normalize`: Enable content normalization on save (default: OFF)

- **New Files**:
  - `includes/api/class-rain-os-ai-backend.php`: New AI backend API client
  - `includes/class-rain-os-ai-score-panel.php`: Meta box implementation
  - `assets/js/ai-score-panel.js`: AJAX loading for score panel

- **Safety Guarantees**:
  - Zero UI changes if flags OFF or backend unavailable
  - No LLM prompts, no content generation - analysis only
  - Fail silently, log to existing debug logger
  - No polling, no repeated calls per contentId

### Gutenberg Sidebar Integration (January 2025)
- **Modern Block Editor Integration**: Converted from PHP meta boxes to React-based Gutenberg sidebar panel
  - Uses WordPress's built-in React globals (wp.element, wp.plugins, wp.data) for WordPress.org compatibility
  - Pre-built JavaScript approach avoids npm build requirements
  - Nonce middleware for REST API authentication

- **Sidebar Features**:
  - Circular score ring display with animated progress
  - Three pillar cards with progress bars (AI Readability, Digital Authority, Conversion Readiness)
  - Tab navigation: Overview, Actions, Metrics, History
  - Real-time content access via wp.data.useSelect
  - Quick Actions: Suggest Titles, Meta Description, Summarize, Rewrite
  - AI Readiness section with commit functionality
  - Local Content Audit checklist

- **REST API Endpoints** (rain-os-aeo/v1/):
  - POST /analyze - Full content analysis
  - POST /normalize - Content normalization for AI backend
  - GET /normalize/status/{task_id} - Normalization status
  - GET /ai-scores/{post_id} - AI readiness scores
  - GET /history/{post_id} - Analysis history
  - POST /quick-action - Quick actions (titles, meta, summarize, rewrite)
  - GET /backend-analysis/{post_id} - Proxy to backend analysis endpoint (API key server-side)

### Backend Analysis Endpoint Integration (January 2025)
- **New Backend Endpoint Integration**: Wired Gutenberg sidebar to fetch cached recommendations from backend
  - Calls `GET /api/plugin/content/:contentId/analysis` via WordPress REST proxy
  - API key stays server-side (security), never exposed to client JavaScript
  - Fire-and-forget pattern ensures buttons reset immediately (no blocking)
  - 5-minute caching: server-side WordPress transients + client-side Map cache
  
- **Adapter Pattern**: `adaptBackendRecommendations()` maps backend response to existing UI shape
  - Maps: issue -> title, recommendation -> description
  - Severity mapping: high -> critical (red), medium -> warning (orange), low -> info (cyan)
  - Category colors match pillar colors (readability/structure=cyan, freshness/citation=green, visibility=purple)
  - De-duplication by stable key to prevent duplicate recommendations

- **Merge Logic**: Backend recommendations append to existing ones after manual actions
  - Only triggers after successful Analyze Content or Commit Content
  - No polling, no autosave triggers
  - Silent fallback if endpoint returns 204 or errors (no UI changes)

- **Feature Guarding**:
  - If backend returns 204 (feature flag OFF or no data): no UI change
  - If backend errors: silent failure, existing behavior preserved
  - Debug logging only when WP_DEBUG is enabled

- **Source Files** (`src/`):
  - `src/index.js`: Plugin registration with PluginSidebar
  - `src/index.css`: Dark theme styling
  - `src/components/AEOSidebar.js`: Main sidebar component
  - `src/hooks/useContentAnalysis.js`: Content analysis and commit logic
  - `src/hooks/useAIReadiness.js`: AI scores and backend analysis refresh
  - Webpack build outputs to `build/gutenberg-sidebar.js`, `.css`, `.asset.php`

- **PHP Integration**:
  - `includes/class-rain-os-gutenberg.php`: Asset enqueuing and REST routes

- **Stale Closure Fix** (January 2025):
  - Added `analysisData` to `commitContent` dependency array to ensure backend refresh receives current recommendations
  - Removed unused `backendScores` state and `useCallback` import from `useAIReadiness.js`

### Dashboard Preview Updates (January 2025)
- **Gutenberg Sidebar Preview Page**: Added interactive preview of the Gutenberg sidebar
  - Shows how the sidebar appears in WordPress block editor
  - Includes all features: score display, pillar cards, tabs, quick actions, AI readiness, local audit
  - Simulated analyze and quick action functionality for demonstration

### Learn About AI Readability Page (January 2025)
- **New Educational Page**: Added comprehensive "Learn About AI Readability" page
  - First menu item in admin navigation to establish conceptual foundation
  - Educational cards explaining AI Readability vs AEO distinction
  - Three Pillars explanation with color-coded pillar cards
  - AI Processing Sequence (Parsing → Understanding → Extraction → Ranking)
  - Translator vs Interpreter analogy (AI Readability = Interpreter, AEO = Translator)
  - Core concept: "AI Readability is the premise. AEO is the thesis."
  - Layered system flow: SEO → AI Readability → AEO

### Admin Menu Structure Update (January 2025)
- **Reorganized Navigation**: Updated admin menu to match prototype
  - "Learn AI Readability" as first submenu item (rain-os-aeo-learn slug)
  - Dashboard moved to separate slug (rain-os-aeo-dashboard)
  - Removed duplicate Help page (consolidated into Documentation)
  - All "Back to Dashboard" links updated to new dashboard slug

### Documentation Sections Added (January 2025)
- **Troubleshooting Section**: Common issues and resolution steps
  - API key and connection issues
  - Score inconsistency debugging
  - Performance timeout solutions
  - Pro features availability
  - Usage quota sync
- **Improve Your Score Section**: Practical tips per pillar
  - AI Readability (Semantic Clarity, Readability Score, Logical Structure)
  - Digital Authority (Entity Recognition, Citation Readiness, Schema Extraction)
  - Conversion Readiness (AI Alignment, QA-Format, Metadata Audit)
  - Quick wins checklist

### CSS Styling Updates (January 2025)
- Added extensive Learn page component styles
- Pillar cards, process steps, analogy grids
- Sequence steps, distinction cards, layer flow
- Troubleshooting and tip card styles