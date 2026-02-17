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

### 4-Pillar System Upgrade (February 2025)
- **Product Discoverability Pillar**: Added 4th pillar (#f59e0b orange) with 3 subcategories: Search Presence, Brand Visibility, Market Positioning
- **Database Migration**: Added product_discoverability column with automatic migration (db version 1.1)
- **Average Score**: Now divides by 4 instead of 3
- **All Templates Updated**: Dashboard, pillar breakdown, score history, documentation, learn page
- **CSS Classes**: Added rain-os-pillar-orange, rain-os-kpi-icon-orange, rain-os-bar-orange-* classes
- **Gutenberg Sidebar**: React components rebuilt with 4th pillar support
- **Dashboard Preview**: Updated with 4-pillar data, 12 categories, and orange color scheme
- **Packaging Fix**: zip-wporg.js now cleanly excludes src/, scripts/, dist/, node_modules/, package.json

## External Dependencies
- **Rain OS API Backend**: An external Node.js/Express service providing core AI-powered content analysis, requiring a valid API key and subscription.
- **WordPress**: Minimum version 5.8+.
- **PHP**: Minimum version 7.4+, with `curl`, `json`, and `mbstring` extensions.
- **jQuery**: Utilized for front-end interactions (bundled with WordPress).
- **Google Fonts**: Roboto, loaded via CSS import.