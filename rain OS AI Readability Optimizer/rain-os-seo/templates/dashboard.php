<?php
/**
 * Dashboard Template
 * Main dashboard page with 5-pillar analysis overview
 */

if (!defined('ABSPATH')) {
    exit;
}

$api = new Rain_OS_API();
$is_configured = $api->is_configured();
$usage = get_option('rain_os_usage', array('count' => 0, 'limit' => 100));
$usage_count = isset($usage['count']) ? intval($usage['count']) : 0;
$usage_limit = isset($usage['limit']) ? intval($usage['limit']) : 100;

$pillars = array(
    array(
        'name' => __('AI Readability', 'rain-os-seo'),
        'score' => 88,
        'color' => '#22D3EE',
        'glow' => 'rgba(34, 211, 238, 0.5)',
        'description' => __('Can AI models parse and understand your content?', 'rain-os-seo'),
        'subcategories' => array(
            array('name' => __('Semantic Clarity', 'rain-os-seo'), 'score' => 92, 'desc' => __('Language precision & clarity', 'rain-os-seo')),
            array('name' => __('Logical Structure', 'rain-os-seo'), 'score' => 85, 'desc' => __('Heading hierarchy & flow', 'rain-os-seo')),
            array('name' => __('Readability', 'rain-os-seo'), 'score' => 87, 'desc' => __('Sentence flow & complexity', 'rain-os-seo')),
        )
    ),
    array(
        'name' => __('Digital Authority', 'rain-os-seo'),
        'score' => 78,
        'color' => '#10B981',
        'glow' => 'rgba(16, 185, 129, 0.5)',
        'description' => __('Is your content credible and trustworthy?', 'rain-os-seo'),
        'subcategories' => array(
            array('name' => __('Descriptive Metadata', 'rain-os-seo'), 'score' => 82, 'desc' => __('Schema markup & semantic HTML', 'rain-os-seo')),
            array('name' => __('Entity Recognition', 'rain-os-seo'), 'score' => 75, 'desc' => __('Knowledge graph linking', 'rain-os-seo')),
            array('name' => __('Citation Readiness', 'rain-os-seo'), 'score' => 77, 'desc' => __('Quotable snippets & facts', 'rain-os-seo')),
        )
    ),
    array(
        'name' => __('Conversion Readiness', 'rain-os-seo'),
        'score' => 84,
        'color' => '#A855F7',
        'glow' => 'rgba(168, 85, 247, 0.5)',
        'description' => __('Is your content structured to provide answers?', 'rain-os-seo'),
        'subcategories' => array(
            array('name' => __('AEO Alignment', 'rain-os-seo'), 'score' => 86, 'desc' => __('Direct conversational answers', 'rain-os-seo')),
            array('name' => __('Schema Extraction', 'rain-os-seo'), 'score' => 80, 'desc' => __('FAQ & How-to schema', 'rain-os-seo')),
            array('name' => __('QA-Format Detection', 'rain-os-seo'), 'score' => 86, 'desc' => __('Q&A formatting quality', 'rain-os-seo')),
        )
    )
);

$overall_score = round(($pillars[0]['score'] + $pillars[1]['score'] + $pillars[2]['score']) / 3);

