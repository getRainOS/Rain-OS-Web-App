<?php
/**
 * Settings Template
 * Settings page with tabbed interface for API config and general settings
 */

if (!defined('ABSPATH')) {
    exit;
}

$api_endpoint = get_option('rain_os_api_endpoint', '');
$api_key = get_option('rain_os_api_key', '');
$default_industry = get_option('rain_os_default_industry', 'General / Other');
$post_types = get_option('rain_os_post_types', array('post', 'page'));
$industries = Rain_OS_Settings::get_industries();
$available_post_types = Rain_OS_Settings::get_post_types();
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <img src="<?php echo esc_url(RAIN_OS_PLUGIN_URL . 'assets/images/rain-os-logo.png'); ?>" alt="Rain OS" class="rain-os-logo-img" width="40" height="40">
                <span class="rain-os-title"><span class="rain-white">R</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge"><?php esc_html_e('Settings', 'rain-os-seo'); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url(admin_url('admin.php?page=rain-os')); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <?php esc_html_e('Back to Dashboard', 'rain-os-seo'); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <div class="rain-os-tabs">
            <div class="rain-os-tabs-nav">
                <button type="button" class="rain-os-tab-btn active" data-tab="api-config">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <?php esc_html_e('API Configuration', 'rain-os-seo'); ?>
                </button>
                <button type="button" class="rain-os-tab-btn" data-tab="general">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    <?php esc_html_e('General Settings', 'rain-os-seo'); ?>
                </button>
                <button type="button" class="rain-os-tab-btn" data-tab="about">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    <?php esc_html_e('About', 'rain-os-seo'); ?>
                </button>
            </div>

            <div class="rain-os-tabs-content">
                <div class="rain-os-tab-panel active" id="tab-api-config">
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e('API Configuration', 'rain-os-seo'); ?></h3>
                            <p><?php esc_html_e('Connect your Rain OS account to enable AI-powered content analysis.', 'rain-os-seo'); ?></p>
                        </div>
                        <div class="rain-os-card-body">
                            <form id="rain-os-api-form" class="rain-os-form">
                                <div class="rain-os-form-group">
                                    <label for="rain-os-api-endpoint"><?php esc_html_e('API Endpoint URL', 'rain-os-seo'); ?></label>
                                    <input type="url" id="rain-os-api-endpoint" name="api_endpoint" value="<?php echo esc_attr($api_endpoint); ?>" placeholder="https://your-api-endpoint.com" class="rain-os-input">
                                    <p class="rain-os-form-hint"><?php esc_html_e('Enter the base URL of your Rain OS API endpoint.', 'rain-os-seo'); ?></p>
                                </div>
                                <div class="rain-os-form-group">
                                    <label for="rain-os-api-key"><?php esc_html_e('API Key', 'rain-os-seo'); ?></label>
                                    <div class="rain-os-input-group">
                                        <input type="password" id="rain-os-api-key" name="api_key" value="<?php echo esc_attr($api_key); ?>" placeholder="rain_os_key_xxxxxxxxxxxx" class="rain-os-input">
                                        <button type="button" class="rain-os-btn rain-os-btn-icon rain-os-toggle-password" title="<?php esc_attr_e('Toggle visibility', 'rain-os-seo'); ?>">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="rain-os-eye-icon">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="rain-os-eye-off-icon" style="display:none;">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <p class="rain-os-form-hint"><?php esc_html_e('Your API key from the Rain OS dashboard. Keep this secret!', 'rain-os-seo'); ?></p>
                                </div>
                                <div class="rain-os-form-actions">
                                    <button type="submit" class="rain-os-btn rain-os-btn-primary" id="rain-os-save-api">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                            <polyline points="17 21 17 13 7 13 7 21"/>
                                            <polyline points="7 3 7 8 15 8"/>
                                        </svg>
                                        <?php esc_html_e('Save Settings', 'rain-os-seo'); ?>
                                    </button>
                                    <button type="button" class="rain-os-btn rain-os-btn-secondary" id="rain-os-test-connection">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <?php esc_html_e('Test Connection', 'rain-os-seo'); ?>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="rain-os-tab-panel" id="tab-general">
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e('General Settings', 'rain-os-seo'); ?></h3>
                            <p><?php esc_html_e('Configure default behavior and post type settings.', 'rain-os-seo'); ?></p>
                        </div>
                        <div class="rain-os-card-body">
                            <form id="rain-os-general-form" class="rain-os-form">
                                <div class="rain-os-form-group">
                                    <label for="rain-os-default-industry"><?php esc_html_e('Default Industry', 'rain-os-seo'); ?></label>
                                    <select id="rain-os-default-industry" name="default_industry" class="rain-os-select">
                                        <?php foreach ($industries as $industry) : ?>
                                            <option value="<?php echo esc_attr($industry); ?>" <?php selected($default_industry, $industry); ?>><?php echo esc_html($industry); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <p class="rain-os-form-hint"><?php esc_html_e('The default industry selected when analyzing new content.', 'rain-os-seo'); ?></p>
                                </div>
                                <div class="rain-os-form-group">
                                    <label><?php esc_html_e('Enable for Post Types', 'rain-os-seo'); ?></label>
                                    <div class="rain-os-checkbox-group">
                                        <?php foreach ($available_post_types as $type => $label) : ?>
                                            <label class="rain-os-checkbox-label">
                                                <input type="checkbox" name="post_types[]" value="<?php echo esc_attr($type); ?>" <?php checked(in_array($type, $post_types)); ?>>
                                                <span class="rain-os-checkbox-custom"></span>
                                                <?php echo esc_html($label); ?>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                    <p class="rain-os-form-hint"><?php esc_html_e('Select which post types should display the SEO analysis meta box.', 'rain-os-seo'); ?></p>
                                </div>
                                <div class="rain-os-form-actions">
                                    <button type="submit" class="rain-os-btn rain-os-btn-primary" id="rain-os-save-general">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                            <polyline points="17 21 17 13 7 13 7 21"/>
                                            <polyline points="7 3 7 8 15 8"/>
                                        </svg>
                                        <?php esc_html_e('Save Settings', 'rain-os-seo'); ?>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="rain-os-tab-panel" id="tab-about">
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3><?php esc_html_e('About Rain OS SEO Analyzer', 'rain-os-seo'); ?></h3>
                        </div>
                        <div class="rain-os-card-body">
                            <div class="rain-os-about">
                                <div class="rain-os-about-logo">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="64" height="64">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                        <path d="M2 12h20"/>
                                    </svg>
                                </div>
                                <h4><?php esc_html_e('Rain OS SEO Analyzer', 'rain-os-seo'); ?></h4>
                                <p class="rain-os-version"><?php echo esc_html(sprintf(__('Version %s', 'rain-os-seo'), RAIN_OS_SEO_VERSION)); ?></p>
                                <p><?php esc_html_e('AI-powered content analysis for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). Optimize your content for the AI-driven future of search.', 'rain-os-seo'); ?></p>
                                <div class="rain-os-about-links">
                                    <a href="https://rain-os.com" target="_blank" rel="noopener noreferrer" class="rain-os-btn rain-os-btn-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                            <path d="M2 12h20"/>
                                        </svg>
                                        <?php esc_html_e('Visit Website', 'rain-os-seo'); ?>
                                    </a>
                                    <a href="https://rain-os.com/docs" target="_blank" rel="noopener noreferrer" class="rain-os-btn rain-os-btn-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                                        </svg>
                                        <?php esc_html_e('Documentation', 'rain-os-seo'); ?>
                                    </a>
                                    <a href="https://rain-os.com/support" target="_blank" rel="noopener noreferrer" class="rain-os-btn rain-os-btn-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                                        </svg>
                                        <?php esc_html_e('Get Support', 'rain-os-seo'); ?>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
