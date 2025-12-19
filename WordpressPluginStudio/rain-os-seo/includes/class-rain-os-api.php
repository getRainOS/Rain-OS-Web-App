<?php
/**
 * Rain OS API Handler
 * Handles all communication with the Rain OS backend API
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rain_OS_API {
    
    private $api_endpoint;
    private $api_key;
    private $timeout = 30;
    
    public function __construct() {
        $this->api_endpoint = get_option('rain_os_api_endpoint', '');
        $this->api_key = get_option('rain_os_api_key', '');
    }
    
    private function get_headers() {
        return array(
            'Authorization' => 'Bearer ' . $this->api_key,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        );
    }
    
    private function make_request($endpoint, $method = 'GET', $body = null) {
        if (empty($this->api_endpoint) || empty($this->api_key)) {
            return new WP_Error('missing_config', __('API endpoint or key not configured.', 'rain-os-seo'));
        }
        
        $url = trailingslashit($this->api_endpoint) . ltrim($endpoint, '/');
        
        $args = array(
            'method' => $method,
            'headers' => $this->get_headers(),
            'timeout' => $this->timeout,
            'sslverify' => true
        );
        
        if ($body !== null && in_array($method, array('POST', 'PUT', 'PATCH'))) {
            $args['body'] = wp_json_encode($body);
        }
        
        $response = wp_remote_request($url, $args);
        
        return $this->parse_response($response);
    }
    
    public function parse_response($response) {
        if (is_wp_error($response)) {
            return $response;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($status_code === 401) {
            return new WP_Error('invalid_api_key', __('Invalid API key. Please check your settings.', 'rain-os-seo'));
        }
        
        if ($status_code === 402) {
            return new WP_Error('payment_required', __('Your subscription is inactive. Please renew your subscription.', 'rain-os-seo'));
        }
        
        if ($status_code === 429) {
            return new WP_Error('rate_limit', __('Rate limit exceeded. Please try again later.', 'rain-os-seo'));
        }
        
        if ($status_code >= 500) {
            return new WP_Error('server_error', __('Server error. Please try again later.', 'rain-os-seo'));
        }
        
        if ($status_code < 200 || $status_code >= 300) {
            $message = isset($data['message']) ? $data['message'] : __('Unknown error occurred.', 'rain-os-seo');
            return new WP_Error('api_error', $message);
        }
        
        return $data;
    }
    
    public function test_connection() {
        $result = $this->make_request('api/users/me', 'GET');
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        if (isset($result['usage'])) {
            update_option('rain_os_usage', array(
                'count' => isset($result['usage']['count']) ? intval($result['usage']['count']) : 0,
                'limit' => isset($result['usage']['limit']) ? intval($result['usage']['limit']) : 5
            ));
        }
        
        return $result;
    }
    
    public function get_user_info() {
        return $this->make_request('api/users/me', 'GET');
    }
    
    public function analyze_content($content, $industry = 'General / Other') {
        $body = array(
            'action' => 'full_analysis',
            'content' => $content,
            'industry' => $industry
        );
        
        $result = $this->make_request('api/analyze', 'POST', $body);
        
        if (!is_wp_error($result)) {
            $this->increment_usage();
        }
        
        return $result;
    }
    
    public function suggest_titles($content) {
        $body = array(
            'action' => 'suggest_titles',
            'content' => $content
        );
        
        return $this->make_request('api/analyze', 'POST', $body);
    }
    
    public function generate_description($content) {
        $body = array(
            'action' => 'generate_description',
            'content' => $content
        );
        
        return $this->make_request('api/analyze', 'POST', $body);
    }
    
    public function summarize_content($content) {
        $body = array(
            'action' => 'summarize_content',
            'content' => $content
        );
        
        return $this->make_request('api/analyze', 'POST', $body);
    }
    
    public function rewrite_sentence($sentence) {
        $body = array(
            'action' => 'rewrite_sentence',
            'sentence' => $sentence
        );
        
        return $this->make_request('api/analyze', 'POST', $body);
    }
    
    private function increment_usage() {
        $usage = get_option('rain_os_usage', array('count' => 0, 'limit' => 5));
        $usage['count'] = intval($usage['count']) + 1;
        update_option('rain_os_usage', $usage);
    }
    
    public function is_configured() {
        return !empty($this->api_endpoint) && !empty($this->api_key);
    }
}
