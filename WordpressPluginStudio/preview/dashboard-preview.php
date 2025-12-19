<?php
$is_configured = true;

$posts_analyzed = [
    ['id' => 1, 'title' => 'How to Optimize Content for AI Search', 'type' => 'Post', 'aeo_score' => 92, 'readability' => 88, 'authority' => 85, 'conversion' => 94, 'date' => '2 hours ago'],
    ['id' => 2, 'title' => 'Complete Guide to Schema Markup', 'type' => 'Post', 'aeo_score' => 78, 'readability' => 82, 'authority' => 71, 'conversion' => 80, 'date' => '1 day ago'],
    ['id' => 3, 'title' => 'About Us', 'type' => 'Page', 'aeo_score' => 65, 'readability' => 70, 'authority' => 58, 'conversion' => 67, 'date' => '3 days ago'],
    ['id' => 4, 'title' => 'Understanding Answer Engine Optimization', 'type' => 'Post', 'aeo_score' => 85, 'readability' => 90, 'authority' => 82, 'conversion' => 83, 'date' => '5 days ago'],
    ['id' => 5, 'title' => 'Services', 'type' => 'Page', 'aeo_score' => 45, 'readability' => 52, 'authority' => 40, 'conversion' => 43, 'date' => '1 week ago'],
];

$score_counts = [
    'good' => 2,
    'ok' => 2,
    'needs_work' => 1,
    'not_analyzed' => 8
];

$trend_data = [
    ['week' => 'Week 1', 'readability' => 65, 'authority' => 58, 'conversion' => 62],
    ['week' => 'Week 2', 'readability' => 72, 'authority' => 65, 'conversion' => 68],
    ['week' => 'Week 3', 'readability' => 78, 'authority' => 71, 'conversion' => 75],
    ['week' => 'Week 4', 'readability' => 83, 'authority' => 76, 'conversion' => 80],
    ['week' => 'Week 5', 'readability' => 88, 'authority' => 78, 'conversion' => 84],
];

$pillar_averages = [
    ['name' => 'AI Readability', 'score' => 88, 'color' => '#22D3EE'],
    ['name' => 'Digital Authority', 'score' => 78, 'color' => '#10B981'],
    ['name' => 'Conversion Readiness', 'score' => 84, 'color' => '#A855F7'],
];

$problems = [
    ['type' => 'error', 'title' => '2 posts have missing meta descriptions', 'desc' => 'Meta descriptions help AI understand your content summary.'],
    ['type' => 'warning', 'title' => '3 posts have low Citation Readiness scores', 'desc' => 'Add quotable facts and statistics to improve authority.'],
];

$notifications = [
    ['title' => 'New: Schema extraction improved', 'desc' => 'FAQ and How-to schemas are now detected more accurately.'],
];

function get_score_class($score) {
    if ($score >= 80) return 'good';
    if ($score >= 60) return 'ok';
    return 'needs-work';
}

function get_score_label($score) {
    if ($score >= 80) return 'Good';
    if ($score >= 60) return 'OK';
    return 'Needs work';
}
?>

