<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Settings', 'rain-os-aeo-analyzer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'rain-os-aeo-analyzer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content rain-os-settings-content">
        <header class="rain-os-page-header">
            <h1><?php esc_html_e( 'Settings', 'rain-os-aeo-analyzer' ); ?></h1>
            <p><?php esc_html_e( 'Configure your Rain OS AEO Analyzer', 'rain-os-aeo-analyzer' ); ?></p>
        </header>

        <div class="rain-os-settings-grid">
            <div class="rain-os-settings-main">
                <form method="post" action="options.php" class="rain-os-settings-form">
                    <?php settings_fields( 'rain_os_aeo_settings' ); ?>

                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e( 'API Configuration', 'rain-os-aeo-analyzer' ); ?></h3>
                        </div>
                        <div class="rain-os-card-body">
                            <div class="rain-os-form-group">
                                <label for="rain_os_api_key"><?php esc_html_e( 'API Key', 'rain-os-aeo-analyzer' ); ?></label>
                                <div class="rain-os-input-group">
                                    <input type="password" 
                                           id="rain_os_api_key" 
                                           name="rain_os_api_key" 
                                           value="<?php echo esc_attr( get_option( 'rain_os_api_key', '' ) ); ?>" 
                                           class="rain-os-input"
                                           autocomplete="off" />
                                    <button type="button" class="rain-os-btn rain-os-btn-icon" id="toggle-api-key">
                                        <span class="dashicons dashicons-visibility"></span>
                                    </button>
                                </div>
                                <p class="rain-os-form-help">
                                    <?php 
                                    printf(
                                        wp_kses(
                                            __( 'Get your API key from <a href="%s" target="_blank">app.getrainos.com</a>', 'rain-os-aeo-analyzer' ),
                                            array( 'a' => array( 'href' => array(), 'target' => array() ) )
                                        ),
                                        'https://www.app.getrainos.com'
                                    );
                                    ?>
                                </p>
                            </div>

                            <div class="rain-os-form-group">
                                <label for="rain_os_cache_time"><?php esc_html_e( 'Cache Duration', 'rain-os-aeo-analyzer' ); ?></label>
                                <select id="rain_os_cache_time" name="rain_os_cache_time" class="rain-os-select">
                                    <?php $cache_time = get_option( 'rain_os_cache_time', 3600 ); ?>
                                    <option value="1800" <?php selected( $cache_time, 1800 ); ?>><?php esc_html_e( '30 minutes', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="3600" <?php selected( $cache_time, 3600 ); ?>><?php esc_html_e( '1 hour', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="7200" <?php selected( $cache_time, 7200 ); ?>><?php esc_html_e( '2 hours', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="86400" <?php selected( $cache_time, 86400 ); ?>><?php esc_html_e( '24 hours', 'rain-os-aeo-analyzer' ); ?></option>
                                </select>
                                <p class="rain-os-form-help"><?php esc_html_e( 'How long to cache analysis results before refreshing.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-settings-actions">
                        <?php submit_button( __( 'Save Settings', 'rain-os-aeo-analyzer' ), 'rain-os-btn rain-os-btn-primary', 'submit', false ); ?>
                    </div>
                </form>
            </div>

            <div class="rain-os-settings-sidebar">
                <div class="rain-os-card">
                    <div class="rain-os-card-header">
                        <h3><?php esc_html_e( 'Account Status', 'rain-os-aeo-analyzer' ); ?></h3>
                    </div>
                    <div class="rain-os-card-body">
                        <?php 
                        $api_key = get_option( 'rain_os_api_key', '' );
                        if ( ! empty( $api_key ) ) :
                            $api_client = rain_os_aeo()->get_api_client();
                            $subscription = $api_client->get_subscription_status();
                        ?>
                        <div class="rain-os-account-status">
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Plan', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value rain-os-plan-badge"><?php echo esc_html( ucfirst( $subscription['plan'] ) ); ?></span>
                            </div>
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Usage', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value"><?php echo esc_html( $subscription['usage'] . ' / ' . $subscription['limit'] ); ?></span>
                            </div>
                            <div class="rain-os-usage-bar">
                                <div class="rain-os-usage-fill" style="width: <?php echo esc_attr( min( 100, ( $subscription['usage'] / max( 1, $subscription['limit'] ) ) * 100 ) ); ?>%;"></div>
                            </div>
                        </div>
                        <?php else : ?>
                        <div class="rain-os-no-api-key">
                            <span class="dashicons dashicons-warning"></span>
                            <p><?php esc_html_e( 'No API key configured', 'rain-os-aeo-analyzer' ); ?></p>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="rain-os-card">
                    <div class="rain-os-card-header">
                        <h3><?php esc_html_e( 'Need Help?', 'rain-os-aeo-analyzer' ); ?></h3>
                    </div>
                    <div class="rain-os-card-body">
                        <ul class="rain-os-help-links">
                            <li>
                                <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-docs' ) ); ?>">
                                    <span class="dashicons dashicons-book"></span>
                                    <?php esc_html_e( 'Documentation', 'rain-os-aeo-analyzer' ); ?>
                                </a>
                            </li>
                            <li>
                                <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-help' ) ); ?>">
                                    <span class="dashicons dashicons-sos"></span>
                                    <?php esc_html_e( 'Troubleshooting', 'rain-os-aeo-analyzer' ); ?>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:support@rainos.com">
                                    <span class="dashicons dashicons-email"></span>
                                    <?php esc_html_e( 'Contact Support', 'rain-os-aeo-analyzer' ); ?>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('toggle-api-key').addEventListener('click', function() {
    var input = document.getElementById('rain_os_api_key');
    var icon = this.querySelector('.dashicons');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('dashicons-visibility');
        icon.classList.add('dashicons-hidden');
    } else {
        input.type = 'password';
        icon.classList.remove('dashicons-hidden');
        icon.classList.add('dashicons-visibility');
    }
});
</script>
