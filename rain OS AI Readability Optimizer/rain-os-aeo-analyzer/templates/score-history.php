<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $wpdb;
$table_name = $wpdb->prefix . 'rain_os_analysis_history';
$period = isset( $_GET['period'] ) ? absint( $_GET['period'] ) : 30;
$date_limit = gmdate( 'Y-m-d H:i:s', strtotime( "-{$period} days" ) );

$analysis_data = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT h.*, p.post_title, p.post_name 
        FROM {$table_name} h 
        LEFT JOIN {$wpdb->posts} p ON h.post_id = p.ID 
        WHERE h.analyzed_at >= %s 
        ORDER BY h.analyzed_at DESC",
        $date_limit
    ),
    ARRAY_A
);
$pd_on = Rain_OS_Settings::is_pd_enabled();

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
                        <option value="7" <?php selected( $period, 7 ); ?>><?php esc_html_e( 'Last 7 Days', 'rain-os-aeo-analyzer' ); ?></option>
                        <option value="30" <?php selected( $period, 30 ); ?>><?php esc_html_e( 'Last 30 Days', 'rain-os-aeo-analyzer' ); ?></option>
                        <option value="90" <?php selected( $period, 90 ); ?>><?php esc_html_e( 'Last 90 Days', 'rain-os-aeo-analyzer' ); ?></option>
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
                <span class="rain-os-chart-period"><?php 
                    printf( 
                        esc_html__( 'Last %d Days', 'rain-os-aeo-analyzer' ), 
                        $period 
                    ); 
                ?></span>
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
                            <?php if ( $pd_on ) : ?>
                            <th><?php esc_html_e( 'Discoverability', 'rain-os-aeo-analyzer' ); ?></th>
                            <?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $count = 0;
                        foreach ( $analysis_data as $item ) : 
                            $count++;
                            $pd_val = intval( $item['product_discoverability'] ?? 0 );
                            if ( $pd_on ) {
                                $avg_score = round( ( intval( $item['ai_readability'] ) + intval( $item['digital_authority'] ) + intval( $item['conversion_readiness'] ) + $pd_val ) / 4 );
                            } else {
                                $avg_score = round( ( intval( $item['ai_readability'] ) + intval( $item['digital_authority'] ) + intval( $item['conversion_readiness'] ) ) / 3 );
                            }
                        ?>
                        <tr>
                            <td class="rain-os-row-num"><?php echo esc_html( $count ); ?></td>
                            <td>
                                <div class="rain-os-post-title"><?php echo esc_html( $item['post_title'] ? $item['post_title'] : __( 'Untitled', 'rain-os-aeo-analyzer' ) ); ?></div>
                                <div class="rain-os-post-slug">/<?php echo esc_html( $item['post_name'] ? $item['post_name'] : '' ); ?>/</div>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( $avg_score ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $avg_score ); ?></span>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( intval( $item['ai_readability'] ) ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $item['ai_readability'] ); ?></span>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( intval( $item['digital_authority'] ) ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $item['digital_authority'] ); ?></span>
                            </td>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( intval( $item['conversion_readiness'] ) ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $item['conversion_readiness'] ); ?></span>
                            </td>
                            <?php if ( $pd_on ) : ?>
                            <td class="rain-os-score-cell">
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_score_class( $pd_val ) ); ?>"></span>
                                <span class="rain-os-score-value"><?php echo esc_html( $pd_val ); ?></span>
                            </td>
                            <?php endif; ?>
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
