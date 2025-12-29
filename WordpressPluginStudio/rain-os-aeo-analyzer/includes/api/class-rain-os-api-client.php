<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_API_Client {

    private $api_url;
    private $api_key;
    private $timeout = 30;

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

        $url = trailingslashit( $this->api_url ) . ltrim( $endpoint, '/' );

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
        $body        = wp_remote_retrieve_body( $response );
        $data        = json_decode( $body, true );

        if ( $status_code < 200 || $status_code >= 300 ) {
            $message = isset( $data['message'] ) ? $data['message'] : __( 'API request failed.', 'rain-os-aeo-analyzer' );
            return new WP_Error( 'api_error', $message, array( 'status' => $status_code ) );
        }

        return $data;
    }

    public function analyze_content( $title, $content ) {
        return $this->make_request(
            'analyze',
            'POST',
            array(
                'title'   => $title,
                'content' => $content,
            )
        );
    }

    public function get_account_info() {
        return $this->make_request( 'account' );
    }

    public function get_usage_stats() {
        return $this->make_request( 'usage' );
    }

    public function quick_tool( $tool, $content, $options = array() ) {
        $endpoint_map = array(
            'title_suggestion'  => 'tools/title-suggestion',
            'meta_description'  => 'tools/meta-description',
            'summarize'         => 'tools/summarize',
            'rewrite'           => 'tools/rewrite',
        );

        if ( ! isset( $endpoint_map[ $tool ] ) ) {
            return new WP_Error( 'invalid_tool', __( 'Invalid tool specified.', 'rain-os-aeo-analyzer' ) );
        }

        $body = array_merge(
            array( 'content' => $content ),
            $options
        );

        return $this->make_request( $endpoint_map[ $tool ], 'POST', $body );
    }

    public function validate_api_key() {
        $result = $this->get_account_info();

        if ( is_wp_error( $result ) ) {
            return false;
        }

        return true;
    }

    public function get_subscription_status() {
        $account = $this->get_account_info();

        if ( is_wp_error( $account ) ) {
            return array(
                'plan'       => 'free',
                'is_pro'     => false,
                'usage'      => 0,
                'limit'      => 10,
            );
        }

        return array(
            'plan'       => isset( $account['plan'] ) ? $account['plan'] : 'free',
            'is_pro'     => isset( $account['is_pro'] ) ? $account['is_pro'] : false,
            'usage'      => isset( $account['usage'] ) ? $account['usage'] : 0,
            'limit'      => isset( $account['limit'] ) ? $account['limit'] : 10,
        );
    }
}
