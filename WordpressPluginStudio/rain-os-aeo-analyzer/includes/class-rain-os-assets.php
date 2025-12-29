<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_Assets {

    public function __construct() {
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    public function enqueue_admin_assets( $hook ) {
        if ( strpos( $hook, 'rain-os-aeo' ) === false ) {
            return;
        }

        wp_enqueue_style(
            'rain-os-admin',
            RAIN_OS_AEO_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            RAIN_OS_AEO_VERSION
        );

        wp_enqueue_script(
            'rain-os-admin',
            RAIN_OS_AEO_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            RAIN_OS_AEO_VERSION,
            true
        );

        wp_enqueue_script(
            'chartjs',
            RAIN_OS_AEO_PLUGIN_URL . 'assets/js/chart.min.js',
            array(),
            '4.4.1',
            true
        );

        wp_enqueue_script(
            'rain-os-charts',
            RAIN_OS_AEO_PLUGIN_URL . 'assets/js/charts.js',
            array( 'jquery', 'chartjs' ),
            RAIN_OS_AEO_VERSION,
            true
        );

        wp_localize_script(
            'rain-os-admin',
            'rainOsAeo',
            array(
                'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                'nonce'     => wp_create_nonce( 'rain_os_aeo_nonce' ),
                'pluginUrl' => RAIN_OS_AEO_PLUGIN_URL,
                'i18n'      => array(
                    'analyzing'    => __( 'Analyzing...', 'rain-os-aeo-analyzer' ),
                    'error'        => __( 'An error occurred. Please try again.', 'rain-os-aeo-analyzer' ),
                    'success'      => __( 'Analysis complete!', 'rain-os-aeo-analyzer' ),
                    'noApiKey'     => __( 'Please configure your API key in Settings.', 'rain-os-aeo-analyzer' ),
                    'confirm'      => __( 'Are you sure?', 'rain-os-aeo-analyzer' ),
                ),
            )
        );
    }
}
