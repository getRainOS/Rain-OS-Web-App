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
                <span class="rain-os-badge"><?php esc_html_e( 'Upgrade', 'rain-os-ai-readability-optimizer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-dashboard' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Back to Dashboard', 'rain-os-ai-readability-optimizer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content rain-os-upgrade-content">
        <header class="rain-os-page-header rain-os-center">
            <h1><?php esc_html_e( 'Upgrade Your Plan', 'rain-os-ai-readability-optimizer' ); ?></h1>
            <p><?php esc_html_e( 'Optimize for Gemini, Perplexity, Claude and the emerging ChatGPT shopping experience', 'rain-os-ai-readability-optimizer' ); ?></p>
        </header>

        <div class="rain-os-pricing-grid">
            <div class="rain-os-pricing-card rain-os-pricing-recommended">
                <span class="rain-os-recommended-badge"><?php esc_html_e( 'RECOMMENDED', 'rain-os-ai-readability-optimizer' ); ?></span>
                <h3 class="rain-os-pricing-title"><?php esc_html_e( 'Business', 'rain-os-ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-pricing-price">
                    <span class="rain-os-price-amount">$29.99</span>
                    <span class="rain-os-price-period">/<?php esc_html_e( 'month', 'rain-os-ai-readability-optimizer' ); ?></span>
                </div>
                <p class="rain-os-pricing-desc"><?php esc_html_e( 'Perfect for local businesses, early-stage startups, product teams and solo-creators', 'rain-os-ai-readability-optimizer' ); ?></p>
                
                <ul class="rain-os-pricing-features">
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( '100 AI Optimizations', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Semantic Clarity: Precision & ambiguity check', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Readability Score: AI & human processing ease', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Metadata Audit: Schema & HTML verification', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Logical Structure: Heading hierarchy analysis', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Entity Recognition: Knowledge graph linking', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Citation Readiness: Quotable snippet detection', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'AI Alignment: Direct answer scoring', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Schema Extraction: Structured data opportunities', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'QA-Format Detection: Question/Answer optimization', 'rain-os-ai-readability-optimizer' ); ?></li>
                </ul>

                <a href="https://app.getrainos.com/#/login" target="_blank" rel="noopener noreferrer" class="rain-os-btn rain-os-btn-primary rain-os-btn-full">
                    <span class="dashicons dashicons-cloud"></span>
                    <?php esc_html_e( 'Upgrade to Business', 'rain-os-ai-readability-optimizer' ); ?>
                </a>
            </div>

            <div class="rain-os-pricing-card">
                <h3 class="rain-os-pricing-title"><?php esc_html_e( 'Pro', 'rain-os-ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-pricing-price">
                    <span class="rain-os-price-amount">$99.99</span>
                    <span class="rain-os-price-period">/<?php esc_html_e( 'month', 'rain-os-ai-readability-optimizer' ); ?></span>
                </div>
                <p class="rain-os-pricing-desc"><?php esc_html_e( 'Ideal for enterprises, agencies, scaling SaaS brands, product teams and other power users', 'rain-os-ai-readability-optimizer' ); ?></p>
                
                <ul class="rain-os-pricing-features">
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Everything in Business +', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( '500 AI Optimizations (400 additional)', 'rain-os-ai-readability-optimizer' ); ?></li>
                    <li><span class="rain-os-check">✓</span> <?php esc_html_e( 'Priority e-mail Support', 'rain-os-ai-readability-optimizer' ); ?></li>
                </ul>

                <a href="https://app.getrainos.com/#/login" target="_blank" rel="noopener noreferrer" class="rain-os-btn rain-os-btn-primary rain-os-btn-full">
                    <span class="dashicons dashicons-star-filled"></span>
                    <?php esc_html_e( 'Upgrade to Pro', 'rain-os-ai-readability-optimizer' ); ?>
                </a>
            </div>
        </div>
    </div>
</div>