function rain_os_get_stroke_dasharray($percentage, $radius = 54) {
    $circumference = 2 * M_PI * $radius;
    return ($percentage / 100 * $circumference) . ' ' . $circumference;
}
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <img src="<?php echo esc_url(RAIN_OS_PLUGIN_URL . 'assets/images/rain-os-logo.png'); ?>" alt="Rain OS" class="rain-os-logo-img" width="40" height="40">
                <span class="rain-os-title"><span class="rain-white">R</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e('AI Readability Optimization', 'rain-os-seo'); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <?php if ($is_configured) : ?>
                <div class="rain-os-status">
                    <div class="rain-os-status-dot online"></div>
                    <span class="rain-os-status-text"><?php esc_html_e('API Connected', 'rain-os-seo'); ?></span>
                </div>
                <?php endif; ?>
                <a href="<?php echo esc_url(admin_url('admin.php?page=rain-os-settings')); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/>
                    </svg>
                    <?php esc_html_e('Settings', 'rain-os-seo'); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <?php if (!$is_configured) : ?>
            <div class="rain-os-hero">
                <div class="rain-os-hero-content">
                    <span class="rain-os-hero-label"><?php esc_html_e('YOUR SEO COMPANION', 'rain-os-seo'); ?></span>
                    <h1 class="rain-os-hero-title"><?php esc_html_e('Make Your Content', 'rain-os-seo'); ?> <span class="rain-os-hero-accent"><?php esc_html_e('Defensible', 'rain-os-seo'); ?></span></h1>
                    <p class="rain-os-hero-subtitle"><?php esc_html_e('AI-powered insights for Answer Engine Optimization', 'rain-os-seo'); ?></p>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=rain-os-settings')); ?>" class="rain-os-btn rain-os-btn-primary rain-os-btn-lg">
                        <?php esc_html_e('Configure API Settings', 'rain-os-seo'); ?>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </div>
        <?php else : ?>
            <div class="rain-os-hero">
                <div class="rain-os-hero-content">
                    <span class="rain-os-hero-label"><?php esc_html_e('YOUR SEO COMPANION', 'rain-os-seo'); ?></span>
                    <h1 class="rain-os-hero-title"><?php esc_html_e('Make Your Content', 'rain-os-seo'); ?> <span class="rain-os-hero-accent"><?php esc_html_e('Defensible', 'rain-os-seo'); ?></span></h1>
                    <p class="rain-os-hero-subtitle"><?php esc_html_e('AI-powered insights for Answer Engine Optimization', 'rain-os-seo'); ?></p>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;">
                        <span class="rain-os-tag info"><?php echo esc_html(sprintf(__('%d Analyses Used', 'rain-os-seo'), $usage_count)); ?></span>
                        <span class="rain-os-tag success"><?php echo esc_html(sprintf(__('%d Remaining', 'rain-os-seo'), $usage_limit - $usage_count)); ?></span>
                        <span class="rain-os-tag warning"><?php esc_html_e('Pro Plan', 'rain-os-seo'); ?></span>
                    </div>
                </div>
            </div>

            <div class="rain-os-overall-score">
                <div class="rain-os-overall-donut">
                    <svg viewBox="0 0 160 160">
                        <circle class="rain-os-donut-track" cx="80" cy="80" r="70"/>
                        <circle class="rain-os-donut-progress overall" cx="80" cy="80" r="70" style="stroke-dasharray: <?php echo esc_attr(rain_os_get_stroke_dasharray($overall_score, 70)); ?>"/>
                    </svg>
                    <div class="rain-os-donut-value">
                        <span class="rain-os-donut-number large"><?php echo esc_html($overall_score); ?></span>
                        <span class="rain-os-donut-label"><?php esc_html_e('Overall AEO', 'rain-os-seo'); ?></span>
                    </div>
                </div>
                <div class="rain-os-overall-info">
                    <h3><?php esc_html_e('Content Health Score', 'rain-os-seo'); ?></h3>
                    <p><?php esc_html_e('Your content is performing well across all five pillars. Focus on improving Digital Authority for maximum AI visibility.', 'rain-os-seo'); ?></p>
                    <div class="rain-os-mini-bars">
                        <?php foreach ($pillars as $pillar) : ?>
                        <div class="rain-os-mini-bar-item">
                            <div class="rain-os-mini-bar-label">
                                <span><?php echo esc_html($pillar['name']); ?></span>
                                <span style="color: <?php echo esc_attr($pillar['color']); ?>"><?php echo esc_html($pillar['score']); ?>%</span>
                            </div>
                            <div class="rain-os-mini-bar-track">
                                <div class="rain-os-mini-bar-fill" style="width: <?php echo esc_attr($pillar['score']); ?>%; background: <?php echo esc_attr($pillar['color']); ?>;"></div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <h2 class="rain-os-section-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
                <?php esc_html_e('Five Pillars of AEO', 'rain-os-seo'); ?>
            </h2>

            <div class="rain-os-pillars-grid">
                <?php foreach ($pillars as $pillar) : ?>
                <div class="rain-os-pillar-card" style="--pillar-color: <?php echo esc_attr($pillar['color']); ?>; --pillar-glow: <?php echo esc_attr($pillar['glow']); ?>">
                    <div class="rain-os-pillar-header">
                        <div class="rain-os-pillar-donut">
                            <svg viewBox="0 0 100 100">
                                <circle class="rain-os-donut-track" cx="50" cy="50" r="42"/>
                                <circle class="rain-os-donut-progress pillar" cx="50" cy="50" r="42" style="stroke: <?php echo esc_attr($pillar['color']); ?>; stroke-dasharray: <?php echo esc_attr(rain_os_get_stroke_dasharray($pillar['score'], 42)); ?>; filter: drop-shadow(0 0 8px <?php echo esc_attr($pillar['glow']); ?>);"/>
                            </svg>
                            <div class="rain-os-donut-value">
                                <span class="rain-os-donut-number"><?php echo esc_html($pillar['score']); ?></span>
                            </div>
                        </div>
                        <div class="rain-os-pillar-info">
                            <h3><?php echo esc_html($pillar['name']); ?></h3>
                            <p><?php echo esc_html($pillar['description']); ?></p>
                        </div>
                    </div>
                    <div class="rain-os-pillar-subcategories">
                        <?php foreach ($pillar['subcategories'] as $sub) : ?>
                        <div class="rain-os-subcategory">
                            <div class="rain-os-subcategory-header">
                                <span class="rain-os-subcategory-name"><?php echo esc_html($sub['name']); ?></span>
                                <span class="rain-os-subcategory-score" style="color: <?php echo esc_attr($pillar['color']); ?>"><?php echo esc_html($sub['score']); ?></span>
                            </div>
                            <div class="rain-os-subcategory-desc"><?php echo esc_html($sub['desc']); ?></div>
                            <div class="rain-os-subcategory-bar">
                                <div class="rain-os-subcategory-bar-fill" style="width: <?php echo esc_attr($sub['score']); ?>%; background: linear-gradient(90deg, <?php echo esc_attr($pillar['color']); ?>, transparent);"></div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <h2 class="rain-os-section-title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <?php esc_html_e('Quick Actions', 'rain-os-seo'); ?>
        </h2>

        <div class="rain-os-actions-grid">
            <a href="<?php echo esc_url(admin_url('post-new.php')); ?>" class="rain-os-action-card">
                <div class="rain-os-action-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                </div>
                <div class="rain-os-action-text">
                    <h4><?php esc_html_e('Create New Post', 'rain-os-seo'); ?></h4>
                    <p><?php esc_html_e('Start with AI-optimized content', 'rain-os-seo'); ?></p>
                </div>
            </a>
            <a href="<?php echo esc_url(admin_url('edit.php')); ?>" class="rain-os-action-card">
                <div class="rain-os-action-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                </div>
                <div class="rain-os-action-text">
                    <h4><?php esc_html_e('Analyze Existing', 'rain-os-seo'); ?></h4>
                    <p><?php esc_html_e('Optimize published content', 'rain-os-seo'); ?></p>
                </div>
            </a>
            <a href="<?php echo esc_url(admin_url('admin.php?page=rain-os-settings')); ?>" class="rain-os-action-card">
                <div class="rain-os-action-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                </div>
                <div class="rain-os-action-text">
                    <h4><?php esc_html_e('Configure Settings', 'rain-os-seo'); ?></h4>
                    <p><?php esc_html_e('API and preferences', 'rain-os-seo'); ?></p>
                </div>
            </a>
        </div>

        <div class="rain-os-footer">
            <?php esc_html_e('Rain OS AI Readability Optimization v1.0.0', 'rain-os-seo'); ?> &bull; <?php esc_html_e('Powered by AI', 'rain-os-seo'); ?> &bull; <a href="#"><?php esc_html_e('Documentation', 'rain-os-seo'); ?></a>
        </div>
    </div>
</div>
