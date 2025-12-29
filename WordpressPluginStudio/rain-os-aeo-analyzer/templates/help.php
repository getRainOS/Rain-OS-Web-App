<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$troubleshooting_items = array(
    array(
        'question' => __( 'My analysis is not working', 'rain-os-aeo-analyzer' ),
        'answer'   => __( 'First, verify your API key is correctly configured in Settings. Check that your subscription is active and you have remaining analysis credits. If the issue persists, try clearing your browser cache and WordPress transients.', 'rain-os-aeo-analyzer' ),
        'steps'    => array(
            __( 'Verify API key in Settings', 'rain-os-aeo-analyzer' ),
            __( 'Check subscription status', 'rain-os-aeo-analyzer' ),
            __( 'Clear browser cache', 'rain-os-aeo-analyzer' ),
            __( 'Try again after a few minutes', 'rain-os-aeo-analyzer' ),
        ),
    ),
    array(
        'question' => __( 'Scores seem incorrect or inconsistent', 'rain-os-aeo-analyzer' ),
        'answer'   => __( 'AEO scores are based on AI analysis of your content structure, readability, and optimization. Scores can vary based on content changes. Re-analyze after making improvements to see updated scores.', 'rain-os-aeo-analyzer' ),
        'steps'    => array(
            __( 'Review the analysis recommendations', 'rain-os-aeo-analyzer' ),
            __( 'Make suggested improvements', 'rain-os-aeo-analyzer' ),
            __( 'Re-analyze the content', 'rain-os-aeo-analyzer' ),
            __( 'Compare before/after scores', 'rain-os-aeo-analyzer' ),
        ),
    ),
    array(
        'question' => __( 'The plugin is slow or timing out', 'rain-os-aeo-analyzer' ),
        'answer'   => __( 'Analysis requires sending content to our API servers. Large content (10,000+ words) may take longer. Check your internet connection and server timeout settings. You may need to increase PHP max_execution_time.', 'rain-os-aeo-analyzer' ),
        'steps'    => array(
            __( 'Check internet connection', 'rain-os-aeo-analyzer' ),
            __( 'Increase PHP max_execution_time', 'rain-os-aeo-analyzer' ),
            __( 'Try analyzing smaller content first', 'rain-os-aeo-analyzer' ),
            __( 'Contact support if issue persists', 'rain-os-aeo-analyzer' ),
        ),
    ),
    array(
        'question' => __( 'Quick Tools (Pro) are not available', 'rain-os-aeo-analyzer' ),
        'answer'   => __( 'Quick Tools require an active Pro subscription. Verify your subscription status in your Rain OS account dashboard. If you recently upgraded, try logging out and back in to refresh your access.', 'rain-os-aeo-analyzer' ),
        'steps'    => array(
            __( 'Verify Pro subscription', 'rain-os-aeo-analyzer' ),
            __( 'Log out and log back in', 'rain-os-aeo-analyzer' ),
            __( 'Clear plugin cache', 'rain-os-aeo-analyzer' ),
            __( 'Re-enter API key', 'rain-os-aeo-analyzer' ),
        ),
    ),
);
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Help', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'rain-os-aeo-analyzer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <header class="rain-os-page-header">
            <h1><?php esc_html_e( 'Help & Troubleshooting', 'rain-os-aeo-analyzer' ); ?></h1>
            <p><?php esc_html_e( 'Common issues and solutions for Rain OS AEO Analyzer', 'rain-os-aeo-analyzer' ); ?></p>
        </header>

        <div class="rain-os-help-grid">
            <?php foreach ( $troubleshooting_items as $item ) : ?>
            <div class="rain-os-help-card">
                <h3 class="rain-os-help-question"><?php echo esc_html( $item['question'] ); ?></h3>
                <p class="rain-os-help-answer"><?php echo esc_html( $item['answer'] ); ?></p>
                <div class="rain-os-help-steps">
                    <strong><?php esc_html_e( 'Steps to resolve:', 'rain-os-aeo-analyzer' ); ?></strong>
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
            <h3><?php esc_html_e( 'Still need help?', 'rain-os-aeo-analyzer' ); ?></h3>
            <p><?php esc_html_e( 'Contact our support team at support@getrainos.com', 'rain-os-aeo-analyzer' ); ?></p>
            <a href="mailto:support@getrainos.com" class="rain-os-btn rain-os-btn-primary">
                <?php esc_html_e( 'Contact Support', 'rain-os-aeo-analyzer' ); ?>
            </a>
        </div>
    </div>
</div>
