<?php
/**
 * Rain OS Admin Handler
 * Manages admin menu, meta boxes, and asset enqueuing
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rain_OS_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('add_meta_boxes', array($this, 'register_meta_boxes'));
        add_action('admin_notices', array($this, 'admin_notices'));
    }
    
    public function register_admin_menu() {
        $icon_svg = 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>');
        
        add_menu_page(
            __('Rain OS', 'rain-os-seo'),
            __('Rain OS', 'rain-os-seo'),
            'manage_options',
            'rain-os',
            array($this, 'render_dashboard_page'),
            $icon_svg,
            30
        );
        
        add_submenu_page(
            'rain-os',
            __('Dashboard', 'rain-os-seo'),
            __('Dashboard', 'rain-os-seo'),
            'manage_options',
            'rain-os',
            array($this, 'render_dashboard_page')
        );
        
        add_submenu_page(
            'rain-os',
            __('Settings', 'rain-os-seo'),
            __('Settings', 'rain-os-seo'),
            'manage_options',
            'rain-os-settings',
            array($this, 'render_settings_page')
        );
    }
    
    public function enqueue_admin_assets($hook) {
        $plugin_pages = array('toplevel_page_rain-os', 'rain-os_page_rain-os-settings');
        $post_types = get_option('rain_os_post_types', array('post', 'page'));
        
        $is_plugin_page = in_array($hook, $plugin_pages);
        $is_post_editor = in_array($hook, array('post.php', 'post-new.php'));
        
        if ($is_post_editor) {
            global $post;
            if ($post && !in_array($post->post_type, $post_types)) {
                $is_post_editor = false;
            }
        }
        
        if (!$is_plugin_page && !$is_post_editor) {
            return;
        }
        
        wp_enqueue_style(
            'rain-os-admin',
            RAIN_OS_SEO_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            RAIN_OS_SEO_VERSION
        );
        
        wp_enqueue_script(
            'rain-os-admin',
            RAIN_OS_SEO_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            RAIN_OS_SEO_VERSION,
            true
        );
        
        wp_localize_script('rain-os-admin', 'rainOS', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rain_os_nonce'),
            'strings' => array(
                'analyzing' => __('Analyzing...', 'rain-os-seo'),
                'analyze' => __('Analyze Content', 'rain-os-seo'),
                'saving' => __('Saving...', 'rain-os-seo'),
                'save' => __('Save Settings', 'rain-os-seo'),
                'testing' => __('Testing...', 'rain-os-seo'),
                'test' => __('Test Connection', 'rain-os-seo'),
                'error' => __('An error occurred. Please try again.', 'rain-os-seo'),
                'noContent' => __('Please add some content before analyzing.', 'rain-os-seo'),
                'connectionSuccess' => __('Connection successful!', 'rain-os-seo'),
                'connectionFailed' => __('Connection failed. Please check your settings.', 'rain-os-seo')
            ),
            'industries' => Rain_OS_Settings::get_industries(),
            'defaultIndustry' => get_option('rain_os_default_industry', 'General / Other')
        ));
    }
    
    public function register_meta_boxes() {
        $post_types = get_option('rain_os_post_types', array('post', 'page'));
        
        foreach ($post_types as $post_type) {
            add_meta_box(
                'rain-os-seo-analysis',
                __('Rain OS SEO Analysis', 'rain-os-seo'),
                array($this, 'render_meta_box'),
                $post_type,
                'normal',
                'high'
            );
        }
    }
    
    public function render_meta_box($post) {
        include RAIN_OS_SEO_PLUGIN_DIR . 'templates/meta-box.php';
    }
    
    public function render_dashboard_page() {
        include RAIN_OS_SEO_PLUGIN_DIR . 'templates/dashboard.php';
    }
    
    public function render_settings_page() {
        include RAIN_OS_SEO_PLUGIN_DIR . 'templates/settings.php';
    }
    
    public function admin_notices() {
        $api = new Rain_OS_API();
        
        if (!$api->is_configured()) {
            $screen = get_current_screen();
            if ($screen && strpos($screen->id, 'rain-os') !== false) {
                return;
            }
            
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p>';
            echo sprintf(
                wp_kses(
                    __('Rain OS SEO is almost ready! Please <a href="%s">configure your API settings</a> to start analyzing your content.', 'rain-os-seo'),
                    array('a' => array('href' => array()))
                ),
                esc_url(admin_url('admin.php?page=rain-os-settings'))
            );
            echo '</p>';
            echo '</div>';
        }
    }
}
