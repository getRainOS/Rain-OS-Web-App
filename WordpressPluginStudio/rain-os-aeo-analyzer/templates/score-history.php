<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$admin = new Rain_OS_Admin( rain_os_aeo()->get_api_client() );
$analysis_data = $admin->get_analysis_data( 30 );

function rain_os_score_class( $score ) {
    if ( $score >= 80 ) {
        return 'green';
    } elseif ( $score >= 65 ) {
        return 'yellow';
    }
    return 'red';
}
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Score History', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <div class="rain-os-period-select">
                    <select id="rain-os-period">
                        <option value="7"><?php esc_html_e( 'Last 7 Days', 'rain-os-aeo-analyzer' ); ?></option>
                        <option value="30" selected><?php esc_html_e( 'Last 30 Days', 'rain-os-aeo-analyzer' ); ?></option>
                        <option value="90"><?php esc_html_e( 'Last 90 Days', 'rain-os-aeo-analyzer' ); ?></option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <header class="rain-os-page-header">
            <h1><?php esc_html_e( 'Score History', 'rain-os-aeo-analyzer' ); ?></h1>
            <p><?php esc_html_e( 'Breakdown of post pillar scores', 'rain-os-aeo-analyzer' ); ?></p>
        </header>

        <div class="rain-os-chart-card">
            <div class="rain-os-chart-header">
                <h3><?php esc_html_e( 'Score Details', 'rain-os-aeo-analyzer' ); ?></h3>
                <span class="rain-os-chart-period"><?php esc_html_e( 'Last 30 Days', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-chart-body">
                <?php if ( ! empty( $analysis_data ) ) : ?>
                <table class="rain-os-table rain-os-score-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th><?php esc_html_e( 'Title', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Overall Score', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Conversion', 'rain-os-aeo-analyzer' ); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $count = 0;
                        foreach ( $analysis_data as $item ) : 
                            $count++;
                            $avg_score = round( ( $item['ai_readability'] + $item['digital_authority'] + $item['conversion_readiness'] ) / 3 );
                        ?>
                        <tr>
                            <td class="rain-os-row-num"><?php echo esc_html( $count ); ?></td>
                            <td>
                                <div class="rain-os-post-title"><?php echo esc_html( $item['post_title'] ); ?></div>
                                <div class="rain-os-post-slug">/<?php echo esc_html( $item['post_name'] ); ?>/</div>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( $avg_score ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $avg_score ); ?></span>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( $item['ai_readability'] ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $item['ai_readability'] ); ?></span>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( $item['digital_authority'] ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $item['digital_authority'] ); ?></span>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( $item['conversion_readiness'] ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $item['conversion_readiness'] ); ?></span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php else : ?>
                <div class="rain-os-empty-state">
                    <span class="dashicons dashicons-chart-area"></span>
                    <p><?php esc_html_e( 'No score history available for this period.', 'rain-os-aeo-analyzer' ); ?></p>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
