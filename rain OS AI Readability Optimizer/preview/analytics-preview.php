<?php
$analyzed_content = [
    ['title' => 'How to Optimize Content for AI', 'date' => '2024-12-15', 'overall' => 87, 'readability' => 92, 'authority' => 78, 'conversion' => 91, 'type' => 'Blog Post'],
    ['title' => 'Understanding Answer Engines', 'date' => '2024-12-14', 'overall' => 72, 'readability' => 68, 'authority' => 75, 'conversion' => 73, 'type' => 'Tutorial'],
    ['title' => 'AEO Best Practices Guide', 'date' => '2024-12-13', 'overall' => 94, 'readability' => 96, 'authority' => 92, 'conversion' => 94, 'type' => 'How-To Guide'],
    ['title' => 'Product Features Overview', 'date' => '2024-12-12', 'overall' => 65, 'readability' => 70, 'authority' => 55, 'conversion' => 70, 'type' => 'Product Page'],
    ['title' => 'Schema Markup Tutorial', 'date' => '2024-12-11', 'overall' => 81, 'readability' => 85, 'authority' => 79, 'conversion' => 79, 'type' => 'Tutorial'],
    ['title' => 'FAQ: Getting Started', 'date' => '2024-12-10', 'overall' => 89, 'readability' => 88, 'authority' => 85, 'conversion' => 94, 'type' => 'FAQ Page'],
    ['title' => 'Case Study: Enterprise SEO', 'date' => '2024-12-09', 'overall' => 76, 'readability' => 72, 'authority' => 82, 'conversion' => 74, 'type' => 'Case Study'],
    ['title' => 'Voice Search Optimization', 'date' => '2024-12-08', 'overall' => 83, 'readability' => 86, 'authority' => 78, 'conversion' => 85, 'type' => 'Blog Post'],
    ['title' => 'Digital Authority Building', 'date' => '2024-12-07', 'overall' => 58, 'readability' => 62, 'authority' => 48, 'conversion' => 64, 'type' => 'Blog Post'],
    ['title' => 'Content Strategy 2025', 'date' => '2024-12-06', 'overall' => 91, 'readability' => 93, 'authority' => 88, 'conversion' => 92, 'type' => 'White Paper'],
    ['title' => 'Landing Page Conversion Tips', 'date' => '2024-12-05', 'overall' => 78, 'readability' => 80, 'authority' => 72, 'conversion' => 82, 'type' => 'Landing Page'],
    ['title' => 'AI Content Generation', 'date' => '2024-12-04', 'overall' => 69, 'readability' => 74, 'authority' => 62, 'conversion' => 71, 'type' => 'Blog Post'],
    ['title' => 'Competitor Analysis Report', 'date' => '2024-12-03', 'overall' => 85, 'readability' => 84, 'authority' => 88, 'conversion' => 83, 'type' => 'Case Study'],
    ['title' => 'Technical SEO Checklist', 'date' => '2024-12-02', 'overall' => 45, 'readability' => 50, 'authority' => 38, 'conversion' => 47, 'type' => 'Listicle'],
    ['title' => 'Content Refresh Strategy', 'date' => '2024-12-01', 'overall' => 88, 'readability' => 90, 'authority' => 84, 'conversion' => 90, 'type' => 'How-To Guide'],
];

$avg_overall = round(array_sum(array_column($analyzed_content, 'overall')) / count($analyzed_content));
$avg_readability = round(array_sum(array_column($analyzed_content, 'readability')) / count($analyzed_content));
$avg_authority = round(array_sum(array_column($analyzed_content, 'authority')) / count($analyzed_content));
$avg_conversion = round(array_sum(array_column($analyzed_content, 'conversion')) / count($analyzed_content));

$good_count = count(array_filter($analyzed_content, fn($c) => $c['overall'] >= 80));
$ok_count = count(array_filter($analyzed_content, fn($c) => $c['overall'] >= 60 && $c['overall'] < 80));
$needs_work_count = count(array_filter($analyzed_content, fn($c) => $c['overall'] < 60));

