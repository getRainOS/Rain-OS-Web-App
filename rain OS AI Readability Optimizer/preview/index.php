<?php
/**
 * rain OS SEO Analyzer - Plugin Preview
 * This is a standalone preview of the plugin's UI for demonstration purposes
 */

$current_tab = isset($_GET['tab']) ? htmlspecialchars($_GET['tab']) : 'dashboard';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>rain OS SEO Analyzer - Plugin Preview</title>
    <link rel="stylesheet" href="preview.css">
    <link rel="stylesheet" href="yoast-style.css">
</head>
<body>
    <script>
        (function() {
            var savedTheme = localStorage.getItem('rain-os-theme') || 'dark';
            document.body.setAttribute('data-theme', savedTheme);
        })();
    </script>
    <div class="preview-container">
        <div class="preview-sidebar">
            <div class="preview-sidebar-header">
                <h2>WordPress Admin</h2>
            </div>
            <nav class="preview-nav">
                <a href="?tab=dashboard" class="preview-nav-item <?php echo $current_tab === 'dashboard' ? 'active' : ''; ?>">
                    <span class="preview-nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                            <path d="M17.5 11a5.5 5.5 0 0 0-10.4-2.5A4 4 0 1 0 4 16h13a3.5 3.5 0 0 0 .5-7z"/>
                            <path d="M7 19c0 1.5 1 3 2.5 3s2.5-1.5 2.5-3c0-2-2.5-4-2.5-4S7 17 7 19z" fill="currentColor" stroke="currentColor"/>
                        </svg>
                    </span>
                    <span>rain OS</span>
                </a>
                <a href="?tab=analyzer" class="preview-nav-item preview-nav-sub <?php echo $current_tab === 'analyzer' ? 'active' : ''; ?>">
                    <span>Content Analyzer</span>
                </a>
                <a href="?tab=analytics" class="preview-nav-item preview-nav-sub <?php echo $current_tab === 'analytics' ? 'active' : ''; ?>">
                    <span>Full Analytics Dashboard</span>
                </a>
                <a href="?tab=settings" class="preview-nav-item preview-nav-sub <?php echo $current_tab === 'settings' ? 'active' : ''; ?>">
                    <span>Settings</span>
                </a>
                <a href="?tab=documentation" class="preview-nav-item preview-nav-sub <?php echo $current_tab === 'documentation' ? 'active' : ''; ?>">
                    <span>Documentation</span>
                </a>
                <div class="preview-nav-divider"></div>
                <a href="?tab=upgrade" class="preview-nav-item preview-nav-sub preview-nav-upgrade <?php echo $current_tab === 'upgrade' ? 'active' : ''; ?>">
                    <span class="preview-nav-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </span>
                    <span>Upgrade Now</span>
                </a>
            </nav>
            <div class="preview-sidebar-footer">
                <a href="mailto:support@getrainos.com">support@getrainos.com</a>
            </div>
        </div>
        <div class="preview-main">
            <div class="preview-notice">
                <strong>Plugin Preview Mode</strong>
                <p>This is a preview of how the rain OS SEO Analyzer plugin will look in WordPress. Download the plugin from the <code>rain-os-seo</code> folder to install it on your WordPress site.</p>
            </div>
            
            <?php if ($current_tab === 'dashboard'): ?>
                <?php include 'dashboard-preview.php'; ?>
            <?php elseif ($current_tab === 'analyzer'): ?>
                <?php include 'content-analyzer-preview.php'; ?>
            <?php elseif ($current_tab === 'analytics'): ?>
                <?php include 'analytics-preview.php'; ?>
            <?php elseif ($current_tab === 'settings'): ?>
                <?php include 'settings-preview.php'; ?>
            <?php elseif ($current_tab === 'documentation'): ?>
                <?php include 'documentation-preview.php'; ?>
            <?php elseif ($current_tab === 'upgrade'): ?>
                <?php include 'upgrade-preview.php'; ?>
            <?php endif; ?>
        </div>
    </div>
    <script src="preview.js"></script>
</body>
</html>
