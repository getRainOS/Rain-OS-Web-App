<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$rain_os_api_key = get_option( 'rain_os_api_key', '' );
$rain_os_industry = get_option( 'rain_os_industry', '' );
$rain_os_cache_time = get_option( 'rain_os_cache_time', 3600 );
$rain_os_auto_analyze = get_option( 'rain_os_auto_analyze', 'no' );
$rain_os_provenance_tracking = get_option( 'rain_os_provenance_tracking', 'no' );
$rain_os_score_alerts = get_option( 'rain_os_score_alerts', 'no' );
$rain_os_score_threshold = get_option( 'rain_os_score_threshold', 70 );
$rain_os_pd_enabled = get_option( 'rain_os_pd_enabled', 'yes' );
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
            <p><?php esc_html_e( 'Configure your rain OS AI Readability Optimizer', 'rain-os-aeo-analyzer' ); ?></p>
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
                                           value="<?php echo esc_attr( $rain_os_api_key ); ?>" 
                                           class="rain-os-input"
                                           placeholder="<?php esc_attr_e( 'Enter your Rain OS API key...', 'rain-os-aeo-analyzer' ); ?>"
                                           autocomplete="off" />
                                    <button type="button" class="rain-os-btn rain-os-btn-icon rain-os-btn-toggle" id="toggle-api-key" title="<?php esc_attr_e( 'Show/Hide API Key', 'rain-os-aeo-analyzer' ); ?>">
                                        <span class="dashicons dashicons-visibility"></span>
                                        <span class="rain-os-toggle-text"><?php esc_html_e( 'View', 'rain-os-aeo-analyzer' ); ?></span>
                                    </button>
                                    <button type="button" class="rain-os-btn rain-os-btn-secondary" id="test-connection">
                                        <span class="dashicons dashicons-update"></span>
                                        <?php esc_html_e( 'Test Connection', 'rain-os-aeo-analyzer' ); ?>
                                    </button>
                                    <button type="button" class="rain-os-btn rain-os-btn-secondary" id="rain-os-regen-key">
                                        <span class="dashicons dashicons-randomize"></span>
                                        <?php esc_html_e( 'Regenerate Key', 'rain-os-aeo-analyzer' ); ?>
                                    </button>
                                </div>
                                <p class="rain-os-form-help">
                                    <?php
                                    /* translators: %s: URL to the Rain OS login page */
                                    printf(
                                        wp_kses(
                                            __( 'Get your API key from <a href="%s" target="_blank">app.getrainos.com</a>', 'rain-os-aeo-analyzer' ),
                                            array( 'a' => array( 'href' => array(), 'target' => array() ) )
                                        ),
                                        'https://app.getrainos.com/#/login'
                                    );
                                    ?>
                                </p>
                                <div id="connection-status" class="rain-os-connection-status" style="display:none;"></div>
                            </div>

                            <div class="rain-os-form-group">
                                <label for="rain_os_industry"><?php esc_html_e( 'Default Industry', 'rain-os-aeo-analyzer' ); ?></label>
                                <select id="rain_os_industry" name="rain_os_industry" class="rain-os-select">
                                    <option value="" <?php selected( $rain_os_industry, '' ); ?>><?php esc_html_e( 'Select Industry...', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="technology" <?php selected( $rain_os_industry, 'technology' ); ?>><?php esc_html_e( 'Technology', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="healthcare" <?php selected( $rain_os_industry, 'healthcare' ); ?>><?php esc_html_e( 'Healthcare', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="finance" <?php selected( $rain_os_industry, 'finance' ); ?>><?php esc_html_e( 'Finance', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="ecommerce" <?php selected( $rain_os_industry, 'ecommerce' ); ?>><?php esc_html_e( 'E-commerce', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="education" <?php selected( $rain_os_industry, 'education' ); ?>><?php esc_html_e( 'Education', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="marketing" <?php selected( $rain_os_industry, 'marketing' ); ?>><?php esc_html_e( 'Marketing', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="legal" <?php selected( $rain_os_industry, 'legal' ); ?>><?php esc_html_e( 'Legal', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="realestate" <?php selected( $rain_os_industry, 'realestate' ); ?>><?php esc_html_e( 'Real Estate', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="travel" <?php selected( $rain_os_industry, 'travel' ); ?>><?php esc_html_e( 'Travel & Hospitality', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="other" <?php selected( $rain_os_industry, 'other' ); ?>><?php esc_html_e( 'Other', 'rain-os-aeo-analyzer' ); ?></option>
                                </select>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Industry context helps the AI provide more relevant and accurate analysis for your content.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>

                            <div class="rain-os-form-group">
                                <label for="rain_os_cache_time"><?php esc_html_e( 'Cache Duration', 'rain-os-aeo-analyzer' ); ?></label>
                                <select id="rain_os_cache_time" name="rain_os_cache_time" class="rain-os-select">
                                    <option value="1800" <?php selected( $rain_os_cache_time, 1800 ); ?>><?php esc_html_e( '30 minutes', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="3600" <?php selected( $rain_os_cache_time, 3600 ); ?>><?php esc_html_e( '1 hour', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="7200" <?php selected( $rain_os_cache_time, 7200 ); ?>><?php esc_html_e( '2 hours', 'rain-os-aeo-analyzer' ); ?></option>
                                    <option value="86400" <?php selected( $rain_os_cache_time, 86400 ); ?>><?php esc_html_e( '24 hours', 'rain-os-aeo-analyzer' ); ?></option>
                                </select>
                                <p class="rain-os-form-help"><?php esc_html_e( 'How long to cache analysis results before refreshing.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e( 'Analysis Preferences', 'rain-os-aeo-analyzer' ); ?></h3>
                            <span class="rain-os-card-badge"><?php esc_html_e( 'Local Settings', 'rain-os-aeo-analyzer' ); ?></span>
                        </div>
                        <div class="rain-os-card-body">
                            <p class="rain-os-card-description"><?php esc_html_e( 'These settings control how the plugin behaves within your WordPress site. They do not require API calls.', 'rain-os-aeo-analyzer' ); ?></p>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rain_os_pd_enabled" 
                                               value="yes" 
                                               <?php checked( $rain_os_pd_enabled, 'yes' ); ?> 
                                               class="rain-os-checkbox" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Product Discoverability Pillar', 'rain-os-aeo-analyzer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Enable or disable the Product Discoverability pillar. When disabled, your overall AEO score will be calculated from the four core content pillars (AI Readability, Digital Authority, Conversion Readiness, RAG Readiness). Enable this if you want to optimize for product or service discovery through AI-powered search.', 'rain-os-aeo-analyzer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Include the Product Discoverability pillar in your AEO analysis and scoring.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rain_os_auto_analyze" 
                                               value="yes" 
                                               <?php checked( $rain_os_auto_analyze, 'yes' ); ?> 
                                               class="rain-os-checkbox" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Auto-Analyze on Publish', 'rain-os-aeo-analyzer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'When enabled, the plugin will automatically run an AEO analysis every time you publish or update a post. This uses one API credit per analysis. Disable this if you prefer to manually trigger analyses.', 'rain-os-aeo-analyzer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Automatically analyze content when publishing or updating posts.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rain_os_provenance_tracking" 
                                               value="yes" 
                                               <?php checked( $rain_os_provenance_tracking, 'yes' ); ?> 
                                               class="rain-os-checkbox" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Enable Provenance Tracking', 'rain-os-aeo-analyzer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Provenance tracking creates a cryptographic hash of your content at the time of analysis, serving as proof of authorship. This helps establish content ownership and can be useful for copyright protection or demonstrating when content was created.', 'rain-os-aeo-analyzer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Record content authorship and timestamp data for provenance verification.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rain_os_score_alerts" 
                                               value="yes" 
                                               <?php checked( $rain_os_score_alerts, 'yes' ); ?> 
                                               class="rain-os-checkbox" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Score Alerts Below Threshold', 'rain-os-aeo-analyzer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'When enabled, you will receive a notification in your WordPress dashboard whenever a post scores below the threshold you set. This helps you identify content that may need improvement for better AI visibility.', 'rain-os-aeo-analyzer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <div class="rain-os-threshold-input" id="threshold-container" style="<?php echo esc_attr( $rain_os_score_alerts !== 'yes' ? 'display:none;' : '' ); ?>">
                                    <label for="rain_os_score_threshold"><?php esc_html_e( 'Alert Threshold:', 'rain-os-aeo-analyzer' ); ?></label>
                                    <input type="number" 
                                           id="rain_os_score_threshold" 
                                           name="rain_os_score_threshold" 
                                           value="<?php echo esc_attr( $rain_os_score_threshold ); ?>" 
                                           min="0" 
                                           max="100" 
                                           class="rain-os-input rain-os-input-small" />
                                    <span class="rain-os-threshold-hint"><?php esc_html_e( 'Notify when score falls below this value (0-100)', 'rain-os-aeo-analyzer' ); ?></span>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Receive alerts when analyzed content scores below a certain threshold.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>
                        </div>
                    </div>

                    <?php
                    $rain_os_ai_backend_enabled = get_option( 'rain_os_ai_backend_enabled', 'no' );
                    $rain_os_ai_score_panel = get_option( 'rain_os_ai_score_panel', 'no' );
                    $rain_os_ai_normalize = get_option( 'rain_os_ai_normalize', 'no' );
                    ?>
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e( 'AI Readiness Backend', 'rain-os-aeo-analyzer' ); ?></h3>
                        </div>
                        <div class="rain-os-card-body">
                            <p class="rain-os-card-description"><?php esc_html_e( 'Enable new AI readiness features. These features require the new backend API and are optional.', 'rain-os-aeo-analyzer' ); ?></p>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rain_os_ai_backend_enabled" 
                                               value="yes" 
                                               <?php checked( $rain_os_ai_backend_enabled, 'yes' ); ?> 
                                               class="rain-os-checkbox"
                                               id="rain_os_ai_backend_enabled" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Enable AI Readiness Backend', 'rain-os-aeo-analyzer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Master switch for new AI backend features. When disabled, all AI readiness features below are inactive.', 'rain-os-aeo-analyzer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Enable new AI readiness analysis backend integration.', 'rain-os-aeo-analyzer' ); ?></p>
                            </div>

                            <div class="rain-os-ai-backend-options" id="ai-backend-options" style="<?php echo esc_attr( $rain_os_ai_backend_enabled !== 'yes' ? 'display:none;' : '' ); ?>">
                                <div class="rain-os-form-group rain-os-toggle-group">
                                    <div class="rain-os-toggle-row">
                                        <label class="rain-os-toggle-label">
                                            <input type="checkbox" 
                                                   name="rain_os_ai_score_panel" 
                                                   value="yes" 
                                                   <?php checked( $rain_os_ai_score_panel, 'yes' ); ?> 
                                                   class="rain-os-checkbox" />
                                            <span class="rain-os-toggle-switch"></span>
                                            <span class="rain-os-toggle-title">
                                                <?php esc_html_e( 'AI Score Panel in Editor', 'rain-os-aeo-analyzer' ); ?>
                                                <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Displays a sidebar panel in the post editor showing AI readiness scores: Readability, Structure, Freshness, Citation Readiness, and AI Visibility.', 'rain-os-aeo-analyzer' ); ?>">
                                                    <span class="dashicons dashicons-info-outline"></span>
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <p class="rain-os-form-help"><?php esc_html_e( 'Show AI readiness scores in the post editor sidebar.', 'rain-os-aeo-analyzer' ); ?></p>
                                </div>

                                <div class="rain-os-form-group rain-os-toggle-group">
                                    <div class="rain-os-toggle-row">
                                        <label class="rain-os-toggle-label">
                                            <input type="checkbox" 
                                                   name="rain_os_ai_normalize" 
                                                   value="yes" 
                                                   <?php checked( $rain_os_ai_normalize, 'yes' ); ?> 
                                                   class="rain-os-checkbox" />
                                            <span class="rain-os-toggle-switch"></span>
                                            <span class="rain-os-toggle-title">
                                                <?php esc_html_e( 'Content Normalization on Save', 'rain-os-aeo-analyzer' ); ?>
                                                <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Automatically sends content to the AI backend for normalization when saving posts. This runs in the background and does not affect the save process.', 'rain-os-aeo-analyzer' ); ?>">
                                                    <span class="dashicons dashicons-info-outline"></span>
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <p class="rain-os-form-help"><?php esc_html_e( 'Normalize content for AI analysis when saving posts (async, non-blocking).', 'rain-os-aeo-analyzer' ); ?></p>
                                </div>
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
                        if ( ! empty( $rain_os_api_key ) ) :
                            $rain_os_api_client = rain_os_aeo()->get_api_client();
                            $rain_os_subscription = $rain_os_api_client->get_subscription_status();
                        ?>
                        <div class="rain-os-account-status">
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Status', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value rain-os-status-badge rain-os-status-<?php echo esc_attr( $rain_os_subscription['subscription_status'] === 'active' ? 'active' : 'inactive' ); ?>">
                                    <?php echo esc_html( ucfirst( $rain_os_subscription['subscription_status'] ) ); ?>
                                </span>
                            </div>
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Plan', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value rain-os-plan-badge"><?php echo esc_html( ucfirst( $rain_os_subscription['plan'] ) ); ?></span>
                            </div>
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Usage', 'rain-os-aeo-analyzer' ); ?></span>
                                <span class="rain-os-status-value"><?php echo esc_html( $rain_os_subscription['usage_count'] . ' / ' . $rain_os_subscription['usage_limit'] ); ?></span>
                            </div>
                            <div class="rain-os-usage-bar">
                                <div class="rain-os-usage-fill" style="width: <?php echo esc_attr( min( 100, ( $rain_os_subscription['usage_count'] / max( 1, $rain_os_subscription['usage_limit'] ) ) * 100 ) ); ?>%;"></div>
                            </div>
                            <?php if ( $rain_os_subscription['is_pro'] ) : ?>
                            <button type="button" id="rain-os-portal-btn" class="rain-os-btn rain-os-btn-secondary rain-os-btn-full">
                                <span class="dashicons dashicons-admin-users"></span>
                                <?php esc_html_e( 'Manage Billing', 'rain-os-aeo-analyzer' ); ?>
                            </button>
                            <?php else : ?>
                            <a href="<?php echo esc_url( admin_url( 'admin.php?page=rain-os-aeo-upgrade' ) ); ?>" class="rain-os-btn rain-os-btn-primary rain-os-btn-full">
                                <?php esc_html_e( 'Upgrade Plan', 'rain-os-aeo-analyzer' ); ?>
                            </a>
                            <?php endif; ?>
                        </div>
                        <?php else : ?>
                        <div class="rain-os-no-api-key">
                            <span class="dashicons dashicons-warning"></span>
                            <p><?php esc_html_e( 'No API key configured', 'rain-os-aeo-analyzer' ); ?></p>
                            <a href="https://app.getrainos.com/#/login" target="_blank" class="rain-os-btn rain-os-btn-primary">
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
                                <a href="mailto:support@getrainos.com">
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
