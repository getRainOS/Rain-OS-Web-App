<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="rain-os-wrap rain-os-analyzer-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Content Analyzer', 'ai-readability-optimizer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-dashboard' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'ai-readability-optimizer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-analyzer-content">
        <div class="rain-os-analyzer-main">
            <header class="rain-os-page-header">
                <h1><?php esc_html_e( 'Content Analyzer', 'ai-readability-optimizer' ); ?></h1>
                <p><?php esc_html_e( 'Analyze your content for AI readability, digital authority, and conversion readiness', 'ai-readability-optimizer' ); ?></p>
            </header>

            <div class="rain-os-editor-card">
                <div class="rain-os-editor-toolbar">
                    <button type="button" class="rain-os-toolbar-btn" data-command="bold" title="<?php esc_attr_e( 'Bold', 'ai-readability-optimizer' ); ?>"><strong>B</strong></button>
                    <button type="button" class="rain-os-toolbar-btn" data-command="italic" title="<?php esc_attr_e( 'Italic', 'ai-readability-optimizer' ); ?>"><em>I</em></button>
                    <button type="button" class="rain-os-toolbar-btn" data-command="underline" title="<?php esc_attr_e( 'Underline', 'ai-readability-optimizer' ); ?>"><u>U</u></button>
                    <span class="rain-os-toolbar-divider"></span>
                    <button type="button" class="rain-os-toolbar-btn" data-command="formatBlock" data-value="h1" title="<?php esc_attr_e( 'Heading 1', 'ai-readability-optimizer' ); ?>">H1</button>
                    <button type="button" class="rain-os-toolbar-btn" data-command="formatBlock" data-value="h2" title="<?php esc_attr_e( 'Heading 2', 'ai-readability-optimizer' ); ?>">H2</button>
                    <button type="button" class="rain-os-toolbar-btn" data-command="formatBlock" data-value="h3" title="<?php esc_attr_e( 'Heading 3', 'ai-readability-optimizer' ); ?>">H3</button>
                    <span class="rain-os-toolbar-divider"></span>
                    <button type="button" class="rain-os-toolbar-btn" data-command="insertUnorderedList" title="<?php esc_attr_e( 'Bullet List', 'ai-readability-optimizer' ); ?>">
                        <span class="dashicons dashicons-editor-ul"></span>
                    </button>
                    <button type="button" class="rain-os-toolbar-btn" data-command="createLink" title="<?php esc_attr_e( 'Insert Link', 'ai-readability-optimizer' ); ?>">
                        <span class="dashicons dashicons-admin-links"></span>
                    </button>
                    <span class="rain-os-toolbar-divider"></span>
                    <button type="button" class="rain-os-toolbar-btn rain-os-heatmap-btn" id="toggle-heatmap" title="<?php esc_attr_e( 'AI Heatmap: Highlights keywords color-coded by pillar category', 'ai-readability-optimizer' ); ?>">
                        <span class="dashicons dashicons-visibility"></span>
                        <?php esc_html_e( 'AI Heatmap', 'ai-readability-optimizer' ); ?>
                    </button>
                    <div class="rain-os-toolbar-spacer"></div>
                    <span class="rain-os-word-count">0 <?php esc_html_e( 'words', 'ai-readability-optimizer' ); ?></span>
                </div>

                <div class="rain-os-editor-title-wrap">
                    <input type="text" id="rain-os-content-title" class="rain-os-editor-title" placeholder="<?php esc_attr_e( 'Enter title...', 'ai-readability-optimizer' ); ?>" />
                </div>

                <div class="rain-os-editor-separator"></div>

                <div id="rain-os-content-editor" class="rain-os-editor" contenteditable="true" placeholder="<?php esc_attr_e( 'Start writing or paste your content here...', 'ai-readability-optimizer' ); ?>"></div>

                <div class="rain-os-editor-actions">
                    <button type="button" id="rain-os-analyze-btn" class="rain-os-btn rain-os-btn-primary">
                        <span class="dashicons dashicons-search"></span>
                        <?php esc_html_e( 'Analyze Content', 'ai-readability-optimizer' ); ?>
                    </button>
                    <button type="button" id="rain-os-clear-btn" class="rain-os-btn rain-os-btn-secondary">
                        <?php esc_html_e( 'Clear', 'ai-readability-optimizer' ); ?>
                    </button>
                </div>
            </div>

            <div class="rain-os-local-audit">
                <h3><?php esc_html_e( 'Local Content Audit', 'ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-audit-grid">
                    <div class="rain-os-audit-item" data-check="title">
                        <span class="rain-os-audit-checkbox"></span>
                        <span class="rain-os-audit-label"><?php esc_html_e( 'Title Present', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-audit-item" data-check="length">
                        <span class="rain-os-audit-checkbox"></span>
                        <span class="rain-os-audit-label"><?php esc_html_e( 'Content Length (300+ words)', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-audit-item" data-check="headings">
                        <span class="rain-os-audit-checkbox"></span>
                        <span class="rain-os-audit-label"><?php esc_html_e( 'Heading Structure', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-audit-item" data-check="links">
                        <span class="rain-os-audit-checkbox"></span>
                        <span class="rain-os-audit-label"><?php esc_html_e( 'Internal/External Links', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-audit-item" data-check="lists">
                        <span class="rain-os-audit-checkbox"></span>
                        <span class="rain-os-audit-label"><?php esc_html_e( 'Lists/Formatting', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-audit-item" data-check="paragraphs">
                        <span class="rain-os-audit-checkbox"></span>
                        <span class="rain-os-audit-label"><?php esc_html_e( 'Paragraph Structure', 'ai-readability-optimizer' ); ?></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="rain-os-analyzer-sidebar">
            <div class="rain-os-sidebar-section rain-os-ai-scores-section">
                <h3><?php esc_html_e( 'AI - Powered Readability Analysis', 'ai-readability-optimizer' ); ?></h3>
                <div id="rain-os-ai-readiness-scores" class="rain-os-ai-readiness-scores">
                    <div class="rain-os-ai-score-row">
                        <span class="rain-os-ai-score-label"><?php esc_html_e( 'Readability', 'ai-readability-optimizer' ); ?></span>
                        <span class="rain-os-ai-score-value" data-score="readability">--</span>
                    </div>
                    <div class="rain-os-ai-score-row">
                        <span class="rain-os-ai-score-label"><?php esc_html_e( 'Structure', 'ai-readability-optimizer' ); ?></span>
                        <span class="rain-os-ai-score-value" data-score="structure">--</span>
                    </div>
                    <div class="rain-os-ai-score-row">
                        <span class="rain-os-ai-score-label"><?php esc_html_e( 'Freshness', 'ai-readability-optimizer' ); ?></span>
                        <span class="rain-os-ai-score-value" data-score="freshness">--</span>
                    </div>
                    <div class="rain-os-ai-score-row">
                        <span class="rain-os-ai-score-label"><?php esc_html_e( 'Citation Readiness', 'ai-readability-optimizer' ); ?></span>
                        <span class="rain-os-ai-score-value" data-score="citation">--</span>
                    </div>
                    <div class="rain-os-ai-score-row">
                        <span class="rain-os-ai-score-label"><?php esc_html_e( 'AI Visibility', 'ai-readability-optimizer' ); ?></span>
                        <span class="rain-os-ai-score-value" data-score="visibility">--</span>
                    </div>
                    <div class="rain-os-ai-normalize-wrap">
                        <button type="button" id="rain-os-normalize-btn" class="rain-os-btn rain-os-btn-secondary rain-os-btn-small">
                            <span class="dashicons dashicons-cloud-upload"></span>
                            <?php esc_html_e( 'Normalize Content', 'ai-readability-optimizer' ); ?>
                        </button>
                        <p class="rain-os-normalize-help"><?php esc_html_e( 'Send content to AI backend for analysis', 'ai-readability-optimizer' ); ?></p>
                    </div>
                    <div class="rain-os-ai-reanalyze-wrap">
                        <button type="button" id="rain-os-reanalyze-btn" class="rain-os-btn rain-os-btn-primary rain-os-btn-small">
                            <span class="dashicons dashicons-update"></span>
                            <?php esc_html_e( 'Reanalyze Content', 'ai-readability-optimizer' ); ?>
                        </button>
                    </div>
                </div>
            </div>

            <div class="rain-os-sidebar-section rain-os-recommendations-section">
                <h3><?php esc_html_e( 'Recommendations', 'ai-readability-optimizer' ); ?></h3>
                <div id="rain-os-recommendations" class="rain-os-recommendations">
                    <p class="rain-os-no-recommendations"><?php esc_html_e( 'No recommendations at this time.', 'ai-readability-optimizer' ); ?></p>
                </div>
            </div>

            <div class="rain-os-sidebar-section rain-os-about-section">
                <h3><?php esc_html_e( 'About AI Readiness', 'ai-readability-optimizer' ); ?></h3>
                <p class="rain-os-about-text"><?php esc_html_e( 'AI Readiness scores measure how well your content is optimized for AI-powered search engines and answer engines. The scores reflect readability, structural clarity, freshness signals, citation readiness, and overall visibility to AI systems.', 'ai-readability-optimizer' ); ?></p>
            </div>

            <div class="rain-os-sidebar-section">
                <h3><?php esc_html_e( 'Analysis Results', 'ai-readability-optimizer' ); ?></h3>
                <div id="rain-os-analysis-results" class="rain-os-analysis-results">
                    <div class="rain-os-no-results">
                        <span class="dashicons dashicons-analytics"></span>
                        <p><?php esc_html_e( 'Click "Analyze Content" to see your AEO scores', 'ai-readability-optimizer' ); ?></p>
                    </div>
                </div>
            </div>

            <div class="rain-os-sidebar-section rain-os-quick-tools">
                <h3><?php esc_html_e( 'Quick Tools', 'ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-quick-tools-grid">
                    <button type="button" class="rain-os-quick-tool" data-tool="title_suggestion">
                        <span class="dashicons dashicons-edit"></span>
                        <?php esc_html_e( 'Title Suggestion', 'ai-readability-optimizer' ); ?>
                    </button>
                    <button type="button" class="rain-os-quick-tool" data-tool="meta_description">
                        <span class="dashicons dashicons-text"></span>
                        <?php esc_html_e( 'Meta Description', 'ai-readability-optimizer' ); ?>
                    </button>
                    <button type="button" class="rain-os-quick-tool" data-tool="summarize">
                        <span class="dashicons dashicons-editor-justify"></span>
                        <?php esc_html_e( 'Summarize', 'ai-readability-optimizer' ); ?>
                    </button>
                    <button type="button" class="rain-os-quick-tool" data-tool="rewrite">
                        <span class="dashicons dashicons-update"></span>
                        <?php esc_html_e( 'Rewrite', 'ai-readability-optimizer' ); ?>
                    </button>
                </div>
            </div>

            <div class="rain-os-sidebar-section rain-os-heatmap-legend" style="display: none;">
                <h3><?php esc_html_e( 'Heatmap Legend', 'ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-legend-items">
                    <div class="rain-os-legend-item">
                        <span class="rain-os-legend-color rain-os-legend-cyan"></span>
                        <span><?php esc_html_e( 'AI Readability', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-legend-item">
                        <span class="rain-os-legend-color rain-os-legend-green"></span>
                        <span><?php esc_html_e( 'Digital Authority', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-legend-item">
                        <span class="rain-os-legend-color rain-os-legend-purple"></span>
                        <span><?php esc_html_e( 'Conversion Readiness', 'ai-readability-optimizer' ); ?></span>
                    </div>
                    <div class="rain-os-legend-item">
                        <span class="rain-os-legend-color rain-os-legend-yellow"></span>
                        <span><?php esc_html_e( 'Needs Citation', 'ai-readability-optimizer' ); ?></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
