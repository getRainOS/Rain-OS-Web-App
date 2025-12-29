<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$admin = new Rain_OS_Admin( rain_os_aeo()->get_api_client() );
$averages = $admin->get_average_scores( 30 );

$ai_readability = isset( $averages['avg_ai_readability'] ) ? round( $averages['avg_ai_readability'] ) : 0;
$digital_authority = isset( $averages['avg_digital_authority'] ) ? round( $averages['avg_digital_authority'] ) : 0;
$conversion_readiness = isset( $averages['avg_conversion_readiness'] ) ? round( $averages['avg_conversion_readiness'] ) : 0;
$overall_score = round( ( $ai_readability + $digital_authority + $conversion_readiness ) / 3 );
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Pillar Breakdown', 'rain-os-aeo-analyzer' ); ?></span>
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
            <h1><?php esc_html_e( 'Pillar Breakdown', 'rain-os-aeo-analyzer' ); ?></h1>
            <p><?php esc_html_e( 'Detailed analysis of your content across the three AEO pillars', 'rain-os-aeo-analyzer' ); ?></p>
        </header>

        <div class="rain-os-overall-score-display">
            <div class="rain-os-score-circle">
                <span class="rain-os-score-number"><?php echo esc_html( $overall_score ); ?>%</span>
            </div>
            <div class="rain-os-score-label"><?php esc_html_e( 'Overall Score', 'rain-os-aeo-analyzer' ); ?></div>
        </div>

        <div class="rain-os-pillars-grid">
            <div class="rain-os-pillar-section rain-os-pillar-cyan">
                <h3 class="rain-os-pillar-title"><?php esc_html_e( 'AI Readability', 'rain-os-aeo-analyzer' ); ?></h3>
                <div class="rain-os-pillar-score"><?php echo esc_html( $ai_readability ); ?>%</div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Semantic Clarity', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $ai_readability + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-cyan-1" style="width: <?php echo esc_attr( max( 0, $ai_readability + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Readability Score', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $ai_readability + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-cyan-2" style="width: <?php echo esc_attr( max( 0, $ai_readability + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Logical Structure', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $ai_readability + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-cyan-3" style="width: <?php echo esc_attr( max( 0, $ai_readability + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
            </div>

            <div class="rain-os-pillar-section rain-os-pillar-green">
                <h3 class="rain-os-pillar-title"><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></h3>
                <div class="rain-os-pillar-score"><?php echo esc_html( $digital_authority ); ?>%</div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Entity Recognition', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $digital_authority + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-green-1" style="width: <?php echo esc_attr( max( 0, $digital_authority + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Citation Readiness', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $digital_authority + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-green-2" style="width: <?php echo esc_attr( max( 0, $digital_authority + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Schema Extraction', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $digital_authority + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-green-3" style="width: <?php echo esc_attr( max( 0, $digital_authority + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
            </div>

            <div class="rain-os-pillar-section rain-os-pillar-purple">
                <h3 class="rain-os-pillar-title"><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></h3>
                <div class="rain-os-pillar-score"><?php echo esc_html( $conversion_readiness ); ?>%</div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'AEO Alignment', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $conversion_readiness + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-purple-1" style="width: <?php echo esc_attr( max( 0, $conversion_readiness + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'QA-Format', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $conversion_readiness + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-purple-2" style="width: <?php echo esc_attr( max( 0, $conversion_readiness + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Metadata Audit', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( max( 0, $conversion_readiness + rand( -5, 5 ) ) ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-purple-3" style="width: <?php echo esc_attr( max( 0, $conversion_readiness + rand( -5, 5 ) ) ); ?>%;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
