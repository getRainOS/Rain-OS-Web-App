<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! isset( $analysis_data ) || ! is_array( $analysis_data ) ) {
    $analysis_data = array();
}
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Content Signals', 'rain-os-aeo-analyzer' ); ?></span>
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
        <div class="rain-os-chart-card rain-os-animate-in" style="margin-bottom: 32px;">
            <div class="rain-os-chart-header">
                <div>
                    <h3><?php esc_html_e( 'Content Signals', 'rain-os-aeo-analyzer' ); ?></h3>
                    <span style="font-size: 13px; color: rgba(255,255,255,0.75);"><?php esc_html_e( 'Word Count vs. AEO Score', 'rain-os-aeo-analyzer' ); ?></span>
                </div>
            </div>
            <div class="rain-os-chart-body">
                <canvas id="rain-os-scatter-chart" height="400"></canvas>
            </div>
        </div>

        <header class="rain-os-page-header">
            <h1><?php esc_html_e( 'Content Signals', 'rain-os-aeo-analyzer' ); ?></h1>
            <p><?php esc_html_e( 'Analyze the relationship between content length and performance', 'rain-os-aeo-analyzer' ); ?></p>
        </header>

        <div class="rain-os-signals-info">
            <div class="rain-os-card">
                <div class="rain-os-card-header">
                    <h3><?php esc_html_e( 'Understanding Content Signals', 'rain-os-aeo-analyzer' ); ?></h3>
                </div>
                <div class="rain-os-card-body">
                    <p><?php esc_html_e( 'This chart shows the relationship between content length (word count) and AEO performance scores. The scatter plot helps identify:', 'rain-os-aeo-analyzer' ); ?></p>
                    <ul class="rain-os-signals-list">
                        <li>
                            <strong><?php esc_html_e( 'Optimal Content Length', 'rain-os-aeo-analyzer' ); ?></strong>
                            <span><?php esc_html_e( 'Find the sweet spot where longer content correlates with higher scores', 'rain-os-aeo-analyzer' ); ?></span>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Underperforming Content', 'rain-os-aeo-analyzer' ); ?></strong>
                            <span><?php esc_html_e( 'Identify content that is long but scores poorly, indicating quality issues', 'rain-os-aeo-analyzer' ); ?></span>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'High-Performers', 'rain-os-aeo-analyzer' ); ?></strong>
                            <span><?php esc_html_e( 'Discover which content pieces achieve the best AEO optimization', 'rain-os-aeo-analyzer' ); ?></span>
                        </li>
                        <li>
                            <strong><?php esc_html_e( 'Baseline (70)', 'rain-os-aeo-analyzer' ); ?></strong>
                            <span><?php esc_html_e( 'The dashed horizontal line at 70 represents the minimum recommended score for well-optimized content', 'rain-os-aeo-analyzer' ); ?></span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

