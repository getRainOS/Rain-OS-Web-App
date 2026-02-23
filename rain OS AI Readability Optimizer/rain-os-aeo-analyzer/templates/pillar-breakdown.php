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

$latest = $wpdb->get_var( "SELECT analysis_data FROM {$table_name} ORDER BY analyzed_at DESC LIMIT 1" );
$latest_data = $latest ? json_decode( $latest, true ) : array();

$p1 = isset( $latest_data['ai_readability_detail'] ) ? $latest_data['ai_readability_detail'] : array();
$p2 = isset( $latest_data['digital_authority_detail'] ) ? $latest_data['digital_authority_detail'] : array();
$p3 = isset( $latest_data['conversion_readiness_detail'] ) ? $latest_data['conversion_readiness_detail'] : array();
$p4 = isset( $latest_data['product_discoverability_detail'] ) ? $latest_data['product_discoverability_detail'] : array();
$crawler = isset( $latest_data['crawler_signals'] ) ? $latest_data['crawler_signals'] : array();

if ( ! function_exists( 'rairo_sub' ) ) {
    function rairo_sub( $arr, $key, $fallback = 0 ) {
        return isset( $arr[ $key ] ) ? intval( $arr[ $key ] ) : $fallback;
    }
}

$ai_semantic   = rairo_sub( $p1, 'semantic_clarity', $ai_readability );
$ai_read_score = rairo_sub( $p1, 'readability_score', $ai_readability );
$ai_structure  = rairo_sub( $p1, 'logical_structure', $ai_readability );
$ai_aeo        = rairo_sub( $p1, 'aeo_alignment', $ai_readability );

$da_entity   = rairo_sub( $p2, 'entity_recognition', $digital_authority );
$da_citation = rairo_sub( $p2, 'citation_readiness', $digital_authority );
$da_metadata = rairo_sub( $p2, 'descriptive_metadata', $digital_authority );

$cr_schema   = rairo_sub( $p3, 'schema_extraction', $conversion_readiness );
$cr_qa       = rairo_sub( $p3, 'qa_format_detection', $conversion_readiness );
$cr_metadata = rairo_sub( $p3, 'metadata_audit', $conversion_readiness );

$pd_schema     = rairo_sub( $p4, 'schema_completeness', $product_discoverability );
$pd_answer     = rairo_sub( $p4, 'answer_layer_quality', $product_discoverability );
$pd_entity     = rairo_sub( $p4, 'entity_disambiguation', $product_discoverability );
$pd_query      = rairo_sub( $p4, 'conversational_query_match', $product_discoverability );
$pd_freshness  = rairo_sub( $p4, 'freshness_signals', $product_discoverability );
$pd_structured = rairo_sub( $p4, 'structured_content_quality', $product_discoverability );
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

                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'AEO Alignment', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $ai_aeo ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-cyan-4" style="width: <?php echo esc_attr( $ai_aeo ); ?>%;"></div>
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
                        <span><?php esc_html_e( 'Descriptive Metadata', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $da_metadata ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-green-3" style="width: <?php echo esc_attr( $da_metadata ); ?>%;"></div>
                    </div>
                </div>
            </div>

            <div class="rain-os-pillar-section rain-os-pillar-purple">
                <h3 class="rain-os-pillar-title"><?php esc_html_e( 'Conversion Readiness', 'rain-os-aeo-analyzer' ); ?></h3>
                <div class="rain-os-pillar-score"><?php echo esc_html( $conversion_readiness ); ?>%</div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Schema Extraction', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $cr_schema ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-purple-1" style="width: <?php echo esc_attr( $cr_schema ); ?>%;"></div>
                    </div>
                </div>
                
                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'QA-Format Detection', 'rain-os-aeo-analyzer' ); ?></span>
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
                        <span><?php esc_html_e( 'Schema Completeness', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $pd_schema ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-orange-1" style="width: <?php echo esc_attr( $pd_schema ); ?>%;"></div>
                    </div>
                </div>

                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Answer Layer Quality', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $pd_answer ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-orange-2" style="width: <?php echo esc_attr( $pd_answer ); ?>%;"></div>
                    </div>
                </div>

                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Freshness Signals', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $pd_freshness ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-orange-3" style="width: <?php echo esc_attr( $pd_freshness ); ?>%;"></div>
                    </div>
                </div>

                <div class="rain-os-subcategory">
                    <div class="rain-os-subcategory-header">
                        <span><?php esc_html_e( 'Conversational Query Match', 'rain-os-aeo-analyzer' ); ?></span>
                        <span><?php echo esc_html( $pd_query ); ?>%</span>
                    </div>
                    <div class="rain-os-bar-track">
                        <div class="rain-os-bar-fill rain-os-bar-orange-4" style="width: <?php echo esc_attr( $pd_query ); ?>%;"></div>
                    </div>
                </div>

                <?php if ( ! empty( $crawler ) ) : ?>
                <div class="rain-os-crawler-signals" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">
                    <h4 style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 12px;"><?php esc_html_e( 'Crawler Signals', 'rain-os-aeo-analyzer' ); ?></h4>
                    <div class="rain-os-crawler-row" style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px;">
                        <span style="color: rgba(255,255,255,0.5);"><?php esc_html_e( 'AI Crawler Access', 'rain-os-aeo-analyzer' ); ?></span>
                        <strong style="color: rgba(255,255,255,0.8);"><?php echo esc_html( ucfirst( $crawler['ai_crawler_access'] ?? 'unknown' ) ); ?> (<?php echo esc_html( $crawler['ai_crawler_access_score'] ?? 0 ); ?>)</strong>
                    </div>
                    <div class="rain-os-crawler-row" style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px;">
                        <span style="color: rgba(255,255,255,0.5);"><?php esc_html_e( 'LLMs.txt Status', 'rain-os-aeo-analyzer' ); ?></span>
                        <strong style="color: rgba(255,255,255,0.8);"><?php echo esc_html( ucfirst( $crawler['llms_txt_status'] ?? 'missing' ) ); ?> (<?php echo esc_html( $crawler['llms_txt_permissions'] ?? 0 ); ?>)</strong>
                    </div>
                    <div class="rain-os-crawler-row" style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px;">
                        <span style="color: rgba(255,255,255,0.5);"><?php esc_html_e( 'Schema Maturity', 'rain-os-aeo-analyzer' ); ?></span>
                        <strong style="color: rgba(255,255,255,0.8);"><?php echo esc_html( ucfirst( $crawler['schema_maturity_level'] ?? 'none' ) ); ?></strong>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
