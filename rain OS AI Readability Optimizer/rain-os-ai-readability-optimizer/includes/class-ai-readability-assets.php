<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AI_Readability_Assets {

    public function __construct() {
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    public function enqueue_admin_assets( $hook ) {
        if ( strpos( $hook, 'ai-readability' ) === false ) {
            return;
        }

        wp_enqueue_style(
            'rain-os-admin',
            AI_READABILITY_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            AI_READABILITY_VERSION
        );

        wp_enqueue_script(
            'rain-os-admin',
            AI_READABILITY_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            AI_READABILITY_VERSION,
            true
        );

        wp_enqueue_script(
            'chartjs',
            AI_READABILITY_PLUGIN_URL . 'assets/js/chart.min.js',
            array(),
            '4.4.1',
            true
        );

        wp_enqueue_script(
            'rain-os-charts',
            AI_READABILITY_PLUGIN_URL . 'assets/js/charts.js',
            array( 'jquery', 'chartjs' ),
            AI_READABILITY_VERSION,
            true
        );

        wp_localize_script(
            'rain-os-admin',
            'rainOsAeo',
            array(
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'ai_readability_aeo_nonce' ),
                'pluginUrl' => AI_READABILITY_PLUGIN_URL,
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
