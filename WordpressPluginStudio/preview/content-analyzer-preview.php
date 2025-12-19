<?php
$industries = array(
    'Technology',
    'SaaS & Software',
    'Marketing & Advertising',
    'Healthcare & Wellness',
    'Finance & Fintech',
    'E-commerce & Retail',
    'Education',
    'Travel & Hospitality',
    'Real Estate',
    'Legal Services',
    'Manufacturing',
    'Automotive',
    'Food & Beverage',
    'Media & Entertainment',
    'Non-Profit',
    'Government',
    'Sports & Fitness',
    'Beauty & Fashion',
    'Consulting',
    'Insurance',
    'Telecommunications',
    'Energy & Utilities',
    'Agriculture',
    'Pharmaceuticals',
    'Logistics & Supply Chain',
    'Construction',
    'Human Resources',
    'General / Other'
);

$content_categories = array(
    'Blog Post',
    'Product Page',
    'Landing Page',
    'How-To Guide',
    'FAQ Page',
    'News Article',
    'Case Study',
    'White Paper',
    'Review',
    'Comparison',
    'Listicle',
    'Tutorial',
    'Other'
);

$show_results = true;

function get_stroke_dasharray_analyzer($percentage, $radius = 54) {
    $circumference = 2 * M_PI * $radius;
    return ($percentage / 100 * $circumference) . ' ' . $circumference;
}

$pillars = [
    [
        'name' => 'AI Readability', 
        'score' => 88, 
        'accent' => '#22D3EE',
        'glow' => 'rgba(34, 211, 238, 0.5)',
        'description' => 'Can AI models parse and understand your content?',
        'subcategories' => [
            ['name' => 'Semantic Clarity', 'score' => 92, 'tip' => 'Language is precise and unambiguous', 'status' => 'good'],
            ['name' => 'Logical Structure', 'score' => 85, 'tip' => 'Good heading hierarchy detected', 'status' => 'good'],
            ['name' => 'Readability', 'score' => 87, 'tip' => 'Sentence flow is easy to process', 'status' => 'good'],
        ]
    ],
    [
        'name' => 'Digital Authority', 
        'score' => 78, 
        'accent' => '#10B981',
        'glow' => 'rgba(16, 185, 129, 0.5)',
        'description' => 'Is your content credible and trustworthy?',
        'subcategories' => [
            ['name' => 'Descriptive Metadata', 'score' => 82, 'tip' => 'Schema markup could be expanded', 'status' => 'good'],
            ['name' => 'Entity Recognition', 'score' => 75, 'tip' => 'Add links to knowledge graphs', 'status' => 'ok'],
            ['name' => 'Citation Readiness', 'score' => 77, 'tip' => 'Include more quotable snippets', 'status' => 'ok'],
        ]
    ],
    [
        'name' => 'Conversion Readiness', 
        'score' => 84, 
        'accent' => '#A855F7',
        'glow' => 'rgba(168, 85, 247, 0.5)',
        'description' => 'Is your content structured to provide answers?',
        'subcategories' => [
            ['name' => 'AEO Alignment', 'score' => 86, 'tip' => 'Good conversational answers', 'status' => 'good'],
            ['name' => 'Schema Extraction', 'score' => 80, 'tip' => 'Consider adding FAQ schema', 'status' => 'good'],
            ['name' => 'QA-Format Detection', 'score' => 86, 'tip' => 'Q&A formatting detected', 'status' => 'good'],
        ]
    ]
];

$overall_score = round(($pillars[0]['score'] + $pillars[1]['score'] + $pillars[2]['score']) / 3);

$content_metrics = [
    'word_count' => 847,
    'reading_time' => '4 min',
    'sentences' => 42,
    'paragraphs' => 8,
    'headings' => 6,
    'questions' => 3,
    'lists' => 2,
];

function get_score_class_analyzer($score) {
    if ($score >= 80) return 'good';
    if ($score >= 60) return 'ok';
    return 'needs-work';
}
?>

