<?php
/**
 * Gutenberg Sidebar Integration
 *
 * @package Rain_OS_AEO_Analyzer
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_Gutenberg {

    private $api_client;

    public function __construct( $api_client = null ) {
        $this->api_client = $api_client;
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_sidebar_assets' ) );
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
    }

    public function enqueue_sidebar_assets() {
        $asset_file = RAIN_OS_AEO_PLUGIN_DIR . 'build/gutenberg-sidebar.asset.php';

        if ( ! file_exists( $asset_file ) ) {
            return;
        }

        $asset = include $asset_file;

        wp_enqueue_script(
            'rain-os-aeo-gutenberg-sidebar',
            RAIN_OS_AEO_PLUGIN_URL . 'build/gutenberg-sidebar.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'rain-os-aeo-gutenberg-sidebar',
            RAIN_OS_AEO_PLUGIN_URL . 'build/gutenberg-sidebar.css',
            array(),
            $asset['version']
        );

        wp_localize_script(
            'rain-os-aeo-gutenberg-sidebar',
            'rainOsAeo',
            array(
                'apiUrl'           => RAIN_OS_AEO_API_URL,
                'nonce'            => wp_create_nonce( 'wp_rest' ),
                'postId'           => get_the_ID(),
                'isPro'            => $this->is_pro_user(),
                'aiBackendEnabled' => Rain_OS_AI_Backend::is_enabled(),
                'pdEnabled'        => Rain_OS_Settings::is_pd_enabled(),
                'debug'            => defined( 'WP_DEBUG' ) && WP_DEBUG,
            )
        );
    }

    private function is_pro_user() {
        $api_key = get_option( 'rain_os_api_key', '' );
        return ! empty( $api_key );
    }

    public function register_rest_routes() {
        register_rest_route( 'rain-os-aeo/v1', '/analyze', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'handle_analyze' ),
            'permission_callback' => array( $this, 'check_edit_permission' ),
        ) );

        register_rest_route( 'rain-os-aeo/v1', '/normalize', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'handle_normalize' ),
            'permission_callback' => array( $this, 'check_edit_permission' ),
        ) );

        register_rest_route( 'rain-os-aeo/v1', '/normalize/status/(?P<task_id>[a-zA-Z0-9_-]+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'handle_normalize_status' ),
            'permission_callback' => array( $this, 'check_edit_permission' ),
        ) );

        register_rest_route( 'rain-os-aeo/v1', '/ai-scores/(?P<post_id>\d+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'handle_get_ai_scores' ),
            'permission_callback' => array( $this, 'check_edit_permission' ),
        ) );

        register_rest_route( 'rain-os-aeo/v1', '/history/(?P<post_id>\d+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'handle_get_history' ),
            'permission_callback' => array( $this, 'check_edit_permission' ),
        ) );

        register_rest_route( 'rain-os-aeo/v1', '/quick-action', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'handle_quick_action' ),
            'permission_callback' => array( $this, 'check_edit_permission' ),
        ) );

        register_rest_route( 'rain-os-aeo/v1', '/backend-analysis/(?P<post_id>\d+)', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'handle_backend_analysis' ),
            'permission_callback' => array( $this, 'check_edit_permission' ),
        ) );
    }

    public function check_edit_permission() {
        return current_user_can( 'edit_posts' );
    }

    public function handle_analyze( $request ) {
        $post_id = absint( $request->get_param( 'post_id' ) );
        $title   = sanitize_text_field( $request->get_param( 'title' ) );
        $content = wp_kses_post( $request->get_param( 'content' ) );

        if ( empty( $content ) ) {
            return new WP_REST_Response( array(
                'success' => false,
                'message' => __( 'Content is required.', 'rain-os-aeo-analyzer' ),
            ), 400 );
        }

        $api_key = get_option( 'rain_os_api_key', '' );

        if ( empty( $api_key ) ) {
            $scores = $this->calculate_local_scores( $title, $content );
            return new WP_REST_Response( array(
                'success' => true,
                'data'    => $scores,
                'local'   => true,
            ), 200 );
        }

        $response = wp_remote_post( RAIN_OS_AEO_API_URL . '/analyze', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json',
            ),
            'body'    => wp_json_encode( array(
                'action'  => 'full_analysis',
                'title'   => $title,
                'content' => wp_strip_all_tags( $content ),
                'url'     => get_permalink( $post_id ),
            ) ),
            'timeout' => 30,
        ) );

        if ( is_wp_error( $response ) ) {
            $scores = $this->calculate_local_scores( $title, $content );
            return new WP_REST_Response( array(
                'success' => true,
                'data'    => $scores,
                'local'   => true,
            ), 200 );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        $response_data = ! empty( $body['data'] ) ? $body['data'] : $body;

        if ( ! empty( $response_data ) && isset( $response_data['overall_score'] ) ) {
            $this->save_analysis_history( $post_id, $response_data );
            return new WP_REST_Response( array(
                'success' => true,
                'data'    => $response_data,
            ), 200 );
        }

        $scores = $this->calculate_local_scores( $title, $content );
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => $scores,
            'local'   => true,
        ), 200 );
    }

    private function calculate_local_scores( $title, $content ) {
        $plain_text = wp_strip_all_tags( $content );
        $word_count = str_word_count( $plain_text );
        $sentence_count = preg_match_all( '/[.!?]+/', $plain_text, $matches );
        $sentence_count = max( 1, $sentence_count );

        $avg_sentence_length = $word_count / $sentence_count;
        $has_headings = preg_match( '/<h[1-6][^>]*>/i', $content );
        $has_lists = preg_match( '/<(ul|ol)[^>]*>/i', $content );
        $has_images = preg_match( '/<img[^>]+>/i', $content );
        $has_links = preg_match( '/<a[^>]+href/i', $content );

        $ai_readability = 60;
        if ( $avg_sentence_length < 25 ) $ai_readability += 10;
        if ( $has_headings ) $ai_readability += 10;
        if ( $has_lists ) $ai_readability += 5;
        if ( $word_count >= 300 ) $ai_readability += 5;
        if ( $word_count >= 1000 ) $ai_readability += 5;
        $ai_readability = min( 95, $ai_readability );

        $digital_authority = 55;
        if ( $has_links ) $digital_authority += 10;
        if ( $word_count >= 500 ) $digital_authority += 10;
        if ( ! empty( $title ) ) $digital_authority += 5;
        if ( $has_images ) $digital_authority += 5;
        $digital_authority = min( 90, $digital_authority );

        $conversion_readiness = 50;
        if ( $has_headings ) $conversion_readiness += 10;
        if ( preg_match( '/\?/i', $content ) ) $conversion_readiness += 5;
        if ( $has_lists ) $conversion_readiness += 10;
        if ( $word_count >= 300 ) $conversion_readiness += 10;
        $conversion_readiness = min( 90, $conversion_readiness );

        $product_discoverability = 45;
        if ( $has_headings ) $product_discoverability += 10;
        if ( $has_links ) $product_discoverability += 10;
        if ( $word_count >= 500 ) $product_discoverability += 10;
        if ( preg_match( '/\?/i', $content ) ) $product_discoverability += 5;
        $product_discoverability = min( 85, $product_discoverability );

        $pd_on = Rain_OS_Settings::is_pd_enabled();
        $overall = $pd_on 
            ? round( ( $ai_readability + $digital_authority + $conversion_readiness + $product_discoverability ) / 4 )
            : round( ( $ai_readability + $digital_authority + $conversion_readiness ) / 3 );

        return array(
            'overall_score'           => $overall,
            'ai_readability'          => $ai_readability,
            'digital_authority'       => $digital_authority,
            'conversion_readiness'    => $conversion_readiness,
            'product_discoverability' => $product_discoverability,
            'pillars' => array(
                'ai_readability'          => $ai_readability,
                'digital_authority'       => $digital_authority,
                'conversion_readiness'    => $conversion_readiness,
                'product_discoverability' => $product_discoverability,
            ),
            'sub_scores'           => array(
                'semanticClarity'          => max( 0, $ai_readability - 5 ),
                'readabilityScore'         => min( 95, $ai_readability + 5 ),
                'logicalStructure'         => $ai_readability,
                'aeoAlignment'             => max( 0, $ai_readability - 8 ),
                'entityRecognition'        => max( 0, $digital_authority - 5 ),
                'citationReadiness'        => min( 95, $digital_authority + 5 ),
                'descriptiveMetadata'      => max( 0, $digital_authority - 10 ),
                'schemaExtraction'         => max( 0, $conversion_readiness - 5 ),
                'qaFormat'                 => $conversion_readiness,
                'metadataAudit'            => min( 95, $conversion_readiness + 5 ),
                'schemaCompleteness'       => max( 0, $product_discoverability - 3 ),
                'answerLayerQuality'       => max( 0, $product_discoverability + 2 ),
                'freshnessSignals'         => max( 0, $product_discoverability - 5 ),
                'conversationalQueryMatch' => max( 0, $product_discoverability + 1 ),
            ),
            'recommendations'      => $this->generate_recommendations( $title, $content ),
        );
    }

    private function generate_recommendations( $title, $content ) {
        $recommendations = array();
        $plain_text = wp_strip_all_tags( $content );
        $word_count = str_word_count( $plain_text );

        if ( empty( $title ) ) {
            $recommendations[] = array(
                'title'       => __( 'Add a Title', 'rain-os-aeo-analyzer' ),
                'description' => __( 'Your content needs a clear, descriptive title for better AI understanding.', 'rain-os-aeo-analyzer' ),
                'icon'        => '✍️',
                'color'       => '#ef4444',
            );
        }

        if ( $word_count < 300 ) {
            $recommendations[] = array(
                'title'       => __( 'Increase Content Length', 'rain-os-aeo-analyzer' ),
                'description' => sprintf( __( 'Add more content. Aim for at least 300 words (currently %d).', 'rain-os-aeo-analyzer' ), $word_count ),
                'icon'        => '📝',
                'color'       => '#f59e0b',
            );
        }

        if ( ! preg_match( '/<h[2-6][^>]*>/i', $content ) ) {
            $recommendations[] = array(
                'title'       => __( 'Add Subheadings', 'rain-os-aeo-analyzer' ),
                'description' => __( 'Break up your content with H2 or H3 headings for better structure.', 'rain-os-aeo-analyzer' ),
                'icon'        => '📋',
                'color'       => '#22d3ee',
            );
        }

        if ( ! preg_match( '/<a[^>]+href/i', $content ) ) {
            $recommendations[] = array(
                'title'       => __( 'Add Links', 'rain-os-aeo-analyzer' ),
                'description' => __( 'Include internal or external links to support your content.', 'rain-os-aeo-analyzer' ),
                'icon'        => '🔗',
                'color'       => '#10b981',
            );
        }

        if ( empty( $recommendations ) ) {
            $recommendations[] = array(
                'title'       => __( 'Great Job!', 'rain-os-aeo-analyzer' ),
                'description' => __( 'Your content meets the basic AEO requirements.', 'rain-os-aeo-analyzer' ),
                'icon'        => '✅',
                'color'       => '#10b981',
            );
        }

        return $recommendations;
    }

    private function save_analysis_history( $post_id, $data ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';

        $wpdb->insert(
            $table_name,
            array(
                'post_id'                 => $post_id,
                'overall_score'           => $data['overall_score'] ?? 0,
                'ai_readability'          => $data['ai_readability'] ?? 0,
                'digital_authority'       => $data['digital_authority'] ?? 0,
                'conversion_readiness'    => $data['conversion_readiness'] ?? 0,
                'product_discoverability' => isset( $data['product_discoverability'] ) ? absint( $data['product_discoverability'] ) : 0,
                'analysis_data'           => wp_json_encode( $data ),
                'analyzed_at'             => current_time( 'mysql' ),
            ),
            array( '%d', '%d', '%d', '%d', '%d', '%d', '%s', '%s' )
        );
    }

    public function handle_normalize( $request ) {
        $post_id = absint( $request->get_param( 'post_id' ) );
        $title   = sanitize_text_field( $request->get_param( 'title' ) );
        $content = wp_kses_post( $request->get_param( 'content' ) );

        $task_id = 'task_' . wp_generate_uuid4();

        set_transient( 'rain_os_normalize_' . $task_id, array(
            'status'  => 'processing',
            'post_id' => $post_id,
        ), 300 );

        if ( Rain_OS_AI_Backend::is_normalize_enabled() ) {
            $ai_backend = new Rain_OS_AI_Backend();
            $result = $ai_backend->normalize_content_async( $post_id );

            if ( $result ) {
                set_transient( 'rain_os_normalize_' . $task_id, array(
                    'status' => 'complete',
                ), 300 );
            }
        } else {
            set_transient( 'rain_os_normalize_' . $task_id, array(
                'status' => 'complete',
            ), 300 );
        }

        return new WP_REST_Response( array(
            'success' => true,
            'task_id' => $task_id,
            'message' => __( 'Content queued for processing.', 'rain-os-aeo-analyzer' ),
        ), 200 );
    }

    public function handle_normalize_status( $request ) {
        $task_id = sanitize_text_field( $request->get_param( 'task_id' ) );
        $data = get_transient( 'rain_os_normalize_' . $task_id );

        if ( ! $data ) {
            return new WP_REST_Response( array(
                'status'  => 'complete',
                'message' => __( 'Task completed or expired.', 'rain-os-aeo-analyzer' ),
            ), 200 );
        }

        return new WP_REST_Response( $data, 200 );
    }

    public function handle_get_ai_scores( $request ) {
        $post_id = absint( $request->get_param( 'post_id' ) );
        $scores = get_post_meta( $post_id, '_rain_os_ai_scores', true );

        if ( empty( $scores ) ) {
            return new WP_REST_Response( array(
                'success' => false,
                'code'    => 'no_scores',
                'message' => __( 'No AI scores available.', 'rain-os-aeo-analyzer' ),
            ), 200 );
        }

        return new WP_REST_Response( array(
            'success' => true,
            'data'    => $scores,
        ), 200 );
    }

    public function handle_get_history( $request ) {
        global $wpdb;
        $post_id = absint( $request->get_param( 'post_id' ) );
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';

        $results = $wpdb->get_results( $wpdb->prepare(
            "SELECT overall_score as overallScore, ai_readability as aiReadability, 
                    digital_authority as digitalAuthority, conversion_readiness as conversionReadiness,
                    product_discoverability as productDiscoverability,
                    analyzed_at as date
             FROM $table_name 
             WHERE post_id = %d 
             ORDER BY analyzed_at DESC 
             LIMIT 10",
            $post_id
        ), ARRAY_A );

        if ( $results && ! Rain_OS_Settings::is_pd_enabled() ) {
            foreach ( $results as &$row ) {
                $row['overallScore'] = round(
                    ( (int) $row['aiReadability'] + (int) $row['digitalAuthority'] + (int) $row['conversionReadiness'] ) / 3
                );
            }
            unset( $row );
        }

        return new WP_REST_Response( $results ?: array(), 200 );
    }

    public function handle_quick_action( $request ) {
        $action  = sanitize_text_field( $request->get_param( 'action' ) );
        $content = wp_kses_post( $request->get_param( 'content' ) );
        $title   = sanitize_text_field( $request->get_param( 'title' ) );

        $action_map = array(
            'generate_meta' => 'generate_description',
            'summarize'     => 'summarize_content',
            'rewrite'       => 'rewrite_sentence',
        );
        $backend_action = isset( $action_map[ $action ] ) ? $action_map[ $action ] : $action;

        $api_key = get_option( 'rain_os_api_key', '' );

        if ( empty( $api_key ) ) {
            return $this->mock_quick_action( $backend_action, $content, $title );
        }

        $response = wp_remote_post( RAIN_OS_AEO_API_URL . '/analyze', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json',
            ),
            'body'    => wp_json_encode( array(
                'action'  => $backend_action,
                'content' => wp_strip_all_tags( $content ),
                'title'   => $title,
            ) ),
            'timeout' => 30,
        ) );

        if ( is_wp_error( $response ) ) {
            return $this->mock_quick_action( $backend_action, $content, $title );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        $normalized = array();
        if ( isset( $body['titles'] ) )      $normalized['titles']           = $body['titles'];
        if ( isset( $body['description'] ) ) $normalized['meta_description'] = $body['description'];
        if ( isset( $body['summary'] ) )     $normalized['summary']          = $body['summary'];
        if ( isset( $body['rewritten'] ) )   $normalized['rewritten']        = $body['rewritten'];
        if ( isset( $body['data'] ) && is_array( $body['data'] ) ) {
            $normalized = array_merge( $normalized, $body['data'] );
        }

        if ( ! empty( $normalized ) ) {
            return new WP_REST_Response( array(
                'success' => true,
                'data'    => $normalized,
            ), 200 );
        }

        return $this->mock_quick_action( $backend_action, $content, $title );
    }

    private function mock_quick_action( $action, $content, $title ) {
        switch ( $action ) {
            case 'suggest_titles':
                $base_title = ! empty( $title ) ? $title : 'Your Content';
                return new WP_REST_Response( array(
                    'success' => true,
                    'data'    => array(
                        'titles' => array(
                            array( 'text' => $base_title . ': A Complete Guide', 'score' => 92 ),
                            array( 'text' => 'Everything You Need to Know About ' . $base_title, 'score' => 88 ),
                            array( 'text' => 'The Ultimate ' . $base_title . ' Resource', 'score' => 85 ),
                            array( 'text' => $base_title . ' Explained: Tips & Best Practices', 'score' => 82 ),
                            array( 'text' => 'How to Master ' . $base_title . ' in 2024', 'score' => 79 ),
                        ),
                    ),
                    'mock' => true,
                ), 200 );

            case 'generate_description':
                $excerpt = wp_trim_words( wp_strip_all_tags( $content ), 25 );
                return new WP_REST_Response( array(
                    'success' => true,
                    'data'    => array(
                        'meta_description' => 'Discover comprehensive insights about ' . ( $title ?: 'this topic' ) . '. ' . $excerpt,
                    ),
                    'mock' => true,
                ), 200 );

            case 'summarize_content':
                $excerpt = wp_trim_words( wp_strip_all_tags( $content ), 50 );
                return new WP_REST_Response( array(
                    'success' => true,
                    'data'    => array(
                        'summary' => $excerpt . '...',
                    ),
                    'mock' => true,
                ), 200 );

            case 'rewrite_sentence':
                return new WP_REST_Response( array(
                    'success' => true,
                    'data'    => array(
                        'rewritten' => 'An improved version of your text with enhanced clarity and readability. ' . ucfirst( strtolower( wp_strip_all_tags( $content ) ) ),
                    ),
                    'mock' => true,
                ), 200 );

            default:
                return new WP_REST_Response( array(
                    'success' => false,
                    'message' => __( 'Unknown action.', 'rain-os-aeo-analyzer' ),
                ), 400 );
        }
    }

    public function handle_backend_analysis( $request ) {
        $post_id = absint( $request->get_param( 'post_id' ) );

        if ( ! $post_id ) {
            return new WP_REST_Response( null, 204 );
        }

        $api_key = get_option( 'rain_os_api_key', '' );

        if ( empty( $api_key ) ) {
            return new WP_REST_Response( null, 204 );
        }

        $cache_key = 'rain_os_backend_analysis_' . $post_id;
        $cached = get_transient( $cache_key );

        if ( false !== $cached ) {
            return new WP_REST_Response( $cached, 200 );
        }

        $response = wp_remote_get( RAIN_OS_AEO_API_URL . '/api/plugin/content/' . $post_id . '/analysis', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json',
            ),
            'timeout' => 15,
        ) );

        if ( is_wp_error( $response ) ) {
            return new WP_REST_Response( null, 204 );
        }

        $status_code = wp_remote_retrieve_response_code( $response );

        if ( 204 === $status_code ) {
            return new WP_REST_Response( null, 204 );
        }

        if ( 200 !== $status_code ) {
            return new WP_REST_Response( null, 204 );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $body ) ) {
            return new WP_REST_Response( null, 204 );
        }

        set_transient( $cache_key, $body, 5 * MINUTE_IN_SECONDS );

        return new WP_REST_Response( $body, 200 );
    }
}