<div class="rain-os-wrap rain-os-yoast-style">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge">AI Readability Optimization</span>
            </div>
            <div class="rain-os-header-actions">
                <div class="rain-os-status">
                    <div class="rain-os-status-dot online"></div>
                    <span class="rain-os-status-text">API Connected</span>
                </div>
                <button class="rain-os-theme-toggle" id="themeToggle" title="Toggle theme">
                    <svg class="rain-os-icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                    <svg class="rain-os-icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </button>
                <a href="?tab=settings" class="rain-os-btn rain-os-btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/>
                    </svg>
                    Settings
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <div class="rain-os-tabs-nav">
            <button class="rain-os-tab-btn active" data-tab="scores">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                </svg>
                AEO Scores
            </button>
            <button class="rain-os-tab-btn" data-tab="problems">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                </svg>
                Problems
                <?php if (count($problems) > 0): ?>
                <span class="rain-os-tab-badge"><?php echo count($problems); ?></span>
                <?php endif; ?>
            </button>
        </div>

        <div class="rain-os-tab-content active" id="tab-scores">
            <div class="rain-os-score-overview">
                <div class="rain-os-score-card good">
                    <div class="rain-os-score-indicator"></div>
                    <div class="rain-os-score-info">
                        <span class="rain-os-score-count"><?php echo $score_counts['good']; ?></span>
                        <span class="rain-os-score-label">Good</span>
                    </div>
                </div>
                <div class="rain-os-score-card ok">
                    <div class="rain-os-score-indicator"></div>
                    <div class="rain-os-score-info">
                        <span class="rain-os-score-count"><?php echo $score_counts['ok']; ?></span>
                        <span class="rain-os-score-label">OK</span>
                    </div>
                </div>
                <div class="rain-os-score-card needs-work">
                    <div class="rain-os-score-indicator"></div>
                    <div class="rain-os-score-info">
                        <span class="rain-os-score-count"><?php echo $score_counts['needs_work']; ?></span>
                        <span class="rain-os-score-label">Needs work</span>
                    </div>
                </div>
                <div class="rain-os-score-card not-analyzed">
                    <div class="rain-os-score-indicator"></div>
                    <div class="rain-os-score-info">
                        <span class="rain-os-score-count"><?php echo $score_counts['not_analyzed']; ?></span>
                        <span class="rain-os-score-label">Not analyzed</span>
                    </div>
                </div>
            </div>

            <div class="rain-os-filters">
                <div class="rain-os-filter-group">
                    <label>Content type:</label>
                    <select class="rain-os-select">
                        <option>All content</option>
                        <option>Posts</option>
                        <option>Pages</option>
                    </select>
                </div>
                <div class="rain-os-filter-group">
                    <label>AEO Score:</label>
                    <select class="rain-os-select">
                        <option>All scores</option>
                        <option>Good (80+)</option>
                        <option>OK (60-79)</option>
                        <option>Needs work (&lt;60)</option>
                    </select>
                </div>
            </div>

            <div class="rain-os-content-table">
                <div class="rain-os-table-header">
                    <div class="rain-os-table-col col-title">Title</div>
                    <div class="rain-os-table-col col-score">AEO Score</div>
                    <div class="rain-os-table-col col-pillar">AI Readability</div>
                    <div class="rain-os-table-col col-pillar">Digital Authority</div>
                    <div class="rain-os-table-col col-pillar">Conversion Readiness</div>
                    <div class="rain-os-table-col col-date">Analyzed</div>
                </div>
                <?php foreach ($posts_analyzed as $post): ?>
                <div class="rain-os-table-row">
                    <div class="rain-os-table-col col-title">
                        <a href="?tab=analyzer" class="rain-os-post-link"><?php echo htmlspecialchars($post['title']); ?></a>
                        <span class="rain-os-post-type"><?php echo $post['type']; ?></span>
                    </div>
                    <div class="rain-os-table-col col-score">
                        <div class="rain-os-score-bullet <?php echo get_score_class($post['aeo_score']); ?>">
                            <span class="rain-os-bullet"></span>
                            <span class="rain-os-score-num"><?php echo $post['aeo_score']; ?></span>
                        </div>
                    </div>
                    <div class="rain-os-table-col col-pillar">
                        <div class="rain-os-score-bullet <?php echo get_score_class($post['readability']); ?>">
                            <span class="rain-os-bullet"></span>
                            <span class="rain-os-score-num"><?php echo $post['readability']; ?></span>
                        </div>
                    </div>
                    <div class="rain-os-table-col col-pillar">
                        <div class="rain-os-score-bullet <?php echo get_score_class($post['authority']); ?>">
                            <span class="rain-os-bullet"></span>
                            <span class="rain-os-score-num"><?php echo $post['authority']; ?></span>
                        </div>
                    </div>
                    <div class="rain-os-table-col col-pillar">
                        <div class="rain-os-score-bullet <?php echo get_score_class($post['conversion']); ?>">
                            <span class="rain-os-bullet"></span>
                            <span class="rain-os-score-num"><?php echo $post['conversion']; ?></span>
                        </div>
                    </div>
                    <div class="rain-os-table-col col-date"><?php echo $post['date']; ?></div>
                </div>
                <?php endforeach; ?>
            </div>

            <div class="rain-os-table-footer">
                <span class="rain-os-table-count">Showing 5 of 13 analyzed items</span>
                <a href="#" class="rain-os-link">View all content &rarr;</a>
            </div>

            <div class="rain-os-charts-section">
                <div class="rain-os-chart-card">
                    <h4 class="rain-os-chart-title">Score Trends (Last 5 Weeks)</h4>
                    <div class="rain-os-trend-chart">
                        <div class="rain-os-trend-lines">
                            <?php foreach ($trend_data as $i => $point): ?>
                            <div class="rain-os-trend-point" style="--index: <?php echo $i; ?>;">
                                <div class="rain-os-trend-bar readability" style="height: <?php echo $point['readability']; ?>%;"></div>
                                <div class="rain-os-trend-bar authority" style="height: <?php echo $point['authority']; ?>%;"></div>
                                <div class="rain-os-trend-bar conversion" style="height: <?php echo $point['conversion']; ?>%;"></div>
                                <span class="rain-os-trend-label"><?php echo $point['week']; ?></span>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <div class="rain-os-trend-legend">
                            <span class="rain-os-legend-item"><span class="rain-os-legend-dot" style="background: #22D3EE;"></span> AI Readability</span>
                            <span class="rain-os-legend-item"><span class="rain-os-legend-dot" style="background: #10B981;"></span> Digital Authority</span>
                            <span class="rain-os-legend-item"><span class="rain-os-legend-dot" style="background: #A855F7;"></span> Conversion Readiness</span>
                        </div>
                    </div>
                </div>

                <div class="rain-os-chart-card">
                    <h4 class="rain-os-chart-title">Pillar Score Averages</h4>
                    <div class="rain-os-bar-chart">
                        <?php foreach ($pillar_averages as $pillar): ?>
                        <div class="rain-os-bar-row">
                            <span class="rain-os-bar-label"><?php echo $pillar['name']; ?></span>
                            <div class="rain-os-bar-track">
                                <div class="rain-os-bar-fill" style="width: <?php echo $pillar['score']; ?>%; background: <?php echo $pillar['color']; ?>;"></div>
                            </div>
                            <span class="rain-os-bar-value" style="color: <?php echo $pillar['color']; ?>;"><?php echo $pillar['score']; ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <div class="rain-os-tab-content" id="tab-problems">
            <div class="rain-os-problems-section">
                <h3 class="rain-os-section-header">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4M12 16h.01"/>
                    </svg>
                    Problems
                </h3>
                <?php if (count($problems) > 0): ?>
                <div class="rain-os-problems-list">
                    <?php foreach ($problems as $problem): ?>
                    <div class="rain-os-problem-item <?php echo $problem['type']; ?>">
                        <div class="rain-os-problem-icon">
                            <?php if ($problem['type'] === 'error'): ?>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M15 9l-6 6M9 9l6 6"/>
                            </svg>
                            <?php else: ?>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <path d="M12 9v4M12 17h.01"/>
                            </svg>
                            <?php endif; ?>
                        </div>
                        <div class="rain-os-problem-content">
                            <div class="rain-os-problem-title"><?php echo htmlspecialchars($problem['title']); ?></div>
                            <div class="rain-os-problem-desc"><?php echo htmlspecialchars($problem['desc']); ?></div>
                        </div>
                        <a href="#" class="rain-os-btn rain-os-btn-small">Fix it</a>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php else: ?>
                <div class="rain-os-empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    <p>No problems found! Your content is in good shape.</p>
                </div>
                <?php endif; ?>
            </div>

            <div class="rain-os-notifications-section">
                <h3 class="rain-os-section-header">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    Notifications
                </h3>
                <?php foreach ($notifications as $note): ?>
                <div class="rain-os-notification-item">
                    <div class="rain-os-notification-content">
                        <div class="rain-os-notification-title"><?php echo htmlspecialchars($note['title']); ?></div>
                        <div class="rain-os-notification-desc"><?php echo htmlspecialchars($note['desc']); ?></div>
                    </div>
                    <button class="rain-os-btn-dismiss">&times;</button>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="rain-os-sidebar-cards">
            <div class="rain-os-glass-card">
                <div class="rain-os-card-header">
                    <h3>Your AEO at a Glance</h3>
                </div>
                <div class="rain-os-card-body">
                    <div class="rain-os-stat-row">
                        <span class="rain-os-stat-label">Total content</span>
                        <span class="rain-os-stat-value">21</span>
                    </div>
                    <div class="rain-os-stat-row">
                        <span class="rain-os-stat-label">Analyzed</span>
                        <span class="rain-os-stat-value">13</span>
                    </div>
                    <div class="rain-os-stat-row">
                        <span class="rain-os-stat-label">Average AEO score</span>
                        <span class="rain-os-stat-value highlight">73</span>
                    </div>
                    <div class="rain-os-divider"></div>
                    <div class="rain-os-stat-row">
                        <span class="rain-os-stat-label">Analyses used</span>
                        <span class="rain-os-stat-value">23 / 100</span>
                    </div>
                    <div class="rain-os-usage-bar">
                        <div class="rain-os-usage-fill" style="width: 23%;"></div>
                    </div>
                </div>
            </div>

            <div class="rain-os-glass-card">
                <div class="rain-os-card-header">
                    <h3>Quick Actions</h3>
                </div>
                <div class="rain-os-card-body">
                    <a href="?tab=analyzer" class="rain-os-quick-action">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <path d="M14 2v6h6M12 18v-6M9 15h6"/>
                        </svg>
                        Analyze new content
                    </a>
                    <a href="?tab=analyzer" class="rain-os-quick-action">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M23 4v6h-6M1 20v-6h6"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Re-analyze all content
                    </a>
                    <a href="?tab=settings" class="rain-os-quick-action">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.51-1 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        Plugin settings
                    </a>
                </div>
            </div>

            <div class="rain-os-glass-card">
                <div class="rain-os-card-header">
                    <h3>Learn AEO</h3>
                </div>
                <div class="rain-os-card-body">
                    <a href="?tab=documentation&section=what-is-aeo" class="rain-os-learn-link">
                        <span>What is Answer Engine Optimization?</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                    <a href="?tab=documentation&section=three-pillars" class="rain-os-learn-link">
                        <span>Understanding the Three Pillars</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                    <a href="?tab=documentation&section=improve-scores" class="rain-os-learn-link">
                        <span>How to improve your scores</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>

        <div class="rain-os-footer">
            rain OS AI Readability Optimization v1.0.0 &bull; <a href="?tab=documentation">Documentation</a> &bull; <a href="mailto:support@getrainos.com">support@getrainos.com</a>
        </div>
    </div>
</div>

<script>
document.querySelectorAll('.rain-os-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.rain-os-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.rain-os-tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('tab-' + this.dataset.tab).classList.add('active');
    });
});

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
