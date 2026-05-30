<?php
/**
 * Meta Box Template
 * Post editor meta box with 5-pillar analysis display and Pro tools
 */

if (!defined('ABSPATH')) {
    exit;
}

$api = new Rain_OS_API();
$is_configured = $api->is_configured();
$default_industry = get_option('rain_os_default_industry', 'General / Other');
$industries = Rain_OS_Settings::get_industries();
$usage = get_option('rain_os_usage', array('count' => 0, 'limit' => 100));
$usage_count = isset($usage['count']) ? intval($usage['count']) : 0;
$usage_limit = isset($usage['limit']) ? intval($usage['limit']) : 100;
$save_provenance = get_option('rain_os_save_provenance', false);
?>

<div class="rain-os-metabox">
    <?php if (!$is_configured) : ?>
        <div class="rain-os-metabox-notice rain-os-metabox-notice-warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
                <strong><?php esc_html_e('API Not Configured', 'rain-os-seo'); ?></strong>
                <p><?php echo wp_kses(sprintf(__('Please <a href="%s">configure your API settings</a> to start analyzing content.', 'rain-os-seo'), esc_url(admin_url('admin.php?page=rain-os-settings'))), array('a' => array('href' => array()))); ?></p>
            </div>
        </div>
    <?php else : ?>
        <div class="rain-os-metabox-tabs">
            <button type="button" class="rain-os-metabox-tab active" data-tab="analysis" aria-label="Analysis">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <?php esc_html_e('Analysis', 'rain-os-seo'); ?>
            </button>
            <button type="button" class="rain-os-metabox-tab" data-tab="quick-tools" aria-label="Quick Tools">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <?php esc_html_e('Quick Tools', 'rain-os-seo'); ?>
                <span class="rain-os-pro-badge">Pro</span>
            </button>
        </div>

        <div class="rain-os-metabox-panel active" id="rain-os-panel-analysis">
            <div class="rain-os-metabox-header">
                <div class="rain-os-metabox-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <?php esc_html_e('AEO Analysis', 'rain-os-seo'); ?>
                </div>
                <div class="rain-os-metabox-controls">
                    <div class="rain-os-metabox-industry">
                        <label for="rain-os-industry"><?php esc_html_e('Industry:', 'rain-os-seo'); ?></label>
                        <select id="rain-os-industry" class="rain-os-select rain-os-select-sm" aria-label="Select industry">
                            <?php foreach ($industries as $industry) : ?>
                                <option value="<?php echo esc_attr($industry); ?>" <?php selected($default_industry, $industry); ?>><?php echo esc_html($industry); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button type="button" class="rain-os-btn rain-os-btn-primary rain-os-btn-sm" id="rain-os-analyze-btn" aria-label="Analyze Content">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" class="rain-os-analyze-icon">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" class="rain-os-spinner-icon" style="display:none;">
                            <line x1="12" y1="2" x2="12" y2="6"/>
                            <line x1="12" y1="18" x2="12" y2="22"/>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                            <line x1="2" y1="12" x2="6" y2="12"/>
                            <line x1="18" y1="12" x2="22" y2="12"/>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                        </svg>
                        <span class="rain-os-analyze-text"><?php esc_html_e('Analyze Content', 'rain-os-seo'); ?></span>
                    </button>
                </div>
            </div>

            <div class="rain-os-usage-widget" id="rain-os-usage-widget">
                <div class="rain-os-usage-bar">
                    <div class="rain-os-usage-fill" style="width: <?php echo esc_attr(min(100, ($usage_count / max(1, $usage_limit)) * 100)); ?>%;"></div>
                </div>
                <span class="rain-os-usage-text"><?php echo esc_html($usage_count); ?> / <?php echo esc_html($usage_limit); ?> <?php esc_html_e('analyses', 'rain-os-seo'); ?></span>
            </div>

            <div id="rain-os-results" class="rain-os-results" style="display:none;">
                <div class="rain-os-score-display">
                    <div class="rain-os-score-donut">
                        <svg viewBox="0 0 80 80">
                            <circle fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6" cx="40" cy="40" r="35"/>
                            <circle id="rain-os-overall-gauge" fill="none" stroke="#22D3EE" stroke-width="6" stroke-linecap="round" cx="40" cy="40" r="35" 
                                style="stroke-dasharray: 0 219.9; transform: rotate(-90deg); transform-origin: center; filter: drop-shadow(0 0 8px rgba(34,211,238,0.5));"/>
                        </svg>
                        <div class="rain-os-score-value">
                            <span class="rain-os-score-number" id="rain-os-overall-score">0</span>
                        </div>
                    </div>
                    <div class="rain-os-score-info">
                        <h4 id="rain-os-score-label"><?php esc_html_e('Analyzing...', 'rain-os-seo'); ?></h4>
                        <p id="rain-os-score-message"><?php esc_html_e('Your content is being analyzed for AI readability.', 'rain-os-seo'); ?></p>
                        <div class="rain-os-tags">
                            <span class="rain-os-tag" id="rain-os-score-tag"></span>
                        </div>
                    </div>
                </div>

                <div class="rain-os-pillars" id="rain-os-pillar-scores">
                </div>

                <div class="rain-os-pro-section rain-os-subscores-section" id="rain-os-subscores-section" style="display:none;">
                    <div class="rain-os-pro-header">
                        <h5>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M3 3v18h18"/>
                                <path d="M18 17V9"/>
                                <path d="M13 17V5"/>
                                <path d="M8 17v-3"/>
                            </svg>
                            <?php esc_html_e('Score Breakdown', 'rain-os-seo'); ?>
                        </h5>
                        <span class="rain-os-pro-badge">Pro</span>
                    </div>
                    <div class="rain-os-subscores-grid" id="rain-os-subscores-grid">
                    </div>
                </div>

                <div class="rain-os-pro-section rain-os-authorship-section" id="rain-os-authorship-section" style="display:none;">
                    <div class="rain-os-pro-header">
                        <h5>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <?php esc_html_e('Authorship / Provenance', 'rain-os-seo'); ?>
                        </h5>
                        <span class="rain-os-pro-badge">Pro</span>
                    </div>
                    <div class="rain-os-authorship-card" id="rain-os-authorship-card">
                        <div class="rain-os-authorship-row">
                            <span class="rain-os-authorship-label"><?php esc_html_e('Hash:', 'rain-os-seo'); ?></span>
                            <span class="rain-os-authorship-value" id="rain-os-authorship-hash">-</span>
                        </div>
                        <div class="rain-os-authorship-row">
                            <span class="rain-os-authorship-label"><?php esc_html_e('Timestamp:', 'rain-os-seo'); ?></span>
                            <span class="rain-os-authorship-value" id="rain-os-authorship-timestamp">-</span>
                        </div>
                        <div class="rain-os-authorship-row">
                            <span class="rain-os-authorship-label"><?php esc_html_e('Status:', 'rain-os-seo'); ?></span>
                            <span class="rain-os-authorship-value" id="rain-os-authorship-status">-</span>
                        </div>
                        <div class="rain-os-authorship-actions">
                            <button type="button" class="rain-os-btn rain-os-btn-sm rain-os-btn-secondary" id="rain-os-copy-provenance" aria-label="Copy provenance">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                                <?php esc_html_e('Copy', 'rain-os-seo'); ?>
                            </button>
                            <label class="rain-os-toggle-label">
                                <input type="checkbox" id="rain-os-save-provenance-toggle" <?php checked($save_provenance, true); ?>>
                                <span class="rain-os-toggle-switch"></span>
                                <?php esc_html_e('Save to post', 'rain-os-seo'); ?>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="rain-os-divider"></div>

                <div class="rain-os-recommendations" id="rain-os-recommendations" style="display:none;">
                    <h5>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        <?php esc_html_e('Recommendations', 'rain-os-seo'); ?>
                    </h5>
                    <ul class="rain-os-recommendations-list"></ul>
                </div>

                <div class="rain-os-keywords" id="rain-os-keywords">
                    <h5>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        <?php esc_html_e('Keywords Detected', 'rain-os-seo'); ?>
                    </h5>
                    <div class="rain-os-keywords-list"></div>
                </div>
            </div>

            <div id="rain-os-placeholder" class="rain-os-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p><?php esc_html_e('Click "Analyze Content" to get AI-powered insights about your content.', 'rain-os-seo'); ?></p>
            </div>
        </div>

        <div class="rain-os-metabox-panel" id="rain-os-panel-quick-tools">
            <div class="rain-os-quick-tools">
                <div class="rain-os-quick-tools-grid">
                    <button type="button" class="rain-os-quick-tool-btn" data-action="suggest_titles" aria-label="Suggest Titles">
                        <div class="rain-os-quick-tool-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </div>
                        <div class="rain-os-quick-tool-text">
                            <span class="rain-os-quick-tool-title"><?php esc_html_e('Suggest Titles', 'rain-os-seo'); ?></span>
                            <span class="rain-os-quick-tool-desc"><?php esc_html_e('Get AI-generated title suggestions', 'rain-os-seo'); ?></span>
                        </div>
                    </button>
                    <button type="button" class="rain-os-quick-tool-btn" data-action="generate_description" aria-label="Generate Meta Description">
                        <div class="rain-os-quick-tool-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <path d="M14 2v6h6"/>
                                <path d="M16 13H8M16 17H8M10 9H8"/>
                            </svg>
                        </div>
                        <div class="rain-os-quick-tool-text">
                            <span class="rain-os-quick-tool-title"><?php esc_html_e('Meta Description', 'rain-os-seo'); ?></span>
                            <span class="rain-os-quick-tool-desc"><?php esc_html_e('Generate optimized meta description', 'rain-os-seo'); ?></span>
                        </div>
                    </button>
                    <button type="button" class="rain-os-quick-tool-btn" data-action="summarize_content" aria-label="Summarize Content">
                        <div class="rain-os-quick-tool-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <line x1="21" y1="10" x2="3" y2="10"/>
                                <line x1="21" y1="6" x2="3" y2="6"/>
                                <line x1="21" y1="14" x2="3" y2="14"/>
                                <line x1="21" y1="18" x2="3" y2="18"/>
                            </svg>
                        </div>
                        <div class="rain-os-quick-tool-text">
                            <span class="rain-os-quick-tool-title"><?php esc_html_e('Summarize', 'rain-os-seo'); ?></span>
                            <span class="rain-os-quick-tool-desc"><?php esc_html_e('Create a concise content summary', 'rain-os-seo'); ?></span>
                        </div>
                    </button>
                </div>

                <div class="rain-os-rewrite-tool">
                    <h5>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M23 4v6h-6M1 20v-6h6"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        <?php esc_html_e('Rewrite Sentence', 'rain-os-seo'); ?>
                    </h5>
                    <div class="rain-os-rewrite-input-group">
                        <textarea id="rain-os-rewrite-input" class="rain-os-textarea" placeholder="<?php esc_attr_e('Paste or type a sentence to rewrite...', 'rain-os-seo'); ?>" rows="2" aria-label="Sentence to rewrite"></textarea>
                        <button type="button" class="rain-os-btn rain-os-btn-primary rain-os-btn-sm" id="rain-os-rewrite-btn" aria-label="Rewrite">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="rain-os-rewrite-icon">
                                <path d="M23 4v6h-6M1 20v-6h6"/>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="rain-os-rewrite-spinner" style="display:none;">
                                <line x1="12" y1="2" x2="12" y2="6"/>
                                <line x1="12" y1="18" x2="12" y2="22"/>
                                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                            </svg>
                            <?php esc_html_e('Rewrite', 'rain-os-seo'); ?>
                        </button>
                    </div>
                </div>

                <div class="rain-os-tool-results" id="rain-os-tool-results" style="display:none;">
                    <div class="rain-os-tool-results-header">
                        <h5 id="rain-os-tool-results-title"><?php esc_html_e('Results', 'rain-os-seo'); ?></h5>
                        <button type="button" class="rain-os-btn-close" id="rain-os-close-results" aria-label="Close results">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="rain-os-tool-results-content" id="rain-os-tool-results-content">
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