// Group content by week for trend data
$weekly_data = [];
foreach ($analyzed_content as $content) {
    $week = date('W', strtotime($content['date']));
    $year = date('Y', strtotime($content['date']));
    $key = $year . '-W' . $week;
    if (!isset($weekly_data[$key])) {
        $weekly_data[$key] = [
            'overall' => [],
            'readability' => [],
            'authority' => [],
            'conversion' => [],
            'date' => $content['date']
        ];
    }
    $weekly_data[$key]['overall'][] = $content['overall'];
    $weekly_data[$key]['readability'][] = $content['readability'];
    $weekly_data[$key]['authority'][] = $content['authority'];
    $weekly_data[$key]['conversion'][] = $content['conversion'];
}

// Calculate weekly averages
$trend_data = [];
foreach ($weekly_data as $key => $week) {
    $trend_data[] = [
        'week' => $key,
        'date' => $week['date'],
        'overall' => round(array_sum($week['overall']) / count($week['overall'])),
        'readability' => round(array_sum($week['readability']) / count($week['readability'])),
        'authority' => round(array_sum($week['authority']) / count($week['authority'])),
        'conversion' => round(array_sum($week['conversion']) / count($week['conversion']))
    ];
}
// Sort by date ascending
usort($trend_data, fn($a, $b) => strtotime($a['date']) - strtotime($b['date']));
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-left">
            <div>
                <h1>Analytics</h1>
            </div>
        </div>
        <div class="rain-os-header-right">
        </div>
    </div>

    <div class="rain-os-content">
        <div class="rain-os-analytics-filters">
            <div class="rain-os-filter-group">
                <label>Time Range</label>
                <select class="rain-os-select">
                    <option>Last 7 days</option>
                    <option selected>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>All time</option>
                </select>
            </div>
            <div class="rain-os-filter-group">
                <label>Content Type</label>
                <select class="rain-os-select">
                    <option selected>All Types</option>
                    <option>Blog Post</option>
                    <option>Product Page</option>
                    <option>Landing Page</option>
                    <option>How-To Guide</option>
                    <option>FAQ Page</option>
                    <option>Tutorial</option>
                    <option>Case Study</option>
                </select>
            </div>
            <div class="rain-os-filter-group">
                <label>Score Range</label>
                <select class="rain-os-select">
                    <option selected>All Scores</option>
                    <option>Good (80+)</option>
                    <option>OK (60-79)</option>
                    <option>Needs Work (&lt;60)</option>
                </select>
            </div>
        </div>

        <div class="rain-os-analytics-stats">
            <div class="rain-os-stat-card">
                <div class="rain-os-stat-value"><?php echo count($analyzed_content); ?></div>
                <div class="rain-os-stat-label">Total Analyzed</div>
            </div>
        </div>
        <?php 
        $total = count($analyzed_content);
        $good_pct = $total > 0 ? round(($good_count / $total) * 100) : 0;
        $ok_pct = $total > 0 ? round(($ok_count / $total) * 100) : 0;
        ?>

        <div class="rain-os-floating-scatter">
            <div class="rain-os-scatter-glass-bar">
                <div class="rain-os-scatter-y-axis">
                    <span class="rain-os-axis-label">100</span>
                    <span class="rain-os-axis-label">75</span>
                    <span class="rain-os-axis-label">50</span>
                    <span class="rain-os-axis-label">25</span>
                    <span class="rain-os-axis-label">0</span>
                </div>
                <div class="rain-os-scatter-chart-wrapper">
                    <div class="rain-os-scatter-y-title">Score</div>
                    <svg class="rain-os-scatter-chart" viewBox="0 0 700 200" preserveAspectRatio="xMidYMid meet">
                        
                        <?php for ($i = 0; $i <= 10; $i++): ?>
                            <line x1="<?php echo 20 + ($i * 66); ?>" y1="10" x2="<?php echo 20 + ($i * 66); ?>" y2="190" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <?php endfor; ?>
                        <?php for ($i = 0; $i <= 4; $i++): ?>
                            <line x1="20" y1="<?php echo 10 + ($i * 45); ?>" x2="680" y2="<?php echo 10 + ($i * 45); ?>" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <?php endfor; ?>
                        
                        <?php 
                        $chartWidth = 660;
                        $chartHeight = 180;
                        $offsetX = 20;
                        $offsetY = 10;
                        
                        foreach ($analyzed_content as $index => $content):
                            $baseX = $offsetX + (($index + 0.5) / count($analyzed_content)) * $chartWidth;
                            
                            $yReadability = $offsetY + $chartHeight - ($content['readability'] / 100 * $chartHeight);
                            $yAuthority = $offsetY + $chartHeight - ($content['authority'] / 100 * $chartHeight);
                            $yConversion = $offsetY + $chartHeight - ($content['conversion'] / 100 * $chartHeight);
                            
                            $needsWorkReadability = $content['readability'] < 60;
                            $needsWorkAuthority = $content['authority'] < 60;
                            $needsWorkConversion = $content['conversion'] < 60;
                            
                            $spreadX = 8;
                        ?>
                            <circle 
                                cx="<?php echo $baseX - $spreadX; ?>" 
                                cy="<?php echo $yReadability; ?>" 
                                r="4" 
                                fill="<?php echo $needsWorkReadability ? '#F87171' : '#3B82F6'; ?>" 
                                class="rain-os-scatter-dot"
                                data-title="<?php echo htmlspecialchars($content['title']); ?>"
                                data-score="<?php echo $content['readability']; ?>"
                                data-pillar="AI Readability"
                            />
                            <circle 
                                cx="<?php echo $baseX; ?>" 
                                cy="<?php echo $yAuthority; ?>" 
                                r="4" 
                                fill="<?php echo $needsWorkAuthority ? '#F87171' : '#10B981'; ?>" 
                                class="rain-os-scatter-dot"
                                data-title="<?php echo htmlspecialchars($content['title']); ?>"
                                data-score="<?php echo $content['authority']; ?>"
                                data-pillar="Digital Authority"
                            />
                            <circle 
                                cx="<?php echo $baseX + $spreadX; ?>" 
                                cy="<?php echo $yConversion; ?>" 
                                r="4" 
                                fill="<?php echo $needsWorkConversion ? '#F87171' : '#A855F7'; ?>" 
                                class="rain-os-scatter-dot"
                                data-title="<?php echo htmlspecialchars($content['title']); ?>"
                                data-score="<?php echo $content['conversion']; ?>"
                                data-pillar="Conversion"
                            />
                        <?php endforeach; ?>
                    </svg>
                    <div class="rain-os-scatter-x-axis">
                        <?php 
                        $dates = array_column($analyzed_content, 'date');
                        $firstDate = end($dates);
                        $lastDate = reset($dates);
                        ?>
                        <span class="rain-os-axis-label"><?php echo date('M j', strtotime($firstDate)); ?></span>
                        <span class="rain-os-axis-label"><?php echo date('M j', strtotime('+5 days', strtotime($firstDate))); ?></span>
                        <span class="rain-os-axis-label"><?php echo date('M j', strtotime('+10 days', strtotime($firstDate))); ?></span>
                        <span class="rain-os-axis-label"><?php echo date('M j', strtotime($lastDate)); ?></span>
                    </div>
                    <div class="rain-os-scatter-x-title">Content by Date</div>
                </div>
                <div class="rain-os-scatter-tooltip" id="scatterTooltip"></div>
            </div>
            <div class="rain-os-scatter-legend-bar">
                <span class="rain-os-legend-item"><span class="rain-os-legend-dot" style="background: #3B82F6;"></span> AI Readability</span>
                <span class="rain-os-legend-item"><span class="rain-os-legend-dot" style="background: #10B981;"></span> Digital Authority</span>
                <span class="rain-os-legend-item"><span class="rain-os-legend-dot" style="background: #A855F7;"></span> Conversion</span>
            </div>
        </div>

        <div class="rain-os-card rain-os-trend-card">
            <div class="rain-os-card-header">
                <h3>Performance Trends Over Time</h3>
            </div>
            <div class="rain-os-card-body">
                <div class="rain-os-trend-chart-container">
                    <div class="rain-os-trend-y-axis">
                        <span>100</span>
                        <span>75</span>
                        <span>50</span>
                        <span>25</span>
                        <span>0</span>
                    </div>
                    <div class="rain-os-trend-chart-wrapper">
                        <svg class="rain-os-trend-chart" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
                            <?php for ($i = 0; $i <= 4; $i++): ?>
                                <line x1="0" y1="<?php echo $i * 50; ?>" x2="600" y2="<?php echo $i * 50; ?>" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                            <?php endfor; ?>
                            
                            <?php
                            $count = count($trend_data);
                            if ($count > 1):
                                $step = 600 / ($count - 1);
                                
                                // Build path strings for each metric
                                $overallPath = '';
                                $readabilityPath = '';
                                $authorityPath = '';
                                $conversionPath = '';
                                
                                foreach ($trend_data as $i => $data) {
                                    $x = $i * $step;
                                    $yOverall = 200 - ($data['overall'] / 100 * 200);
                                    $yRead = 200 - ($data['readability'] / 100 * 200);
                                    $yAuth = 200 - ($data['authority'] / 100 * 200);
                                    $yConv = 200 - ($data['conversion'] / 100 * 200);
                                    
                                    $prefix = $i === 0 ? 'M' : 'L';
                                    $overallPath .= "$prefix $x $yOverall ";
                                    $readabilityPath .= "$prefix $x $yRead ";
                                    $authorityPath .= "$prefix $x $yAuth ";
                                    $conversionPath .= "$prefix $x $yConv ";
                                }
                            ?>
                            <path d="<?php echo $overallPath; ?>" fill="none" stroke="#6366F1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="<?php echo $readabilityPath; ?>" fill="none" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="<?php echo $authorityPath; ?>" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="<?php echo $conversionPath; ?>" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            
                            <?php foreach ($trend_data as $i => $data): 
                                $x = $i * $step;
                            ?>
                                <circle cx="<?php echo $x; ?>" cy="<?php echo 200 - ($data['overall'] / 100 * 200); ?>" r="5" fill="#6366F1"/>
                                <circle cx="<?php echo $x; ?>" cy="<?php echo 200 - ($data['readability'] / 100 * 200); ?>" r="4" fill="#22D3EE"/>
                                <circle cx="<?php echo $x; ?>" cy="<?php echo 200 - ($data['authority'] / 100 * 200); ?>" r="4" fill="#10B981"/>
                                <circle cx="<?php echo $x; ?>" cy="<?php echo 200 - ($data['conversion'] / 100 * 200); ?>" r="4" fill="#A855F7"/>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </svg>
                        <div class="rain-os-trend-x-axis">
                            <?php foreach ($trend_data as $data): ?>
                                <span><?php echo date('M j', strtotime($data['date'])); ?></span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
                <div class="rain-os-trend-legend">
                    <span class="rain-os-legend-item"><span class="rain-os-legend-line" style="background: #6366F1;"></span> Overall AEO</span>
                    <span class="rain-os-legend-item"><span class="rain-os-legend-line" style="background: #22D3EE;"></span> AI Readability</span>
                    <span class="rain-os-legend-item"><span class="rain-os-legend-line" style="background: #10B981;"></span> Digital Authority</span>
                    <span class="rain-os-legend-item"><span class="rain-os-legend-line" style="background: #A855F7;"></span> Conversion</span>
                </div>
            </div>
        </div>

        <div class="rain-os-analytics-grid">
            <div class="rain-os-card rain-os-averages-card">
                <div class="rain-os-card-header">
                    <h3>Average Scores</h3>
                </div>
                <div class="rain-os-card-body">
                    <div class="rain-os-averages-layout">
                        <div class="rain-os-vertical-bars">
                            <div class="rain-os-vertical-bar-item">
                                <div class="rain-os-vertical-bar-value"><?php echo $avg_overall; ?>%</div>
                                <div class="rain-os-vertical-bar-track">
                                    <div class="rain-os-vertical-bar-fill rain-os-fill-overall" style="height: <?php echo $avg_overall; ?>%;"></div>
                                </div>
                                <div class="rain-os-vertical-bar-label">Overall</div>
                            </div>
                            <div class="rain-os-vertical-bar-item">
                                <div class="rain-os-vertical-bar-value" style="color: #22D3EE;"><?php echo $avg_readability; ?>%</div>
                                <div class="rain-os-vertical-bar-track">
                                    <div class="rain-os-vertical-bar-fill" style="height: <?php echo $avg_readability; ?>%; background: linear-gradient(180deg, #22D3EE, #06B6D4);"></div>
                                </div>
                                <div class="rain-os-vertical-bar-label">Readability</div>
                            </div>
                            <div class="rain-os-vertical-bar-item">
                                <div class="rain-os-vertical-bar-value" style="color: #10B981;"><?php echo $avg_authority; ?>%</div>
                                <div class="rain-os-vertical-bar-track">
                                    <div class="rain-os-vertical-bar-fill" style="height: <?php echo $avg_authority; ?>%; background: linear-gradient(180deg, #10B981, #059669);"></div>
                                </div>
                                <div class="rain-os-vertical-bar-label">Authority</div>
                            </div>
                            <div class="rain-os-vertical-bar-item">
                                <div class="rain-os-vertical-bar-value" style="color: #A855F7;"><?php echo $avg_conversion; ?>%</div>
                                <div class="rain-os-vertical-bar-track">
                                    <div class="rain-os-vertical-bar-fill" style="height: <?php echo $avg_conversion; ?>%; background: linear-gradient(180deg, #A855F7, #9333EA);"></div>
                                </div>
                                <div class="rain-os-vertical-bar-label">Conversion</div>
                            </div>
                        </div>
                        <div class="rain-os-pie-section">
                            <div class="rain-os-pie-wrapper">
                                <?php
                                $good_angle = ($good_pct / 100) * 360;
                                $ok_angle = ($ok_pct / 100) * 360;
                                
                                function polarToCartesian($cx, $cy, $r, $angle) {
                                    $rad = ($angle - 90) * pi() / 180;
                                    return [
                                        'x' => $cx + $r * cos($rad),
                                        'y' => $cy + $r * sin($rad)
                                    ];
                                }
                                
                                function describeArc($cx, $cy, $r, $startAngle, $endAngle) {
                                    $start = polarToCartesian($cx, $cy, $r, $endAngle);
                                    $end = polarToCartesian($cx, $cy, $r, $startAngle);
                                    $largeArc = ($endAngle - $startAngle) <= 180 ? 0 : 1;
                                    return "M $cx $cy L {$start['x']} {$start['y']} A $r $r 0 $largeArc 0 {$end['x']} {$end['y']} Z";
                                }
                                ?>
                                <svg class="rain-os-pie-chart" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="rgba(255,255,255,0.1)"/>
                                    <?php if ($good_pct > 0): ?>
                                    <path d="<?php echo describeArc(50, 50, 45, 0, $good_angle); ?>" fill="#10B981"/>
                                    <?php endif; ?>
                                    <?php if ($ok_pct > 0): ?>
                                    <path d="<?php echo describeArc(50, 50, 45, $good_angle, $good_angle + $ok_angle); ?>" fill="#F59E0B"/>
                                    <?php endif; ?>
                                </svg>
                            </div>
                            <div class="rain-os-pie-legend">
                                <div class="rain-os-pie-legend-item">
                                    <span class="rain-os-pie-dot" style="background: #10B981;"></span>
                                    <span>Good</span>
                                    <span class="rain-os-pie-pct" style="color: #10B981;"><?php echo $good_pct; ?>%</span>
                                </div>
                                <div class="rain-os-pie-legend-item">
                                    <span class="rain-os-pie-dot" style="background: #F59E0B;"></span>
                                    <span>OK</span>
                                    <span class="rain-os-pie-pct" style="color: #F59E0B;"><?php echo $ok_pct; ?>%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="rain-os-card rain-os-content-table-card">
            <div class="rain-os-card-header">
                <h3>Analyzed Content</h3>
            </div>
            <div class="rain-os-card-body">
                <table class="rain-os-analytics-table">
                    <thead>
                        <tr>
                            <th>Content</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Overall</th>
                            <th>AI Readability</th>
                            <th>Digital Authority</th>
                            <th>Conversion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($analyzed_content as $content): ?>
                            <?php
                            $overallClass = $content['overall'] >= 80 ? 'good' : ($content['overall'] >= 60 ? 'ok' : 'needs-work');
                            ?>
                            <tr>
                                <td class="rain-os-content-title"><?php echo htmlspecialchars($content['title']); ?></td>
                                <td><span class="rain-os-type-badge"><?php echo htmlspecialchars($content['type']); ?></span></td>
                                <td class="rain-os-date"><?php echo date('M j', strtotime($content['date'])); ?></td>
                                <td><span class="rain-os-score-badge rain-os-score-<?php echo $overallClass; ?>"><?php echo $content['overall']; ?></span></td>
                                <td><span class="rain-os-pillar-score" style="color: #22D3EE;"><?php echo $content['readability']; ?></span></td>
                                <td><span class="rain-os-pillar-score" style="color: #10B981;"><?php echo $content['authority']; ?></span></td>
                                <td><span class="rain-os-pillar-score" style="color: #A855F7;"><?php echo $content['conversion']; ?></span></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="rain-os-footer">
        rain OS AI Readability Optimization v1.0.0 &bull; <a href="?tab=documentation">Documentation</a> &bull; <a href="mailto:support@getrainos.com">support@getrainos.com</a>
    </div>
