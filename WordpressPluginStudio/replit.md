# Rain OS AI Readability Optimization - WordPress Plugin

## Overview
A professional, production-ready WordPress plugin called "Rain OS" that provides AI-powered content analysis for Answer Engine Optimization (AEO). The plugin features a billion-dollar SaaS aesthetic with dark mode glassmorphism design matching the Rain OS marketing website, multiple donut charts for the 3-pillar analysis hierarchy, and premium UI elements.

## Project Structure
```
rain-os-seo/
├── rain-os-seo.php              # Main plugin file with headers and initialization
├── README.txt                   # WordPress.org standard readme
├── includes/
│   ├── class-rain-os-admin.php  # Admin menu, meta boxes, asset enqueuing
│   ├── class-rain-os-api.php    # API communication with backend
│   └── class-rain-os-settings.php # Settings management and AJAX handlers
├── templates/
│   ├── dashboard.php            # Main dashboard page
│   ├── settings.php             # Settings page with tabs
│   └── meta-box.php             # Post editor meta box
└── assets/
    ├── css/
    │   └── admin.css            # Premium dark theme with glassmorphism
    ├── js/
    │   └── admin.js             # jQuery-based interactions
    └── images/
        └── rain-os-logo.png     # Rain OS cloud logo

preview/                         # PHP-based preview system (legacy)
├── index.php                    # Preview router
├── dashboard-preview.php        # Dashboard preview with 3 pillars
├── content-analyzer-preview.php # Content analyzer with Pro features
├── settings-preview.php         # Settings preview
├── preview.css                  # Preview-specific styles
├── preview.js                   # Preview interactions
└── rain-os-logo.png             # Logo for preview

dashboard-preview/               # React-based analytics dashboard (current)
├── src/
│   ├── App.jsx                  # Main dashboard with Recharts charts
│   ├── index.css                # Dark theme CSS with animations
│   └── main.jsx                 # React entry point
├── vite.config.js               # Vite config (port 5000, allowedHosts)
└── package.json                 # Dependencies (recharts, lucide-react)
```

## Technical Requirements
- **PHP Version**: 7.4+ (tested up to 8.2)
- **WordPress Version**: 5.8+
- **PHP Extensions**: curl, json, mbstring

## Three Pillars of AEO Analysis

### Pillar 1: AI Readability (Cyan #22D3EE)
Focus: Can AI models parse and understand your content?
- **Semantic Clarity**: Language precision and unambiguous terms
- **Logical Structure**: Heading hierarchy and section flow
- **Readability**: Sentence flow and complexity for humans and AI

### Pillar 2: Digital Authority (Green #10B981)
Focus: Is your content credible and trustworthy?
- **Descriptive Metadata**: Schema markup, alt tags, semantic HTML
- **Entity Recognition**: Knowledge graph linking for key entities
- **Citation Readiness**: Quotable snippets and extractable facts

### Pillar 3: Conversion Readiness (Purple #A855F7)
Focus: Is your content structured to provide answers?
- **AEO Alignment**: Direct conversational answers for voice/chat
- **Schema Extraction**: FAQ schema, How-to schema detection
- **QA-Format Detection**: Question & Answer formatting quality

## Features Implemented

### Core Functionality
1. **Plugin Activation/Deactivation**
   - Version checks for PHP and WordPress
   - Extension requirement validation
   - Default options initialization

2. **Admin Menu System**
   - Main menu "Rain OS" with cloud logo icon
   - Submenu: Dashboard, Settings
   - Menu position: 30 (after Comments)

3. **Dashboard Page (React Version)**
   - Fixed sidebar (192px) with admin bar (48px) and cyan active state
   - 4 KPI cards: Total Analyses, Average Score, Content Health %, API Usage %
   - Performance History line chart (2/3 width) with dashed baseline comparison
   - Pillar Breakdown donut chart (1/3 width) with overall score in center
   - Analysis Categories horizontal bar chart (9 metric categories)
   - Content Signals scatter plot (word count vs score correlation)
   - Header with search input, notification bell, and "New Analysis" CTA
   - Fade-in animations (fadeInUp keyframe) on page load
   - Hover effects on cards: translateY(-2px) with border glow
   - Built with Recharts and Lucide React icons
   - Connection status with pulse animation

