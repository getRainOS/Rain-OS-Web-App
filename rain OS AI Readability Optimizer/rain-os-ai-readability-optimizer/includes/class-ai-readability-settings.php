<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AI_Readability_Settings {

    private $options = array();

    public function __construct() {
        $this->options = array(
            'ai_readability_api_key'             => get_option( 'ai_readability_api_key', '' ),
            'ai_readability_api_url'             => get_option( 'ai_readability_api_url', AI_READABILITY_API_URL ),
            'ai_readability_cache_time'          => get_option( 'ai_readability_cache_time', 3600 ),
            'ai_readability_industry'            => get_option( 'ai_readability_industry', '' ),
            'ai_readability_auto_analyze'        => get_option( 'ai_readability_auto_analyze', 'no' ),
            'ai_readability_provenance_tracking' => get_option( 'ai_readability_provenance_tracking', 'no' ),
            'ai_readability_score_alerts'        => get_option( 'ai_readability_score_alerts', 'no' ),
            'ai_readability_score_threshold'     => get_option( 'ai_readability_score_threshold', 70 ),
            'ai_readability_ai_backend_enabled'  => get_option( 'ai_readability_ai_backend_enabled', 'no' ),
            'ai_readability_ai_score_panel'      => get_option( 'ai_readability_ai_score_panel', 'no' ),
            'ai_readability_ai_normalize'        => get_option( 'ai_readability_ai_normalize', 'no' ),
        );

        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'admin_notices', array( $this, 'show_api_key_notice' ) );
        add_action( 'update_option_ai_readability_api_key', array( $this, 'clear_ai_backend_cache' ) );
        add_action( 'update_option_ai_readability_ai_backend_enabled', array( $this, 'clear_ai_backend_cache' ) );
    }

    public function clear_ai_backend_cache() {
        if ( class_exists( 'AI_Readability_AI_Backend' ) ) {
            AI_Readability_AI_Backend::clear_capability_cache();
        }
    }

    public function register_settings() {
        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_api_key',
            array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_api_url',
            array(
                'type'              => 'string',
                'sanitize_callback' => 'esc_url_raw',
                'default'           => AI_READABILITY_API_URL,
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_cache_time',
            array(
                'type'              => 'integer',
                'sanitize_callback' => 'absint',
                'default'           => 3600,
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_industry',
            array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default'           => '',
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_auto_analyze',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_provenance_tracking',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_score_alerts',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_score_threshold',
            array(
                'type'              => 'integer',
                'sanitize_callback' => array( $this, 'sanitize_threshold' ),
                'default'           => 70,
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_ai_backend_enabled',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_ai_score_panel',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        register_setting(
            'ai_readability_aeo_settings',
            'ai_readability_ai_normalize',
            array(
                'type'              => 'string',
                'sanitize_callback' => array( $this, 'sanitize_checkbox' ),
                'default'           => 'no',
            )
        );

        add_settings_section(
            'ai_readability_api_section',
            __( 'API Configuration', 'rain-os-ai-readability-optimizer' ),
            array( $this, 'render_api_section' ),
            'ai_readability_aeo_settings'
        );

        add_settings_field(
            'ai_readability_api_key',
            __( 'API Key', 'rain-os-ai-readability-optimizer' ),
            array( $this, 'render_api_key_field' ),
            'ai_readability_aeo_settings',
            'ai_readability_api_section'
        );

        add_settings_field(
            'ai_readability_cache_time',
            __( 'Cache Duration', 'rain-os-ai-readability-optimizer' ),
            array( $this, 'render_cache_field' ),
            'ai_readability_aeo_settings',
            'ai_readability_api_section'
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
        echo '<p>' . esc_html__( 'Configure your Rain OS API settings. Get your API key from', 'rain-os-ai-readability-optimizer' ) . ' <a href="https://app.getrainos.com/#/login" target="_blank">app.getrainos.com</a></p>';
    }

    public function render_api_key_field() {
        $value = get_option( 'ai_readability_api_key', '' );
        ?>
        <input type="password" 
               id="ai_readability_api_key" 
               name="ai_readability_api_key" 
               value="<?php echo esc_attr( $value ); ?>" 
               class="regular-text"
               autocomplete="off" />
        <p class="description"><?php esc_html_e( 'Enter your Rain OS API key.', 'rain-os-ai-readability-optimizer' ); ?></p>
        <?php
    }

    public function render_cache_field() {
        $value = get_option( 'ai_readability_cache_time', 3600 );
        ?>
        <select id="ai_readability_cache_time" name="ai_readability_cache_time">
            <option value="1800" <?php selected( $value, 1800 ); ?>><?php esc_html_e( '30 minutes', 'rain-os-ai-readability-optimizer' ); ?></option>
            <option value="3600" <?php selected( $value, 3600 ); ?>><?php esc_html_e( '1 hour', 'rain-os-ai-readability-optimizer' ); ?></option>
            <option value="7200" <?php selected( $value, 7200 ); ?>><?php esc_html_e( '2 hours', 'rain-os-ai-readability-optimizer' ); ?></option>
            <option value="86400" <?php selected( $value, 86400 ); ?>><?php esc_html_e( '24 hours', 'rain-os-ai-readability-optimizer' ); ?></option>
        </select>
        <p class="description"><?php esc_html_e( 'How long to cache analysis results.', 'rain-os-ai-readability-optimizer' ); ?></p>
        <?php
    }

    public function show_api_key_notice() {
        $screen = get_current_screen();
        if ( strpos( $screen->id, 'ai-readability' ) === false ) {
            return;
        }

        $api_key = get_option( 'ai_readability_api_key', '' );
        if ( empty( $api_key ) ) {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <?php
                    printf(
                        wp_kses(
                            __( 'AI Readability Optimizer requires an API key to function. <a href="%s">Configure your API key</a> to get started.', 'rain-os-ai-readability-optimizer' ),
                            array( 'a' => array( 'href' => array() ) )
                        ),
                        esc_url( admin_url( 'admin.php?page=ai-readability-settings' ) )
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
        $api_key = get_option( 'ai_readability_api_key', '' );
        return ! empty( $api_key );
    }

    public static function is_auto_analyze_enabled() {
        return 'yes' === get_option( 'ai_readability_auto_analyze', 'no' );
    }

    public static function is_provenance_tracking_enabled() {
        return 'yes' === get_option( 'ai_readability_provenance_tracking', 'no' );
    }

    public static function is_score_alerts_enabled() {
        return 'yes' === get_option( 'ai_readability_score_alerts', 'no' );
    }

    public static function get_score_threshold() {
        return absint( get_option( 'ai_readability_score_threshold', 70 ) );
    }

    public static function get_default_industry() {
        return get_option( 'ai_readability_industry', '' );
    }
}
