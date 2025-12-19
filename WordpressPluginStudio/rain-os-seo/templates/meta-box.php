<?php
/**
 * Meta Box Template
 * Post editor meta box with 3-pillar analysis display
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
                    <select id="rain-os-industry" class="rain-os-select rain-os-select-sm">
                        <?php foreach ($industries as $industry) : ?>
                            <option value="<?php echo esc_attr($industry); ?>" <?php selected($default_industry, $industry); ?>><?php echo esc_html($industry); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="button" class="rain-os-btn rain-os-btn-primary rain-os-btn-sm" id="rain-os-analyze-btn">
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

            <div class="rain-os-pillars" id="rain-os-pillars">
            </div>

            <div class="rain-os-divider"></div>

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
    <?php endif; ?>
</div>

<div id="rain-os-alert" class="rain-os-alert" style="display:none;">
    <div class="rain-os-alert-icon"></div>
    <div class="rain-os-alert-content">
        <strong class="rain-os-alert-title"></strong>
        <p class="rain-os-alert-message"></p>
    </div>
    <button type="button" class="rain-os-alert-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    </button>
</div>