4. **Settings Page**
   - Tabbed interface with gradient active state
   - API Configuration, General Settings, About tabs
   - Glassmorphism form inputs
   - Test connection with visual feedback

5. **Content Analyzer Page**
   - Full content editor with toolbar (bold, italic, heading, link, list, image, video)
   - Multi-ring donut chart showing overall AEO score
   - Donut legend with three pillars breakdown
   - Analysis tabs (Readability, Authority, Conversion) with subcategory scores
   - Content metrics (words, reading time, headings, questions)
   - 13 content type categories dropdown
   - 8 industry categories dropdown
   - Dark/Light mode toggle

### API Integration
- **Base URL**: Configurable endpoint
- **Authentication**: Bearer token
- **Endpoints**:
  - POST /api/analyze - Content analysis
  - GET /api/users/me - User verification

### Design System (Matching Marketing Website)

**Color Palette - Night Sky Theme**
- Background: `#0F172A` (dark navy) to `#312E81` (deep purple) gradient
- Primary: `#6366f1` (indigo) with glow effects
- Cyan: `#22D3EE` for AI Readability pillar
- Success: `#10B981` (emerald) for Digital Authority pillar
- Purple: `#A855F7` for Conversion Readiness pillar
- Text: `#F8FAFC` (primary), `#94A3B8` (secondary), `#64748B` (muted)

**Glassmorphism Effects**
- Cards: `rgba(255,255,255,0.05)` background with `backdrop-filter: blur(20px)`
- Borders: `rgba(255,255,255,0.1)` subtle glass edges
- Top highlight: Linear gradient creating light reflection effect
- Glow shadows: Colored shadows matching accent colors

**Donut Charts**
- SVG-based with correct circumference calculations (2πr)
- Stroke-dasharray for progress visualization
- Drop-shadow glow filters
- Multi-ring nested charts for pillar overview

**Components**
- Glass cards with hover lift animation
- Gradient buttons with shadow
- Pulse animations for status indicators
- Accordion panels with chevron rotation
- Tags/pills with colored backgrounds
- Pillar cards with top accent borders

## Security Implementation
- Nonce verification on all AJAX calls
- Capability checks (manage_options, edit_posts)
- Input sanitization (sanitize_text_field, esc_url_raw, wp_kses_post)
- Output escaping (esc_html, esc_attr, esc_url)
- wp_remote_post for API calls with timeout

## Installation
1. Copy the `rain-os-seo` folder to WordPress `/wp-content/plugins/`
2. Activate the plugin in WordPress admin
3. Navigate to Rain OS > Settings
4. Enter your API endpoint and API key
5. Click "Test Connection" to verify
6. Start analyzing content!

## Development Notes
- Dark theme design matching Rain OS marketing website
- CSS custom properties for consistent theming
- SVG-based charts with accurate math (no external libraries)
- jQuery for WordPress compatibility
- Responsive design with mobile breakpoints

## User Preferences
- "AI Readability Optimization" branding (not "SEO Analyzer")
- Rain OS cloud logo throughout
- "Make Your Content Defensible" tagline from marketing
- Three-pillar analysis hierarchy with 9 subcategories
- Billion-dollar SaaS aesthetic with dark mode
- Glassmorphism effects and neon accents

## Recent Updates (December 2024)

### URL and Email Standardization
- All upgrade/login URLs standardized to `https://app.getrainos.com/#/login`
- All support emails standardized to `support@getrainos.com`
- API base URL: `https://api.getrainos.com/v1`
- Files updated: settings.php, upgrade.php, documentation.php, help.php, class-rain-os-settings.php, class-rain-os-api-client.php, readme.txt, App.jsx
