<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_API_Client {

    private $api_url;
    private $api_key;
    private $timeout = 60;
    private $last_usage_info = null;

    public function __construct() {
        $this->api_url = get_option( 'rain_os_api_url', RAIN_OS_AEO_API_URL );
        $this->api_key = get_option( 'rain_os_api_key', '' );
    }

    private function get_headers() {
        return array(
            'Authorization' => 'Bearer ' . $this->api_key,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        );
    }

    private function make_request( $endpoint, $method = 'GET', $body = array() ) {
        if ( empty( $this->api_key ) ) {
            return new WP_Error( 'no_api_key', __( 'API key is not configured. Please add your API key in Settings.', 'rain-os-aeo-analyzer' ) );
        }

        $url = trailingslashit( $this->api_url ) . 'api/' . ltrim( $endpoint, '/' );

        $args = array(
            'method'  => $method,
            'headers' => $this->get_headers(),
            'timeout' => $this->timeout,
        );

        if ( ! empty( $body ) && in_array( $method, array( 'POST', 'PUT', 'PATCH' ), true ) ) {
            $args['body'] = wp_json_encode( $body );
        }

        $response = wp_remote_request( $url, $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $status_code = wp_remote_retrieve_response_code( $response );
        $body_raw    = wp_remote_retrieve_body( $response );
        $data        = json_decode( $body_raw, true );

        $usage_header = wp_remote_retrieve_header( $response, 'x-usage-info' );
        if ( ! empty( $usage_header ) ) {
            $this->last_usage_info = json_decode( $usage_header, true );
            $this->cache_usage_info( $this->last_usage_info );
        }

        if ( 401 === $status_code ) {
            return new WP_Error( 'unauthorized', __( 'Invalid or missing API key. Please check your API key in Settings.', 'rain-os-aeo-analyzer' ), array( 'status' => 401 ) );
        }

        if ( 402 === $status_code ) {
            return new WP_Error( 'payment_required', __( 'Your subscription is not active. Please upgrade your plan at https://app.getrainos.com/#/login', 'rain-os-aeo-analyzer' ), array( 'status' => 402 ) );
        }

        if ( 429 === $status_code ) {
            return new WP_Error( 'rate_limit_exceeded', __( 'You have reached your usage limit. Please upgrade your plan for more analyses.', 'rain-os-aeo-analyzer' ), array( 'status' => 429 ) );
        }

        if ( 400 === $status_code ) {
            $message = isset( $data['message'] ) ? $data['message'] : __( 'Missing required parameters.', 'rain-os-aeo-analyzer' );
            return new WP_Error( 'bad_request', $message, array( 'status' => 400 ) );
        }

        if ( $status_code < 200 || $status_code >= 300 ) {
            $message = isset( $data['message'] ) ? $data['message'] : __( 'API request failed.', 'rain-os-aeo-analyzer' );
            return new WP_Error( 'api_error', $message, array( 'status' => $status_code ) );
        }

        return $data;
    }

    private function cache_usage_info( $usage_info ) {
        if ( ! empty( $usage_info ) ) {
            set_transient( 'rain_os_usage_info', $usage_info, HOUR_IN_SECONDS );
        }
    }

    public function get_last_usage_info() {
        if ( $this->last_usage_info ) {
            return $this->last_usage_info;
        }
        return get_transient( 'rain_os_usage_info' );
    }

    public function analyze_content( $content, $industry = '', $content_id = '' ) {
        $payload = array(
            'action'   => 'full_analysis',
            'content'  => $content,
            'industry' => $industry,
        );
        if ( ! empty( $content_id ) ) {
            $payload['contentId'] = $content_id;
        }
        return $this->make_request( 'analyze', 'POST', $payload );
    }

    public function scan_url( $url, $industry = '' ) {
        return $this->make_request(
            'url-scan',
            'POST',
            array(
                'url'      => $url,
                'industry' => $industry,
            )
        );
    }

    public function suggest_titles( $content ) {
        return $this->make_request(
            'analyze',
            'POST',
            array(
                'action'  => 'suggest_titles',
                'content' => $content,
            )
        );
    }

    public function generate_meta_description( $content ) {
        return $this->make_request(
            'analyze',
            'POST',
            array(
                'action'  => 'generate_description',
                'content' => $content,
            )
        );
    }

    public function summarize_content( $content ) {
        return $this->make_request(
            'analyze',
            'POST',
            array(
                'action'  => 'summarize_content',
                'content' => $content,
            )
        );
    }

    public function rewrite_sentence( $sentence ) {
        return $this->make_request(
            'analyze',
            'POST',
            array(
                'action'   => 'rewrite_sentence',
                'sentence' => $sentence,
            )
        );
    }

    public function get_user_info() {
        return $this->make_request( 'users/me', 'GET' );
    }

    public function validate_api_key() {
        $result = $this->get_user_info();

        if ( is_wp_error( $result ) ) {
            return false;
        }

        return true;
    }

    public function get_subscription_status() {
        $user = $this->get_user_info();

        if ( is_wp_error( $user ) ) {
            return array(
                'plan'               => 'free',
                'is_pro'             => false,
                'usage_count'        => 0,
                'usage_limit'        => 5,
                'subscription_status' => 'inactive',
            );
        }

        $usage = isset( $user['usage'] ) ? $user['usage'] : array();

        return array(
            'plan'               => isset( $user['stripePriceId'] ) ? $this->get_plan_name( $user['stripePriceId'] ) : 'free',
            'is_pro'             => isset( $user['subscriptionStatus'] ) && 'active' === $user['subscriptionStatus'],
            'usage_count'        => isset( $usage['count'] ) ? intval( $usage['count'] ) : 0,
            'usage_limit'        => isset( $usage['limit'] ) ? intval( $usage['limit'] ) : 5,
            'subscription_status' => isset( $user['subscriptionStatus'] ) ? $user['subscriptionStatus'] : 'inactive',
            'email'              => isset( $user['email'] ) ? $user['email'] : '',
        );
    }

    private function get_plan_name( $stripe_price_id ) {
        $plan_map = array(
            'price_1SeCHg3NMjs4uYdguOgkr3SQ' => 'Free',
            'price_1SeCJH3NMjs4uYdgpi0xB0XN' => 'Business',
            'price_1SeCKM3NMjs4uYdgcBRhgIhD' => 'Pro',
        );

        if ( isset( $plan_map[ $stripe_price_id ] ) ) {
            return $plan_map[ $stripe_price_id ];
        }

        return 'Pro';
    }

    public function create_checkout_session( $price_id, $success_url, $cancel_url ) {
        return $this->make_request(
            'stripe/create-checkout-session',
            'POST',
            array(
                'priceId'    => $price_id,
                'successUrl' => $success_url,
                'cancelUrl'  => $cancel_url,
            )
        );
    }

    public function create_portal_session( $return_url ) {
        return $this->make_request(
            'stripe/create-portal-session',
            'POST',
            array( 'returnUrl' => $return_url )
        );
    }

    public function regenerate_api_key() {
        return $this->make_request( 'users/me/regenerate-key', 'POST' );
    }

    public function check_capabilities() {
        return $this->make_request( 'capabilities', 'GET' );
    }

    public function quick_tool( $tool, $content, $options = array() ) {
        switch ( $tool ) {
            case 'title_suggestion':
                return $this->suggest_titles( $content );
            case 'meta_description':
                return $this->generate_meta_description( $content );
            case 'summarize':
                return $this->summarize_content( $content );
            case 'rewrite':
                $sentence = isset( $options['sentence'] ) ? $options['sentence'] : $content;
                return $this->rewrite_sentence( $sentence );
            default:
                return new WP_Error( 'invalid_tool', __( 'Invalid tool specified.', 'rain-os-aeo-analyzer' ) );
        }
    }

    public function parse_analysis_response( $response ) {
        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $overall  = isset( $response['overall_score'] ) ? intval( $response['overall_score'] ) : ( isset( $response['overallScore'] ) ? intval( $response['overallScore'] ) : 0 );
        $ai_read  = isset( $response['ai_readability'] ) ? intval( $response['ai_readability'] ) : ( isset( $response['pillarScores']['aiReadability'] ) ? intval( $response['pillarScores']['aiReadability'] ) : 0 );
        $dig_auth = isset( $response['digital_authority'] ) ? intval( $response['digital_authority'] ) : ( isset( $response['pillarScores']['digitalAuthority'] ) ? intval( $response['pillarScores']['digitalAuthority'] ) : 0 );
        $conv_read = isset( $response['conversion_readiness'] ) ? intval( $response['conversion_readiness'] ) : ( isset( $response['pillarScores']['conversionReadiness'] ) ? intval( $response['pillarScores']['conversionReadiness'] ) : 0 );
        $prod_disc = isset( $response['product_discoverability'] ) ? intval( $response['product_discoverability'] ) : ( isset( $response['pillarScores']['productDiscoverability'] ) ? intval( $response['pillarScores']['productDiscoverability'] ) : 0 );

        $parsed = array(
            'overall_score'            => $overall,
            'ai_readability'           => $ai_read,
            'digital_authority'        => $dig_auth,
            'conversion_readiness'     => $conv_read,
            'product_discoverability'  => $prod_disc,

            'pillars' => array(
                'ai_readability'          => $ai_read,
                'digital_authority'       => $dig_auth,
                'conversion_readiness'    => $conv_read,
                'product_discoverability' => $prod_disc,
            ),

            'ai_scores'                     => isset( $response['ai_scores'] ) ? $response['ai_scores'] : array(),
            'sub_scores'                    => array(),
            'phase2_sub_scores'             => isset( $response['phase2_sub_scores'] ) ? $response['phase2_sub_scores'] : array(),
            'crawler_signals'               => isset( $response['crawler_signals'] ) ? $response['crawler_signals'] : array(),

            'ai_readability_detail'         => isset( $response['ai_readability_detail'] ) ? $response['ai_readability_detail'] : array(),
            'digital_authority_detail'      => isset( $response['digital_authority_detail'] ) ? $response['digital_authority_detail'] : array(),
            'conversion_readiness_detail'   => isset( $response['conversion_readiness_detail'] ) ? $response['conversion_readiness_detail'] : array(),
            'product_discoverability_detail' => isset( $response['product_discoverability_detail'] ) ? $response['product_discoverability_detail'] : array(),

            'recommendations'               => isset( $response['recommendations'] ) ? $response['recommendations'] : array(),
            'keywords'                      => isset( $response['keywords'] ) ? $response['keywords'] : array(),
            'authorship'                    => isset( $response['authorship'] ) ? $response['authorship'] : null,
            'technical_signals'             => isset( $response['technical_signals'] ) ? $response['technical_signals'] : null,
            'technical_recommendations'     => isset( $response['technical_recommendations'] ) ? $response['technical_recommendations'] : array(),
            'url_scanned'                   => isset( $response['url_scanned'] ) ? $response['url_scanned'] : null,
        );

        if ( isset( $response['sub_scores'] ) ) {
            if ( is_array( $response['sub_scores'] ) ) {
                foreach ( $response['sub_scores'] as $key => $val ) {
                    if ( is_array( $val ) && isset( $val['category'] ) ) {
                        $parsed['sub_scores'][ $val['category'] ] = intval( $val['score'] );
                    } else {
                        $parsed['sub_scores'][ $key ] = intval( $val );
                    }
                }
            }
        } elseif ( isset( $response['subScores'] ) && is_array( $response['subScores'] ) ) {
            foreach ( $response['subScores'] as $sub ) {
                if ( isset( $sub['category'], $sub['score'] ) ) {
                    $parsed['sub_scores'][ $sub['category'] ] = intval( $sub['score'] );
                }
            }
        }

        return $parsed;
    }
}