</div>

<style>
.rain-os-analytics-filters {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.rain-os-filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.rain-os-filter-group label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.rain-os-select {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    min-width: 150px;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
}

.rain-os-select:hover {
    border-color: var(--accent-primary);
}

.rain-os-analytics-stats {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
}

.rain-os-pie-chart-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1rem 1.5rem;
}

.rain-os-pie-wrapper {
    width: 80px;
    height: 80px;
}

.rain-os-pie-chart {
    width: 100%;
    height: 100%;
}

.rain-os-pie-legend {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.rain-os-pie-legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.rain-os-pie-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.rain-os-pie-pct {
    font-weight: 700;
    margin-left: 0.25rem;
}

.rain-os-stat-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
}

.rain-os-stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
}

.rain-os-stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.rain-os-stat-good .rain-os-stat-value { color: #10B981; }
.rain-os-stat-ok .rain-os-stat-value { color: #F59E0B; }
.rain-os-stat-needs-work .rain-os-stat-value { color: #F87171; }

.rain-os-trend-card {
    margin-bottom: 2rem;
}

.rain-os-trend-chart-container {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
}

.rain-os-trend-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    min-width: 30px;
    text-align: right;
    padding: 0 0.5rem;
}

.rain-os-trend-chart-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.rain-os-trend-chart {
    width: 100%;
    height: 200px;
}

.rain-os-trend-x-axis {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    padding-top: 0.5rem;
}

.rain-os-trend-legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
    margin-top: 1rem;
}

.rain-os-legend-line {
    display: inline-block;
    width: 20px;
    height: 3px;
    border-radius: 2px;
    vertical-align: middle;
    margin-right: 0.5rem;
}

.rain-os-floating-scatter {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.rain-os-scatter-glass-bar {
    position: relative;
    width: 100%;
    max-width: 900px;
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 
        0 4px 30px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    display: flex;
    gap: 0.5rem;
}

.rain-os-scatter-y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.5rem 0;
    min-width: 30px;
    text-align: right;
}

.rain-os-scatter-chart-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
}

