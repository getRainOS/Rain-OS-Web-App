<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$troubleshooting_items = array(
    array(
        'question' => __( 'My analysis is not working', 'ai-readability-optimizer' ),
        'answer'   => __( 'First, verify your API key is correctly configured in Settings. Check that your subscription is active and you have remaining analysis credits. If the issue persists, try clearing your browser cache and WordPress transients.', 'ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Verify API key in Settings', 'ai-readability-optimizer' ),
            __( 'Check subscription status', 'ai-readability-optimizer' ),
            __( 'Clear browser cache', 'ai-readability-optimizer' ),
            __( 'Try again after a few minutes', 'ai-readability-optimizer' ),
        ),
    ),
    array(
        'question' => __( 'Scores seem incorrect or inconsistent', 'ai-readability-optimizer' ),
        'answer'   => __( 'AEO scores are based on AI analysis of your content structure, readability, and optimization. Scores can vary based on content changes. Re-analyze after making improvements to see updated scores.', 'ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Review the analysis recommendations', 'ai-readability-optimizer' ),
            __( 'Make suggested improvements', 'ai-readability-optimizer' ),
            __( 'Re-analyze the content', 'ai-readability-optimizer' ),
            __( 'Compare before/after scores', 'ai-readability-optimizer' ),
        ),
    ),
    array(
        'question' => __( 'The plugin is slow or timing out', 'ai-readability-optimizer' ),
        'answer'   => __( 'Analysis requires sending content to our API servers. Large content (10,000+ words) may take longer. Check your internet connection and server timeout settings. You may need to increase PHP max_execution_time.', 'ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Check internet connection', 'ai-readability-optimizer' ),
            __( 'Increase PHP max_execution_time', 'ai-readability-optimizer' ),
            __( 'Try analyzing smaller content first', 'ai-readability-optimizer' ),
            __( 'Contact support if issue persists', 'ai-readability-optimizer' ),
        ),
    ),
    array(
        'question' => __( 'Quick Tools are not available', 'ai-readability-optimizer' ),
        'answer'   => __( 'Quick Tools require a valid API key and active subscription. Verify your subscription status in your Rain OS account dashboard. If you recently subscribed, try logging out and back in to refresh your access.', 'ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Verify subscription status', 'ai-readability-optimizer' ),
            __( 'Log out and log back in', 'ai-readability-optimizer' ),
            __( 'Clear plugin cache', 'ai-readability-optimizer' ),
            __( 'Re-enter API key', 'ai-readability-optimizer' ),
        ),
    ),
);
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Help', 'ai-readability-optimizer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-dashboard' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'ai-readability-optimizer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <header class="rain-os-page-header">
            <h1><?php esc_html_e( 'Help & Troubleshooting', 'ai-readability-optimizer' ); ?></h1>
            <p><?php esc_html_e( 'Common issues and solutions for AI Readability Optimizer', 'ai-readability-optimizer' ); ?></p>
        </header>

        <div class="rain-os-help-grid">
            <?php foreach ( $troubleshooting_items as $item ) : ?>
            <div class="rain-os-help-card">
                <h3 class="rain-os-help-question"><?php echo esc_html( $item['question'] ); ?></h3>
                <p class="rain-os-help-answer"><?php echo esc_html( $item['answer'] ); ?></p>
                <div class="rain-os-help-steps">
                    <strong><?php esc_html_e( 'Steps to resolve:', 'ai-readability-optimizer' ); ?></strong>
                    <ol>
                        <?php foreach ( $item['steps'] as $step ) : ?>
                        <li><?php echo esc_html( $step ); ?></li>
                        <?php endforeach; ?>
                    </ol>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="rain-os-help-contact">
            <h3><?php esc_html_e( 'Still need help?', 'ai-readability-optimizer' ); ?></h3>
            <p><?php esc_html_e( 'Contact our support team at support@getrainos.com', 'ai-readability-optimizer' ); ?></p>
            <a href="mailto:support@getrainos.com" class="rain-os-btn rain-os-btn-primary">
                <?php esc_html_e( 'Contact Support', 'ai-readability-optimizer' ); ?>
            </a>
        </div>
    </div>
</div>
