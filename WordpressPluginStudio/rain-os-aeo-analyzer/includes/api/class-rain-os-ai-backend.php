<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_AI_Backend {

    private $api_url;
    private $api_key;
    private $timeout = 15;
    private $capability_cache_key = 'rain_os_ai_backend_capability';
    private $capability_cache_ttl = 21600;

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

    public static function is_enabled() {
        return 'yes' === get_option( 'rain_os_ai_backend_enabled', 'no' );
    }

    public static function is_score_panel_enabled() {
        return self::is_enabled() && 'yes' === get_option( 'rain_os_ai_score_panel', 'no' );
    }

    public static function is_normalize_enabled() {
        return self::is_enabled() && 'yes' === get_option( 'rain_os_ai_normalize', 'no' );
    }

    public function check_capability() {
        $cached = get_transient( $this->capability_cache_key );
        if ( false !== $cached ) {
            return (bool) $cached;
        }

        if ( empty( $this->api_key ) ) {
            return false;
        }

        $url = trailingslashit( $this->api_url ) . 'v1/ai/site/llms';

        $response = wp_remote_get( $url, array(
            'headers' => $this->get_headers(),
            'timeout' => $this->timeout,
        ) );

        if ( is_wp_error( $response ) ) {
            set_transient( $this->capability_cache_key, 0, 300 );
            return false;
        }

        $status_code = wp_remote_retrieve_response_code( $response );
        $available   = ( $status_code >= 200 && $status_code < 300 );

        set_transient( $this->capability_cache_key, $available ? 1 : 0, $available ? $this->capability_cache_ttl : 300 );

        return $available;
    }

    public function get_content_scores( $content_id ) {
        if ( ! $this->check_capability() ) {
            return null;
        }

        $cache_key = 'rain_os_ai_scores_' . md5( $content_id );
        $cached    = get_transient( $cache_key );

        if ( false !== $cached ) {
            return $cached;
        }

        $url = trailingslashit( $this->api_url ) . 'v1/ai/content/' . urlencode( $content_id );

        $response = wp_remote_get( $url, array(
            'headers' => $this->get_headers(),
            'timeout' => $this->timeout,
        ) );

        if ( is_wp_error( $response ) ) {
            return null;
        }

        $status_code = wp_remote_retrieve_response_code( $response );
        if ( $status_code < 200 || $status_code >= 300 ) {
            return null;
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( ! empty( $data ) && isset( $data['scores'] ) ) {
            set_transient( $cache_key, $data, $this->capability_cache_ttl );
            return $data;
        }

        return null;
    }

    public function get_diagnostics( $content_id ) {
        if ( ! $this->check_capability() ) {
            return null;
        }

        $url = trailingslashit( $this->api_url ) . 'v1/ai/diagnostics/' . urlencode( $content_id );

        $response = wp_remote_get( $url, array(
            'headers' => $this->get_headers(),
            'timeout' => $this->timeout,
        ) );

        if ( is_wp_error( $response ) ) {
            return null;
        }

        $status_code = wp_remote_retrieve_response_code( $response );
        if ( $status_code < 200 || $status_code >= 300 ) {
            return null;
        }

        $body = wp_remote_retrieve_body( $response );
        return json_decode( $body, true );
    }

    public function normalize_content( $content_id, $content_data = array() ) {
        if ( ! $this->check_capability() ) {
            return false;
        }

        $url = trailingslashit( $this->api_url ) . 'v1/ai/normalize';

        $payload = array(
            'contentId' => $content_id,
        );

        if ( ! empty( $content_data['text'] ) ) {
            $payload['text'] = $content_data['text'];
        }

        if ( ! empty( $content_data['html'] ) ) {
            $payload['html'] = $content_data['html'];
        }

        if ( ! empty( $content_data['canonicalUrl'] ) ) {
            $payload['canonicalUrl'] = $content_data['canonicalUrl'];
        }

        $response = wp_remote_post( $url, array(
            'headers'  => $this->get_headers(),
            'timeout'  => $this->timeout,
            'body'     => wp_json_encode( $payload ),
            'blocking' => false,
        ) );

        return ! is_wp_error( $response );
    }

    public function normalize_content_async( $post_id ) {
        if ( ! self::is_normalize_enabled() ) {
            return;
        }

        $post = get_post( $post_id );
        if ( ! $post || ! in_array( $post->post_status, array( 'publish', 'draft' ), true ) ) {
            return;
        }

        $content_id   = 'wp_post_' . $post_id;
        $content_data = array(
            'html'         => apply_filters( 'the_content', $post->post_content ),
            'text'         => wp_strip_all_tags( $post->post_content ),
            'canonicalUrl' => get_permalink( $post_id ),
        );

        $this->normalize_content( $content_id, $content_data );
    }

    public static function clear_capability_cache() {
        delete_transient( 'rain_os_ai_backend_capability' );
    }
}