.rain-os-scatter-y-title {
    position: absolute;
    left: -45px;
    top: 50%;
    transform: rotate(-90deg) translateX(-50%);
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
}

.rain-os-scatter-x-axis {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem 0;
}

.rain-os-scatter-x-title {
    text-align: center;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.25rem;
}

.rain-os-axis-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
}

.rain-os-scatter-chart {
    width: 100%;
    height: auto;
    display: block;
}

.rain-os-scatter-dot {
    cursor: pointer;
    transition: all 0.2s ease;
}

.rain-os-scatter-dot:hover {
    r: 6;
}

.rain-os-scatter-tooltip {
    position: absolute;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    color: var(--text-primary);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 100;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.rain-os-scatter-tooltip.visible {
    opacity: 1;
}

.rain-os-scatter-legend-bar {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.rain-os-legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.rain-os-legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.rain-os-analytics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.rain-os-averages-card .rain-os-card-body {
    padding: 1.5rem;
}

.rain-os-averages-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3rem;
}

.rain-os-vertical-bars {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 2rem;
    padding: 1rem 0;
}

.rain-os-pie-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-left: 2rem;
    border-left: 1px solid var(--glass-border);
}

.rain-os-vertical-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    max-width: 80px;
}

.rain-os-vertical-bar-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.rain-os-vertical-bar-track {
    width: 100%;
    height: 140px;
    background: rgba(255,255,255,0.08);
    border-radius: 6px;
    position: relative;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
}

