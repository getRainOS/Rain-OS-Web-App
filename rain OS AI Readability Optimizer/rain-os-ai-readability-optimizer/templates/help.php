<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$troubleshooting_items = array(
    array(
        'question' => __( 'My analysis is not working', 'rain-os-ai-readability-optimizer' ),
        'answer'   => __( 'First, verify your API key is correctly configured in Settings. Check that your subscription is active and you have remaining analysis credits. If the issue persists, try clearing your browser cache and WordPress transients.', 'rain-os-ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Verify API key in Settings', 'rain-os-ai-readability-optimizer' ),
            __( 'Check subscription status', 'rain-os-ai-readability-optimizer' ),
            __( 'Clear browser cache', 'rain-os-ai-readability-optimizer' ),
            __( 'Try again after a few minutes', 'rain-os-ai-readability-optimizer' ),
        ),
    ),
    array(
        'question' => __( 'Scores seem incorrect or inconsistent', 'rain-os-ai-readability-optimizer' ),
        'answer'   => __( 'AEO scores are based on AI analysis of your content structure, readability, and optimization. Scores can vary based on content changes. Re-analyze after making improvements to see updated scores.', 'rain-os-ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Review the analysis recommendations', 'rain-os-ai-readability-optimizer' ),
            __( 'Make suggested improvements', 'rain-os-ai-readability-optimizer' ),
            __( 'Re-analyze the content', 'rain-os-ai-readability-optimizer' ),
            __( 'Compare before/after scores', 'rain-os-ai-readability-optimizer' ),
        ),
    ),
    array(
        'question' => __( 'The plugin is slow or timing out', 'rain-os-ai-readability-optimizer' ),
        'answer'   => __( 'Analysis requires sending content to our API servers. Large content (10,000+ words) may take longer. Check your internet connection and server timeout settings. You may need to increase PHP max_execution_time.', 'rain-os-ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Check internet connection', 'rain-os-ai-readability-optimizer' ),
            __( 'Increase PHP max_execution_time', 'rain-os-ai-readability-optimizer' ),
            __( 'Try analyzing smaller content first', 'rain-os-ai-readability-optimizer' ),
            __( 'Contact support if issue persists', 'rain-os-ai-readability-optimizer' ),
        ),
    ),
    array(
        'question' => __( 'Quick Tools are not available', 'rain-os-ai-readability-optimizer' ),
        'answer'   => __( 'Quick Tools require a valid API key and active subscription. Verify your subscription status in your Rain OS account dashboard. If you recently subscribed, try logging out and back in to refresh your access.', 'rain-os-ai-readability-optimizer' ),
        'steps'    => array(
            __( 'Verify subscription status', 'rain-os-ai-readability-optimizer' ),
            __( 'Log out and log back in', 'rain-os-ai-readability-optimizer' ),
            __( 'Clear plugin cache', 'rain-os-ai-readability-optimizer' ),
            __( 'Re-enter API key', 'rain-os-ai-readability-optimizer' ),
        ),
    ),
);
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Help', 'rain-os-ai-readability-optimizer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-dashboard' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'rain-os-ai-readability-optimizer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <header class="rain-os-page-header">
            <h1><?php esc_html_e( 'Help & Troubleshooting', 'rain-os-ai-readability-optimizer' ); ?></h1>
            <p><?php esc_html_e( 'Common issues and solutions for AI Readability Optimizer', 'rain-os-ai-readability-optimizer' ); ?></p>
        </header>

        <div class="rain-os-help-grid">
            <?php foreach ( $troubleshooting_items as $item ) : ?>
            <div class="rain-os-help-card">
                <h3 class="rain-os-help-question"><?php echo esc_html( $item['question'] ); ?></h3>
                <p class="rain-os-help-answer"><?php echo esc_html( $item['answer'] ); ?></p>
                <div class="rain-os-help-steps">
                    <strong><?php esc_html_e( 'Steps to resolve:', 'rain-os-ai-readability-optimizer' ); ?></strong>
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
            <h3><?php esc_html_e( 'Still need help?', 'rain-os-ai-readability-optimizer' ); ?></h3>
            <p><?php esc_html_e( 'Contact our support team at support@getrainos.com', 'rain-os-ai-readability-optimizer' ); ?></p>
            <a href="mailto:support@getrainos.com" class="rain-os-btn rain-os-btn-primary">
                <?php esc_html_e( 'Contact Support', 'rain-os-ai-readability-optimizer' ); ?>
            </a>
        </div>
    </div>
</div>
