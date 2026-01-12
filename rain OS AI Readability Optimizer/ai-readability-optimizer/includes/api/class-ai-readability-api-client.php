<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AI_Readability_API_Client {

    private $api_url;
    private $api_key;
    private $timeout = 30;
    private $last_usage_info = null;

    public function __construct() {
        $this->api_url = get_option( 'ai_readability_api_url', AI_READABILITY_API_URL );
        $this->api_key = get_option( 'ai_readability_api_key', '' );
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
            return new WP_Error( 'no_api_key', __( 'API key is not configured. Please add your API key in Settings.', 'ai-readability-optimizer' ) );
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
            return new WP_Error( 'unauthorized', __( 'Invalid or missing API key. Please check your API key in Settings.', 'ai-readability-optimizer' ), array( 'status' => 401 ) );
        }

        if ( 402 === $status_code ) {
            return new WP_Error( 'payment_required', __( 'Your subscription is not active. Please upgrade your plan at https://app.getrainos.com/#/login', 'ai-readability-optimizer' ), array( 'status' => 402 ) );
        }

        if ( 429 === $status_code ) {
            return new WP_Error( 'rate_limit_exceeded', __( 'You have reached your usage limit. Please upgrade your plan for more analyses.', 'ai-readability-optimizer' ), array( 'status' => 429 ) );
        }

        if ( 400 === $status_code ) {
            $message = isset( $data['message'] ) ? $data['message'] : __( 'Missing required parameters.', 'ai-readability-optimizer' );
            return new WP_Error( 'bad_request', $message, array( 'status' => 400 ) );
        }

        if ( $status_code < 200 || $status_code >= 300 ) {
            $message = isset( $data['message'] ) ? $data['message'] : __( 'API request failed.', 'ai-readability-optimizer' );
            return new WP_Error( 'api_error', $message, array( 'status' => $status_code ) );
        }

        return $data;
    }

    private function cache_usage_info( $usage_info ) {
        if ( ! empty( $usage_info ) ) {
            set_transient( 'ai_readability_usage_info', $usage_info, HOUR_IN_SECONDS );
        }
    }

    public function get_last_usage_info() {
        if ( $this->last_usage_info ) {
            return $this->last_usage_info;
        }
        return get_transient( 'ai_readability_usage_info' );
    }

    public function analyze_content( $content, $industry = '' ) {
        return $this->make_request(
            'analyze',
            'POST',
            array(
                'action'   => 'full_analysis',
                'content'  => $content,
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
                'usage_limit'        => 10,
                'subscription_status' => 'inactive',
            );
        }

        $usage = isset( $user['usage'] ) ? $user['usage'] : array();

        return array(
            'plan'               => isset( $user['stripePriceId'] ) ? $this->get_plan_name( $user['stripePriceId'] ) : 'free',
            'is_pro'             => isset( $user['subscriptionStatus'] ) && 'active' === $user['subscriptionStatus'],
            'usage_count'        => isset( $usage['count'] ) ? intval( $usage['count'] ) : 0,
            'usage_limit'        => isset( $usage['limit'] ) ? intval( $usage['limit'] ) : 10,
            'subscription_status' => isset( $user['subscriptionStatus'] ) ? $user['subscriptionStatus'] : 'inactive',
            'email'              => isset( $user['email'] ) ? $user['email'] : '',
        );
    }

    private function get_plan_name( $stripe_price_id ) {
        $plan_map = array(
            'price_starter'  => 'Starter',
            'price_business' => 'Business',
            'price_agency'   => 'Agency',
        );

        foreach ( $plan_map as $key => $name ) {
            if ( strpos( $stripe_price_id, $key ) !== false ) {
                return $name;
            }
        }

        return 'Pro';
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
                return new WP_Error( 'invalid_tool', __( 'Invalid tool specified.', 'ai-readability-optimizer' ) );
        }
    }

    public function parse_analysis_response( $response ) {
        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $parsed = array(
            'overall_score'        => isset( $response['overallScore'] ) ? intval( $response['overallScore'] ) : 0,
            'ai_readability'       => isset( $response['pillarScores']['aiReadability'] ) ? intval( $response['pillarScores']['aiReadability'] ) : 0,
            'digital_authority'    => isset( $response['pillarScores']['digitalAuthority'] ) ? intval( $response['pillarScores']['digitalAuthority'] ) : 0,
            'conversion_readiness' => isset( $response['pillarScores']['conversionReadiness'] ) ? intval( $response['pillarScores']['conversionReadiness'] ) : 0,
            'sub_scores'           => array(),
            'recommendations'      => isset( $response['recommendations'] ) ? $response['recommendations'] : array(),
            'keywords'             => isset( $response['keywords'] ) ? $response['keywords'] : array(),
            'authorship'           => isset( $response['authorship'] ) ? $response['authorship'] : null,
        );

        if ( isset( $response['subScores'] ) && is_array( $response['subScores'] ) ) {
            foreach ( $response['subScores'] as $sub_score ) {
                if ( isset( $sub_score['category'] ) && isset( $sub_score['score'] ) ) {
                    $parsed['sub_scores'][ $sub_score['category'] ] = intval( $sub_score['score'] );
                }
            }
        }

        return $parsed;
    }
}
