<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$admin = new Rain_OS_Admin( rain_os_aeo()->get_api_client() );
$averages = $admin->get_average_scores( 30 );
$analysis_data = $admin->get_analysis_data( 30 );

$overall_score = isset( $averages['avg_overall'] ) ? round( $averages['avg_overall'] ) : 0;
$ai_readability = isset( $averages['avg_ai_readability'] ) ? round( $averages['avg_ai_readability'] ) : 0;
$digital_authority = isset( $averages['avg_digital_authority'] ) ? round( $averages['avg_digital_authority'] ) : 0;
$conversion_readiness = isset( $averages['avg_conversion_readiness'] ) ? round( $averages['avg_conversion_readiness'] ) : 0;
$total_analyzed = isset( $averages['total_analyzed'] ) ? intval( $averages['total_analyzed'] ) : 0;
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'AEO Analyzer', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <div class="rain-os-search-wrap">
                    <input type="text" id="rain-os-search" class="rain-os-search" placeholder="<?php esc_attr_e( 'Search posts...', 'rain-os-aeo-analyzer' ); ?>" />
                    <div id="rain-os-search-results" class="rain-os-search-results"></div>
                </div>
                <div class="rain-os-notifications-wrap">
                    <button type="button" id="rain-os-notifications-btn" class="rain-os-btn rain-os-btn-icon">
                        <span class="dashicons dashicons-bell"></span>
                        <span id="rain-os-notification-badge" class="rain-os-notification-badge" style="display:none;">0</span>
                    </button>
                    <div id="rain-os-notifications-dropdown" class="rain-os-notifications-dropdown" style="display:none;"></div>
                </div>
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
            <h1><?php esc_html_e( 'Dashboard', 'rain-os-aeo-analyzer' ); ?></h1>
            <p><?php esc_html_e( 'Your AEO performance at a glance', 'rain-os-aeo-analyzer' ); ?></p>
        </header>

        <div class="rain-os-kpi-grid">
            <div class="rain-os-kpi-card">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-cyan">
                        <span class="dashicons dashicons-chart-bar"></span>
                    </div>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( $overall_score ); ?>" data-color="#22d3ee"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $overall_score ); ?></div>
                <div class="rain-os-kpi-label"><?php esc_html_e( 'Overall AEO Score', 'rain-os-aeo-analyzer' ); ?></div>
                <div class="rain-os-kpi-subtitle"><?php esc_html_e( 'Combined performance', 'rain-os-aeo-analyzer' ); ?></div>
            </div>

            <div class="rain-os-kpi-card">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-cyan">
                        <span class="dashicons dashicons-visibility"></span>
                    </div>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( $ai_readability ); ?>" data-color="#22d3ee"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $ai_readability ); ?></div>
                <div class="rain-os-kpi-label"><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></div>
                <div class="rain-os-kpi-subtitle"><?php esc_html_e( 'Semantic clarity', 'rain-os-aeo-analyzer' ); ?></div>
            </div>

            <div class="rain-os-kpi-card">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-green">
                        <span class="dashicons dashicons-shield"></span>
                    </div>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( $digital_authority ); ?>" data-color="#10b981"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $digital_authority ); ?></div>
                <div class="rain-os-kpi-label"><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></div>
                <div class="rain-os-kpi-subtitle"><?php esc_html_e( 'Trust signals', 'rain-os-aeo-analyzer' ); ?></div>
            </div>

            <div class="rain-os-kpi-card">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-purple">
                        <span class="dashicons dashicons-megaphone"></span>
                    </div>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( $conversion_readiness ); ?>" data-color="#a855f7"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $conversion_readiness ); ?></div>
                <div class="rain-os-kpi-label"><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></div>
                <div class="rain-os-kpi-subtitle"><?php esc_html_e( 'Action optimization', 'rain-os-aeo-analyzer' ); ?></div>
            </div>
        </div>

        <div class="rain-os-charts-grid">
            <div class="rain-os-chart-card">
                <div class="rain-os-chart-header">
                    <h3><?php esc_html_e( 'Performance History', 'rain-os-aeo-analyzer' ); ?></h3>
                    <span class="rain-os-chart-period"><?php esc_html_e( 'Last 30 Days', 'rain-os-aeo-analyzer' ); ?></span>
                </div>
                <div class="rain-os-chart-body">
                    <canvas id="rain-os-performance-chart" height="300"></canvas>
                </div>
            </div>

            <div class="rain-os-chart-card">
                <div class="rain-os-chart-header">
                    <h3><?php esc_html_e( 'Pillar Distribution', 'rain-os-aeo-analyzer' ); ?></h3>
                </div>
                <div class="rain-os-chart-body rain-os-pillar-bars">
                    <div class="rain-os-pillar-bar">
                        <div class="rain-os-pillar-bar-label">
                            <span><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></span>
                            <span><?php echo esc_html( $ai_readability ); ?>%</span>
                        </div>
                        <div class="rain-os-pillar-bar-track">
                            <div class="rain-os-pillar-bar-fill rain-os-pillar-cyan" style="width: <?php echo esc_attr( $ai_readability ); ?>%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-pillar-bar">
                        <div class="rain-os-pillar-bar-label">
                            <span><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></span>
                            <span><?php echo esc_html( $digital_authority ); ?>%</span>
                        </div>
                        <div class="rain-os-pillar-bar-track">
                            <div class="rain-os-pillar-bar-fill rain-os-pillar-green" style="width: <?php echo esc_attr( $digital_authority ); ?>%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-pillar-bar">
                        <div class="rain-os-pillar-bar-label">
                            <span><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></span>
                            <span><?php echo esc_html( $conversion_readiness ); ?>%</span>
                        </div>
                        <div class="rain-os-pillar-bar-track">
                            <div class="rain-os-pillar-bar-fill rain-os-pillar-purple" style="width: <?php echo esc_attr( $conversion_readiness ); ?>%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="rain-os-chart-card rain-os-full-width">
            <div class="rain-os-chart-header">
                <h3><?php esc_html_e( 'Recent Analyses', 'rain-os-aeo-analyzer' ); ?></h3>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-history' ) ); ?>" class="rain-os-btn rain-os-btn-text">
                    <?php esc_html_e( 'View All', 'rain-os-aeo-analyzer' ); ?>
                </a>
            </div>
            <div class="rain-os-chart-body">
                <?php if ( ! empty( $analysis_data ) ) : ?>
                <table class="rain-os-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th><?php esc_html_e( 'Title', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Overall', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Authority', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Conversion', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Date', 'rain-os-aeo-analyzer' ); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $count = 0;
                        foreach ( $analysis_data as $item ) : 
                            if ( $count >= 5 ) break;
                            $count++;
                            $avg_score = round( ( $item['ai_readability'] + $item['digital_authority'] + $item['conversion_readiness'] ) / 3 );
                        ?>
                        <tr>
                            <td><?php echo esc_html( $count ); ?></td>
                            <td>
                                <div class="rain-os-post-title"><?php echo esc_html( $item['post_title'] ); ?></div>
                                <div class="rain-os-post-slug">/<?php echo esc_html( $item['post_name'] ); ?>/</div>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( $avg_score ) ); ?>"></span>
                                <?php echo esc_html( $avg_score ); ?>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( $item['ai_readability'] ) ); ?>"></span>
                                <?php echo esc_html( $item['ai_readability'] ); ?>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( $item['digital_authority'] ) ); ?>"></span>
                                <?php echo esc_html( $item['digital_authority'] ); ?>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( $item['conversion_readiness'] ) ); ?>"></span>
                                <?php echo esc_html( $item['conversion_readiness'] ); ?>
                            </td>
                            <td><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $item['analyzed_at'] ) ) ); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php else : ?>
                <div class="rain-os-empty-state">
                    <span class="dashicons dashicons-chart-area"></span>
                    <p><?php esc_html_e( 'No analyses yet. Start by analyzing your content!', 'rain-os-aeo-analyzer' ); ?></p>
                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-analyzer' ) ); ?>" class="rain-os-btn rain-os-btn-primary">
                        <?php esc_html_e( 'Analyze Content', 'rain-os-aeo-analyzer' ); ?>
                    </a>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php
function rain_os_get_score_class( $score ) {
    if ( $score >= 80 ) {
        return 'green';
    } elseif ( $score >= 65 ) {
        return 'yellow';
    }
    return 'red';
}
?>
