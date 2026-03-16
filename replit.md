# rain OS AI Readability Optimizer - WordPress Plugin

## Overview
rain OS AI Readability Optimizer is a WordPress plugin for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). It offers AI-powered content analysis across AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability. The plugin integrates with an external Rain OS API for features like title suggestions, meta description generation, content summarization, and sentence rewriting. Its main goal is to optimize content for AI-driven search engines, enhancing content performance and discoverability for content creators and marketers.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The plugin adheres to WordPress plugin standards with a modular, class-based design, including admin, API, and settings classes.

### UI/UX Decisions
- **Design Language**: Dark theme with glassmorphism effects, using distinct color themes for each analysis pillar (Cyan for AI Readability, Green for Digital Authority, Purple for Conversion Readiness, Orange for Product Discoverability).
- **Editor Integration**: Supports both Gutenberg and Classic editors via meta boxes.
- **Dashboard & Analytics**: Features a React-based dashboard preview displaying KPI cards, performance history, pillar breakdown pie charts, and content signals scatter plots.
- **Interactive Elements**: Utilizes `react-circular-progressbar`, `recharts`, and `lucide-react` for data visualization.
- **Branding**: Replaces "SEO" with "AEO" (Answer Engine Optimization) to align with its core focus.

### Technical Implementations
- **Four Pillars Scoring**: Content is analyzed and scored across AI Readability (semantic clarity, structure), Digital Authority (credibility, citation readiness), Conversion Readiness (engagement, calls to action), and Product Discoverability (search presence, brand visibility, market positioning).
- **Quick Tools**: A panel providing micro-actions like title suggestions, meta descriptions, summarization, and rewriting, along with authorship/provenance tracking, sub-score breakdowns, and real-time usage quota.
- **API Communication**: All analysis requests are routed through a dedicated API class using a configurable base URL and API key for bearer token authentication.
- **Data Storage**: Plugin settings are stored in WordPress options, while analysis results and provenance data are cached in post meta.
- **Local Content Audit**: Incorporates WordPress-powered checks for content quality that do not require API interaction (e.g., title presence, content length, image alt tags, internal/external links, heading structure).
- **AI Heatmap**: A feature within the Content Analyzer that highlights keywords and technology terms in content, color-coded by pillar categories, to indicate AI relevance.
- **AI Readiness Backend Integration**: Integration with a new headless AI backend for advanced AI readiness scores and content normalization, feature-flagged for controlled rollout.
- **Gutenberg Sidebar Integration**: A React-based Gutenberg sidebar panel for modern block editor integration, utilizing WordPress's built-in React globals and nonce middleware for REST API authentication.

### System Design Choices
- **Modular Class-Based Design**: For maintainability and extensibility.
- **AJAX Handlers**: Uses WordPress AJAX for dynamic content loading and interactions with nonce verification.
- **Client-Side Logic**: Employs JavaScript (jQuery for core plugin, React for dashboard preview) for interactive elements.
- **AEO-Centric Metrics**: The entire system is built around AEO principles.
- **Responsive Design**: Optimized for various devices within the WordPress admin environment.

## Recent Updates

### Nav Layout & Docs Overhaul (March 2026)
- **Admin Menu Restructure**: Dashboard is now the top-level landing page (slug `rain-os-aeo`); 4 non-clickable separator items registered (ANALYZE, REPORTS, LEARN, ACCOUNT) using `__return_null` callback; `render_menu_separator_styles()` injects CSS via `admin_head` to make them non-clickable (pointer-events:none) and styled as uppercase section labels; menu order: Dashboard | ANALYZE | Content Analyzer | URL Scanner | REPORTS | Score History | Pillar Breakdown | Content Signals | LEARN | Learn AI Readability | Documentation | ACCOUNT | Upgrade | Settings
- **Dashboard Slug Fix**: All template "Back to Dashboard" links updated from `page=rain-os-aeo-dashboard` to `page=rain-os-aeo` across 7 templates
- **readme.txt v2.3.0**: Stable tag bumped to 2.3.0; four pillars listed with all 14 sub-scores; URL Scanner, Gutenberg Sidebar, PD Mute Toggle added as features; `== External Services ==` section (WP.org compliant); full 2.3.0 changelog and upgrade notice
- **documentation.php**: Added `url-scanner` section with: what it does, 5-step how-to, all 9 technical signal definitions, results sections explained, URL Scanner vs Content Analyzer comparison
- **learn-ai-readability.php**: Added URL Scanner card (use cases, what it returns, link) and Product Discoverability Mute Toggle card (what it is, when to mute vs keep active, link to settings)
- **App.jsx Sidebar Restructure**: Replaced flat `navItems` array with `navSections` grouped structure; Sidebar renders uppercase section label dividers: ANALYZE (Content Analyzer, URL Scanner), REPORTS (Dashboard + sub-pages), LEARN (Learn AI Readability, Documentation + sub-pages), ACCOUNT (Upgrade, Settings)
- **Package**: 166.50 KB, repackaged with all updated templates

