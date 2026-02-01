<?php
/**
 * Plugin Name: Rain OS AI Readability Optimizer
 * Plugin URI: https://www.rainos.com/rain-os-ai-readability-optimizer
 * Description: AI-powered Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) for WordPress. Analyze your content across three pillars: AI Readability, Digital Authority, and Conversion Readiness.
 * Version: 1.0.0
 * Author: Rain OS
 * Author URI: https://www.rainos.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: rain-os-ai-readability-optimizer
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'RAIRO_VERSION', '1.0.0' );
define( 'RAIRO_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'RAIRO_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'RAIRO_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'RAIRO_API_URL', 'https://api.getrainos.com/v1' );

require_once RAIRO_PLUGIN_DIR . 'includes/class-rairo-loader.php';
require_once RAIRO_PLUGIN_DIR . 'includes/class-rairo-admin.php';
require_once RAIRO_PLUGIN_DIR . 'includes/class-rairo-assets.php';
require_once RAIRO_PLUGIN_DIR . 'includes/class-rairo-settings.php';
require_once RAIRO_PLUGIN_DIR . 'includes/class-rairo-ajax.php';
require_once RAIRO_PLUGIN_DIR . 'includes/api/class-rairo-api-client.php';
require_once RAIRO_PLUGIN_DIR . 'includes/api/class-rairo-ai-backend.php';
require_once RAIRO_PLUGIN_DIR . 'includes/class-rairo-ai-score-panel.php';
require_once RAIRO_PLUGIN_DIR . 'includes/class-rairo-gutenberg.php';

final class RAIRO_Analyzer {

    private static $instance = null;
    private $loader;
    private $admin;
    private $assets;
    private $settings;
    private $ajax;
    private $api_client;
    private $ai_backend;
    private $ai_score_panel;
    private $gutenberg;

    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->init_classes();
        $this->init_hooks();
    }

    private function init_classes() {
        $this->api_client = new RAIRO_API_Client();
        $this->loader     = new RAIRO_Loader();
        $this->assets     = new RAIRO_Assets();
        $this->settings   = new RAIRO_Settings();
        $this->admin      = new RAIRO_Admin( $this->api_client );
        $this->ajax       = new RAIRO_Ajax( $this->api_client );

        $this->ai_backend     = new RAIRO_AI_Backend();
        $this->ai_score_panel = new RAIRO_AI_Score_Panel();
        $this->gutenberg      = new RAIRO_Gutenberg( $this->api_client );
    }

    private function init_hooks() {
        register_activation_hook( __FILE__, array( $this, 'activate' ) );
        register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );

        add_action( 'save_post', array( $this, 'handle_post_save_normalize' ), 99, 3 );
    }

    public function handle_post_save_normalize( $post_id, $post, $update ) {
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }

        if ( wp_is_post_revision( $post_id ) ) {
            return;
        }

        if ( ! in_array( $post->post_type, array( 'post', 'page' ), true ) ) {
            return;
        }

        if ( RAIRO_AI_Backend::is_normalize_enabled() ) {
            $this->ai_backend->normalize_content_async( $post_id );
        }
    }

    public function activate() {
        $default_options = array(
            'rairo_api_key'     => '',
            'rairo_api_url'     => RAIRO_API_URL,
            'rairo_cache_time'  => 3600,
        );

        foreach ( $default_options as $key => $value ) {
            if ( false === get_option( $key ) ) {
                add_option( $key, $value );
            }
        }

        $this->create_tables();

        flush_rewrite_rules();
    }

    private function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        $table_name = $wpdb->prefix . 'rairo_analysis_history';

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            overall_score int(3) NOT NULL DEFAULT 0,
            ai_readability int(3) NOT NULL DEFAULT 0,
            digital_authority int(3) NOT NULL DEFAULT 0,
            conversion_readiness int(3) NOT NULL DEFAULT 0,
            analysis_data longtext,
            analyzed_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY analyzed_at (analyzed_at)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }

    public function deactivate() {
        flush_rewrite_rules();
    }

    public function get_api_client() {
        return $this->api_client;
    }
}

function rairo_aeo() {
    return RAIRO_Analyzer::instance();
}

rairo_aeo();