.rain-os-vertical-bar-fill {
    width: 100%;
    border-radius: 6px;
    transition: height 0.5s ease;
    position: relative;
}

.rain-os-vertical-bar-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 40%;
    background: linear-gradient(90deg, rgba(255,255,255,0.15) 0%, transparent 100%);
    border-radius: 6px 0 0 6px;
}

.rain-os-vertical-bar-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.rain-os-fill-overall {
    background: linear-gradient(180deg, #6366F1, #8B5CF6);
}

.rain-os-content-table-card {
    overflow: hidden;
}

.rain-os-analytics-table {
    width: 100%;
    border-collapse: collapse;
}

.rain-os-analytics-table th,
.rain-os-analytics-table td {
    padding: 0.875rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--glass-border);
}

.rain-os-analytics-table th {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    font-weight: 600;
}

.rain-os-analytics-table tbody tr:hover {
    background: rgba(255,255,255,0.02);
}

.rain-os-content-title {
    font-weight: 500;
    color: var(--text-primary);
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.rain-os-type-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.rain-os-date {
    color: var(--text-muted);
    font-size: 0.875rem;
}

.rain-os-score-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 40px;
    text-align: center;
}

.rain-os-score-good {
    background: rgba(16, 185, 129, 0.15);
    color: #10B981;
}

