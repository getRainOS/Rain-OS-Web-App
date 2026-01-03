<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Rain_OS_Settings {

    private $options = array();

    public function __construct() {
        $this->options = array(
            'rain_os_api_key'             => get_option( 'rain_os_api_key', '' ),
            'rain_os_api_url'             => get_option( 'rain_os_api_url', RAIN_OS_AEO_API_URL ),
            'rain_os_cache_time'          => get_option( 'rain_os_cache_time', 3600 ),
            'rain_os_industry'            => get_option( 'rain_os_industry', '' ),
            'rain_os_auto_analyze'        => get_option( 'rain_os_auto_analyze', 'no' ),
            'rain_os_provenance_tracking' => get_option( 'rain_os_provenance_tracking', 'no' ),
            'rain_os_score_alerts'        => get_option( 'rain_os_score_alerts', 'no' ),
            'rain_os_score_threshold'     => get_option( 'rain_os_score_threshold', 70 ),
            'rain_os_ai_backend_enabled'  => get_option( 'rain_os_ai_backend_enabled', 'no' ),
            'rain_os_ai_score_panel'      => get_option( 'rain_os_ai_score_panel', 'no' ),
            'rain_os_ai_normalize'        => get_option( 'rain_os_ai_normalize', 'no' ),
        );

        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'admin_notices', array( $this, 'show_api_key_notice' ) );
        add_action( 'update_option_rain_os_api_key', array( $this, 'clear_ai_backend_cache' ) );
        add_action( 'update_option_rain_os_ai_backend_enabled', array( $this, 'clear_ai_backend_cache' ) );
    }

    public function clear_ai_backend_cache() {
        if ( class_exists( 'Rain_OS_AI_Backend' ) ) {
            Rain_OS_AI_Backend::clear_capability_cache();
        }
    }

    public function register_settings() {
        register_setting(
            'rain_os_aeo_settings',
            'rain_os_api_key',
            array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_api_url',
            array(
                'type'              => 'string',
                'sanitize_callback' => 'esc_url_raw',
                'default'           => RAIN_OS_AEO_API_URL,
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_cache_time',
            array(
                'type'              => 'integer',
                'sanitize_callback' => 'absint',
                'default'           => 3600,
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_industry',
            array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_auto_analyze',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_provenance_tracking',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_score_alerts',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_score_threshold',
            array(
                'type'              => 'integer',
                'sanitize_callback' => array( $this, 'sanitize_threshold' ),
                'default'           => 70,
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_ai_backend_enabled',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_ai_score_panel',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'rain_os_aeo_settings',
            'rain_os_ai_normalize',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        add_settings_section(
            'rain_os_api_section',
            __( 'API Configuration', 'rain-os-aeo-analyzer' ),
            array( $this, 'render_api_section' ),
            'rain_os_aeo_settings'
        );

        add_settings_field(
            'rain_os_api_key',
            __( 'API Key', 'rain-os-aeo-analyzer' ),
            array( $this, 'render_api_key_field' ),
            'rain_os_aeo_settings',
            'rain_os_api_section'
        );

        add_settings_field(
            'rain_os_cache_time',
            __( 'Cache Duration', 'rain-os-aeo-analyzer' ),
            array( $this, 'render_cache_field' ),
            'rain_os_aeo_settings',
            'rain_os_api_section'
        );
    }

    public function sanitize_checkbox( $value ) {
        return 'yes' === $value ? 'yes' : 'no';
    }

    public function sanitize_threshold( $value ) {
        $value = absint( $value );
        return max( 0, min( 100, $value ) );
    }

    public function render_api_section() {
        echo '<p>' . esc_html__( 'Configure your Rain OS API settings. Get your API key from', 'rain-os-aeo-analyzer' ) . ' <a href="https://app.getrainos.com/#/login" target="_blank">app.getrainos.com</a></p>';
    }

    public function render_api_key_field() {
        $value = get_option( 'rain_os_api_key', '' );
        ?>
        <input type="password" 
               id="rain_os_api_key" 
               name="rain_os_api_key" 
               value="<?php echo esc_attr( $value ); ?>" 
               class="regular-text"
               autocomplete="off" />
        <p class="description"><?php esc_html_e( 'Enter your Rain OS API key.', 'rain-os-aeo-analyzer' ); ?></p>
        <?php
    }

    public function render_cache_field() {
        $value = get_option( 'rain_os_cache_time', 3600 );
        ?>
        <select id="rain_os_cache_time" name="rain_os_cache_time">
            <option value="1800" <?php selected( $value, 1800 ); ?>><?php esc_html_e( '30 minutes', 'rain-os-aeo-analyzer' ); ?></option>
            <option value="3600" <?php selected( $value, 3600 ); ?>><?php esc_html_e( '1 hour', 'rain-os-aeo-analyzer' ); ?></option>
            <option value="7200" <?php selected( $value, 7200 ); ?>><?php esc_html_e( '2 hours', 'rain-os-aeo-analyzer' ); ?></option>
            <option value="86400" <?php selected( $value, 86400 ); ?>><?php esc_html_e( '24 hours', 'rain-os-aeo-analyzer' ); ?></option>
        </select>
        <p class="description"><?php esc_html_e( 'How long to cache analysis results.', 'rain-os-aeo-analyzer' ); ?></p>
        <?php
    }

    public function show_api_key_notice() {
        $screen = get_current_screen();
        if ( strpos( $screen->id, 'rain-os-aeo' ) === false ) {
            return;
        }

        $api_key = get_option( 'rain_os_api_key', '' );
        if ( empty( $api_key ) ) {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <?php
                    printf(
                        wp_kses(
                            __( 'Rain OS AEO Analyzer requires an API key to function. <a href="%s">Configure your API key</a> to get started.', 'rain-os-aeo-analyzer' ),
                            array( 'a' => array( 'href' => array() ) )
                        ),
                        esc_url( admin_url( 'admin.php?page=rain-os-aeo-settings' ) )
                    );
                    ?>
                </p>
            </div>
            <?php
        }
    }

    public function get_option( $key, $default = '' ) {
        return isset( $this->options[ $key ] ) ? $this->options[ $key ] : $default;
    }

    public static function has_valid_api_key() {
        $api_key = get_option( 'rain_os_api_key', '' );
        return ! empty( $api_key );
    }

    public static function is_auto_analyze_enabled() {
        return 'yes' === get_option( 'rain_os_auto_analyze', 'no' );
    }

    public static function is_provenance_tracking_enabled() {
        return 'yes' === get_option( 'rain_os_provenance_tracking', 'no' );
    }

    public static function is_score_alerts_enabled() {
        return 'yes' === get_option( 'rain_os_score_alerts', 'no' );
    }

    public static function get_score_threshold() {
        return absint( get_option( 'rain_os_score_threshold', 70 ) );
    }

    public static function get_default_industry() {
        return get_option( 'rain_os_industry', '' );
    }
}
