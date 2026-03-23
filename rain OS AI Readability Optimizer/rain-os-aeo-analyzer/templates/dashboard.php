<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $wpdb;
$rain_os_table_name = $wpdb->prefix . 'rain_os_analysis_history';
$rain_os_period     = isset( $_GET['period'] ) ? absint( $_GET['period'] ) : 30; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Admin-only read-only period filter; no data is modified.
$rain_os_date_limit = gmdate( 'Y-m-d H:i:s', strtotime( '-' . $rain_os_period . ' days' ) );

// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table name is derived from $wpdb->prefix (trusted); live dashboard metrics make caching inappropriate.
$rain_os_averages = $wpdb->get_row(
    $wpdb->prepare(
        'SELECT 
            ROUND(AVG(overall_score)) as avg_overall,
            ROUND(AVG(ai_readability)) as avg_ai_readability,
            ROUND(AVG(digital_authority)) as avg_digital_authority,
            ROUND(AVG(conversion_readiness)) as avg_conversion_readiness,
            ROUND(AVG(product_discoverability)) as avg_product_discoverability,
            COUNT(*) as total_analyzed
        FROM ' . $rain_os_table_name . '
        WHERE analyzed_at >= %s',
        $rain_os_date_limit
    ),
    ARRAY_A
);

// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table name is derived from $wpdb->prefix (trusted); live dashboard metrics make caching inappropriate.
$rain_os_analysis_data = $wpdb->get_results(
    $wpdb->prepare(
        'SELECT h.*, p.post_title, p.post_name 
        FROM ' . $rain_os_table_name . ' h 
        LEFT JOIN ' . $wpdb->posts . ' p ON h.post_id = p.ID 
        WHERE h.analyzed_at >= %s 
        ORDER BY h.analyzed_at DESC
        LIMIT 10',
        $rain_os_date_limit
    ),
    ARRAY_A
);

$rain_os_overall_score = isset( $rain_os_averages['avg_overall'] ) ? intval( $rain_os_averages['avg_overall'] ) : 0;
$rain_os_ai_readability = isset( $rain_os_averages['avg_ai_readability'] ) ? intval( $rain_os_averages['avg_ai_readability'] ) : 0;
$rain_os_digital_authority = isset( $rain_os_averages['avg_digital_authority'] ) ? intval( $rain_os_averages['avg_digital_authority'] ) : 0;
$rain_os_conversion_readiness = isset( $rain_os_averages['avg_conversion_readiness'] ) ? intval( $rain_os_averages['avg_conversion_readiness'] ) : 0;
$rain_os_product_discoverability = isset( $rain_os_averages['avg_product_discoverability'] ) ? intval( $rain_os_averages['avg_product_discoverability'] ) : 0;
$rain_os_total_analyzed = isset( $rain_os_averages['total_analyzed'] ) ? intval( $rain_os_averages['total_analyzed'] ) : 0;