.rain-os-score-ok {
    background: rgba(245, 158, 11, 0.15);
    color: #F59E0B;
}

.rain-os-score-needs-work {
    background: rgba(248, 113, 113, 0.15);
    color: #F87171;
}

.rain-os-pillar-score {
    font-weight: 500;
}

@media (max-width: 900px) {
    .rain-os-analytics-grid {
        grid-template-columns: 1fr;
    }
    
    .rain-os-analytics-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var dots = document.querySelectorAll('.rain-os-scatter-dot');
    var tooltip = document.getElementById('scatterTooltip');
    var container = document.querySelector('.rain-os-scatter-container');
    
    dots.forEach(function(dot) {
        dot.addEventListener('mouseenter', function(e) {
            var title = this.getAttribute('data-title');
            var score = this.getAttribute('data-score');
            var pillar = this.getAttribute('data-pillar');
            
            tooltip.innerHTML = '<strong>' + title + '</strong><br>' + pillar + ': ' + score + '%';
            tooltip.classList.add('visible');
        });
        
        dot.addEventListener('mousemove', function(e) {
            var rect = container.getBoundingClientRect();
            var x = e.clientX - rect.left + 10;
            var y = e.clientY - rect.top - 40;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        });
        
        dot.addEventListener('mouseleave', function() {
            tooltip.classList.remove('visible');
        });
    });
});
</script>
