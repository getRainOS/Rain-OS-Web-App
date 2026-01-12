<?php
$api_endpoint = 'https://api.rain-os.com';
$api_key = 'rain_os_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
$default_industry = 'Technology';
$industries = array(
    'Technology',
    'Marketing & Advertising',
    'Healthcare & Wellness',
    'Finance & Fintech',
    'E-commerce & Retail',
    'Education',
    'Travel & Hospitality',
    'General / Other'
);
$post_types = array('post', 'page');
$available_post_types = array(
    'post' => 'Posts',
    'page' => 'Pages',
    'product' => 'Products'
);
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge">Settings</span>
            </div>
            <div class="rain-os-header-actions">
                <a href="?tab=dashboard" class="rain-os-btn rain-os-btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Dashboard
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
                    API Configuration
                </button>
                <button type="button" class="rain-os-tab-btn" data-tab="general">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    General Settings
                </button>
                <button type="button" class="rain-os-tab-btn" data-tab="about">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    About
                </button>
            </div>

            <div class="rain-os-tabs-content">
                <div class="rain-os-tab-panel active" id="tab-api-config">
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3>API Configuration</h3>
                            <p>Connect your rain OS account to enable AI-powered content analysis.</p>
                        </div>
                        <div class="rain-os-card-body">
                            <form class="rain-os-form">
                                <div class="rain-os-form-group">
                                    <label for="rain-os-api-key">API Key</label>
                                    <div class="rain-os-input-group">
                                        <input type="password" id="rain-os-api-key" name="api_key" value="<?php echo htmlspecialchars($api_key); ?>" placeholder="rain_os_key_xxxxxxxxxxxx" class="rain-os-input">
                                        <button type="button" class="rain-os-btn rain-os-btn-icon rain-os-toggle-password" title="Toggle visibility">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" class="rain-os-eye-icon">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <p class="rain-os-form-hint">Your API key from the rain OS dashboard. Keep this secret!</p>
                                </div>
                                <div class="rain-os-form-actions">
                                    <button type="button" class="rain-os-btn rain-os-btn-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                            <polyline points="17 21 17 13 7 13 7 21"/>
                                            <polyline points="7 3 7 8 15 8"/>
                                        </svg>
                                        Save Settings
                                    </button>
                                    <button type="button" class="rain-os-btn rain-os-btn-secondary">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        Test Connection
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="rain-os-tab-panel" id="tab-general">
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3>General Settings</h3>
                            <p>Configure default behavior and post type settings.</p>
                        </div>
                        <div class="rain-os-card-body">
                            <form class="rain-os-form">
                                <div class="rain-os-form-group">
                                    <label for="rain-os-default-industry">Default Industry</label>
                                    <select id="rain-os-default-industry" name="default_industry" class="rain-os-select">
                                        <?php foreach ($industries as $industry) : ?>
                                            <option value="<?php echo htmlspecialchars($industry); ?>" <?php echo $default_industry === $industry ? 'selected' : ''; ?>><?php echo htmlspecialchars($industry); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <p class="rain-os-form-hint">The default industry selected when analyzing new content.</p>
                                </div>
                                <div class="rain-os-form-group">
                                    <label>Enable Content Types</label>
                                    <div class="rain-os-checkbox-group">
                                        <?php foreach ($available_post_types as $type => $label) : ?>
                                            <label class="rain-os-checkbox-label">
                                                <input type="checkbox" name="post_types[]" value="<?php echo htmlspecialchars($type); ?>" <?php echo in_array($type, $post_types) ? 'checked' : ''; ?>>
                                                <span class="rain-os-checkbox-custom"></span>
                                                <?php echo htmlspecialchars($label); ?>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                    <p class="rain-os-form-hint">Select which post types should display the SEO analysis meta box.</p>
                                </div>
                                <div class="rain-os-form-actions">
                                    <button type="button" class="rain-os-btn rain-os-btn-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                            <polyline points="17 21 17 13 7 13 7 21"/>
                                            <polyline points="7 3 7 8 15 8"/>
                                        </svg>
                                        Save Settings
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="rain-os-tab-panel" id="tab-about">
                    <div class="rain-os-card">
                        <div class="rain-os-card-header">
                            <h3>About rain OS AI Readability Optimizer</h3>
                        </div>
                        <div class="rain-os-card-body">
                            <div class="rain-os-about">
                                <div class="rain-os-about-logo">
                                    <img src="rain-logo.png" alt="rain logo" width="64" height="64" style="object-fit: contain;">
                                </div>
                                <h4>rain OS AI Readability Optimizer</h4>
                                <p class="rain-os-version">Version 1.0.0</p>
                                <p>AI-powered content analysis for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). Optimize your content for the AI-driven future of search.</p>
                                <div class="rain-os-about-links">
                                    <a href="https://www.getrainos.com" target="_blank" rel="noopener noreferrer" class="rain-os-btn rain-os-btn-secondary">
                                        <img src="rain-logo.png" alt="rain logo" width="16" height="16" style="object-fit: contain;">
                                        Visit Website
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="rain-os-footer">
            rain OS AI Readability Optimization v1.0.0 &bull; <a href="?tab=documentation">Documentation</a> &bull; <a href="mailto:support@getrainos.com">support@getrainos.com</a>
        </div>
    </div>
</div>
