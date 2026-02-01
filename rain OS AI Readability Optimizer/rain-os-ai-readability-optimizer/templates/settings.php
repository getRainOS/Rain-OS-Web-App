<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$api_key = get_option( 'rairo_api_key', '' );
$industry = get_option( 'rairo_industry', '' );
$cache_time = get_option( 'rairo_cache_time', 3600 );
$auto_analyze = get_option( 'rairo_auto_analyze', 'no' );
$provenance_tracking = get_option( 'rairo_provenance_tracking', 'no' );
$score_alerts = get_option( 'rairo_score_alerts', 'no' );
$score_threshold = get_option( 'rairo_score_threshold', 70 );
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e( 'Settings', 'rain-os-ai-readability-optimizer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-dashboard' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'rain-os-ai-readability-optimizer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content rain-os-settings-content">
        <header class="rain-os-page-header">
            <h1><?php esc_html_e( 'Settings', 'rain-os-ai-readability-optimizer' ); ?></h1>
            <p><?php esc_html_e( 'Configure your AI Readability Optimizer', 'rain-os-ai-readability-optimizer' ); ?></p>
        </header>

        <div class="rain-os-settings-grid">
            <div class="rain-os-settings-main">
                <form method="post" action="options.php" class="rain-os-settings-form">
                    <?php settings_fields( 'rairo_aeo_settings' ); ?>

                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e( 'API Configuration', 'rain-os-ai-readability-optimizer' ); ?></h3>
                        </div>
                        <div class="rain-os-card-body">
                            <div class="rain-os-form-group">
                                <label for="rairo_api_key"><?php esc_html_e( 'API Key', 'rain-os-ai-readability-optimizer' ); ?></label>
                                <div class="rain-os-input-group">
                                    <input type="password" 
                                           id="rairo_api_key" 
                                           name="rairo_api_key" 
                                           value="<?php echo esc_attr( $api_key ); ?>" 
                                           class="rain-os-input"
                                           placeholder="<?php esc_attr_e( 'Enter your Rain OS API key...', 'rain-os-ai-readability-optimizer' ); ?>"
                                           autocomplete="off" />
                                    <button type="button" class="rain-os-btn rain-os-btn-icon rain-os-btn-toggle" id="toggle-api-key" title="<?php esc_attr_e( 'Show/Hide API Key', 'rain-os-ai-readability-optimizer' ); ?>">
                                        <span class="dashicons dashicons-visibility"></span>
                                        <span class="rain-os-toggle-text"><?php esc_html_e( 'View', 'rain-os-ai-readability-optimizer' ); ?></span>
                                    </button>
                                    <button type="button" class="rain-os-btn rain-os-btn-secondary" id="test-connection">
                                        <span class="dashicons dashicons-update"></span>
                                        <?php esc_html_e( 'Test Connection', 'rain-os-ai-readability-optimizer' ); ?>
                                    </button>
                                </div>
                                <p class="rain-os-form-help">
                                    <?php 
                                    printf(
                                        wp_kses(
                                            __( 'Get your API key from <a href="%s" target="_blank">app.getrainos.com</a>', 'rain-os-ai-readability-optimizer' ),
                                            array( 'a' => array( 'href' => array(), 'target' => array() ) )
                                        ),
                                        'https://app.getrainos.com/#/login'
                                    );
                                    ?>
                                </p>
                                <div id="connection-status" class="rain-os-connection-status" style="display:none;"></div>
                            </div>

                            <div class="rain-os-form-group">
                                <label for="rairo_industry"><?php esc_html_e( 'Default Industry', 'rain-os-ai-readability-optimizer' ); ?></label>
                                <select id="rairo_industry" name="rairo_industry" class="rain-os-select">
                                    <option value="" <?php selected( $industry, '' ); ?>><?php esc_html_e( 'Select Industry...', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="technology" <?php selected( $industry, 'technology' ); ?>><?php esc_html_e( 'Technology', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="healthcare" <?php selected( $industry, 'healthcare' ); ?>><?php esc_html_e( 'Healthcare', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="finance" <?php selected( $industry, 'finance' ); ?>><?php esc_html_e( 'Finance', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="ecommerce" <?php selected( $industry, 'ecommerce' ); ?>><?php esc_html_e( 'E-commerce', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="education" <?php selected( $industry, 'education' ); ?>><?php esc_html_e( 'Education', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="marketing" <?php selected( $industry, 'marketing' ); ?>><?php esc_html_e( 'Marketing', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="legal" <?php selected( $industry, 'legal' ); ?>><?php esc_html_e( 'Legal', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="realestate" <?php selected( $industry, 'realestate' ); ?>><?php esc_html_e( 'Real Estate', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="travel" <?php selected( $industry, 'travel' ); ?>><?php esc_html_e( 'Travel & Hospitality', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="other" <?php selected( $industry, 'other' ); ?>><?php esc_html_e( 'Other', 'rain-os-ai-readability-optimizer' ); ?></option>
                                </select>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Industry context helps the AI provide more relevant and accurate analysis for your content.', 'rain-os-ai-readability-optimizer' ); ?></p>
                            </div>

                            <div class="rain-os-form-group">
                                <label for="rairo_cache_time"><?php esc_html_e( 'Cache Duration', 'rain-os-ai-readability-optimizer' ); ?></label>
                                <select id="rairo_cache_time" name="rairo_cache_time" class="rain-os-select">
                                    <option value="1800" <?php selected( $cache_time, 1800 ); ?>><?php esc_html_e( '30 minutes', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="3600" <?php selected( $cache_time, 3600 ); ?>><?php esc_html_e( '1 hour', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="7200" <?php selected( $cache_time, 7200 ); ?>><?php esc_html_e( '2 hours', 'rain-os-ai-readability-optimizer' ); ?></option>
                                    <option value="86400" <?php selected( $cache_time, 86400 ); ?>><?php esc_html_e( '24 hours', 'rain-os-ai-readability-optimizer' ); ?></option>
                                </select>
                                <p class="rain-os-form-help"><?php esc_html_e( 'How long to cache analysis results before refreshing.', 'rain-os-ai-readability-optimizer' ); ?></p>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e( 'Analysis Preferences', 'rain-os-ai-readability-optimizer' ); ?></h3>
                            <span class="rain-os-card-badge"><?php esc_html_e( 'Local Settings', 'rain-os-ai-readability-optimizer' ); ?></span>
                        </div>
                        <div class="rain-os-card-body">
                            <p class="rain-os-card-description"><?php esc_html_e( 'These settings control how the plugin behaves within your WordPress site. They do not require API calls.', 'rain-os-ai-readability-optimizer' ); ?></p>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rairo_auto_analyze" 
                                               value="yes" 
                                               <?php checked( $auto_analyze, 'yes' ); ?> 
                                               class="rain-os-checkbox" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Auto-Analyze on Publish', 'rain-os-ai-readability-optimizer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'When enabled, the plugin will automatically run an AEO analysis every time you publish or update a post. This uses one API credit per analysis. Disable this if you prefer to manually trigger analyses.', 'rain-os-ai-readability-optimizer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Automatically analyze content when publishing or updating posts.', 'rain-os-ai-readability-optimizer' ); ?></p>
                            </div>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rairo_provenance_tracking" 
                                               value="yes" 
                                               <?php checked( $provenance_tracking, 'yes' ); ?> 
                                               class="rain-os-checkbox" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Enable Provenance Tracking', 'rain-os-ai-readability-optimizer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Provenance tracking creates a cryptographic hash of your content at the time of analysis, serving as proof of authorship. This helps establish content ownership and can be useful for copyright protection or demonstrating when content was created.', 'rain-os-ai-readability-optimizer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Record content authorship and timestamp data for provenance verification.', 'rain-os-ai-readability-optimizer' ); ?></p>
                            </div>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rairo_score_alerts" 
                                               value="yes" 
                                               <?php checked( $score_alerts, 'yes' ); ?> 
                                               class="rain-os-checkbox" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Score Alerts Below Threshold', 'rain-os-ai-readability-optimizer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'When enabled, you will receive a notification in your WordPress dashboard whenever a post scores below the threshold you set. This helps you identify content that may need improvement for better AI visibility.', 'rain-os-ai-readability-optimizer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <div class="rain-os-threshold-input" id="threshold-container" style="<?php echo esc_attr( $score_alerts !== 'yes' ? 'display:none;' : '' ); ?>">
                                    <label for="rairo_score_threshold"><?php esc_html_e( 'Alert Threshold:', 'rain-os-ai-readability-optimizer' ); ?></label>
                                    <input type="number" 
                                           id="rairo_score_threshold" 
                                           name="rairo_score_threshold" 
                                           value="<?php echo esc_attr( $score_threshold ); ?>" 
                                           min="0" 
                                           max="100" 
                                           class="rain-os-input rain-os-input-small" />
                                    <span class="rain-os-threshold-hint"><?php esc_html_e( 'Notify when score falls below this value (0-100)', 'rain-os-ai-readability-optimizer' ); ?></span>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Receive alerts when analyzed content scores below a certain threshold.', 'rain-os-ai-readability-optimizer' ); ?></p>
                            </div>
                        </div>
                    </div>

                    <?php
                    $ai_backend_enabled = get_option( 'rairo_ai_backend_enabled', 'no' );
                    $ai_score_panel = get_option( 'rairo_ai_score_panel', 'no' );
                    $ai_normalize = get_option( 'rairo_ai_normalize', 'no' );
                    ?>
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e( 'AI Readiness Backend', 'rain-os-ai-readability-optimizer' ); ?></h3>
                            <span class="rain-os-card-badge rain-os-card-badge-beta"><?php esc_html_e( 'Beta', 'rain-os-ai-readability-optimizer' ); ?></span>
                        </div>
                        <div class="rain-os-card-body">
                            <p class="rain-os-card-description"><?php esc_html_e( 'Enable new AI readiness features. These features require the new backend API and are optional.', 'rain-os-ai-readability-optimizer' ); ?></p>

                            <div class="rain-os-form-group rain-os-toggle-group">
                                <div class="rain-os-toggle-row">
                                    <label class="rain-os-toggle-label">
                                        <input type="checkbox" 
                                               name="rairo_ai_backend_enabled" 
                                               value="yes" 
                                               <?php checked( $ai_backend_enabled, 'yes' ); ?> 
                                               class="rain-os-checkbox"
                                               id="rairo_ai_backend_enabled" />
                                        <span class="rain-os-toggle-switch"></span>
                                        <span class="rain-os-toggle-title">
                                            <?php esc_html_e( 'Enable AI Readiness Backend', 'rain-os-ai-readability-optimizer' ); ?>
                                            <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Master switch for new AI backend features. When disabled, all AI readiness features below are inactive.', 'rain-os-ai-readability-optimizer' ); ?>">
                                                <span class="dashicons dashicons-info-outline"></span>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                <p class="rain-os-form-help"><?php esc_html_e( 'Enable new AI readiness analysis backend integration.', 'rain-os-ai-readability-optimizer' ); ?></p>
                            </div>

                            <div class="rain-os-ai-backend-options" id="ai-backend-options" style="<?php echo esc_attr( $ai_backend_enabled !== 'yes' ? 'display:none;' : '' ); ?>">
                                <div class="rain-os-form-group rain-os-toggle-group">
                                    <div class="rain-os-toggle-row">
                                        <label class="rain-os-toggle-label">
                                            <input type="checkbox" 
                                                   name="rairo_ai_score_panel" 
                                                   value="yes" 
                                                   <?php checked( $ai_score_panel, 'yes' ); ?> 
                                                   class="rain-os-checkbox" />
                                            <span class="rain-os-toggle-switch"></span>
                                            <span class="rain-os-toggle-title">
                                                <?php esc_html_e( 'AI Score Panel in Editor', 'rain-os-ai-readability-optimizer' ); ?>
                                                <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Displays a sidebar panel in the post editor showing AI readiness scores: Readability, Structure, Freshness, Citation Readiness, and AI Visibility.', 'rain-os-ai-readability-optimizer' ); ?>">
                                                    <span class="dashicons dashicons-info-outline"></span>
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <p class="rain-os-form-help"><?php esc_html_e( 'Show AI readiness scores in the post editor sidebar.', 'rain-os-ai-readability-optimizer' ); ?></p>
                                </div>

                                <div class="rain-os-form-group rain-os-toggle-group">
                                    <div class="rain-os-toggle-row">
                                        <label class="rain-os-toggle-label">
                                            <input type="checkbox" 
                                                   name="rairo_ai_normalize" 
                                                   value="yes" 
                                                   <?php checked( $ai_normalize, 'yes' ); ?> 
                                                   class="rain-os-checkbox" />
                                            <span class="rain-os-toggle-switch"></span>
                                            <span class="rain-os-toggle-title">
                                                <?php esc_html_e( 'Content Normalization on Save', 'rain-os-ai-readability-optimizer' ); ?>
                                                <span class="rain-os-tooltip" data-tooltip="<?php esc_attr_e( 'Automatically sends content to the AI backend for normalization when saving posts. This runs in the background and does not affect the save process.', 'rain-os-ai-readability-optimizer' ); ?>">
                                                    <span class="dashicons dashicons-info-outline"></span>
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    <p class="rain-os-form-help"><?php esc_html_e( 'Normalize content for AI analysis when saving posts (async, non-blocking).', 'rain-os-ai-readability-optimizer' ); ?></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-settings-actions">
                        <?php submit_button( __( 'Save Settings', 'rain-os-ai-readability-optimizer' ), 'rain-os-btn rain-os-btn-primary', 'submit', false ); ?>
                    </div>
                </form>
            </div>

            <div class="rain-os-settings-sidebar">
                <div class="rain-os-card">
                    <div class="rain-os-card-header">
                        <h3><?php esc_html_e( 'Account Status', 'rain-os-ai-readability-optimizer' ); ?></h3>
                    </div>
                    <div class="rain-os-card-body" id="account-status-container">
                        <?php 
                        if ( ! empty( $api_key ) ) :
                            $api_client = ai_readability_aeo()->get_api_client();
                            $subscription = $api_client->get_subscription_status();
                        ?>
                        <div class="rain-os-account-status">
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Status', 'rain-os-ai-readability-optimizer' ); ?></span>
                                <span class="rain-os-status-value rain-os-status-badge rain-os-status-<?php echo esc_attr( $subscription['subscription_status'] === 'active' ? 'active' : 'inactive' ); ?>">
                                    <?php echo esc_html( ucfirst( $subscription['subscription_status'] ) ); ?>
                                </span>
                            </div>
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Plan', 'rain-os-ai-readability-optimizer' ); ?></span>
                                <span class="rain-os-status-value rain-os-plan-badge"><?php echo esc_html( ucfirst( $subscription['plan'] ) ); ?></span>
                            </div>
                            <div class="rain-os-status-item">
                                <span class="rain-os-status-label"><?php esc_html_e( 'Usage', 'rain-os-ai-readability-optimizer' ); ?></span>
                                <span class="rain-os-status-value"><?php echo esc_html( $subscription['usage_count'] . ' / ' . $subscription['usage_limit'] ); ?></span>
                            </div>
                            <div class="rain-os-usage-bar">
                                <div class="rain-os-usage-fill" style="width: <?php echo esc_attr( min( 100, ( $subscription['usage_count'] / max( 1, $subscription['usage_limit'] ) ) * 100 ) ); ?>%;"></div>
                            </div>
                            <?php if ( ! $subscription['is_pro'] ) : ?>
                            <a href="https://app.getrainos.com/#/login" target="_blank" class="rain-os-btn rain-os-btn-primary rain-os-btn-full">
                                <?php esc_html_e( 'Upgrade Plan', 'rain-os-ai-readability-optimizer' ); ?>
                            </a>
                            <?php endif; ?>
                        </div>
                        <?php else : ?>
                        <div class="rain-os-no-api-key">
                            <span class="dashicons dashicons-warning"></span>
                            <p><?php esc_html_e( 'No API key configured', 'rain-os-ai-readability-optimizer' ); ?></p>
                            <a href="https://app.getrainos.com/#/login" target="_blank" class="rain-os-btn rain-os-btn-primary">
                                <?php esc_html_e( 'Get API Key', 'rain-os-ai-readability-optimizer' ); ?>
                            </a>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="rain-os-card">
                    <div class="rain-os-card-header">
                        <h3><?php esc_html_e( 'Need Help?', 'rain-os-ai-readability-optimizer' ); ?></h3>
                    </div>
                    <div class="rain-os-card-body">
                        <ul class="rain-os-help-links">
                            <li>
                                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-docs' ) ); ?>">
                                    <span class="dashicons dashicons-book"></span>
                                    <?php esc_html_e( 'Documentation', 'rain-os-ai-readability-optimizer' ); ?>
                                </a>
                            </li>
                            <li>
                                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-help' ) ); ?>">
                                    <span class="dashicons dashicons-sos"></span>
                                    <?php esc_html_e( 'Troubleshooting', 'rain-os-ai-readability-optimizer' ); ?>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:support@getrainos.com">
                                    <span class="dashicons dashicons-email"></span>
                                    <?php esc_html_e( 'Contact Support', 'rain-os-ai-readability-optimizer' ); ?>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