<div class="rain-os-wrap rain-os-editor-view">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge">Content Analyzer</span>
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
                <a href="?tab=dashboard" class="rain-os-btn rain-os-btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Dashboard
                </a>
                <button class="rain-os-btn rain-os-btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <path d="M17 21v-8H7v8M7 3v5h8"/>
                    </svg>
                    Save Draft
                </button>
            </div>
        </div>
    </div>

    <div class="rain-os-content rain-os-editor-layout">
        <div class="rain-os-editor-main">
            <div class="rain-os-industry-bar">
                <label>Industry:</label>
                <select class="rain-os-select rain-os-industry-select-top">
                    <?php foreach ($industries as $industry): ?>
                    <option><?php echo htmlspecialchars($industry); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="rain-os-meta-bar">
                <div class="rain-os-meta-row">
                    <label>Content Type:</label>
                    <select class="rain-os-select">
                        <?php foreach ($content_categories as $category): ?>
                        <option><?php echo htmlspecialchars($category); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="rain-os-meta-row">
                    <label>Tags:</label>
                    <input type="text" class="rain-os-input" value="Microservices, Architecture, Cloud, DevOps">
                </div>
            </div>
            <div class="rain-os-editor-title-wrap">
                <input type="text" class="rain-os-editor-title" placeholder="Enter your post title..." value="Building Scalable Microservices Architecture: A Complete Guide">
            </div>
            
            <div class="rain-os-editor-toolbar">
                <button class="rain-os-toolbar-btn" title="Bold"><strong>B</strong></button>
                <button class="rain-os-toolbar-btn" title="Italic"><em>I</em></button>
                <button class="rain-os-toolbar-btn" title="Heading">H</button>
                <button class="rain-os-toolbar-btn" title="Link">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                </button>
                <button class="rain-os-toolbar-btn" title="List">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <line x1="8" y1="6" x2="21" y2="6"/>
                        <line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/>
                        <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                </button>
                <div class="rain-os-toolbar-sep"></div>
                <button class="rain-os-toolbar-btn" title="Add Image">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </button>
                <button class="rain-os-toolbar-btn" title="Add Video">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                </button>
            </div>

            <div class="rain-os-editor-content" contenteditable="true">
                <h2>What is Microservices Architecture?</h2>
                <p>Microservices architecture is an approach to building software applications as a collection of small, independent services that communicate through well-defined APIs. Each service is self-contained and implements a single business capability.</p>
                
                <h2>Why Choose Microservices?</h2>
                <p>Modern applications require scalability, flexibility, and rapid deployment cycles. Microservices enable teams to develop, deploy, and scale individual components independently without affecting the entire system.</p>
                
                <h3>Key Benefits of Microservices</h3>
                <ul>
                    <li>Independent deployment and scaling of services</li>
                    <li>Technology flexibility for each service</li>
                    <li>Improved fault isolation and resilience</li>
                    <li>Faster development cycles with smaller teams</li>
                </ul>
                
                <h2>How to Implement Microservices</h2>
                <p>Focus on three key areas: service decomposition, communication patterns, and data management strategies.</p>
                
                <h3>1. Service Decomposition</h3>
                <p>Break down your monolith into bounded contexts. Each microservice should own its domain logic and data. Use domain-driven design principles to identify service boundaries.</p>
                
                <h3>2. Communication Patterns</h3>
                <p>Choose between synchronous REST/gRPC calls and asynchronous message queues. Implement API gateways for routing and load balancing. Use service mesh for observability.</p>
                
                <h3>3. Data Management</h3>
                <p>Each service should have its own database. Implement eventual consistency patterns. Use event sourcing for complex state management across services.</p>
            </div>

            <div class="rain-os-analyze-controls-main">
                <button class="rain-os-btn rain-os-btn-primary rain-os-btn-block">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M23 4v6h-6M1 20v-6h6"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    Analyze Content
                </button>
            </div>

        </div>

        <div class="rain-os-editor-sidebar">
            <div class="rain-os-sidebar-section rain-os-score-section">
                <div class="rain-os-donut-row">
                    <div class="rain-os-main-donut">
                        <svg viewBox="0 0 180 180" class="rain-os-multi-ring">
                            <circle cx="90" cy="90" r="80" stroke-width="8" fill="none" stroke="rgba(255,255,255,0.05)"/>
                            <circle cx="90" cy="90" r="80" stroke-width="8" fill="none" stroke="<?php echo $pillars[0]['accent']; ?>"
                                style="stroke-dasharray: <?php echo get_stroke_dasharray_analyzer($pillars[0]['score'], 80); ?>; transform: rotate(-90deg); transform-origin: center;
                                filter: drop-shadow(0 0 8px <?php echo $pillars[0]['glow']; ?>);"/>
                            
                            <circle cx="90" cy="90" r="66" stroke-width="8" fill="none" stroke="rgba(255,255,255,0.05)"/>
                            <circle cx="90" cy="90" r="66" stroke-width="8" fill="none" stroke="<?php echo $pillars[1]['accent']; ?>"
                                style="stroke-dasharray: <?php echo get_stroke_dasharray_analyzer($pillars[1]['score'], 66); ?>; transform: rotate(-90deg); transform-origin: center;
                                filter: drop-shadow(0 0 8px <?php echo $pillars[1]['glow']; ?>);"/>
                            
                            <circle cx="90" cy="90" r="52" stroke-width="8" fill="none" stroke="rgba(255,255,255,0.05)"/>
                            <circle cx="90" cy="90" r="52" stroke-width="8" fill="none" stroke="<?php echo $pillars[2]['accent']; ?>"
                                style="stroke-dasharray: <?php echo get_stroke_dasharray_analyzer($pillars[2]['score'], 52); ?>; transform: rotate(-90deg); transform-origin: center;
                                filter: drop-shadow(0 0 8px <?php echo $pillars[2]['glow']; ?>);"/>
                        </svg>
                        <div class="rain-os-main-donut-center">
                            <span class="rain-os-main-score"><?php echo $overall_score; ?></span>
                            <span class="rain-os-main-label">AEO Score</span>
                        </div>
                        <div class="rain-os-score-status-below <?php echo get_score_class_analyzer($overall_score); ?>">
                            <span class="rain-os-status-bullet"></span>
                            <?php echo $overall_score >= 80 ? 'Good' : ($overall_score >= 60 ? 'OK' : 'Needs work'); ?>
                        </div>
                    </div>
                    
                    <div class="rain-os-pillar-donuts">
                        <?php foreach ($pillars as $pillar): ?>
                        <div class="rain-os-pillar-donut-wrap">
                            <div class="rain-os-pillar-donut">
                                <svg viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="34" stroke-width="5" fill="none" stroke="rgba(255,255,255,0.08)"/>
                                    <circle cx="40" cy="40" r="34" stroke-width="5" fill="none" stroke="<?php echo $pillar['accent']; ?>"
                                        style="stroke-dasharray: <?php echo get_stroke_dasharray_analyzer($pillar['score'], 34); ?>; transform: rotate(-90deg); transform-origin: center;
                                        filter: drop-shadow(0 0 6px <?php echo $pillar['glow']; ?>);"/>
                                </svg>
                                <div class="rain-os-pillar-donut-center">
                                    <span class="rain-os-pillar-donut-score"><?php echo $pillar['score']; ?></span>
                                </div>
                            </div>
                            <span class="rain-os-pillar-donut-label" style="color: <?php echo $pillar['accent']; ?>;"><?php echo $pillar['name']; ?></span>
                            <div class="rain-os-pillar-subcats">
                                <?php foreach ($pillar['subcategories'] as $sub): ?>
                                <div class="rain-os-subcat-item <?php echo $sub['status']; ?>">
                                    <div class="rain-os-subcat-top">
                                        <span class="rain-os-subcat-dot"></span>
                                        <span class="rain-os-subcat-name"><?php echo $sub['name']; ?></span>
                                        <span class="rain-os-subcat-score"><?php echo $sub['score']; ?></span>
                                    </div>
                                    <span class="rain-os-subcat-tip"><?php echo $sub['tip']; ?></span>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

            </div>

            <div class="rain-os-sidebar-section rain-os-analysis-details">
                <h4 class="rain-os-sidebar-title">Content Analysis</h4>
                
                <div class="rain-os-analysis-card">
                    <div class="rain-os-analysis-header">
                        <span class="rain-os-analysis-icon good">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                        </span>
                        <span class="rain-os-analysis-title">Paragraph Length</span>
                        <span class="rain-os-analysis-score good">92%</span>
                    </div>
                    <div class="rain-os-analysis-bar-wrap">
                        <div class="rain-os-analysis-bar">
                            <div class="rain-os-analysis-bar-fill good" style="width: 92%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-analysis-breakdown">
                        <div class="rain-os-breakdown-item">
                            <span class="rain-os-breakdown-label">Short (1-3 sentences)</span>
                            <span class="rain-os-breakdown-value">3 paragraphs</span>
                        </div>
                        <div class="rain-os-breakdown-item">
                            <span class="rain-os-breakdown-label">Optimal (4-6 sentences)</span>
                            <span class="rain-os-breakdown-value">4 paragraphs</span>
                        </div>
                        <div class="rain-os-breakdown-item">
                            <span class="rain-os-breakdown-label">Long (7+ sentences)</span>
                            <span class="rain-os-breakdown-value">1 paragraph</span>
                        </div>
                    </div>
                    <p class="rain-os-analysis-tip">Good paragraph variety. Consider breaking up the long paragraph for better readability.</p>
                </div>

                <div class="rain-os-analysis-card">
                    <div class="rain-os-analysis-header">
                        <span class="rain-os-analysis-icon good">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                        </span>
                        <span class="rain-os-analysis-title">Heading Structure</span>
                        <span class="rain-os-analysis-score good">88%</span>
                    </div>
                    <div class="rain-os-analysis-bar-wrap">
                        <div class="rain-os-analysis-bar">
                            <div class="rain-os-analysis-bar-fill good" style="width: 88%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-heading-tree">
                        <div class="rain-os-heading-item h1"><span class="rain-os-heading-tag">H1</span> Building Scalable Microservices...</div>
                        <div class="rain-os-heading-item h2"><span class="rain-os-heading-tag">H2</span> What are Microservices?</div>
                        <div class="rain-os-heading-item h3"><span class="rain-os-heading-tag">H3</span> Key Benefits</div>
                        <div class="rain-os-heading-item h2"><span class="rain-os-heading-tag">H2</span> Architecture Patterns</div>
                        <div class="rain-os-heading-item h3"><span class="rain-os-heading-tag">H3</span> Service Mesh</div>
                        <div class="rain-os-heading-item h2"><span class="rain-os-heading-tag">H2</span> Implementation Guide</div>
                    </div>
                    <p class="rain-os-analysis-tip">Proper heading hierarchy detected. 1 H1, 3 H2s, 2 H3s.</p>
                </div>

                <div class="rain-os-analysis-card">
                    <div class="rain-os-analysis-header">
                        <span class="rain-os-analysis-icon ok">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </span>
                        <span class="rain-os-analysis-title">Keyword Density</span>
                        <span class="rain-os-analysis-score ok">74%</span>
                    </div>
                    <div class="rain-os-analysis-bar-wrap">
                        <div class="rain-os-analysis-bar">
                            <div class="rain-os-analysis-bar-fill ok" style="width: 74%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-keyword-list">
                        <div class="rain-os-keyword-item">
                            <span class="rain-os-keyword-word">microservices</span>
                            <div class="rain-os-keyword-bar-wrap">
                                <div class="rain-os-keyword-bar" style="width: 85%;"></div>
                            </div>
                            <span class="rain-os-keyword-pct">2.8%</span>
                        </div>
                        <div class="rain-os-keyword-item">
                            <span class="rain-os-keyword-word">architecture</span>
                            <div class="rain-os-keyword-bar-wrap">
                                <div class="rain-os-keyword-bar" style="width: 60%;"></div>
                            </div>
                            <span class="rain-os-keyword-pct">1.9%</span>
                        </div>
                        <div class="rain-os-keyword-item">
                            <span class="rain-os-keyword-word">scalable</span>
                            <div class="rain-os-keyword-bar-wrap">
                                <div class="rain-os-keyword-bar" style="width: 40%;"></div>
                            </div>
                            <span class="rain-os-keyword-pct">1.2%</span>
                        </div>
                        <div class="rain-os-keyword-item">
                            <span class="rain-os-keyword-word">API</span>
                            <div class="rain-os-keyword-bar-wrap">
                                <div class="rain-os-keyword-bar" style="width: 35%;"></div>
                            </div>
                            <span class="rain-os-keyword-pct">1.1%</span>
                        </div>
                    </div>
                    <p class="rain-os-analysis-tip">Primary keyword density is good. Consider adding more secondary keywords.</p>
                </div>

                <div class="rain-os-analysis-card">
                    <div class="rain-os-analysis-header">
                        <span class="rain-os-analysis-icon needs-work">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        </span>
                        <span class="rain-os-analysis-title">Alt Text Check</span>
                        <span class="rain-os-analysis-score needs-work">50%</span>
                    </div>
                    <div class="rain-os-analysis-bar-wrap">
                        <div class="rain-os-analysis-bar">
                            <div class="rain-os-analysis-bar-fill needs-work" style="width: 50%;"></div>
                        </div>
                    </div>
                    <div class="rain-os-alt-check-list">
                        <div class="rain-os-alt-item good">
                            <span class="rain-os-alt-icon">✓</span>
                            <span class="rain-os-alt-name">microservices-diagram.png</span>
                        </div>
                        <div class="rain-os-alt-item needs-work">
                            <span class="rain-os-alt-icon">✗</span>
                            <span class="rain-os-alt-name">architecture-overview.jpg</span>
                        </div>
                        <div class="rain-os-alt-item good">
                            <span class="rain-os-alt-icon">✓</span>
                            <span class="rain-os-alt-name">api-gateway.svg</span>
                        </div>
                        <div class="rain-os-alt-item needs-work">
                            <span class="rain-os-alt-icon">✗</span>
                            <span class="rain-os-alt-name">service-mesh.png</span>
                        </div>
                    </div>
                    <p class="rain-os-analysis-tip">2 of 4 images missing alt text. Add descriptive alt attributes for better accessibility and AI understanding.</p>
                </div>

            </div>

        </div>

        <div class="rain-os-footer">
            rain OS AI Readability Optimization v1.0.0 &bull; <a href="?tab=documentation">Documentation</a> &bull; <a href="mailto:support@getrainos.com">support@getrainos.com</a>
        </div>
    </div>
</div>

<script>
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const savedTheme = localStorage.getItem('rain-os-theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('rain-os-theme', newTheme);
    });
}
</script>
