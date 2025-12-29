<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$current_section = isset( $_GET['section'] ) ? sanitize_text_field( wp_unslash( $_GET['section'] ) ) : 'getting-started';

$sections = array(
    'getting-started' => __( 'Getting Started', 'rain-os-aeo-analyzer' ),
    'three-pillars'   => __( 'The Three Pillars', 'rain-os-aeo-analyzer' ),
    'content-analyzer' => __( 'Content Analyzer', 'rain-os-aeo-analyzer' ),
    'quick-tools'     => __( 'Quick Tools', 'rain-os-aeo-analyzer' ),
    'best-practices'  => __( 'Best Practices', 'rain-os-aeo-analyzer' ),
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
            <?php foreach ( $sections as $key => $label ) : ?>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-docs&section=' . $key ) ); ?>" 
               class="rain-os-docs-nav-item <?php echo $current_section === $key ? 'active' : ''; ?>">
                <?php echo esc_html( $label ); ?>
            </a>
            <?php endforeach; ?>
        </nav>

        <div class="rain-os-docs-content">
            <?php if ( 'getting-started' === $current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Getting Started with Rain OS AEO Analyzer', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Welcome to Rain OS AEO Analyzer! This guide will help you set up and start optimizing your content for AI-powered answer engines.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Step 1: Get Your API Key', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ol class="rain-os-docs-steps">
                        <li>
                            <strong><?php esc_html_e( 'Sign Up or Log In', 'rain-os-aeo-analyzer' ); ?></strong>
                            <p><?php printf( wp_kses( __( 'Visit <a href="%s" target="_blank">app.getrainos.com</a> to create your account or log in.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array(), 'target' => array() ) ) ), 'https://www.app.getrainos.com' ); ?></p>
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
                    <p><?php printf( wp_kses( __( 'Navigate to <a href="%s">Content Analyzer</a> and paste your content to receive your first AEO analysis.', 'rain-os-aeo-analyzer' ), array( 'a' => array( 'href' => array() ) ) ), esc_url( admin_url( 'admin.php?page=rain-os-aeo-analyzer' ) ) ); ?></p>
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
                        <li><strong><?php esc_html_e( 'AEO Alignment', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Content structured to provide direct answers', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'QA-Format', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Question and answer optimization', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Metadata Audit', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Schema and HTML verification', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'content-analyzer' === $current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Using the Content Analyzer', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'The Content Analyzer is your primary tool for evaluating and improving your content AEO performance.', 'rain-os-aeo-analyzer' ); ?></p>

                <div class="rain-os-docs-card">
                    <h2><?php esc_html_e( 'Editor Features', 'rain-os-aeo-analyzer' ); ?></h2>
                    <ul>
                        <li><strong><?php esc_html_e( 'Rich Text Toolbar', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Format your content with headings, bold, italic, lists, and links', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'AI Heatmap', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Color-coded highlighting showing which parts of your content relate to each pillar', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Word Count', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Real-time word count as you type', 'rain-os-aeo-analyzer' ); ?></li>
                        <li><strong><?php esc_html_e( 'Local Audit', 'rain-os-aeo-analyzer' ); ?>:</strong> <?php esc_html_e( 'Quick checks for title, length, headings, and formatting', 'rain-os-aeo-analyzer' ); ?></li>
                    </ul>
                </div>
            </div>

            <?php elseif ( 'quick-tools' === $current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'Quick Tools (Pro Feature)', 'rain-os-aeo-analyzer' ); ?></h1>
                <p class="rain-os-docs-intro"><?php esc_html_e( 'Quick Tools provide AI-powered micro-actions to enhance your content quickly.', 'rain-os-aeo-analyzer' ); ?></p>

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

            <?php elseif ( 'best-practices' === $current_section ) : ?>
            <div class="rain-os-docs-section">
                <h1><?php esc_html_e( 'AEO Best Practices', 'rain-os-aeo-analyzer' ); ?></h1>
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