function rain_os_get_score_class( $score ) {
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
                <span class="rain-os-badge"><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <div class="rain-os-period-select">
                    <select id="rain-os-period">
                        <option value="7" <?php selected( $rain_os_period, 7 ); ?>><?php esc_html_e( 'Last 7 Days', 'rain-os-aeo-analyzer' ); ?></option>
                        <option value="30" <?php selected( $rain_os_period, 30 ); ?>><?php esc_html_e( 'Last 30 Days', 'rain-os-aeo-analyzer' ); ?></option>
                        <option value="90" <?php selected( $rain_os_period, 90 ); ?>><?php esc_html_e( 'Last 90 Days', 'rain-os-aeo-analyzer' ); ?></option>
                    </select>
                </div>
                <div class="rain-os-search-bar" id="rain-os-search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" id="rain-os-search" class="rain-os-search-input" placeholder="<?php esc_attr_e( 'Search content...', 'rain-os-aeo-analyzer' ); ?>" autocomplete="off" />
                </div>
                <div class="rain-os-notifications" id="rain-os-notifications">
                    <button type="button" id="rain-os-notifications-btn" class="rain-os-notification-btn" title="<?php esc_attr_e( 'Notifications', 'rain-os-aeo-analyzer' ); ?>">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                        <span id="rain-os-notification-count" class="rain-os-notification-badge">2</span>
                    </button>
                    <div id="rain-os-notification-dropdown" class="rain-os-notification-dropdown">
                        <div class="rain-os-notification-header">
                            <h4><?php esc_html_e( 'Notifications', 'rain-os-aeo-analyzer' ); ?></h4>
                            <button type="button" id="rain-os-mark-all-read"><?php esc_html_e( 'Mark all read', 'rain-os-aeo-analyzer' ); ?></button>
                        </div>
                        <div class="rain-os-notification-list" id="rain-os-notification-list"></div>
                    </div>
                </div>
                <a href="<?php echo esc_url( admin_url( 'post-new.php' ) ); ?>" class="rain-os-btn-new-analysis">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    <?php esc_html_e( 'New Analysis', 'rain-os-aeo-analyzer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <header class="rain-os-page-header rain-os-animate-in">
            <div class="rain-os-page-header-row">
                <div>
                    <h1><?php esc_html_e( 'Dashboard', 'rain-os-aeo-analyzer' ); ?></h1>
                    <p><?php esc_html_e( 'Monitor your content performance and AI Readability metrics', 'rain-os-aeo-analyzer' ); ?></p>
                </div>
            </div>
        </header>

        <div class="rain-os-kpi-grid">
            <div class="rain-os-kpi-card rain-os-kpi-card-cyan rain-os-animate-delay-1">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-cyan">
                        <span class="dashicons dashicons-media-document"></span>
                    </div>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( min( 100, $rain_os_total_analyzed ) ); ?>" data-color="#22d3ee"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $rain_os_total_analyzed ); ?></div>
                <div class="rain-os-kpi-label">
                    <span class="rain-os-tooltip-wrap">
                        <?php esc_html_e( 'Total Analyses', 'rain-os-aeo-analyzer' ); ?>
                        <span class="rain-os-tooltip-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                        </span>
                        <span class="rain-os-tooltip-content"><?php esc_html_e( 'Total number of content analyses performed in the selected time period. Each analysis evaluates your content across all four AEO pillars.', 'rain-os-aeo-analyzer' ); ?></span>
                    </span>
                </div>
                <div class="rain-os-kpi-subtitle"><?php
                /* translators: %d: number of days */
                printf( esc_html__( 'Last %d Days', 'rain-os-aeo-analyzer' ), $rain_os_period );
                ?></div>
            </div>

            <div class="rain-os-kpi-card rain-os-kpi-card-green rain-os-animate-delay-2">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-green">
                        <span class="dashicons dashicons-chart-line"></span>
                    </div>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( $rain_os_overall_score ); ?>" data-color="#22d3ee"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $rain_os_overall_score ); ?></div>
                <div class="rain-os-kpi-label">
                    <span class="rain-os-tooltip-wrap">
                        <?php esc_html_e( 'Average Score', 'rain-os-aeo-analyzer' ); ?>
                        <span class="rain-os-tooltip-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                        </span>
                        <span class="rain-os-tooltip-content"><?php esc_html_e( 'The average AEO score across all analyzed content. This combines AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability scores.', 'rain-os-aeo-analyzer' ); ?></span>
                    </span>
                </div>
                <div class="rain-os-kpi-subtitle"><?php
                /* translators: %d: number of days */
                printf( esc_html__( 'Last %d Days', 'rain-os-aeo-analyzer' ), $rain_os_period );
                ?></div>
            </div>

            <div class="rain-os-kpi-card rain-os-kpi-card-purple rain-os-animate-delay-3">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-purple">
                        <span class="dashicons dashicons-heart"></span>
                    </div>
                    <?php 
                    $rain_os_content_health = $rain_os_total_analyzed > 0 
                        ? round( ( $rain_os_ai_readability + $rain_os_digital_authority + $rain_os_conversion_readiness + $rain_os_product_discoverability ) / 4 )
                        : 0;
                    ?>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( $rain_os_content_health ); ?>" data-color="#a855f7"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $rain_os_content_health ); ?>%</div>
                <div class="rain-os-kpi-label">
                    <span class="rain-os-tooltip-wrap">
                        <?php esc_html_e( 'Content Health', 'rain-os-aeo-analyzer' ); ?>
                        <span class="rain-os-tooltip-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                        </span>
                        <span class="rain-os-tooltip-content"><?php esc_html_e( 'Overall health score of your content portfolio. Scores above 80% indicate strong AI readiness across all four pillars.', 'rain-os-aeo-analyzer' ); ?></span>
                    </span>
                </div>
                <div class="rain-os-kpi-subtitle"><?php
                /* translators: %d: number of days */
                printf( esc_html__( 'Last %d Days', 'rain-os-aeo-analyzer' ), $rain_os_period );
                ?></div>
            </div>

            <div class="rain-os-kpi-card rain-os-kpi-card-orange rain-os-animate-delay-4">
                <div class="rain-os-kpi-header">
                    <div class="rain-os-kpi-icon rain-os-kpi-icon-orange">
                        <span class="dashicons dashicons-performance"></span>
                    </div>
                    <?php 
                    $rain_os_options = get_option( 'rain_os_settings', array() );
                    $rain_os_api_usage = isset( $rain_os_options['api_usage'] ) ? intval( $rain_os_options['api_usage'] ) : 0;
                    $rain_os_api_limit = isset( $rain_os_options['api_limit'] ) ? intval( $rain_os_options['api_limit'] ) : 100;
                    $rain_os_api_percent = $rain_os_api_limit > 0 ? round( ( $rain_os_api_usage / $rain_os_api_limit ) * 100 ) : 0;
                    ?>
                    <div class="rain-os-kpi-gauge" data-value="<?php echo esc_attr( $rain_os_api_percent ); ?>" data-color="#f59e0b"></div>
                </div>
                <div class="rain-os-kpi-value"><?php echo esc_html( $rain_os_api_percent ); ?>%</div>
                <div class="rain-os-kpi-label">
                    <span class="rain-os-tooltip-wrap">
                        <?php esc_html_e( 'API Usage', 'rain-os-aeo-analyzer' ); ?>
                        <span class="rain-os-tooltip-trigger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                        </span>
                        <span class="rain-os-tooltip-content"><?php
                        /* translators: %1$d: current API request count, %2$d: API request limit */
                        printf( esc_html__( 'Current API usage: %1$d of %2$d requests this billing cycle. Upgrade your plan for more analyses.', 'rain-os-aeo-analyzer' ), $rain_os_api_usage, $rain_os_api_limit );
                        ?></span>
                    </span>
                </div>
                <div class="rain-os-kpi-subtitle"><?php esc_html_e( 'This Billing Cycle', 'rain-os-aeo-analyzer' ); ?></div>
            </div>
        </div>

        <div class="rain-os-charts-grid rain-os-animate-in">
            <div class="rain-os-chart-card">
                <div class="rain-os-chart-header">
                    <h3><?php esc_html_e( 'Performance History', 'rain-os-aeo-analyzer' ); ?></h3>
                    <span class="rain-os-chart-period"><?php
                        /* translators: %d: number of days */
                        printf( 
                            esc_html__( 'Last %d Days', 'rain-os-aeo-analyzer' ), 
                            $rain_os_period 
                        ); 
                    ?></span>
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
                            <span><?php echo esc_html( $rain_os_ai_readability ); ?>%</span>
                        </div>
                        <div class="rain-os-pillar-bar-track">
                            <div class="rain-os-pillar-bar-fill rain-os-pillar-cyan" style="width: <?php echo esc_attr( $rain_os_ai_readability ); ?>%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-pillar-bar">
                        <div class="rain-os-pillar-bar-label">
                            <span><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></span>
                            <span><?php echo esc_html( $rain_os_digital_authority ); ?>%</span>
                        </div>
                        <div class="rain-os-pillar-bar-track">
                            <div class="rain-os-pillar-bar-fill rain-os-pillar-green" style="width: <?php echo esc_attr( $rain_os_digital_authority ); ?>%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-pillar-bar">
                        <div class="rain-os-pillar-bar-label">
                            <span><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></span>
                            <span><?php echo esc_html( $rain_os_conversion_readiness ); ?>%</span>
                        </div>
                        <div class="rain-os-pillar-bar-track">
                            <div class="rain-os-pillar-bar-fill rain-os-pillar-purple" style="width: <?php echo esc_attr( $rain_os_conversion_readiness ); ?>%;"></div>
                        </div>
                    </div>
                    <?php if ( $rain_os_pd_on ) : ?>
                    <div class="rain-os-pillar-bar">
                        <div class="rain-os-pillar-bar-label">
                            <span><?php esc_html_e( 'Product Discoverability', 'rain-os-aeo-analyzer' ); ?></span>
                            <span><?php echo esc_html( $rain_os_product_discoverability ); ?>%</span>
                        </div>
                        <div class="rain-os-pillar-bar-track">
                            <div class="rain-os-pillar-bar-fill rain-os-pillar-orange" style="width: <?php echo esc_attr( $rain_os_product_discoverability ); ?>%;"></div>
                        </div>
                    </div>
                    <?php endif; ?>
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
                <?php if ( ! empty( $rain_os_analysis_data ) ) : ?>
                <table class="rain-os-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th><?php esc_html_e( 'Title', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Overall', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Authority', 'rain-os-aeo-analyzer' ); ?></th>
                            <th><?php esc_html_e( 'Conversion', 'rain-os-aeo-analyzer' ); ?></th>
                            <?php if ( $rain_os_pd_on ) : ?>
                            <th><?php esc_html_e( 'Discoverability', 'rain-os-aeo-analyzer' ); ?></th>
                            <?php endif; ?>
                            <th><?php esc_html_e( 'Date', 'rain-os-aeo-analyzer' ); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $rain_os_count = 0;
                        foreach ( $rain_os_analysis_data as $rain_os_item ) : 
                            if ( $rain_os_count >= 5 ) break;
                            $rain_os_count++;
                            $rain_os_avg_score = $rain_os_pd_on 
                                ? round( ( intval( $rain_os_item['ai_readability'] ) + intval( $rain_os_item['digital_authority'] ) + intval( $rain_os_item['conversion_readiness'] ) + intval( $rain_os_item['product_discoverability'] ?? 0 ) ) / 4 )
                                : round( ( intval( $rain_os_item['ai_readability'] ) + intval( $rain_os_item['digital_authority'] ) + intval( $rain_os_item['conversion_readiness'] ) ) / 3 );
                        ?>
                        <tr>
                            <td><?php echo esc_html( $rain_os_count ); ?></td>
                            <td>
                                <div class="rain-os-post-title"><?php echo esc_html( $rain_os_item['post_title'] ? $rain_os_item['post_title'] : __( 'Untitled', 'rain-os-aeo-analyzer' ) ); ?></div>
                                <div class="rain-os-post-slug">/<?php echo esc_html( $rain_os_item['post_name'] ? $rain_os_item['post_name'] : '' ); ?>/</div>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( $rain_os_avg_score ) ); ?>"></span>
                                <?php echo esc_html( $rain_os_avg_score ); ?>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( intval( $rain_os_item['ai_readability'] ) ) ); ?>"></span>
                                <?php echo esc_html( $rain_os_item['ai_readability'] ); ?>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( intval( $rain_os_item['digital_authority'] ) ) ); ?>"></span>
                                <?php echo esc_html( $rain_os_item['digital_authority'] ); ?>
                            </td>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( intval( $rain_os_item['conversion_readiness'] ) ) ); ?>"></span>
                                <?php echo esc_html( $rain_os_item['conversion_readiness'] ); ?>
                            </td>
                            <?php if ( $rain_os_pd_on ) : ?>
                            <td>
                                <span class="rain-os-score-indicator rain-os-score-<?php echo esc_attr( rain_os_get_score_class( intval( $rain_os_item['product_discoverability'] ?? 0 ) ) ); ?>"></span>
                                <?php echo esc_html( $rain_os_item['product_discoverability'] ?? 0 ); ?>
                            </td>
                            <?php endif; ?>
                            <td><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $rain_os_item['analyzed_at'] ) ) ); ?></td>
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
