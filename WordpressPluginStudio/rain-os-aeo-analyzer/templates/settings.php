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
                                    <button type="button" class="rain-os-btn rain-os-btn-secondary" id="test-connection">
                                        <span class="dashicons dashicons-update"></span>
                                        <?php esc_html_e( 'Test Connection', 'rain-os-aeo-analyzer' ); ?>
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
                                <div id="connection-status" class="rain-os-connection-status" style="display:none;"></div>
                            </div>

                            <div class="rain-os-form-group">
                                <label for="rain_os_industry"><?php esc_html_e( 'Default Industry', 'rain-os-aeo-analyzer' ); ?></label>
                                <select id="rain_os_industry" name="rain_os_industry" class="rain-os-select">
                                    <?php $industry = get_option( 'rain_os_industry', '' ); ?>
                                    <option value="" <?php selected( $industry, '' ); ?>><?php esc_html_e( 'Select Industry...', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="technology" <?php selected( $industry, 'technology' ); ?>><?php esc_html_e( 'Technology', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="healthcare" <?php selected( $industry, 'healthcare' ); ?>><?php esc_html_e( 'Healthcare', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="finance" <?php selected( $industry, 'finance' ); ?>><?php esc_html_e( 'Finance', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="ecommerce" <?php selected( $industry, 'ecommerce' ); ?>><?php esc_html_e( 'E-commerce', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="education" <?php selected( $industry, 'education' ); ?>><?php esc_html_e( 'Education', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="marketing" <?php selected( $industry, 'marketing' ); ?>><?php esc_html_e( 'Marketing', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="legal" <?php selected( $industry, 'legal' ); ?>><?php esc_html_e( 'Legal', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="other" <?php selected( $industry, 'other' ); ?>><?php esc_html_e( 'Other', 'rain-os-aeo-analyzer' ); ?></option>
                                </select>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Industry context helps improve analysis accuracy.', 'rain-os-aeo-analyzer' ); ?></p>
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
                    <div class="rain-os-card-body" id="account-status-container">
                        <?php 
                        $api_key = get_option( 'rain_os_api_key', '' );
                        if ( ! empty( $api_key ) ) :
                            $api_client = rain_os_aeo()->get_api_client();
                            $subscription = $api_client->get_subscription_status();
                        ?>
                        <div class="rain-os-account-status">
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Status', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value rain-os-status-badge rain-os-status-<?php echo esc_attr( $subscription['subscription_status'] === 'active' ? 'active' : 'inactive' ); ?>">
                                    <?php echo esc_html( ucfirst( $subscription['subscription_status'] ) ); ?>
                                </span>
                            </div>
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Plan', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value rain-os-plan-badge"><?php echo esc_html( ucfirst( $subscription['plan'] ) ); ?></span>
                            </div>
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Usage', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value"><?php echo esc_html( $subscription['usage_count'] . ' / ' . $subscription['usage_limit'] ); ?></span>
                            </div>
                            <div class="rain-os-usage-bar">
                                <div class="rain-os-usage-fill" style="width: <?php echo esc_attr( min( 100, ( $subscription['usage_count'] / max( 1, $subscription['usage_limit'] ) ) * 100 ) ); ?>%;"></div>
                            </div>
                            <?php if ( ! $subscription['is_pro'] ) : ?>
                            <a href="https://www.app.getrainos.com" target="_blank" class="rain-os-btn rain-os-btn-primary rain-os-btn-full">
                                <?php esc_html_e( 'Upgrade Plan', 'rain-os-aeo-analyzer' ); ?>
                            </a>
                            <?php endif; ?>
                        </div>
                        <?php else : ?>
                        <div class="rain-os-no-api-key">
                            <span class="dashicons dashicons-warning"></span>
                            <p><?php esc_html_e( 'No API key configured', 'rain-os-aeo-analyzer' ); ?></p>
                            <a href="https://www.app.getrainos.com" target="_blank" class="rain-os-btn rain-os-btn-primary">
                                <?php esc_html_e( 'Get API Key', 'rain-os-aeo-analyzer' ); ?>
                            </a>
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
(function($) {
    'use strict';
    
    $('#toggle-api-key').on('click', function() {
        var input = $('#rain_os_api_key');
        var icon = $(this).find('.dashicons');
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('dashicons-visibility').addClass('dashicons-hidden');
        } else {
            input.attr('type', 'password');
            icon.removeClass('dashicons-hidden').addClass('dashicons-visibility');
        }
    });

    $('#test-connection').on('click', function() {
        var $btn = $(this);
        var $status = $('#connection-status');
        
        $btn.prop('disabled', true);
        $btn.find('.dashicons').addClass('rain-os-spin');
        $status.hide();

        $.ajax({
            url: rainOsAeo.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_test_connection',
                nonce: rainOsAeo.nonce
            },
            success: function(response) {
                $btn.prop('disabled', false);
                $btn.find('.dashicons').removeClass('rain-os-spin');
                
                if (response.success) {
                    $status
                        .removeClass('rain-os-error')
                        .addClass('rain-os-success')
                        .html('<span class="dashicons dashicons-yes-alt"></span> Connected! Account: ' + response.data.user.email)
                        .show();
                } else {
                    $status
                        .removeClass('rain-os-success')
                        .addClass('rain-os-error')
                        .html('<span class="dashicons dashicons-warning"></span> ' + response.data.message)
                        .show();
                }
            },
            error: function() {
                $btn.prop('disabled', false);
                $btn.find('.dashicons').removeClass('rain-os-spin');
                $status
                    .removeClass('rain-os-success')
                    .addClass('rain-os-error')
                    .html('<span class="dashicons dashicons-warning"></span> Connection failed. Please check your API key.')
                    .show();
            }
        });
    });
})(jQuery);
</script>

<style>
.rain-os-connection-status {
    margin-top: 10px;
    padding: 10px 15px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.rain-os-connection-status.rain-os-success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid #10b981;
    color: #10b981;
}
.rain-os-connection-status.rain-os-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    color: #ef4444;
}
.rain-os-spin {
    animation: rain-os-spin 1s linear infinite;
}
@keyframes rain-os-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.rain-os-status-badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}
.rain-os-status-active {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}
.rain-os-status-inactive {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}
.rain-os-btn-full {
    width: 100%;
    margin-top: 15px;
}
</style>
