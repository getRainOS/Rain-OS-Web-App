<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$rain_os_current_section = isset( $_GET['section'] ) ? sanitize_text_field( wp_unslash( $_GET['section'] ) ) : 'getting-started'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Admin-only read-only section filter; no data is modified.

$rain_os_sections = array(
    'getting-started'   => __( 'Getting Started', 'rain-os-aeo-analyzer' ),
    'four-pillars'      => __( 'The Four Pillars', 'rain-os-aeo-analyzer' ),
    'url-scanner'       => __( 'URL Scanner', 'rain-os-aeo-analyzer' ),
    'content-analyzer'  => __( 'Gutenberg Sidebar', 'rain-os-aeo-analyzer' ),
    'quick-tools'       => __( 'Quick Tools', 'rain-os-aeo-analyzer' ),
    'troubleshooting'   => __( 'Troubleshooting', 'rain-os-aeo-analyzer' ),
    'improve-score'     => __( 'Improve Your Score', 'rain-os-aeo-analyzer' ),
    'best-practices'    => __( 'Best Practices', 'rain-os-aeo-analyzer' ),
);
?>

<div class="rain-os-wrap rain-os-docs-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Documentation', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'rain-os-aeo-analyzer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-docs-layout">
        <nav class="rain-os-docs-nav">
            <?php foreach ( $rain_os_sections as $rain_os_key => $rain_os_label ) : ?>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-docs&section=' . $rain_os_key ) ); ?>" 
               class="rain-os-docs-nav-item <?php echo esc_attr( $rain_os_current_section === $rain_os_key ? 'active' : '' ); ?>">
                <?php echo esc_html( $rain_os_label ); ?>
            </a>
            <?php endforeach; ?>
        </nav>

        <div class="rain-os-docs-content">
            <?php if ( 'getting-started' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Getting Started with Rain OS AI Readability Analyzer', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Welcome to Rain OS AI Readability Analyzer! This guide will help you set up and start optimizing your content for AI-powered answer engines.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Step 1: Get Your API Key', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ol class="rain-os-docs-steps">
                        <li>
                            <strong><?php esc_html_e( 'Sign Up or Log In', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php
                            /* translators: %s: URL to the Rain OS login page */
                            printf( wp_kses( __( 'Visit <a href="%s" target="_blank">app.getrainos.com</a> to create your account or log in.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array(), 'target' => array() ) ) ), 'https://app.getrainos.com/#/login' );
                            ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Copy Your API Key', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'In your Rain OS dashboard, find your API key and copy it.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Configure Plugin Settings', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php
                            /* translators: %s: URL to the Rain OS settings page */
                            printf( wp_kses( __( 'Go to <a href="%s">Rain OS > Settings</a> and paste your API key.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array() ) ) ), esc_url( admin_url( 'admin.php?page=rain-os-aeo-settings' ) ) );
                            ?></p>
                        </li>
                    </ol>
                </div>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Step 2: Analyze Your First Content', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Open any post in the block editor and look for the Rain OS AI Readability panel in the sidebar to receive your first AI Readability analysis.', 'rain-os-aeo-analyzer' ); ?></p>
                </div>
            </div>

            <?php elseif ( 'four-pillars' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Understanding the Four Pillars', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Rain OS analyzes your content based on four key pillars that determine how well AI systems can understand, trust, extract information from, and discover your content.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card rain-os-pillar-doc rain-os-pillar-doc-cyan">
                    <h2><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Measures how easily AI systems can parse and understand your content. Includes:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'Semantic Clarity', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Clear, unambiguous language that AI can interpret correctly', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Readability Score', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'How easy it is for both humans and AI to process your content', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Logical Structure', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Proper heading hierarchy and content organization', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'AEO Alignment', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Content structured for answer engine optimization', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-docs-card rain-os-pillar-doc rain-os-pillar-doc-green">
                    <h2><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Assesses the credibility and trustworthiness of your content. Includes:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'Entity Recognition', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Links to known entities in knowledge graphs', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Citation Readiness', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Content that can be quoted and attributed', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Descriptive Metadata', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Meta tags and descriptive content for AI indexing', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-docs-card rain-os-pillar-doc rain-os-pillar-doc-purple">
                    <h2><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Evaluates how well your content drives engagement and action. Includes:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'Schema Extraction', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Structured data opportunities for rich snippets', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'QA-Format Detection', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Question and answer optimization', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Metadata Audit', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Schema and HTML verification', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-docs-card rain-os-pillar-doc rain-os-pillar-doc-orange">
                    <h2><?php esc_html_e( 'Product Discoverability', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Measures how easily your product or service can be found through AI-powered search and recommendation systems. Includes:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'Schema Completeness', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'How thoroughly structured data markup covers your content and products', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Answer Layer Quality', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'How well your content provides direct, extractable answers for AI systems', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Freshness Signals', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Indicators that your content is current, updated, and time-relevant', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Conversational Query Match', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'How well your content aligns with natural language and voice search queries', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'url-scanner' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'URL Scanner', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'The URL Scanner lets you analyze any publicly accessible web page for AEO readiness — without creating or editing a WordPress post. Enter a URL, run the scan, and receive a full four-pillar score plus a technical HTML signal audit.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'What the URL Scanner Does', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'The scanner fetches the target URL and evaluates it across two dimensions:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'AEO Pillar Scores', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'The same four-pillar analysis (AI Readability, Digital Authority, Conversion Readiness, Product Discoverability) that you use for your own posts — applied to any public URL.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Technical HTML Signals', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'A set of 9 pass/fail checks that identify the presence or absence of critical technical elements affecting AI discoverability.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                    <p><?php esc_html_e( 'Common use cases include auditing competitor pages, checking a landing page before publishing, or scanning any page on your own site that lives outside of WordPress.', 'rain-os-aeo-analyzer' ); ?></p>
                </div>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'How to Use the URL Scanner', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ol class="rain-os-docs-steps">
                        <li>
                            <strong><?php esc_html_e( 'Go to Rain OS > URL Scanner', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php
                            /* translators: %s: URL to the Rain OS URL Scanner page */
                            printf( wp_kses( __( 'Navigate to <a href="%s">Rain OS &rsaquo; URL Scanner</a> in your WordPress admin sidebar.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array() ) ) ), esc_url( admin_url( 'admin.php?page=rain-os-aeo-url-scanner' ) ) );
                            ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Enter the URL', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Paste the full URL you want to analyze (must start with http:// or https://). The target page must be publicly accessible — pages behind login screens or firewalls cannot be scanned.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Select an Industry (optional)', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Choosing an industry helps the scoring engine weight the analysis for your specific context (e.g. e-commerce, SaaS, news, healthcare).', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Click Scan URL', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'The scanner sends the URL to the Rain OS API, fetches and parses the page, then returns scores and signals within a few seconds.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Review Results', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'The results area shows your overall AEO score, four pillar scores with color-coded bars, the 9-signal technical audit, and a list of improvement recommendations.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                    </ol>
                </div>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Understanding the 9 Technical HTML Signals', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Technical signals are binary pass/fail checks. Each one indicates whether a key structural element is present on the page.', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li>
                            <strong><?php esc_html_e( 'Schema Markup', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Checks whether the page includes any structured data in JSON-LD, Microdata, or RDFa format. Schema markup helps AI and search engines understand what your content is about and can unlock rich results.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'FAQ Schema', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Checks for the presence of FAQPage or Question/Answer structured data. FAQ schema makes individual Q&A pairs directly extractable by AI answer engines.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Semantic HTML', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Checks whether the page uses semantic HTML5 elements such as &lt;article&gt;, &lt;section&gt;, &lt;main&gt;, &lt;nav&gt;, and &lt;aside&gt;. These elements give AI systems strong contextual signals about content roles and structure.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Proper Heading Hierarchy', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Verifies that the page contains at least one H1 tag and that headings follow a logical descending order (H1 → H2 → H3). Correct heading structure is one of the strongest signals for AI content parsing.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Meta Description', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Checks for a &lt;meta name="description"&gt; tag. A descriptive meta description signals to AI systems what the page is about and is often used in snippet generation.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Canonical Tag', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Checks for a &lt;link rel="canonical"&gt; tag. Canonical tags prevent duplicate content issues and ensure AI systems attribute authority to the correct URL.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Open Graph Tags', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Checks for Open Graph meta tags (og:title, og:description, og:image). These tags improve how your content is represented when shared or cited by AI systems and social platforms.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'llms.txt', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Checks whether the site has a /llms.txt file at its root. This emerging standard allows site owners to provide AI crawlers with a structured, plain-language summary of site content and permissions — similar to robots.txt but designed for large language models.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'JS Rendering Risk', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'Flags pages that appear to require JavaScript execution to render meaningful content. Heavily JS-dependent pages (e.g. single-page apps with client-side rendering) may not be fully parsed by AI crawlers that do not execute JavaScript. A pass here means the page delivers meaningful HTML without JS; a fail indicates a rendering risk.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                    </ul>
                </div>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Understanding the Results Sections', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ul>
                        <li><strong><?php esc_html_e( 'Overall AEO Score', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'A composite score (0–100) averaging the four pillar scores. Higher is better. Scores above 70 indicate strong AI readiness; below 40 indicates significant improvement opportunities.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Four Pillar Bars', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Color-coded bars showing the individual score for each pillar. Cyan = AI Readability, Green = Digital Authority, Purple = Conversion Readiness, Orange = Product Discoverability.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Technical Signals Grid', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'A 9-item grid showing pass (green check) or fail (red X) for each technical signal. Failures are the quickest wins — they can usually be fixed with a small technical change.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Recommendations', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'A prioritized list of improvement actions generated by the Rain OS API, ordered from highest to lowest expected score impact.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'URL Scanner vs Content Analyzer', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Both tools provide AEO scoring, but they serve different workflows:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'Content Analyzer / Gutenberg Sidebar', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Best for analyzing and improving your own WordPress posts and pages during editing. Results are saved to Score History.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'URL Scanner', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Best for auditing competitor pages, external landing pages, or any public URL outside of WordPress. Results are not saved to Score History.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'content-analyzer' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Using the Gutenberg Sidebar', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'The Gutenberg Sidebar is your primary tool for evaluating and improving your content AI Readability performance directly in the WordPress block editor.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Sidebar Features', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ul>
                        <li><strong><?php esc_html_e( 'AI Readability Score', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'See your overall score and pillar breakdown at a glance', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Quick Actions', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Generate titles, meta descriptions, summaries, and rewrites', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Detailed Metrics', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'View sub-scores for each pillar category', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Local Audit', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Quick checks for title, length, headings, and formatting', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'quick-tools' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Quick Tools', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Quick Tools provide AI-powered micro-actions to enhance your content quickly. Available to all subscribers.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Available Tools', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ul>
                        <li><strong><?php esc_html_e( 'Title Suggestion', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Generate optimized title alternatives for your content', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Meta Description', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Create compelling meta descriptions automatically', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Summarize', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Generate a concise summary of your content', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Rewrite', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Get alternative versions of selected text', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'troubleshooting' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Troubleshooting', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Common issues and solutions', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-troubleshoot-item">
                    <h3><?php esc_html_e( 'Analysis is not working or returns an error', 'rain-os-aeo-analyzer' ); ?></h3>
                    <p><?php esc_html_e( 'First, check that your API key is correctly entered in Rain OS > Settings. Verify your subscription is active and you have remaining API credits. If the issue persists, check your server error logs for PHP errors.', 'rain-os-aeo-analyzer' ); ?></p>
                    <div class="rain-os-troubleshoot-steps">
                        <strong><?php esc_html_e( 'Steps to resolve:', 'rain-os-aeo-analyzer' ); ?></strong>
                        <ol>
                            <li><?php esc_html_e( 'Verify API key in Settings', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Check subscription status', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Ensure PHP curl extension is enabled', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Check server error logs', 'rain-os-aeo-analyzer' ); ?></li>
                        </ol>
                    </div>
                </div>

                <div class="rain-os-troubleshoot-item">
                    <h3><?php esc_html_e( 'Scores seem inconsistent or unexpected', 'rain-os-aeo-analyzer' ); ?></h3>
                    <p><?php esc_html_e( 'AI analysis can produce slightly different results each time due to the nature of AI models. However, scores should be generally consistent. If you see major variations, try clearing your browser cache and running the analysis again.', 'rain-os-aeo-analyzer' ); ?></p>
                    <div class="rain-os-troubleshoot-steps">
                        <strong><?php esc_html_e( 'Steps to resolve:', 'rain-os-aeo-analyzer' ); ?></strong>
                        <ol>
                            <li><?php esc_html_e( 'Clear browser cache', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Wait a few minutes and re-analyze', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Ensure content has saved properly', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Check for special characters that may affect parsing', 'rain-os-aeo-analyzer' ); ?></li>
                        </ol>
                    </div>
                </div>

                <div class="rain-os-troubleshoot-item">
                    <h3><?php esc_html_e( 'The plugin is slow or timing out', 'rain-os-aeo-analyzer' ); ?></h3>
                    <p><?php esc_html_e( 'Analysis requires sending content to our API servers. Large content (10,000+ words) may take longer. Check your internet connection and server timeout settings. You may need to increase PHP max_execution_time.', 'rain-os-aeo-analyzer' ); ?></p>
                    <div class="rain-os-troubleshoot-steps">
                        <strong><?php esc_html_e( 'Steps to resolve:', 'rain-os-aeo-analyzer' ); ?></strong>
                        <ol>
                            <li><?php esc_html_e( 'Check internet connection', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Increase PHP max_execution_time', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Try analyzing smaller content first', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Contact support if issue persists', 'rain-os-aeo-analyzer' ); ?></li>
                        </ol>
                    </div>
                </div>

                <div class="rain-os-troubleshoot-item">
                    <h3><?php esc_html_e( 'Quick Tools are not available', 'rain-os-aeo-analyzer' ); ?></h3>
                    <p><?php esc_html_e( 'Quick Tools require a valid API key and active subscription. Verify your subscription status in your Rain OS account dashboard. If you recently subscribed, try logging out and back in to refresh your access.', 'rain-os-aeo-analyzer' ); ?></p>
                    <div class="rain-os-troubleshoot-steps">
                        <strong><?php esc_html_e( 'Steps to resolve:', 'rain-os-aeo-analyzer' ); ?></strong>
                        <ol>
                            <li><?php esc_html_e( 'Verify subscription status', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Log out and log back in', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Clear plugin cache', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Re-enter API key', 'rain-os-aeo-analyzer' ); ?></li>
                        </ol>
                    </div>
                </div>

                <div class="rain-os-troubleshoot-item">
                    <h3><?php esc_html_e( 'Usage quota shows incorrect numbers', 'rain-os-aeo-analyzer' ); ?></h3>
                    <p><?php esc_html_e( 'Usage is tracked on our servers and may take a few minutes to sync. The quota resets at the beginning of each billing cycle. Check your account dashboard for the most accurate usage information.', 'rain-os-aeo-analyzer' ); ?></p>
                    <div class="rain-os-troubleshoot-steps">
                        <strong><?php esc_html_e( 'Steps to resolve:', 'rain-os-aeo-analyzer' ); ?></strong>
                        <ol>
                            <li><?php esc_html_e( 'Refresh the page', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Check account dashboard', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Wait a few minutes for sync', 'rain-os-aeo-analyzer' ); ?></li>
                            <li><?php esc_html_e( 'Contact support if discrepancy persists', 'rain-os-aeo-analyzer' ); ?></li>
                        </ol>
                    </div>
                </div>

                <div class="rain-os-support-cta">
                    <h3><?php esc_html_e( 'Still need help?', 'rain-os-aeo-analyzer' ); ?></h3>
                    <p><?php esc_html_e( 'Contact our support team at support@getrainos.com', 'rain-os-aeo-analyzer' ); ?></p>
                    <a href="mailto:support@getrainos.com" class="rain-os-btn rain-os-btn-primary">
                        <?php esc_html_e( 'Contact Support', 'rain-os-aeo-analyzer' ); ?>
                    </a>
                </div>
            </div>

            <?php elseif ( 'improve-score' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Improve Your Score', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Practical tips and strategies to boost your content scores', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-tip-card">
                    <h3><?php esc_html_e( 'AI Readability (Cyan Pillar)', 'rain-os-aeo-analyzer' ); ?></h3>
                    <ul>
                        <li><strong><?php esc_html_e( 'Semantic Clarity:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Use precise, unambiguous language. Avoid jargon or define it when used. Write sentences that express one clear idea each.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Readability Score:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Aim for shorter sentences (15-20 words average). Use active voice. Break up long paragraphs into digestible chunks.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Logical Structure:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Use proper heading hierarchy (H1, H2, H3). Organize content from general to specific. Include transition phrases between sections.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-tip-card">
                    <h3><?php esc_html_e( 'Digital Authority (Green Pillar)', 'rain-os-aeo-analyzer' ); ?></h3>
                    <ul>
                        <li><strong><?php esc_html_e( 'Entity Recognition:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Mention well-known entities (people, companies, concepts) by their full names. Link to authoritative sources like Wikipedia for key terms.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Citation Readiness:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Include quotable statements that stand alone. Write "soundbite" sentences that summarize key points. Use statistics and data points with sources.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Descriptive Metadata:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Provide rich meta tags, descriptions, and structured content that helps AI systems understand and index your content.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-tip-card">
                    <h3><?php esc_html_e( 'Conversion Readiness (Purple Pillar)', 'rain-os-aeo-analyzer' ); ?></h3>
                    <ul>
                        <li><strong><?php esc_html_e( 'Schema Extraction:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Add structured data markup (FAQ, HowTo, Article schemas). Use lists and tables for easily extractable information.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'QA-Format Detection:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Include FAQ sections with clear questions and concise answers. Format Q&A pairs so AI can easily extract them.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Metadata Audit:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Ensure meta title and description are present and optimized. Validate HTML markup. Check that schema data is error-free.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-tip-card">
                    <h3><?php esc_html_e( 'Product Discoverability (Orange Pillar)', 'rain-os-aeo-analyzer' ); ?></h3>
                    <ul>
                        <li><strong><?php esc_html_e( 'Schema Completeness:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Ensure your product pages use comprehensive structured data markup. Include product schema, FAQ schema, and breadcrumb schema where applicable.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Answer Layer Quality:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Structure content to provide clear, direct answers that AI systems can extract. Use concise definitions, summaries, and key takeaways.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Freshness Signals:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Keep content current with updated dates, recent references, and timely information. AI systems prioritize fresh, regularly maintained content.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Conversational Query Match:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Write content that naturally answers questions people ask in conversational search. Include question-format headings and direct response patterns.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-tip-card">
                    <h3><?php esc_html_e( 'Quick Wins for Better Scores', 'rain-os-aeo-analyzer' ); ?></h3>
                    <ul>
                        <li><?php esc_html_e( 'Add a clear, descriptive title that includes your main topic', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Write a compelling meta description (150-160 characters)', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Include an FAQ section with 3-5 common questions', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Add alt text to all images', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Include internal links to related content on your site', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Add external links to authoritative sources', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Break content into sections with descriptive subheadings', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'best-practices' === $rain_os_current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'AI Readability Best Practices', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Follow these guidelines to maximize your content performance in AI answer engines.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Content Structure', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ol class="rain-os-docs-steps">
                        <li><?php esc_html_e( 'Use clear, descriptive headings (H1, H2, H3)', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Keep paragraphs focused and concise', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Include bullet points and numbered lists', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Add structured data/schema markup', 'rain-os-aeo-analyzer' ); ?></li>
                    </ol>
                </div>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Writing for AI', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ol class="rain-os-docs-steps">
                        <li><?php esc_html_e( 'Answer questions directly and clearly', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Define terms and acronyms', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Use consistent terminology throughout', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><?php esc_html_e( 'Include relevant citations and sources', 'rain-os-aeo-analyzer' ); ?></li>
                    </ol>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>
