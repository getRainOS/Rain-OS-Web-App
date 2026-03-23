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
                    'scanning'     => __( 'Scanning URL…', 'rain-os-aeo-analyzer' ),
                    'error'        => __( 'An error occurred. Please try again.', 'rain-os-aeo-analyzer' ),
                    'success'      => __( 'Analysis complete!', 'rain-os-aeo-analyzer' ),
                    'noApiKey'     => __( 'Please configure your API key in Settings.', 'rain-os-aeo-analyzer' ),
                    'confirm'      => __( 'Are you sure?', 'rain-os-aeo-analyzer' ),
                    'urlRequired'  => __( 'Please enter a URL to scan.', 'rain-os-aeo-analyzer' ),
                    'urlInvalid'   => __( 'Please enter a valid URL including http:// or https://', 'rain-os-aeo-analyzer' ),
                ),
            )
        );

        // Upgrade & Settings — Stripe checkout / portal / key regen
        if ( strpos( $hook, 'rain-os-aeo-upgrade' ) !== false || strpos( $hook, 'rain-os-aeo-settings' ) !== false ) {
            wp_enqueue_script(
                'rain-os-upgrade',
                RAIN_OS_AEO_PLUGIN_URL . 'assets/js/upgrade.js',
                array( 'jquery' ),
                RAIN_OS_AEO_VERSION,
                true
            );

            wp_localize_script(
                'rain-os-upgrade',
                'rainOsUpgrade',
                array(
                    'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                    'nonce'   => wp_create_nonce( 'rain_os_aeo_nonce' ),
                    'i18n'    => array(
                        'redirecting'  => __( 'Redirecting to checkout…', 'rain-os-aeo-analyzer' ),
                        'opening'      => __( 'Opening billing portal…', 'rain-os-aeo-analyzer' ),
                        'regenerating' => __( 'Regenerating key…', 'rain-os-aeo-analyzer' ),
                        'regenConfirm' => __( 'Regenerate your API key? Your current key will stop working immediately.', 'rain-os-aeo-analyzer' ),
                        'error'        => __( 'An error occurred. Please try again.', 'rain-os-aeo-analyzer' ),
                    ),
                )
            );
        }

        // URL Scanner assets — only on the URL scanner page
        if ( strpos( $hook, 'rain-os-aeo-url-scanner' ) !== false ) {
            wp_enqueue_style(
                'rain-os-url-scanner',
                RAIN_OS_AEO_PLUGIN_URL . 'assets/css/url-scanner.css',
                array( 'rain-os-admin' ),
                RAIN_OS_AEO_VERSION
            );

            wp_enqueue_script(
                'rain-os-url-scanner',
                RAIN_OS_AEO_PLUGIN_URL . 'assets/js/url-scanner.js',
                array( 'jquery', 'rain-os-admin' ),
                RAIN_OS_AEO_VERSION,
                true
            );

            wp_localize_script(
                'rain-os-url-scanner',
                'rainOsScanner',
                array(
                    'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                    'nonce'     => wp_create_nonce( 'rain_os_aeo_nonce' ),
                    'i18n'    => array(
                        'urlRequired'              => __( 'Please enter a URL to scan.', 'rain-os-aeo-analyzer' ),
                        'urlInvalid'               => __( 'Please enter a valid URL including http:// or https://', 'rain-os-aeo-analyzer' ),
                        'scanning'                 => __( 'Scanning URL…', 'rain-os-aeo-analyzer' ),
                        'scan'                     => __( 'Scan URL', 'rain-os-aeo-analyzer' ),
                        'error'                    => __( 'An error occurred. Please try again.', 'rain-os-aeo-analyzer' ),
                        'networkError'             => __( 'Network error. Please try again.', 'rain-os-aeo-analyzer' ),
                        'overallScore'             => __( 'Overall Score', 'rain-os-aeo-analyzer' ),
                        'technicalSignals'         => __( 'Technical HTML Signals', 'rain-os-aeo-analyzer' ),
                        'technicalRecommendations' => __( 'Technical Recommendations', 'rain-os-aeo-analyzer' ),
                        'recommendations'          => __( 'Recommendations', 'rain-os-aeo-analyzer' ),
                        'urlScanOnly'              => __( 'URL Scan Only', 'rain-os-aeo-analyzer' ),
                        'usageInfo'                => __( 'API Usage', 'rain-os-aeo-analyzer' ),
                    ),
                )
            );
        }
    }
}
