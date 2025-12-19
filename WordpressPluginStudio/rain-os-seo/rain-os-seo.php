<?php
/**
 * Plugin Name: Rain OS SEO Analyzer
 * Plugin URI: https://rain-os.com
 * Description: AI-powered content analysis for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). Analyze your content for AI readability, digital authority, and conversion readiness.
 * Version: 1.0.0
 * Author: Rain OS
 * Author URI: https://rain-os.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: rain-os-seo
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

if (version_compare(PHP_VERSION, '7.4', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="error"><p>';
        echo esc_html__('Rain OS SEO requires PHP 7.4 or higher. You are running PHP ', 'rain-os-seo');
        echo esc_html(PHP_VERSION);
        echo '</p></div>';
    });
    return;
}

global $wp_version;
if (version_compare($wp_version, '5.8', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="error"><p>';
        echo esc_html__('Rain OS SEO requires WordPress 5.8 or higher.', 'rain-os-seo');
        echo '</p></div>';
    });
    return;
}

$required_extensions = array('curl', 'json', 'mbstring');
$missing_extensions = array();
foreach ($required_extensions as $ext) {
    if (!extension_loaded($ext)) {
        $missing_extensions[] = $ext;
    }
}
if (!empty($missing_extensions)) {
    add_action('admin_notices', function() use ($missing_extensions) {
        echo '<div class="error"><p>';
        echo esc_html__('Rain OS SEO requires the following PHP extensions: ', 'rain-os-seo');
        echo esc_html(implode(', ', $missing_extensions));
        echo '</p></div>';
    });
    return;
}

define('RAIN_OS_SEO_VERSION', '1.0.0');
define('RAIN_OS_SEO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RAIN_OS_SEO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('RAIN_OS_SEO_PLUGIN_BASENAME', plugin_basename(__FILE__));

require_once RAIN_OS_SEO_PLUGIN_DIR . 'includes/class-rain-os-api.php';
require_once RAIN_OS_SEO_PLUGIN_DIR . 'includes/class-rain-os-settings.php';
require_once RAIN_OS_SEO_PLUGIN_DIR . 'includes/class-rain-os-admin.php';

function rain_os_seo_activate() {
    $default_options = array(
        'rain_os_api_endpoint' => '',
        'rain_os_api_key' => '',
        'rain_os_default_industry' => 'General / Other',
        'rain_os_post_types' => array('post', 'page'),
        'rain_os_usage' => array('count' => 0, 'limit' => 5)
    );
    
    foreach ($default_options as $option => $value) {
        if (get_option($option) === false) {
            add_option($option, $value);
        }
    }
    
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'rain_os_seo_activate');

function rain_os_seo_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'rain_os_seo_deactivate');

function rain_os_seo_init() {
    load_plugin_textdomain('rain-os-seo', false, dirname(RAIN_OS_SEO_PLUGIN_BASENAME) . '/languages');
    
    if (is_admin()) {
        new Rain_OS_Admin();
    }
}
add_action('plugins_loaded', 'rain_os_seo_init');

function rain_os_seo_plugin_action_links($links) {
    $settings_link = '<a href="' . esc_url(admin_url('admin.php?page=rain-os-settings')) . '">' . esc_html__('Settings', 'rain-os-seo') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . RAIN_OS_SEO_PLUGIN_BASENAME, 'rain_os_seo_plugin_action_links');
