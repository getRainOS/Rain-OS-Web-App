<?php
$plans = [
    [
        'name' => 'Business',
        'price' => '29.99',
        'period' => 'month',
        'description' => 'Perfect for local businesses, early-stage startups, product teams and solo-creators optimizing for Gemini, Perplexity, Claude and the emerging ChatGPT shopping experience.',
        'features' => [
            '100 Answer Engine Optimizations',
            'Semantic Clarity: Precision & ambiguity check',
            'Readability Score: AI & human processing ease',
            'Metadata Audit: Schema & HTML verification',
            'Logical Structure: Heading hierarchy analysis',
            'Entity Recognition: Knowledge graph linking',
            'Citation Readiness: Quotable snippet detection',
            'AEO Alignment: Direct answer scoring',
            'Schema Extraction: Structured data opportunities',
            'QA-Format Detection: Question/Answer optimization'
        ],
        'accent' => '#22D3EE',
        'popular' => false
    ],
    [
        'name' => 'Pro',
        'price' => '99.99',
        'period' => 'month',
        'description' => 'Ideal for enterprises, scaling SaaS brands, product teams and other power users optimizing for Gemini, Perplexity, Claude and the emerging ChatGPT shopping experience.',
        'features' => [
            '500 Answer Engine Optimizations',
            'Everything in Business',
            '400 Additional AI Optimizations',
            'Priority E-mail Support'
        ],
        'accent' => '#10B981',
        'popular' => true
    ]
];
?>

<div class="rain-os-wrap rain-os-yoast-style">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge">AI Readability Optimization</span>
            </div>
            <div class="rain-os-header-actions">
                <button class="rain-os-theme-toggle" id="themeToggle" title="Toggle theme">
                    <svg class="rain-os-icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                    <svg class="rain-os-icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <div class="rain-os-content rain-os-upgrade-content">
        <div class="rain-os-upgrade-hero">
            <h1>Unlock the Full Power of <span class="rain-os-title-inline"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span></h1>
            <p class="rain-os-upgrade-subtitle">Make your content defensible against AI competitors. Choose the plan that fits your content strategy.</p>
        </div>

        <div class="rain-os-upgrade-features-bar">
            <div class="rain-os-upgrade-feature">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>AI-Ready Content</span>
            </div>
            <div class="rain-os-upgrade-feature">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Instant Analysis</span>
            </div>
            <div class="rain-os-upgrade-feature">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Actionable Insights</span>
            </div>
        </div>

        <div class="rain-os-pricing-grid">
            <?php foreach ($plans as $plan): ?>
            <div class="rain-os-pricing-card <?php echo $plan['popular'] ? 'popular' : ''; ?>">
                <?php if ($plan['popular']): ?>
                <div class="rain-os-pricing-badge">Most Popular</div>
                <?php endif; ?>
                <div class="rain-os-pricing-header" style="border-color: <?php echo $plan['accent']; ?>;">
                    <h3 class="rain-os-pricing-name"><?php echo $plan['name']; ?></h3>
                    <div class="rain-os-pricing-price">
                        <span class="rain-os-pricing-currency">$</span>
                        <span class="rain-os-pricing-amount"><?php echo $plan['price']; ?></span>
                        <span class="rain-os-pricing-period">/<?php echo $plan['period']; ?></span>
                    </div>
                    <p class="rain-os-pricing-desc"><?php echo $plan['description']; ?></p>
                </div>
                <ul class="rain-os-pricing-features">
                    <?php foreach ($plan['features'] as $feature): ?>
                    <li>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="<?php echo $plan['accent']; ?>" stroke-width="2" width="16" height="16">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <?php echo $feature; ?>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <a href="https://app.getrainos.com" target="_blank" class="rain-os-pricing-btn <?php echo $plan['popular'] ? 'primary' : ''; ?>" style="<?php echo $plan['popular'] ? 'background: linear-gradient(135deg, ' . $plan['accent'] . ' 0%, ' . $plan['accent'] . 'dd 100%);' : ''; ?>">
                    Get Started
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="rain-os-upgrade-faq">
            <h2>Frequently Asked Questions</h2>
            <div class="rain-os-faq-grid">
                <div class="rain-os-faq-item">
                    <h4>What is Answer Engine Optimization (AEO)?</h4>
                    <p>AEO is the practice of optimizing your content to be easily understood and cited by AI systems like ChatGPT, Google AI Overviews, and voice assistants. It focuses on making your content the authoritative source that AI recommends.</p>
                </div>
                <div class="rain-os-faq-item">
                    <h4>How does rain help my content?</h4>
                    <p>rain analyzes your content across three key pillars: AI Readability, Digital Authority, and Conversion Readiness. Each pillar has specific metrics that help you understand exactly how to improve your content for AI visibility.</p>
                </div>
                <div class="rain-os-faq-item">
                    <h4>Can I try before I buy?</h4>
                    <p>Yes! You can analyze up to 5 pieces of content for free. No credit card required. See exactly how rain can improve your content before committing to a plan.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="rain-os-footer">
        <span>support@getrainos.com</span>
    </div>
</div>
