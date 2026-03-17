<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_Ajax {

    private $api_client;

    public function __construct( $api_client ) {
        $this->api_client = $api_client;
        $this->register_ajax_handlers();
    }

    private function register_ajax_handlers() {
        add_action( 'wp_ajax_rain_os_analyze_content', array( $this, 'analyze_content' ) );
        add_action( 'wp_ajax_rain_os_scan_url', array( $this, 'scan_url' ) );
        add_action( 'wp_ajax_rain_os_get_analysis', array( $this, 'get_analysis' ) );
        add_action( 'wp_ajax_rain_os_get_dashboard_data', array( $this, 'get_dashboard_data' ) );
        add_action( 'wp_ajax_rain_os_get_score_history', array( $this, 'get_score_history' ) );
        add_action( 'wp_ajax_rain_os_search_posts', array( $this, 'search_posts' ) );
        add_action( 'wp_ajax_rain_os_get_notifications', array( $this, 'get_notifications' ) );
        add_action( 'wp_ajax_rain_os_mark_notification_read', array( $this, 'mark_notification_read' ) );
        add_action( 'wp_ajax_rain_os_get_pillar_details', array( $this, 'get_pillar_details' ) );
        add_action( 'wp_ajax_rain_os_quick_tool', array( $this, 'quick_tool' ) );
        add_action( 'wp_ajax_rain_os_test_connection', array( $this, 'test_connection' ) );
        add_action( 'wp_ajax_rain_os_get_usage', array( $this, 'get_usage' ) );
        add_action( 'wp_ajax_rain_os_check_ai_backend', array( $this, 'check_ai_backend' ) );
        add_action( 'wp_ajax_rain_os_get_ai_readiness_scores', array( $this, 'get_ai_readiness_scores' ) );
        add_action( 'wp_ajax_rain_os_normalize_content', array( $this, 'normalize_content' ) );
        add_action( 'wp_ajax_rain_os_create_checkout_session', array( $this, 'create_checkout_session' ) );
        add_action( 'wp_ajax_rain_os_create_portal_session', array( $this, 'create_portal_session' ) );
        add_action( 'wp_ajax_rain_os_regenerate_api_key', array( $this, 'regenerate_api_key' ) );
    }

    private function verify_nonce() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'rain_os_aeo_nonce' ) ) {
            wp_send_json_error( array( 'message' => __( 'Security check failed.', 'rain-os-aeo-analyzer' ) ) );
        }
    }

    private function check_capability( $capability = 'edit_posts' ) {
        if ( ! current_user_can( $capability ) ) {
            wp_send_json_error( array( 'message' => __( 'You do not have permission to perform this action.', 'rain-os-aeo-analyzer' ) ) );
        }
    }

    public function analyze_content() {
        $this->verify_nonce();
        $this->check_capability();

        $content  = isset( $_POST['content'] ) ? wp_kses_post( wp_unslash( $_POST['content'] ) ) : '';
        $title    = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
        $industry = isset( $_POST['industry'] ) ? sanitize_text_field( wp_unslash( $_POST['industry'] ) ) : '';
        $post_id  = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
        $content_id = $post_id > 0 ? 'wp_post_' . $post_id : '';

        if ( empty( $industry ) && $post_id > 0 ) {
            $categories = get_the_category( $post_id );
            if ( ! empty( $categories ) ) {
                $industry = $categories[0]->name;
            }
        }

        if ( empty( $content ) ) {
            wp_send_json_error( array( 'message' => __( 'Content is required.', 'rain-os-aeo-analyzer' ) ) );
        }

        $full_content = $title ? $title . "\n\n" . $content : $content;

        $word_count = str_word_count( wp_strip_all_tags( $full_content ) );
        if ( $word_count < 100 ) {
            wp_send_json_error( array(
                'message' => sprintf(
                    __( 'Content is too short to analyze accurately (%d words). Please add more content — a minimum of 100 words is recommended for meaningful scores.', 'rain-os-aeo-analyzer' ),
                    $word_count
                ),
                'code' => 'content_too_short',
                'word_count' => $word_count,
            ) );
        }

        $result = $this->api_client->analyze_content( $full_content, $industry, $content_id );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( array( 
                'message' => $result->get_error_message(),
                'code'    => $result->get_error_code(),
            ) );
        }

        $parsed = $this->api_client->parse_analysis_response( $result );

        if ( $post_id > 0 ) {
            $this->save_analysis_to_history( $post_id, $parsed );
        }

        $usage_info = $this->api_client->get_last_usage_info();

        wp_send_json_success( array_merge( $parsed, array( 'usage' => $usage_info ) ) );
    }

    public function scan_url() {
        $this->verify_nonce();
        $this->check_capability();

        $url      = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';
        $industry = isset( $_POST['industry'] ) ? sanitize_text_field( wp_unslash( $_POST['industry'] ) ) : '';
        $post_id  = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

        if ( empty( $url ) ) {
            wp_send_json_error( array( 'message' => __( 'A URL is required.', 'rain-os-aeo-analyzer' ) ) );
        }

        if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
            wp_send_json_error( array( 'message' => __( 'Please enter a valid URL including http:// or https://', 'rain-os-aeo-analyzer' ) ) );
        }

        $result = $this->api_client->scan_url( $url, $industry );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( array(
                'message' => $result->get_error_message(),
                'code'    => $result->get_error_code(),
            ) );
        }

        $parsed = $this->api_client->parse_analysis_response( $result );

        if ( $post_id > 0 ) {
            $this->save_analysis_to_history( $post_id, $parsed );
        }

        $usage_info = $this->api_client->get_last_usage_info();

        wp_send_json_success( array(
            'analysis'     => $parsed,
            'usage'        => $usage_info,
            'url_scanned'  => $url,
            'technical'    => isset( $parsed['technical_signals'] ) ? $parsed['technical_signals'] : null,
            'tech_recs'    => isset( $parsed['technical_recommendations'] ) ? $parsed['technical_recommendations'] : array(),
        ) );
    }

    private function save_analysis_to_history( $post_id, $analysis ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';

        $wpdb->insert(
            $table_name,
            array(
                'post_id'              => $post_id,
                'overall_score'        => isset( $analysis['overall_score'] ) ? absint( $analysis['overall_score'] ) : 0,
                'ai_readability'       => isset( $analysis['ai_readability'] ) ? absint( $analysis['ai_readability'] ) : 0,
                'digital_authority'    => isset( $analysis['digital_authority'] ) ? absint( $analysis['digital_authority'] ) : 0,
                'conversion_readiness' => isset( $analysis['conversion_readiness'] ) ? absint( $analysis['conversion_readiness'] ) : 0,
                'product_discoverability' => isset( $analysis['product_discoverability'] ) ? absint( $analysis['product_discoverability'] ) : 0,
                'analysis_data'        => wp_json_encode( $analysis ),
                'analyzed_at'          => current_time( 'mysql' ),
            ),
            array( '%d', '%d', '%d', '%d', '%d', '%d', '%s', '%s' )
        );
    }

    public function get_analysis() {
        $this->verify_nonce();
        $this->check_capability();

        $post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

        if ( ! $post_id ) {
            wp_send_json_error( array( 'message' => __( 'Post ID is required.', 'rain-os-aeo-analyzer' ) ) );
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} WHERE post_id = %d ORDER BY analyzed_at DESC LIMIT 1",
                $post_id
            ),
            ARRAY_A
        );

        if ( $result ) {
            $result['analysis_data'] = json_decode( $result['analysis_data'], true );
            wp_send_json_success( $result );
        } else {
            wp_send_json_error( array( 'message' => __( 'No analysis found for this post.', 'rain-os-aeo-analyzer' ) ) );
        }
    }

    public function get_dashboard_data() {
        $this->verify_nonce();
        $this->check_capability();

        $period = isset( $_POST['period'] ) ? absint( $_POST['period'] ) : 30;

        global $wpdb;
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';
        $date_limit = gmdate( 'Y-m-d H:i:s', strtotime( "-{$period} days" ) );

        $averages = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT 
                    ROUND(AVG(overall_score)) as avg_overall,
                    ROUND(AVG(ai_readability)) as avg_ai_readability,
                    ROUND(AVG(digital_authority)) as avg_digital_authority,
                    ROUND(AVG(conversion_readiness)) as avg_conversion_readiness,
                    ROUND(AVG(product_discoverability)) as avg_product_discoverability,
                    COUNT(*) as total_analyzed
                FROM {$table_name} 
                WHERE analyzed_at >= %s",
                $date_limit
            ),
            ARRAY_A
        );

        $trend_data = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT 
                    DATE(analyzed_at) as date,
                    ROUND(AVG(overall_score)) as avg_score,
                    ROUND(AVG(ai_readability)) as avg_ai,
                    ROUND(AVG(digital_authority)) as avg_authority,
                    ROUND(AVG(conversion_readiness)) as avg_conversion,
                    ROUND(AVG(product_discoverability)) as avg_discoverability
                FROM {$table_name} 
                WHERE analyzed_at >= %s 
                GROUP BY DATE(analyzed_at) 
                ORDER BY date ASC",
                $date_limit
            ),
            ARRAY_A
        );

        $recent_posts = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT h.*, p.post_title, p.post_name 
                FROM {$table_name} h 
                LEFT JOIN {$wpdb->posts} p ON h.post_id = p.ID 
                WHERE h.analyzed_at >= %s 
                ORDER BY h.analyzed_at DESC 
                LIMIT 10",
                $date_limit
            ),
            ARRAY_A
        );

        wp_send_json_success(
            array(
                'averages'    => $averages,
                'trend_data'  => $trend_data,
                'recent_posts' => $recent_posts,
            )
        );
    }

    public function get_score_history() {
        $this->verify_nonce();
        $this->check_capability();

        $period = isset( $_POST['period'] ) ? absint( $_POST['period'] ) : 30;
        $page   = isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1;
        $limit  = isset( $_POST['limit'] ) ? absint( $_POST['limit'] ) : 20;
        $offset = ( $page - 1 ) * $limit;

        global $wpdb;
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';
        $date_limit = gmdate( 'Y-m-d H:i:s', strtotime( "-{$period} days" ) );

        $total = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table_name} WHERE analyzed_at >= %s",
                $date_limit
            )
        );

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT h.*, p.post_title, p.post_name, p.post_content 
                FROM {$table_name} h 
                LEFT JOIN {$wpdb->posts} p ON h.post_id = p.ID 
                WHERE h.analyzed_at >= %s 
                ORDER BY h.analyzed_at DESC 
                LIMIT %d OFFSET %d",
                $date_limit,
                $limit,
                $offset
            ),
            ARRAY_A
        );

        foreach ( $results as &$row ) {
            $plain_text = wp_strip_all_tags( $row['post_content'] ?? '' );
            $row['word_count'] = str_word_count( $plain_text );
            unset( $row['post_content'] );
        }

        wp_send_json_success(
            array(
                'posts'       => $results,
                'total'       => (int) $total,
                'total_pages' => ceil( $total / $limit ),
                'current_page' => $page,
            )
        );
    }

    public function search_posts() {
        $this->verify_nonce();
        $this->check_capability();

        $query = isset( $_POST['query'] ) ? sanitize_text_field( wp_unslash( $_POST['query'] ) ) : '';

        if ( strlen( $query ) < 2 ) {
            wp_send_json_success( array( 'posts' => array() ) );
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT h.*, p.post_title, p.post_name, p.post_author 
                FROM {$table_name} h 
                LEFT JOIN {$wpdb->posts} p ON h.post_id = p.ID 
                WHERE p.post_title LIKE %s OR p.post_name LIKE %s 
                GROUP BY h.post_id 
                ORDER BY h.analyzed_at DESC 
                LIMIT 10",
                '%' . $wpdb->esc_like( $query ) . '%',
                '%' . $wpdb->esc_like( $query ) . '%'
            ),
            ARRAY_A
        );

        wp_send_json_success( array( 'posts' => $results ) );
    }

    public function get_notifications() {
        $this->verify_nonce();
        $this->check_capability();

        $user_id       = get_current_user_id();
        $notifications = get_user_meta( $user_id, 'rain_os_notifications', true );

        if ( ! is_array( $notifications ) ) {
            $notifications = array();
        }

        wp_send_json_success( array( 'notifications' => $notifications ) );
    }

    public function mark_notification_read() {
        $this->verify_nonce();
        $this->check_capability();

        $notification_id = isset( $_POST['notification_id'] ) ? sanitize_text_field( wp_unslash( $_POST['notification_id'] ) ) : '';
        $user_id         = get_current_user_id();

        $notifications = get_user_meta( $user_id, 'rain_os_notifications', true );

        if ( is_array( $notifications ) ) {
            foreach ( $notifications as &$notification ) {
                if ( isset( $notification['id'] ) && $notification['id'] === $notification_id ) {
                    $notification['read'] = true;
                    break;
                }
            }
            update_user_meta( $user_id, 'rain_os_notifications', $notifications );
        }

        wp_send_json_success();
    }

    public function get_pillar_details() {
        $this->verify_nonce();
        $this->check_capability();

        $post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

        if ( ! $post_id ) {
            wp_send_json_error( array( 'message' => __( 'Post ID is required.', 'rain-os-aeo-analyzer' ) ) );
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'rain_os_analysis_history';

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT analysis_data FROM {$table_name} WHERE post_id = %d ORDER BY analyzed_at DESC LIMIT 1",
                $post_id
            ),
            ARRAY_A
        );

        if ( $result && ! empty( $result['analysis_data'] ) ) {
            $data = json_decode( $result['analysis_data'], true );
            wp_send_json_success( $data );
        } else {
            wp_send_json_error( array( 'message' => __( 'No analysis data found.', 'rain-os-aeo-analyzer' ) ) );
        }
    }

    public function quick_tool() {
        $this->verify_nonce();
        $this->check_capability();

        $tool    = isset( $_POST['tool'] ) ? sanitize_text_field( wp_unslash( $_POST['tool'] ) ) : '';
        $content = isset( $_POST['content'] ) ? wp_kses_post( wp_unslash( $_POST['content'] ) ) : '';

        if ( empty( $tool ) || empty( $content ) ) {
            wp_send_json_error( array( 'message' => __( 'Tool and content are required.', 'rain-os-aeo-analyzer' ) ) );
        }

        $valid_tools = array( 'title_suggestion', 'meta_description', 'summarize', 'rewrite' );

        if ( ! in_array( $tool, $valid_tools, true ) ) {
            wp_send_json_error( array( 'message' => __( 'Invalid tool specified.', 'rain-os-aeo-analyzer' ) ) );
        }

        $options = array();
        if ( 'rewrite' === $tool && isset( $_POST['sentence'] ) ) {
            $options['sentence'] = sanitize_text_field( wp_unslash( $_POST['sentence'] ) );
        }

        $result = $this->api_client->quick_tool( $tool, $content, $options );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( array( 
                'message' => $result->get_error_message(),
                'code'    => $result->get_error_code(),
            ) );
        }

        $usage_info = $this->api_client->get_last_usage_info();

        $text_result = $this->extract_quick_tool_result( $tool, $result );

        wp_send_json_success( array(
            'result' => $text_result,
            'raw'    => $result,
            'usage'  => $usage_info,
        ) );
    }

    private function extract_quick_tool_result( $tool, $data ) {
        if ( ! is_array( $data ) ) {
            return (string) $data;
        }

        switch ( $tool ) {
            case 'title_suggestion':
                if ( ! empty( $data['titles'] ) && is_array( $data['titles'] ) ) {
                    $lines = array();
                    foreach ( $data['titles'] as $i => $t ) {
                        $text  = is_array( $t ) ? ( $t['text'] ?? '' ) : (string) $t;
                        $score = is_array( $t ) ? ( ' [score: ' . ( $t['score'] ?? '' ) . ']' ) : '';
                        $lines[] = ( $i + 1 ) . '. ' . $text . $score;
                    }
                    return implode( "\n", $lines );
                }
                if ( ! empty( $data['recommendations'] ) && is_array( $data['recommendations'] ) ) {
                    $titles = array_filter( $data['recommendations'], function( $r ) {
                        return isset( $r['pillar'] ) && $r['pillar'] === 'ai_readability';
                    } );
                    if ( ! empty( $titles ) ) {
                        return implode( "\n", array_column( $titles, 'description' ) );
                    }
                    return implode( "\n", array_column( array_slice( $data['recommendations'], 0, 5 ), 'description' ) );
                }
                break;

            case 'meta_description':
                if ( ! empty( $data['description'] ) )      return (string) $data['description'];
                if ( ! empty( $data['meta_description'] ) ) return (string) $data['meta_description'];
                if ( ! empty( $data['recommendations'] ) ) {
                    $first = reset( $data['recommendations'] );
                    return is_array( $first ) ? ( $first['description'] ?? '' ) : (string) $first;
                }
                break;

            case 'summarize':
                if ( ! empty( $data['summary'] ) )  return (string) $data['summary'];
                if ( ! empty( $data['summaries'] ) ) return implode( ' ', (array) $data['summaries'] );
                break;

            case 'rewrite':
                if ( ! empty( $data['rewritten'] ) )  return (string) $data['rewritten'];
                if ( ! empty( $data['rewrite'] ) )     return (string) $data['rewrite'];
                if ( ! empty( $data['ai_readability_detail']['answerFirstFormatting'] ) ) {
                    return sprintf(
                        /* translators: %d: Answer-first formatting score out of 100 */
                        __( 'Tip: Answer-first formatting score is %d/100. Lead with the direct answer before supporting details.', 'rain-os-aeo-analyzer' ),
                        (int) $data['ai_readability_detail']['answerFirstFormatting']
                    );
                }
                break;
        }

        foreach ( array( 'text', 'result', 'content', 'output' ) as $k ) {
            if ( ! empty( $data[ $k ] ) && is_string( $data[ $k ] ) ) {
                return $data[ $k ];
            }
        }

        return __( 'Action completed. Check your recommendations for detailed suggestions.', 'rain-os-aeo-analyzer' );
    }

    public function create_checkout_session() {
        $this->verify_nonce();
        $this->check_capability( 'manage_options' );

        $price_id   = isset( $_POST['price_id'] ) ? sanitize_text_field( wp_unslash( $_POST['price_id'] ) ) : '';
        $cancel_url = admin_url( 'admin.php?page=rain-os-aeo-upgrade' );
        $success_url = admin_url( 'admin.php?page=rain-os-aeo-upgrade&checkout=success' );

        if ( empty( $price_id ) ) {
            wp_send_json_error( array( 'message' => __( 'Price ID is required.', 'rain-os-aeo-analyzer' ) ) );
        }

        $result = $this->api_client->create_checkout_session( $price_id, $success_url, $cancel_url );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( array( 'message' => $result->get_error_message() ) );
        }

        $url = isset( $result['url'] ) ? $result['url'] : ( isset( $result['checkoutUrl'] ) ? $result['checkoutUrl'] : '' );

        if ( empty( $url ) ) {
            wp_send_json_error( array( 'message' => __( 'No checkout URL returned. Please try again.', 'rain-os-aeo-analyzer' ) ) );
        }

        wp_send_json_success( array( 'url' => esc_url_raw( $url ) ) );
    }

    public function create_portal_session() {
        $this->verify_nonce();
        $this->check_capability( 'manage_options' );

        $return_url = admin_url( 'admin.php?page=rain-os-aeo-settings' );
        $result     = $this->api_client->create_portal_session( $return_url );

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( array( 'message' => $result->get_error_message() ) );
        }

        $url = isset( $result['url'] ) ? $result['url'] : ( isset( $result['portalUrl'] ) ? $result['portalUrl'] : '' );

        if ( empty( $url ) ) {
            wp_send_json_error( array( 'message' => __( 'No billing portal URL returned. Please try again.', 'rain-os-aeo-analyzer' ) ) );
        }

        wp_send_json_success( array( 'url' => esc_url_raw( $url ) ) );
    }

    public function regenerate_api_key() {
        $this->verify_nonce();
        $this->check_capability( 'manage_options' );

        $result = $this->api_client->regenerate_api_key();

        if ( is_wp_error( $result ) ) {
            wp_send_json_error( array( 'message' => $result->get_error_message() ) );
        }

        $new_key = isset( $result['apiKey'] ) ? $result['apiKey'] : ( isset( $result['api_key'] ) ? $result['api_key'] : '' );

        if ( empty( $new_key ) ) {
            wp_send_json_error( array( 'message' => __( 'No new API key returned. Please try again.', 'rain-os-aeo-analyzer' ) ) );
        }

        update_option( 'rain_os_api_key', sanitize_text_field( $new_key ) );

        wp_send_json_success( array(
            'api_key' => $new_key,
            'message' => __( 'API key regenerated successfully.', 'rain-os-aeo-analyzer' ),
        ) );
    }

    public function test_connection() {
        $this->verify_nonce();
        $this->check_capability( 'manage_options' );

        $user_info = $this->api_client->get_user_info();

        if ( is_wp_error( $user_info ) ) {
            wp_send_json_error( array( 
                'message' => $user_info->get_error_message(),
                'code'    => $user_info->get_error_code(),
            ) );
        }

        wp_send_json_success( array(
            'connected' => true,
            'user'      => array(
                'email'               => isset( $user_info['email'] ) ? $user_info['email'] : '',
                'subscription_status' => isset( $user_info['subscriptionStatus'] ) ? $user_info['subscriptionStatus'] : 'inactive',
                'usage'               => isset( $user_info['usage'] ) ? $user_info['usage'] : array( 'count' => 0, 'limit' => 10 ),
            ),
        ) );
    }

    public function get_usage() {
        $this->verify_nonce();
        $this->check_capability();

        $subscription = $this->api_client->get_subscription_status();

        wp_send_json_success( $subscription );
    }

    public function check_ai_backend() {
        $this->verify_nonce();
        $this->check_capability();

        $ai_backend = new Rain_OS_AI_Backend();
        $available  = $ai_backend->check_capability();

        wp_send_json_success( array(
            'available' => $available,
            'enabled'   => Rain_OS_AI_Backend::is_enabled(),
        ) );
    }

    public function get_ai_readiness_scores() {
        $this->verify_nonce();
        $this->check_capability();

        $content_id = isset( $_POST['content_id'] ) ? sanitize_text_field( wp_unslash( $_POST['content_id'] ) ) : '';

        if ( empty( $content_id ) ) {
            wp_send_json_error( array( 'message' => __( 'Content ID is required.', 'rain-os-aeo-analyzer' ) ) );
        }

        $ai_backend = new Rain_OS_AI_Backend();
        $scores     = $ai_backend->get_content_scores( $content_id );

        if ( null === $scores ) {
            wp_send_json_error( array( 'message' => __( 'Scores unavailable.', 'rain-os-aeo-analyzer' ) ) );
        }

        wp_send_json_success( $scores );
    }

    public function normalize_content() {
        $this->verify_nonce();
        $this->check_capability();

        $content_id = isset( $_POST['content_id'] ) ? sanitize_text_field( wp_unslash( $_POST['content_id'] ) ) : '';
        $html       = isset( $_POST['html'] ) ? wp_kses_post( wp_unslash( $_POST['html'] ) ) : '';
        $text       = isset( $_POST['text'] ) ? sanitize_textarea_field( wp_unslash( $_POST['text'] ) ) : '';

        if ( empty( $content_id ) ) {
            $content_id = 'analyzer_' . wp_generate_uuid4();
        }

        $ai_backend = new Rain_OS_AI_Backend();

        if ( ! $ai_backend->check_capability() ) {
            wp_send_json_error( array( 'message' => __( 'AI backend is not available.', 'rain-os-aeo-analyzer' ) ) );
        }

        $result = $ai_backend->normalize_content( $content_id, array(
            'html' => $html,
            'text' => $text,
        ) );

        if ( $result ) {
            wp_send_json_success( array(
                'content_id' => $content_id,
                'message'    => __( 'Content sent for normalization.', 'rain-os-aeo-analyzer' ),
            ) );
        } else {
            wp_send_json_error( array( 'message' => __( 'Failed to normalize content.', 'rain-os-aeo-analyzer' ) ) );
        }
    }
}
