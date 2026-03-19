<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $wpdb;
$table_name = $wpdb->prefix . 'rain_os_analysis_history';
$analysis_data = $wpdb->get_results(
    "SELECT h.*, p.post_title, p.post_name 
    FROM {$table_name} h 
    LEFT JOIN {$wpdb->posts} p ON h.post_id = p.ID 
    ORDER BY h.analyzed_at DESC
    LIMIT 50",
    ARRAY_A
);
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
                    <span style="font-size: 13px; color: rgba(255,255,255,0.72);"><?php esc_html_e( 'Word Count vs. AEO Score', 'rain-os-aeo-analyzer' ); ?></span>
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

<script>
(function() {
    var canvas = document.getElementById('rain-os-scatter-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (canvas.getAttribute('data-chart-initialized')) return;
    canvas.setAttribute('data-chart-initialized', 'true');

    var analysisData = <?php echo wp_json_encode($analysis_data ? $analysis_data : array()); ?>;

    var dataPoints = [];
    var pointColors = [];
    var titles = [];

    analysisData.forEach(function(row) {
        var wordCount = parseInt(row.word_count) || 0;
        var score = parseFloat(row.overall_score) || 0;
        var title = row.post_title || 'Untitled';

        dataPoints.push({ x: wordCount, y: score });
        titles.push(title);

        if (score >= 80) {
            pointColors.push('#10b981');
        } else if (score >= 65) {
            pointColors.push('#f59e0b');
        } else {
            pointColors.push('#ef4444');
        }
    });

    new Chart(canvas, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Posts',
                data: dataPoints,
                backgroundColor: pointColors,
                borderColor: pointColors,
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    callbacks: {
                        title: function(context) {
                            var idx = context[0].dataIndex;
                            return titles[idx];
                        },
                        label: function(context) {
                            return 'Word Count: ' + context.parsed.x + ' | Score: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Word Count',
                        color: 'rgba(255,255,255,0.72)'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.72)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'AEO Score',
                        color: 'rgba(255,255,255,0.72)'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.72)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
})();
</script>