<div class="rain-os-subscore-drawer" id="rain-os-subscore-drawer" style="display:none;">
    <div class="rain-os-drawer-overlay"></div>
    <div class="rain-os-drawer-content">
        <div class="rain-os-drawer-header">
            <h4 id="rain-os-drawer-title"><?php esc_html_e('Score Details', 'rain-os-seo'); ?></h4>
            <button type="button" class="rain-os-btn-close" id="rain-os-close-drawer" aria-label="Close drawer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="rain-os-drawer-body">
            <div class="rain-os-drawer-score" id="rain-os-drawer-score">
                <span class="rain-os-drawer-score-value">0</span>
                <span class="rain-os-drawer-score-label">/100</span>
            </div>
            <div class="rain-os-drawer-why">
                <h5><?php esc_html_e('Why it matters', 'rain-os-seo'); ?></h5>
                <p id="rain-os-drawer-why-text"></p>
            </div>
            <div class="rain-os-drawer-recommendations">
                <h5><?php esc_html_e('Recommendations', 'rain-os-seo'); ?></h5>
                <ul id="rain-os-drawer-recommendations-list"></ul>
            </div>
        </div>
    </div>
</div>

<div id="rain-os-alert" class="rain-os-alert" style="display:none;">
    <div class="rain-os-alert-icon"></div>
    <div class="rain-os-alert-content">
        <strong class="rain-os-alert-title"></strong>
        <p class="rain-os-alert-message"></p>
    </div>
    <button type="button" class="rain-os-alert-close" aria-label="Close alert">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    </button>
</div>
