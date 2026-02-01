<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class RAIRO_Assets {

    public function __construct() {
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    public function enqueue_admin_assets( $hook ) {
        if ( strpos( $hook, 'ai-readability' ) === false ) {
            return;
        }

        wp_enqueue_style(
            'rain-os-admin',
            RAIRO_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            RAIRO_VERSION
        );

        wp_enqueue_script(
            'rain-os-admin',
            RAIRO_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            RAIRO_VERSION,
            true
        );

        wp_enqueue_script(
            'chartjs',
            RAIRO_PLUGIN_URL . 'assets/js/chart.min.js',
            array(),
            '4.4.1',
            true
        );

        wp_enqueue_script(
            'rain-os-charts',
            RAIRO_PLUGIN_URL . 'assets/js/charts.js',
            array( 'jquery', 'chartjs' ),
            RAIRO_VERSION,
            true
        );

        wp_localize_script(
            'rain-os-admin',
            'rainOsAeo',
            array(
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'rairo_aeo_nonce' ),
                'pluginUrl' => RAIRO_PLUGIN_URL,
                'i18n'      => array(
                    'analyzing'    => __( 'Analyzing...', 'rain-os-ai-readability-optimizer' ),
                    'error'        => __( 'An error occurred. Please try again.', 'rain-os-ai-readability-optimizer' ),
                    'success'      => __( 'Analysis complete!', 'rain-os-ai-readability-optimizer' ),
                    'noApiKey'     => __( 'Please configure your API key in Settings.', 'rain-os-ai-readability-optimizer' ),
                    'confirm'      => __( 'Are you sure?', 'rain-os-ai-readability-optimizer' ),
                ),
            )
        );
    }
}
