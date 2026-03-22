# rain OS AI Readability Optimizer

## Overview
rain OS AI Readability Optimizer is a platform for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). It provides AI-powered content analysis across four key pillars: AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability. The platform consists of three clients: a WordPress plugin, a standalone web app, and a planned Chrome extension — all backed by the `api.getrainos.com` Rain OS API.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Clients

#### 1. WordPress Plugin (`rain OS AI Readability Optimizer/rain-os-aeo-analyzer/`)
Full-featured WordPress plugin packaged at `dist/rain-os-aeo-analyzer.zip`.

#### 2. Standalone Web App (`web-app/`)
Vite + React SPA running on port 3000. API key is stored in localStorage (`rain_os_api_key`). Bearer token authentication via `Authorization: Bearer {key}` header.

Pages:
- **Auth Gate** — API key entry, validated against `GET /api/users/me`
- **Dashboard** — KPI cards, performance history line chart, pillar breakdown bar chart, recent analyses table
- **Content Analyzer** — Paste content, run full AEO analysis, view pillar scores + recommendations + Quick Tools
- **URL Scanner** — Enter a URL, get technical signals + pillar scores + recommendations
- **Score History** — Expandable list of all past analyses with pillar scores
- **Upgrade** — Plan comparison (Free / Pro / Business) with Stripe checkout links

Components:
- `Layout.jsx` — Sidebar with nav, usage bar, user info, upgrade button, sign-out
- `PillarScores.jsx` — Reusable pillar score display with progress bars and sub-scores
- `QuickTools.jsx` — Suggest Titles, Meta Description, Summarize, Rewrite actions

API client (`src/api/client.js`):
- `api.me()` → `GET /api/users/me`
- `api.analyze(body)` → `POST /api/analyze`
- `api.history(params)` → `GET /api/history`
- `api.scanUrl(url)` → `POST /api/scan`

#### 3. Chrome Extension (planned)
Future third client for the Rain OS platform.

### API
- **Base URL**: `https://api.getrainos.com`
- **Auth**: `Authorization: Bearer {key}`
- **Usage**: `x-usage-info` response header; `/api/users/me` returns `usage.count`, `usage.limit`, `subscriptionStatus`, `stripePriceId`, `email`
- **Quick tool actions**: `suggest_titles`, `generate_description`, `summarize_content`, `rewrite_sentence`

### Stripe Price IDs
- Free: `price_1SeCHg3NMjs4uYdguOgkr3SQ`
- Pro: `price_1SeCKM3NMjs4uYdgcBRhgIhD`
- Business: `price_1SeCJH3NMjs4uYdgpi0xB0XN`

### UI/UX Decisions
- **Design Language**: Dark theme — bg `#020410`, surface `#040714`, accent `#0EA5E9`, font Inter
- **Four Pillar Colors**: Cyan (AI Readability), Green (Digital Authority), Purple (Conversion Readiness), Orange (Product Discoverability)
- **Product Discoverability Mute Toggle**: Allows users to disable the PD pillar; WordPress option `rain_os_pd_enabled`

### WordPress Plugin Technical Details
- **Modular Class-Based Design**: Enhances maintainability and extensibility
- **AJAX Handlers**: WordPress AJAX with nonce verification
- **Gutenberg Sidebar**: React-based sidebar panel with nonce middleware for REST API authentication
- **URL Scanner**: Interface to scan URLs for technical signals and pillar feedback
- **Editor Integration**: Supports both Gutenberg and Classic editors through meta boxes

## External Dependencies
- **Rain OS API Backend**: External Node.js/Express service at `api.getrainos.com`
- **WordPress**: Minimum version 5.8+
- **PHP**: Minimum version 7.4+, with `curl`, `json`, and `mbstring` extensions
- **jQuery**: Front-end interactions in the plugin
- **React + Vite**: Web app and dashboard preview
- **recharts**: Charts in web app and dashboard preview
- **Google Fonts**: Roboto (plugin), Inter (web app)
