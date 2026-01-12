<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$current_section = isset( $_GET['section'] ) ? sanitize_text_field( wp_unslash( $_GET['section'] ) ) : 'getting-started';

$sections = array(
    'getting-started'   => __( 'Getting Started', 'rain-os-aeo-analyzer' ),
    'three-pillars'     => __( 'The Three Pillars', 'rain-os-aeo-analyzer' ),
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
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-dashboard' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'rain-os-aeo-analyzer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-docs-layout">
        <nav class="rain-os-docs-nav">
            <?php foreach ( $sections as $key => $label ) : ?>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-docs&section=' . $key ) ); ?>" 
               class="rain-os-docs-nav-item <?php echo esc_attr( $current_section === $key ? 'active' : '' ); ?>">
                <?php echo esc_html( $label ); ?>
            </a>
            <?php endforeach; ?>
        </nav>

        <div class="rain-os-docs-content">
            <?php if ( 'getting-started' === $current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Getting Started with Rain OS AI Readability Analyzer', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Welcome to Rain OS AI Readability Analyzer! This guide will help you set up and start optimizing your content for AI-powered answer engines.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Step 1: Get Your API Key', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ol class="rain-os-docs-steps">
                        <li>
                            <strong><?php esc_html_e( 'Sign Up or Log In', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php printf( wp_kses( __( 'Visit <a href="%s" target="_blank">app.getrainos.com</a> to create your account or log in.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array(), 'target' => array() ) ) ), 'https://app.getrainos.com/#/login' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Copy Your API Key', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php esc_html_e( 'In your Rain OS dashboard, find your API key and copy it.', 'rain-os-aeo-analyzer' ); ?></p>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Configure Plugin Settings', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php printf( wp_kses( __( 'Go to <a href="%s">Rain OS > Settings</a> and paste your API key.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array() ) ) ), esc_url( admin_url( 'admin.php?page=rain-os-aeo-settings' ) ) ); ?></p>
                        </li>
                    </ol>
                </div>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Step 2: Analyze Your First Content', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php printf( wp_kses( __( 'Open any post in the block editor and look for the Rain OS AI Readability panel in the sidebar to receive your first AI Readability analysis.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array() ) ) ), esc_url( admin_url( 'edit.php' ) ) ); ?></p>
                </div>
            </div>

            <?php elseif ( 'three-pillars' === $current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Understanding the Three Pillars', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Rain OS analyzes your content based on three key pillars that determine how well AI systems can understand, trust, and extract information from your content.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card rain-os-pillar-doc rain-os-pillar-doc-cyan">
                    <h2><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Measures how easily AI systems can parse and understand your content. Includes:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'Semantic Clarity', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Clear, unambiguous language that AI can interpret correctly', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Readability Score', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'How easy it is for both humans and AI to process your content', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Logical Structure', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Proper heading hierarchy and content organization', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-docs-card rain-os-pillar-doc rain-os-pillar-doc-green">
                    <h2><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Assesses the credibility and trustworthiness of your content. Includes:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'Entity Recognition', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Links to known entities in knowledge graphs', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Citation Readiness', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Content that can be quoted and attributed', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Schema Extraction', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Structured data opportunities for rich snippets', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-docs-card rain-os-pillar-doc rain-os-pillar-doc-purple">
                    <h2><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></h2>
                    <p><?php esc_html_e( 'Evaluates how well your content drives engagement and action. Includes:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul>
                        <li><strong><?php esc_html_e( 'AI Alignment', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Content structured to provide direct answers', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'QA-Format', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Question and answer optimization', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Metadata Audit', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Schema and HTML verification', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'content-analyzer' === $current_section ) : ?>
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

            <?php elseif ( 'quick-tools' === $current_section ) : ?>
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

            <?php elseif ( 'troubleshooting' === $current_section ) : ?>
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

            <?php elseif ( 'improve-score' === $current_section ) : ?>
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
                        <li><strong><?php esc_html_e( 'Schema Extraction:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Add structured data markup (FAQ, HowTo, Article schemas). Use lists and tables for easily extractable information.', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>

                <div class="rain-os-tip-card">
                    <h3><?php esc_html_e( 'Conversion Readiness (Purple Pillar)', 'rain-os-aeo-analyzer' ); ?></h3>
                    <ul>
                        <li><strong><?php esc_html_e( 'AI Alignment:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Structure content to directly answer common questions. Start paragraphs with the key information. Use "What is X?" and "How to Y" formats.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'QA-Format:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Include FAQ sections with clear questions and concise answers. Format Q&A pairs so AI can easily extract them.', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Metadata Audit:', 'rain-os-aeo-analyzer' ); ?></strong> <?php esc_html_e( 'Ensure meta title and description are present and optimized. Validate HTML markup. Check that schema data is error-free.', 'rain-os-aeo-analyzer' ); ?></li>
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

            <?php elseif ( 'best-practices' === $current_section ) : ?>
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
