<?php
/**
 * Rain OS Settings Handler
 * Manages plugin settings and AJAX handlers
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rain_OS_Settings {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function __construct() {
        add_action('wp_ajax_rain_os_save_settings', array($this, 'ajax_save_settings'));
        add_action('wp_ajax_rain_os_test_connection', array($this, 'ajax_test_connection'));
        add_action('wp_ajax_rain_os_get_usage', array($this, 'ajax_get_usage'));
        add_action('wp_ajax_rain_os_analyze_content', array($this, 'ajax_analyze_content'));
        add_action('wp_ajax_rain_os_suggest_titles', array($this, 'ajax_suggest_titles'));
        add_action('wp_ajax_rain_os_generate_description', array($this, 'ajax_generate_description'));
        add_action('wp_ajax_rain_os_summarize_content', array($this, 'ajax_summarize_content'));
        add_action('wp_ajax_rain_os_rewrite_sentence', array($this, 'ajax_rewrite_sentence'));
        add_action('wp_ajax_rain_os_save_provenance', array($this, 'ajax_save_provenance'));
    }
    
    public static function get($option, $default = '') {
        return get_option('rain_os_' . $option, $default);
    }
    
    public static function update($option, $value) {
        return update_option('rain_os_' . $option, $value);
    }
    
    public static function delete($option) {
        return delete_option('rain_os_' . $option);
    }
    
    public static function get_industries() {
        return array(
            'Technology',
            'Marketing & Advertising',
            'Healthcare & Wellness',
            'Finance & Fintech',
            'E-commerce & Retail',
            'Education',
            'Travel & Hospitality',
            'General / Other'
        );
    }
    
    public static function get_post_types() {
        $post_types = get_post_types(array('public' => true), 'objects');
        $options = array();
        
        foreach ($post_types as $post_type) {
            if ($post_type->name !== 'attachment') {
                $options[$post_type->name] = $post_type->label;
            }
        }
        
        return $options;
    }

    public static function get_subscore_descriptions() {
        return array(
            'Semantic Clarity' => 'Measures how clearly your content communicates its meaning to AI systems. High semantic clarity helps search engines and AI assistants accurately understand and represent your content.',
            'Logical Structure' => 'Evaluates the organization and flow of your content. Well-structured content with clear headings and logical progression is easier for AI to parse and summarize.',
            'Descriptive Metadata' => 'Assesses the quality of meta descriptions, titles, and structured data. Rich metadata helps AI systems categorize and surface your content appropriately.',
            'Entity Recognition' => 'Measures how well your content identifies and connects to known entities (people, places, organizations). Strong entity signals improve AI comprehension.',
            'Citation Readiness' => 'Evaluates whether your content contains quotable facts, statistics, and authoritative statements that AI can cite as sources.',
            'AEO Alignment' => 'Overall alignment with Answer Engine Optimization best practices for appearing in AI-generated responses and featured snippets.',
            'Readability' => 'Measures how easy your content is to read and understand. Clear, accessible writing improves both human and AI comprehension.',
            'Schema Extraction' => 'Assesses the presence and quality of structured data markup that helps AI systems understand content relationships.',
            'QA-format Detection' => 'Evaluates whether your content contains question-answer patterns that AI assistants can easily extract and present.'
        );
    }
    
    public function ajax_save_settings() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $api_endpoint = isset($_POST['api_endpoint']) ? esc_url_raw(wp_unslash($_POST['api_endpoint'])) : '';
        $api_key = isset($_POST['api_key']) ? sanitize_text_field(wp_unslash($_POST['api_key'])) : '';
        $default_industry = isset($_POST['default_industry']) ? sanitize_text_field(wp_unslash($_POST['default_industry'])) : 'General / Other';
        $post_types = isset($_POST['post_types']) ? array_map('sanitize_text_field', wp_unslash($_POST['post_types'])) : array('post', 'page');
        $save_provenance = isset($_POST['save_provenance']) ? (bool) $_POST['save_provenance'] : false;
        
        update_option('rain_os_api_endpoint', $api_endpoint);
        update_option('rain_os_api_key', $api_key);
        update_option('rain_os_default_industry', $default_industry);
        update_option('rain_os_post_types', $post_types);
        update_option('rain_os_save_provenance', $save_provenance);
        
        wp_send_json_success(array('message' => __('Settings saved successfully.', 'rain-os-seo')));
    }
    
    public function ajax_test_connection() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $api = new Rain_OS_API();
        $result = $api->test_connection();
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array(
            'message' => __('Connection successful!', 'rain-os-seo'),
            'user' => $result
        ));
    }
    
    public function ajax_get_usage() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $api = new Rain_OS_API();
        $result = $api->get_user_info();
        
        if (is_wp_error($result)) {
            $usage = get_option('rain_os_usage', array('count' => 0, 'limit' => 5));
            wp_send_json_success(array('usage' => $usage));
        }
        
        if (isset($result['usage'])) {
            update_option('rain_os_usage', array(
                'count' => isset($result['usage']['count']) ? intval($result['usage']['count']) : 0,
                'limit' => isset($result['usage']['limit']) ? intval($result['usage']['limit']) : 5
            ));
        }
        
        wp_send_json_success(array('usage' => $result['usage'] ?? array('count' => 0, 'limit' => 5)));
    }
    
    public function ajax_analyze_content() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $content = isset($_POST['content']) ? wp_kses_post(wp_unslash($_POST['content'])) : '';
        $industry = isset($_POST['industry']) ? sanitize_text_field(wp_unslash($_POST['industry'])) : 'General / Other';
        
        if (empty($content)) {
            wp_send_json_error(array('message' => __('Content is required for analysis.', 'rain-os-seo')));
        }
        
        $api = new Rain_OS_API();
        
        if (!$api->is_configured()) {
            wp_send_json_error(array('message' => __('Please configure your API settings first.', 'rain-os-seo')));
        }
        
        $result = $api->analyze_content($content, $industry);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }

        $result['subScoreDescriptions'] = self::get_subscore_descriptions();
        
        wp_send_json_success($result);
    }
    
    public function ajax_suggest_titles() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $content = isset($_POST['content']) ? wp_kses_post(wp_unslash($_POST['content'])) : '';
        
        if (empty($content)) {
            wp_send_json_error(array('message' => __('Content is required.', 'rain-os-seo')));
        }
        
        $api = new Rain_OS_API();
        $result = $api->suggest_titles($content);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success($result);
    }
    
    public function ajax_generate_description() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $content = isset($_POST['content']) ? wp_kses_post(wp_unslash($_POST['content'])) : '';
        
        if (empty($content)) {
            wp_send_json_error(array('message' => __('Content is required.', 'rain-os-seo')));
        }
        
        $api = new Rain_OS_API();
        $result = $api->generate_description($content);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success($result);
    }
    
    public function ajax_summarize_content() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $content = isset($_POST['content']) ? wp_kses_post(wp_unslash($_POST['content'])) : '';
        
        if (empty($content)) {
            wp_send_json_error(array('message' => __('Content is required.', 'rain-os-seo')));
        }
        
        $api = new Rain_OS_API();
        $result = $api->summarize_content($content);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success($result);
    }
    
    public function ajax_rewrite_sentence() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $sentence = isset($_POST['sentence']) ? sanitize_text_field(wp_unslash($_POST['sentence'])) : '';
        
        if (empty($sentence)) {
            wp_send_json_error(array('message' => __('Sentence is required.', 'rain-os-seo')));
        }
        
        $api = new Rain_OS_API();
        $result = $api->rewrite_sentence($sentence);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success($result);
    }

    public function ajax_save_provenance() {
        check_ajax_referer('rain_os_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => __('Permission denied.', 'rain-os-seo')));
        }
        
        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        
        if (!$post_id) {
            wp_send_json_error(array('message' => __('Invalid post ID.', 'rain-os-seo')));
        }
        
        if (!current_user_can('edit_post', $post_id)) {
            wp_send_json_error(array('message' => __('Permission denied. You cannot edit this post.', 'rain-os-seo')));
        }
        
        $hash = isset($_POST['hash']) ? sanitize_text_field(wp_unslash($_POST['hash'])) : '';
        $timestamp = isset($_POST['timestamp']) ? sanitize_text_field(wp_unslash($_POST['timestamp'])) : '';
        $status = isset($_POST['status']) ? sanitize_text_field(wp_unslash($_POST['status'])) : '';
        
        update_post_meta($post_id, '_rainos_authorship_hash', $hash);
        update_post_meta($post_id, '_rainos_authorship_timestamp', $timestamp);
        update_post_meta($post_id, '_rainos_authorship_status', $status);
        
        wp_send_json_success(array('message' => __('Provenance saved to post.', 'rain-os-seo')));
    }
}

Rain_OS_Settings::get_instance();
