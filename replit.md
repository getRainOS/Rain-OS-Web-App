# rain OS AI Readability Optimizer

## Overview
rain OS AI Readability Optimizer is a platform for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). It provides AI-powered content analysis across three solution lanes: **Writers & Marketers** (3 core pillars: AI Readability 40%, Digital Authority 30%, Conversion Readiness 30%), **Product Sellers** (dedicated Product Discoverability module at 50% weight), and **Developers** (doc-specific 3-pillar analysis). The platform consists of three clients: a WordPress plugin, a standalone web app, and a planned Chrome extension — all backed by the `api.getrainos.com` Rain OS API.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Clients

#### 1. WordPress Plugin (`rain OS AI Readability Optimizer/rain-os-aeo-analyzer/`)
Full-featured WordPress plugin packaged at `dist/rain-os-aeo-analyzer.zip`.

#### 2. Standalone Web App (`web-app/`)
Vite + React SPA running on port 3000. API key is stored in localStorage (`rain_os_api_key`). Bearer token authentication via `Authorization: Bearer {key}` header.

**Entry Flow (unauthenticated users):**
- Visitor arrives → **Marketing Landing Page** (`src/pages/LandingPage.tsx`) — full marketing site with hero, features, pricing, FAQ
- "Login" click → **Auth Gate** — API key form with "Try Demo" option and "← Back to home"
- After auth → **Analytics Dashboard** (all existing pages unchanged)

**Authenticated users** (API key in localStorage) skip directly to the dashboard.

Pages:
- **Landing Page** — Marketing homepage (Tailwind CSS, Framer Motion, rain animations). Entry for all unauthenticated visitors.
- **Auth Gate** — API key entry, validated against `GET /api/users/me`. Has `onBack` to return to landing.
- **Dashboard** — KPI cards, performance history line chart, pillar breakdown bar chart, recent analyses table
- **Content Analyzer** — Paste content, run full AEO analysis, view pillar scores + recommendations + Quick Tools
- **URL Scanner** — Enter a URL, get technical signals + pillar scores + recommendations
- **Score History** — Expandable list of all past analyses with pillar scores
- **Upgrade** — Plan comparison (Free / Pro / Business) with Stripe checkout links

Components:
- `Layout.jsx` — Sidebar with nav, usage bar, user info, upgrade button, sign-out
- `PillarScores.jsx` — Reusable pillar score display with progress bars and sub-scores
- `QuickTools.jsx` — Suggest Titles, Meta Description, Summarize, Rewrite actions

Marketing components (`src/components/marketing/`, `src/components/ui/`, `src/components/RainfallBeams.tsx`):
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin) + Framer Motion animations
- `RainfallBeams.tsx` — Canvas-based animated rain beams in the hero
- `RainBackground.tsx` — Full-page subtle rain canvas effect
- `MarketingComponents.tsx` — HybridFuture, FourPillars, FeatureGrid, ReadabilityIntelligence, ComparisonTable, ThreeModesSection, VibeCoderBand, Pricing, FAQ, CTA sections. **Testimonials removed.**
- `ThreeModesSection` — 3-card section explaining Content Analysis / URL Scanner / Repo Analysis with availability badges (WP Plugin + Web App vs. Web App Only). Placed between DemoShowcase and VibeCoderBand on LandingPage.
- `VibeCoderBand` — Vibe coder section with emerald accent, explicitly calls out GitHub repo scanning for Bolt/Lovable/Cursor/v0 users.
- UI primitives: `Button`, `Badge` (shadcn-style with class-variance-authority)

API client (`src/api/client.js`):
- `api.me()` → `GET /api/users/me`
- `api.analyze(body)` → `POST /api/analyze`
- `api.history(params)` → `GET /api/history`
- `api.scanUrl(url)` → `POST /api/scan`
- `api.citationCheck({topic, url})` → `POST /api/citation-check`
- `api.citationHistory({topic?})` → `GET /api/citation-checks` (omit `topic` for full user-wide history)
- `api.deleteCitationHistory()` → `DELETE /api/citation-checks` (used by Competitor Map "Clear history")

The Citation Monitor's Competitor Map (`web-app/src/pages/CitationMonitor.jsx`) reads from the persistent backend history (cross-device) — `web-app/src/lib/citationHistory.js` only exports the `buildCompetitorMap` aggregator now (the localStorage store has been removed).

#### 3. Chrome Extension (planned)
Future third client for the Rain OS platform.

### Analysis Modes (Web App)
Three independent analysis tools accessible from the sidebar:
1. **Content Analyzer** (`/analyze`) — Paste text → full 4-pillar AI analysis via Gemini
2. **URL Scanner** (`/url-scanner`) — Fetch a URL → static HTML signals + Gemini scoring; shows yellow JS-rendering warning banner when site requires JS, with CTA to Repo Analysis
3. **Repo Analysis** (`/repo-analysis`) — GitHub OAuth → source file analysis (README, package.json, index.html, llms.txt, robots.txt, etc.) → 4-pillar scores + ArtifactBlock recommendations

### API
- **Base URL**: `https://api.getrainos.com`
- **Auth**: `Authorization: Bearer {key}`
- **Usage**: `x-usage-info` response header; `/api/users/me` returns `usage.count`, `usage.limit`, `subscriptionStatus`, `stripePriceId`, `email`
- **Quick tool actions**: `suggest_titles`, `generate_description`, `summarize_content`, `rewrite_sentence`
- **GitHub OAuth endpoints**: `POST /api/github/oauth/init` (init, returns `{ url }` for redirect), `GET /api/github/oauth/callback` (OAuth callback, redirects to `/#/repo-analysis`)
- **Repo Analysis endpoints**: `GET /api/github/repos`, `POST /api/github/analyze`, `DELETE /api/github/disconnect`
- **GitHub env vars needed**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (Railway env), callback URL: `https://api.getrainos.com/api/github/oauth/callback`

### Stripe Price IDs
- Free: `price_1SeCHg3NMjs4uYdguOgkr3SQ`
- Pro: `price_1SeCKM3NMjs4uYdgcBRhgIhD`
- Business: `price_1SeCJH3NMjs4uYdgpi0xB0XN`

### Database Schema (users table)
Standard columns + additive GitHub columns (added via ALTER TABLE IF NOT EXISTS on startup):
- `github_id TEXT UNIQUE` — GitHub user numeric ID
- `github_login TEXT` — GitHub username (@handle)
- `encrypted_github_token TEXT` — AES-256-CBC encrypted OAuth access token

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
