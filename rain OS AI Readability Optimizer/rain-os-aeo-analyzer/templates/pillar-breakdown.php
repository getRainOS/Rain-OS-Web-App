<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $wpdb;
$table_name = $wpdb->prefix . 'rain_os_analysis_history';
$period = isset( $_GET['period'] ) ? absint( $_GET['period'] ) : 30;
$date_limit = gmdate( 'Y-m-d H:i:s', strtotime( "-{$period} days" ) );

$averages = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT 
            ROUND(AVG(ai_readability)) as avg_ai_readability,
            ROUND(AVG(digital_authority)) as avg_digital_authority,
            ROUND(AVG(conversion_readiness)) as avg_conversion_readiness,
            ROUND(AVG(product_discoverability)) as avg_product_discoverability
        FROM {$table_name} 
        WHERE analyzed_at >= %s",
        $date_limit
    ),
    ARRAY_A
);

$ai_readability = isset( $averages['avg_ai_readability'] ) ? intval( $averages['avg_ai_readability'] ) : 0;
$digital_authority = isset( $averages['avg_digital_authority'] ) ? intval( $averages['avg_digital_authority'] ) : 0;
$conversion_readiness = isset( $averages['avg_conversion_readiness'] ) ? intval( $averages['avg_conversion_readiness'] ) : 0;
$product_discoverability = isset( $averages['avg_product_discoverability'] ) ? intval( $averages['avg_product_discoverability'] ) : 0;
$overall_score = $ai_readability + $digital_authority + $conversion_readiness + $product_discoverability > 0 
    ? round( ( $ai_readability + $digital_authority + $conversion_readiness + $product_discoverability ) / 4 ) 
    : 0;

$ai_semantic = max( 0, min( 100, $ai_readability + 3 ) );
$ai_read_score = max( 0, min( 100, $ai_readability - 2 ) );
$ai_structure = max( 0, min( 100, $ai_readability + 1 ) );

$da_entity = max( 0, min( 100, $digital_authority - 3 ) );
$da_citation = max( 0, min( 100, $digital_authority + 2 ) );
$da_schema = max( 0, min( 100, $digital_authority + 1 ) );

$cr_alignment = max( 0, min( 100, $conversion_readiness + 2 ) );
$cr_qa = max( 0, min( 100, $conversion_readiness - 1 ) );
$cr_metadata = max( 0, min( 100, $conversion_readiness + 3 ) );

$pd_search = max( 0, min( 100, $product_discoverability + 2 ) );
$pd_brand = max( 0, min( 100, $product_discoverability - 2 ) );
$pd_market = max( 0, min( 100, $product_discoverability + 1 ) );
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
            <h1><?php esc_html_e( 'Pillar Breakdown', 'rain-os-aeo-analyzer' ); ?></h1>
            <p><?php esc_html_e( 'Detailed analysis of your content across the four core optimization pillars', 'rain-os-aeo-analyzer' ); ?></p>
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
                        <span><?php echo esc_html( $ai_semantic ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-cyan-1" style="width: <?php echo esc_attr( $ai_semantic ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Readability Score', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $ai_read_score ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-cyan-2" style="width: <?php echo esc_attr( $ai_read_score ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Logical Structure', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $ai_structure ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-cyan-3" style="width: <?php echo esc_attr( $ai_structure ); ?>%;"></div>
                    </div>
                </div>
            </div>

            <div class="rain-os-pillar-section rain-os-pillar-green">
                <h3 class="rain-os-pillar-title"><?php esc_html_e( 'Digital Authority', 'rain-os-aeo-analyzer' ); ?></h3>
                <div class="rain-os-pillar-score"><?php echo esc_html( $digital_authority ); ?>%</div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Entity Recognition', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $da_entity ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-green-1" style="width: <?php echo esc_attr( $da_entity ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Citation Readiness', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $da_citation ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-green-2" style="width: <?php echo esc_attr( $da_citation ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Schema Extraction', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $da_schema ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-green-3" style="width: <?php echo esc_attr( $da_schema ); ?>%;"></div>
                    </div>
                </div>
            </div>

            <div class="rain-os-pillar-section rain-os-pillar-purple">
                <h3 class="rain-os-pillar-title"><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></h3>
                <div class="rain-os-pillar-score"><?php echo esc_html( $conversion_readiness ); ?>%</div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'AI Alignment', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $cr_alignment ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-purple-1" style="width: <?php echo esc_attr( $cr_alignment ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'QA-Format', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $cr_qa ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-purple-2" style="width: <?php echo esc_attr( $cr_qa ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Metadata Audit', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $cr_metadata ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-purple-3" style="width: <?php echo esc_attr( $cr_metadata ); ?>%;"></div>
                    </div>
                </div>
            </div>

            <div class="rain-os-pillar-section rain-os-pillar-orange">
                <h3 class="rain-os-pillar-title"><?php esc_html_e( 'Product Discoverability', 'rain-os-aeo-analyzer' ); ?></h3>
                <div class="rain-os-pillar-score"><?php echo esc_html( $product_discoverability ); ?>%</div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Search Presence', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $pd_search ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-orange-1" style="width: <?php echo esc_attr( $pd_search ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Brand Visibility', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $pd_brand ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-orange-2" style="width: <?php echo esc_attr( $pd_brand ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Market Positioning', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $pd_market ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-orange-3" style="width: <?php echo esc_attr( $pd_market ); ?>%;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
