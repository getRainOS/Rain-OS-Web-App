=== rain OS AI Readability Optimizer ===
Contributors: rainos
Tags: aeo, ai, content optimization, answer engine, seo
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 2.3.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI-powered AEO & GEO optimizer for WordPress. Optimize your content for AI search engines: ChatGPT, Perplexity, Google Overviews & Gemini.

== Description ==

rain OS AI Readability Optimizer helps you optimize your content for AI-powered answer engines like Google AI Overviews, ChatGPT, Perplexity, Claude, and Gemini.

= Features =

* **Four Pillars Analysis** - Analyze your content across AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability
* **Content Analyzer** - Full-featured standalone editor with formatting toolbar and real-time analysis
* **URL Scanner** - Scan any public URL to evaluate its AEO readiness and technical HTML structure without creating a post
* **Gutenberg Sidebar Panel** - Analyze content directly inside the WordPress block editor with a dedicated sidebar
* **AI Heatmap** - Color-coded highlighting showing keyword relevance by category
* **Score History** - Track your content performance over time with trend indicators
* **Pillar Breakdown** - Detailed subcategory scores with visual charts across all 14 sub-scores
* **Content Signals** - Word count vs score correlation analysis
* **Technical HTML Signals** - Check 9 technical factors including Schema Markup, FAQ Schema, Semantic HTML, Open Graph, llms.txt, and more
* **Quick Tools** - AI-powered title suggestions, meta descriptions, summarization, and rewriting
* **Product Discoverability Mute Toggle** - Optionally mute the 4th pillar if it is not relevant to your content type
* **Dark Theme Dashboard** - Beautiful, modern glassmorphism admin interface

= Four Pillars =

1. **AI Readability** (Cyan) - Measures how easily AI systems can parse and understand your content: Semantic Clarity, Readability Score, Logical Structure, AEO Alignment
2. **Digital Authority** (Green) - Assesses credibility, trust signals, and citation readiness: Entity Recognition, Citation Readiness, Descriptive Metadata
3. **Conversion Readiness** (Purple) - Evaluates content structure for direct answers and engagement: Schema Extraction, QA-Format Detection, Metadata Audit
4. **Product Discoverability** (Orange) - Measures how easily your product or service can be found through AI search: Schema Completeness, Answer Layer Quality, Freshness Signals, Conversational Query Match

= URL Scanner =

The URL Scanner lets you analyze any public URL without creating a WordPress post. Enter a URL, optionally select an industry, and receive:

* Overall AEO score and all four pillar scores
* 9 technical HTML signal checks (Schema Markup, FAQ Schema, Semantic HTML, Heading Hierarchy, Meta Description, Canonical Tag, Open Graph Tags, llms.txt presence, JS Rendering risk)
* Technical recommendations for improving your page structure
* Content-level recommendations for improving pillar scores

= Requirements =