### URL Scanner + v2.3.0 (March 2026)
- **Version Bump**: Plugin version updated to 2.3.0 in rain-os-aeo-analyzer.php
- **URL Scanner Admin Page**: `templates/url-scanner.php` — URL input with industry dropdown, results area with overall score, 4-pillar bars, technical HTML signals grid, and recommendations
- **URL Scanner JS**: `assets/js/url-scanner.js` — AJAX handler using `rainOsScanner` localized object, form validation, loading states, HTML escaping; displays technical signals (hasSchemaMarkup, hasFaqSchema, hasSemanticHtml, hasProperHeadingHierarchy, hasMetaDescription, hasCanonicalTag, hasOpenGraphTags, hasLlmsTxt, isJsRendered)
- **URL Scanner CSS**: `assets/css/url-scanner.css` — glassmorphism dark theme, 4-pillar colored bars, pass/fail signal grid, responsive layout
- **Admin Menu**: `URL Scanner` submenu added in class-rain-os-admin.php between Content Analyzer and Score History; `render_url_scanner_page()` method added
- **Asset Enqueueing**: class-rain-os-assets.php enqueues url-scanner.js + url-scanner.css only on the URL scanner page; localizes `rainOsScanner` object with ajaxUrl, nonce, i18n strings
- **avg_product_discoverability**: `get_average_scores()` in class-rain-os-admin.php now includes AVG(product_discoverability) in SQL query
- **Dashboard Preview**: `UrlScannerPage` React component added to App.jsx with interactive mock scan (1.8s loading simulation), 4-pillar score display, 9-signal technical grid with pass/fail icons, tech recommendations, and recommendations list; `Globe` nav item added to sidebar; `url-scanner` case added to renderPage router
- **Package**: 162.17 KB, 46 files, webpack compiled successfully (0 errors)

### Backend Sync & 4-Pillar Completion (February 2026)
- **Gutenberg Sidebar React Rebuild**: useContentAnalysis.js includes productDiscoverability pillar (#f97316); MetricsTab.js updated with backend-matching sub-category names across all 4 pillars (14 total sub-scores); PillarCards.js color unified to #f97316
- **Sub-Category Names (Backend-Synced)**: P1: Semantic Clarity, Readability Score, Logical Structure, AEO Alignment; P2: Entity Recognition, Citation Readiness, Descriptive Metadata; P3: Schema Extraction, QA-Format Detection, Metadata Audit; P4: Schema Completeness, Answer Layer Quality, Freshness Signals, Conversational Query Match
- **Gutenberg PHP (class-rain-os-gutenberg.php)**: handle_analyze parses flat backend response; save_analysis_history stores product_discoverability + analysis_data JSON + analyzed_at; handle_get_history returns productDiscoverability and uses analyzed_at; handle_quick_action remaps actions (generate_meta→generate_description, summarize→summarize_content, rewrite→rewrite_sentence) and normalizes response; mock_quick_action case labels match backend action names; calculate_local_scores includes 4th pillar and all 14 sub-scores
- **admin.js**: Product Discoverability uses 'orange' CSS class (was 'yellow'); crawler signals display function; rich recommendation rendering
- **admin.css**: --rain-pillar-orange: #f97316 custom property; .rain-os-pillar-fill-result.rain-os-pillar-orange; .rain-os-pillar-bar-fill.rain-os-pillar-orange; .rain-os-bar-orange-1/2/3/4 tokens updated to #f97316 scale; pillar section orange references use --rain-pillar-orange
- **All PHP Templates Synced**: learn-ai-readability.php, documentation.php, upgrade.php now use all 14 backend-synced sub-category names with correct pillar groupings (AEO Alignment in P1, Descriptive Metadata in P2, Schema Extraction in P3, 4 new P4 sub-categories)
- **HistoryTab.js**: Product Discoverability color fixed to #f97316
- **Package**: 153.59 KB, 43 files, webpack compiled successfully

### Product Discoverability Mute Toggle (February 2026)
- **Toggle Feature**: Users can mute/unmute the Product Discoverability pillar via a toggle switch
- **WordPress Setting**: `rain_os_pd_enabled` option (default: 'yes') in class-rain-os-settings.php, registered with sanitize_checkbox
- **Settings UI**: Toggle with orange glow animation in Analysis Preferences section of settings.php
- **Score Calculations**: dashboard.php, pillar-breakdown.php, class-rain-os-gutenberg.php all conditionally divide by 3 or 4 based on `Rain_OS_Settings::is_pd_enabled()`
- **Gutenberg Sidebar**: `pdEnabled` flag passed via wp_localize_script; useContentAnalysis.js, PillarCards.js, MetricsTab.js, HistoryTab.js conditionally include/exclude PD
- **Dashboard Preview**: `pdMuted` state in App.jsx with PDMuteToggle component featuring throbbing orange glow; all pages (dashboard, pillar breakdown, score history, performance, Gutenberg sidebar preview) respect mute state
- **CSS**: `@keyframes rainPdGlow` animation, `.rain-os-pd-toggle-wrap`, `.rain-os-pd-switch` toggle styles, `.rain-os-pd-hidden` for conditional visibility
- **admin.css**: PD toggle with throbbing glow animation using #f97316 orange

### 4-Pillar System Upgrade (February 2025)
- **Product Discoverability Pillar**: Added 4th pillar with 4 subcategories
- **Database Migration**: Added product_discoverability column with automatic migration (db version 1.1)
- **Average Score**: Now divides by 4 instead of 3
- **All Templates Updated**: Dashboard, pillar breakdown, score history, documentation, learn page
- **Packaging Fix**: zip-wporg.js now cleanly excludes src/, scripts/, dist/, node_modules/, package.json

## External Dependencies
- **Rain OS API Backend**: An external Node.js/Express service providing core AI-powered content analysis, requiring a valid API key and subscription.
- **WordPress**: Minimum version 5.8+.
- **PHP**: Minimum version 7.4+, with `curl`, `json`, and `mbstring` extensions.
- **jQuery**: Utilized for front-end interactions (bundled with WordPress).
- **Google Fonts**: Roboto, loaded via CSS import.