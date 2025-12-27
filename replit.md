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