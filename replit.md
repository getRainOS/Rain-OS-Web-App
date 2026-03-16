# rain OS AI Readability Optimizer - WordPress Plugin

## Overview
rain OS AI Readability Optimizer is a WordPress plugin designed for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). It provides AI-powered content analysis across four key pillars: AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability. The plugin integrates with an external Rain OS API to offer features like title suggestions, meta description generation, content summarization, and sentence rewriting. Its primary purpose is to optimize content for AI-driven search engines, thereby enhancing content performance and discoverability for content creators and marketers.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The plugin follows WordPress plugin standards with a modular, class-based design, encompassing admin, API, and settings classes.

### UI/UX Decisions
- **Design Language**: Features a dark theme with glassmorphism effects and distinct color themes for each analysis pillar (Cyan for AI Readability, Green for Digital Authority, Purple for Conversion Readiness, Orange for Product Discoverability).
- **Editor Integration**: Supports both Gutenberg and Classic editors through meta boxes.
- **Dashboard & Analytics**: A React-based dashboard preview showcases KPI cards, performance history, pillar breakdown pie charts, and content signals scatter plots.
- **Interactive Elements**: Leverages `react-circular-progressbar`, `recharts`, and `lucide-react` for data visualization.
- **Branding**: Emphasizes "AEO" (Answer Engine Optimization) over "SEO" to align with its core focus.

### Technical Implementations
- **Four Pillars Scoring**: Content is analyzed and scored across four pillars:
    - **AI Readability**: Semantic clarity, structure, readability, and AEO alignment.
    - **Digital Authority**: Credibility, entity recognition, citation readiness, and descriptive metadata.
    - **Conversion Readiness**: Engagement, calls to action, schema extraction, and metadata audit.
    - **Product Discoverability**: Search presence, brand visibility, market positioning, schema completeness, and conversational query match.
- **Quick Tools**: Provides micro-actions such as title suggestions, meta descriptions, summarization, and rewriting, alongside authorship/provenance tracking, sub-score breakdowns, and real-time usage quota.
- **API Communication**: All analysis requests are routed through a dedicated API class using a configurable base URL and API key for bearer token authentication.
- **Data Storage**: Plugin settings are stored in WordPress options, while analysis results and provenance data are cached in post meta.
- **Local Content Audit**: Incorporates WordPress-powered checks for content quality that do not require API interaction (e.g., title presence, content length, image alt tags, internal/external links, heading structure).
- **AI Heatmap**: A feature within the Content Analyzer that highlights keywords and technology terms, color-coded by pillar categories, to indicate AI relevance.
- **AI Readiness Backend Integration**: Integrates with a headless AI backend for advanced AI readiness scores and content normalization, managed by a feature flag.
- **Gutenberg Sidebar Integration**: A React-based sidebar panel for the block editor, utilizing WordPress's built-in React globals and nonce middleware for REST API authentication.
- **URL Scanner**: Provides an interface to scan URLs for technical signals, overall scores, and pillar-specific feedback, including detailed HTML signals and recommendations.
- **Product Discoverability Mute Toggle**: Allows users to conditionally enable or disable the Product Discoverability pillar for scoring and display.

### System Design Choices
- **Modular Class-Based Design**: Enhances maintainability and extensibility.
- **AJAX Handlers**: Utilizes WordPress AJAX for dynamic content loading and interactions with nonce verification.
- **Client-Side Logic**: Employs JavaScript (jQuery for core, React for dashboard preview) for interactive elements.
- **AEO-Centric Metrics**: The system is designed around Answer Engine Optimization principles.
- **Responsive Design**: Optimized for various devices within the WordPress admin environment.

## External Dependencies
- **Rain OS API Backend**: An external Node.js/Express service providing core AI-powered content analysis, requiring a valid API key and subscription.
- **WordPress**: Minimum version 5.8+.
- **PHP**: Minimum version 7.4+, with `curl`, `json`, and `mbstring` extensions.
- **jQuery**: Utilized for front-end interactions.
- **Google Fonts**: Roboto.