* WordPress 5.8 or higher
* PHP 7.4 or higher
* Rain OS API key (get yours at https://app.getrainos.com/#/login)

== External Services ==

This plugin connects to two external services to provide its features. By activating and using this plugin, you agree to the terms and privacy policies of those services.

= Rain OS API (https://api.getrainos.com) =

All AI-powered analysis is performed by the Rain OS API. The following data is sent to this service when you trigger an analysis:

* Your content (title and body text) for pillar scoring and Quick Tools
* A URL you provide when using the URL Scanner
* Your Rain OS API key (sent as a bearer token in the request header)

This service is used for: content scoring across four pillars (AI Readability, Digital Authority, Conversion Readiness, Product Discoverability), URL scanning, Quick Tools (title suggestions, meta descriptions, summarization, rewriting), and subscription/usage tracking.

* Terms of Service: https://getrainos.com/terms
* Privacy Policy: https://getrainos.com/privacy

No data is sent to the Rain OS API automatically. Requests are only made when you click Analyze, Scan URL, or use a Quick Tool.

= Stripe (via Rain OS API) =

Subscription billing and payment processing is handled by Stripe through the Rain OS API. When you initiate an upgrade or manage your billing, you are redirected to a Stripe-hosted checkout or billing portal page. No payment card data is transmitted through or stored by this plugin.

* Stripe Terms of Service: https://stripe.com/legal
* Stripe Privacy Policy: https://stripe.com/privacy

== Source Code ==

This plugin includes compiled JavaScript built from human-readable source code. The full, unminified source is publicly available on GitHub:

https://github.com/getRainOS/rain-os-aeo-analyzer

The Gutenberg sidebar (`build/gutenberg-sidebar.js`) is compiled from the `src/` directory using webpack and Babel. To build from source:

1. Clone or download the repository from https://github.com/getRainOS/rain-os-aeo-analyzer
2. Navigate to the plugin directory: `cd "rain OS AI Readability Optimizer/rain-os-aeo-analyzer"`
3. Install dependencies: `npm install`
4. Build the plugin: `npm run build`

The minified charting library (`assets/js/chart.min.js`) is Chart.js, an open-source library. Its full source code is available at: https://github.com/chartjs/Chart.js

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/rain-os-aeo-analyzer/` or install through WordPress plugins screen
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Go to Rain OS > Settings and enter your API key
4. Start analyzing your content!

== Frequently Asked Questions ==

= Where do I get an API key? =

Visit https://app.getrainos.com/#/login to create an account and get your API key.

= What is AEO? =

Answer Engine Optimization (AEO) is the practice of optimizing content for AI-powered answer engines that provide direct responses to user queries.

= How is this different from SEO? =

While SEO focuses on ranking in traditional search results, AEO focuses on having your content selected and cited by AI systems that generate direct answers.

= What are Quick Tools? =

Quick Tools are AI-powered features that provide micro-actions like title suggestions, meta description generation, content summarization, and sentence rewriting. They are available to all users with an active subscription.

= What is the URL Scanner? =

The URL Scanner lets you enter any public URL and receive an AEO analysis including pillar scores and technical HTML signal checks. It is useful for auditing competitor pages or scanning pages outside of WordPress.

= What is Product Discoverability? =

Product Discoverability is the fourth analysis pillar, measuring how easily AI search and recommendation systems can find and surface your product or service. You can mute this pillar in Settings if it is not relevant to your content.

== Screenshots ==

1. Dashboard with KPI cards and performance charts
2. Content Analyzer with formatting toolbar
3. URL Scanner with technical signals grid
4. Score History with colored indicators
5. Pillar Breakdown with horizontal bar charts for all four pillars
6. Gutenberg Sidebar with real-time analysis
7. Settings page with API configuration and PD mute toggle

== Changelog ==

= 2.3.0 =
* Added fourth pillar: Product Discoverability with 4 sub-scores (Schema Completeness, Answer Layer Quality, Freshness Signals, Conversational Query Match)
* Added URL Scanner page for scanning any public URL with AEO analysis and technical HTML signal detection
* Added Gutenberg Sidebar panel for analyzing content directly in the WordPress block editor
* Added Product Discoverability Mute Toggle to optionally exclude the 4th pillar from scoring
* Added 9 technical HTML signal checks: Schema Markup, FAQ Schema, Semantic HTML, Heading Hierarchy, Meta Description, Canonical Tag, Open Graph Tags, llms.txt, JS Rendering
* Updated all dashboards and templates to display four pillars
* Updated database schema with product_discoverability column and automatic migration
* Updated admin menu: Dashboard is now the landing page; Content Analyzer and URL Scanner grouped together
* Updated documentation with URL Scanner guide and four pillar references
* Plugin version bumped to 2.3.0

= 1.0.0 =
* Initial release
* Three Pillars analysis (AI Readability, Digital Authority, Conversion Readiness)
* Content Analyzer with rich text editor
* AI Heatmap visualization
* Score History tracking
* Pillar Breakdown charts
* Content Signals scatter plot
* Quick Tools
* Dark theme admin dashboard

== Upgrade Notice ==

= 2.3.0 =
Major update: adds Product Discoverability (4th pillar), URL Scanner with technical HTML signals, Gutenberg Sidebar panel, and PD mute toggle. Database migration runs automatically.

= 1.0.0 =
Initial release of rain OS AI Readability Optimizer.
