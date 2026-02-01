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
                <span class="rain-os-badge"><?php esc_html_e( 'AI Readability', 'rain-os-ai-readability-optimizer' ); ?></span>
            </div>
            <div class="rain-os-header-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-readability-dashboard' ) ); ?>" class="rain-os-btn rain-os-btn-secondary">
                    <span class="dashicons dashicons-arrow-left-alt"></span>
                    <?php esc_html_e( 'Go to Dashboard', 'rain-os-ai-readability-optimizer' ); ?>
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <header class="rain-os-page-header rain-os-center">
            <h1><?php esc_html_e( 'Learn About AI Readability', 'rain-os-ai-readability-optimizer' ); ?></h1>
            <p><?php esc_html_e( 'Understand how AI systems read and interpret your content', 'rain-os-ai-readability-optimizer' ); ?></p>
        </header>

        <div class="rain-os-learn-grid">
            <div class="rain-os-learn-card">
                <div class="rain-os-learn-card-icon">
                    <span class="dashicons dashicons-welcome-learn-more"></span>
                </div>
                <h3><?php esc_html_e( 'What is AI Readability?', 'rain-os-ai-readability-optimizer' ); ?></h3>
                <p><?php esc_html_e( 'AI Readability is a measure of how easily artificial intelligence systems can understand, parse, and extract meaning from your content. It goes beyond traditional readability scores to evaluate semantic clarity, logical structure, and machine interpretability.', 'rain-os-ai-readability-optimizer' ); ?></p>
            </div>

            <div class="rain-os-learn-card">
                <div class="rain-os-learn-card-icon rain-os-icon-green">
                    <span class="dashicons dashicons-chart-line"></span>
                </div>
                <h3><?php esc_html_e( 'Why Does It Matter?', 'rain-os-ai-readability-optimizer' ); ?></h3>
                <p><?php esc_html_e( 'As AI-powered search engines and answer engines become the primary way users find information, your content must be optimized for machine understanding. Content that AI cannot parse will not appear in AI-generated answers, regardless of its quality or SEO ranking.', 'rain-os-ai-readability-optimizer' ); ?></p>
            </div>

            <div class="rain-os-learn-card rain-os-learn-card-full">
                <h3><?php esc_html_e( 'The Three Pillars Explained', 'rain-os-ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-pillars-grid">
                    <div class="rain-os-pillar-card rain-os-pillar-cyan">
                        <div class="rain-os-pillar-indicator"></div>
                        <h4><?php esc_html_e( 'AI Readability', 'rain-os-ai-readability-optimizer' ); ?></h4>
                        <p><?php esc_html_e( 'Measures semantic clarity, logical structure, and readability. Determines whether AI can understand what you are saying.', 'rain-os-ai-readability-optimizer' ); ?></p>
                        <ul>
                            <li><?php esc_html_e( 'Semantic Clarity', 'rain-os-ai-readability-optimizer' ); ?></li>
                            <li><?php esc_html_e( 'Readability Score', 'rain-os-ai-readability-optimizer' ); ?></li>
                            <li><?php esc_html_e( 'Logical Structure', 'rain-os-ai-readability-optimizer' ); ?></li>
                        </ul>
                    </div>
                    <div class="rain-os-pillar-card rain-os-pillar-green">
                        <div class="rain-os-pillar-indicator"></div>
                        <h4><?php esc_html_e( 'Digital Authority', 'rain-os-ai-readability-optimizer' ); ?></h4>
                        <p><?php esc_html_e( 'Evaluates credibility, trust signals, and citation readiness. Determines whether AI should trust and cite your content.', 'rain-os-ai-readability-optimizer' ); ?></p>
                        <ul>
                            <li><?php esc_html_e( 'Entity Recognition', 'rain-os-ai-readability-optimizer' ); ?></li>
                            <li><?php esc_html_e( 'Citation Readiness', 'rain-os-ai-readability-optimizer' ); ?></li>
                            <li><?php esc_html_e( 'Schema Extraction', 'rain-os-ai-readability-optimizer' ); ?></li>
                        </ul>
                    </div>
                    <div class="rain-os-pillar-card rain-os-pillar-purple">
                        <div class="rain-os-pillar-indicator"></div>
                        <h4><?php esc_html_e( 'Conversion Readiness', 'rain-os-ai-readability-optimizer' ); ?></h4>
                        <p><?php esc_html_e( 'Assesses engagement potential and action-driving effectiveness. Determines whether your content drives user action.', 'rain-os-ai-readability-optimizer' ); ?></p>
                        <ul>
                            <li><?php esc_html_e( 'AI Alignment', 'rain-os-ai-readability-optimizer' ); ?></li>
                            <li><?php esc_html_e( 'QA-Format', 'rain-os-ai-readability-optimizer' ); ?></li>
                            <li><?php esc_html_e( 'Metadata Audit', 'rain-os-ai-readability-optimizer' ); ?></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="rain-os-learn-card rain-os-learn-card-full">
                <h3><?php esc_html_e( 'How AI Reads Your Content', 'rain-os-ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-process-steps">
                    <div class="rain-os-process-step">
                        <div class="rain-os-step-number">1</div>
                        <div class="rain-os-step-content">
                            <h4><?php esc_html_e( 'Parsing', 'rain-os-ai-readability-optimizer' ); ?></h4>
                            <p><?php esc_html_e( 'AI breaks your content into tokens and identifies sentence structure, headings, and formatting elements.', 'rain-os-ai-readability-optimizer' ); ?></p>
                        </div>
                    </div>
                    <div class="rain-os-process-step">
                        <div class="rain-os-step-number">2</div>
                        <div class="rain-os-step-content">
                            <h4><?php esc_html_e( 'Understanding', 'rain-os-ai-readability-optimizer' ); ?></h4>
                            <p><?php esc_html_e( 'AI analyzes semantic meaning, identifies entities, and maps relationships between concepts.', 'rain-os-ai-readability-optimizer' ); ?></p>
                        </div>
                    </div>
                    <div class="rain-os-process-step">
                        <div class="rain-os-step-number">3</div>
                        <div class="rain-os-step-content">
                            <h4><?php esc_html_e( 'Extraction', 'rain-os-ai-readability-optimizer' ); ?></h4>
                            <p><?php esc_html_e( 'AI extracts key facts, answers, and quotable content that can be used in responses and citations.', 'rain-os-ai-readability-optimizer' ); ?></p>
                        </div>
                    </div>
                    <div class="rain-os-process-step">
                        <div class="rain-os-step-number">4</div>
                        <div class="rain-os-step-content">
                            <h4><?php esc_html_e( 'Ranking', 'rain-os-ai-readability-optimizer' ); ?></h4>
                            <p><?php esc_html_e( 'AI ranks your content against alternatives based on clarity, authority, and relevance to user queries.', 'rain-os-ai-readability-optimizer' ); ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="rain-os-learn-card rain-os-learn-card-full rain-os-learn-card-highlight">
                <h3><?php esc_html_e( 'AI Readability vs. Answer Engine Optimization', 'rain-os-ai-readability-optimizer' ); ?></h3>
                <div class="rain-os-concept-callout">
                    <p class="rain-os-callout-quote"><?php esc_html_e( 'You cannot optimize for answers if AI cannot first understand what you are saying. AI Readability is the premise. AEO is the thesis.', 'rain-os-ai-readability-optimizer' ); ?></p>
                </div>
                
                <h4><?php esc_html_e( 'The Translator vs. Interpreter Analogy', 'rain-os-ai-readability-optimizer' ); ?></h4>
                <div class="rain-os-analogy-grid">
                    <div class="rain-os-analogy-card rain-os-analogy-cyan">
                        <strong><?php esc_html_e( 'AI Readability = The Interpreter', 'rain-os-ai-readability-optimizer' ); ?></strong>
                        <p><?php esc_html_e( 'Ensures AI can understand what you are saying in the first place. If your content is unclear or poorly structured, AI cannot interpret it—making you invisible.', 'rain-os-ai-readability-optimizer' ); ?></p>
                    </div>
                    <div class="rain-os-analogy-card rain-os-analogy-purple">
                        <strong><?php esc_html_e( 'AEO = The Translator', 'rain-os-ai-readability-optimizer' ); ?></strong>
                        <p><?php esc_html_e( 'Comes after understanding. AI summarizes your ideas, reformats them as answers, and potentially cites your content. Translation cannot happen without interpretation.', 'rain-os-ai-readability-optimizer' ); ?></p>
                    </div>
                </div>

                <h4><?php esc_html_e( 'The AI Processing Sequence', 'rain-os-ai-readability-optimizer' ); ?></h4>
                <div class="rain-os-sequence-steps">
                    <div class="rain-os-sequence-step">
                        <div class="rain-os-seq-number">1</div>
                        <div class="rain-os-seq-title"><?php esc_html_e( 'Interpretation', 'rain-os-ai-readability-optimizer' ); ?></div>
                        <div class="rain-os-seq-desc"><?php esc_html_e( 'AI determines if it understands your content', 'rain-os-ai-readability-optimizer' ); ?></div>
                    </div>
                    <div class="rain-os-sequence-step">
                        <div class="rain-os-seq-number">2</div>
                        <div class="rain-os-seq-title"><?php esc_html_e( 'Meaning Mapping', 'rain-os-ai-readability-optimizer' ); ?></div>
                        <div class="rain-os-seq-desc"><?php esc_html_e( 'AI converts language into structured representations', 'rain-os-ai-readability-optimizer' ); ?></div>
                    </div>
                    <div class="rain-os-sequence-step">
                        <div class="rain-os-seq-number">3</div>
                        <div class="rain-os-seq-title"><?php esc_html_e( 'Answer Generation', 'rain-os-ai-readability-optimizer' ); ?></div>
                        <div class="rain-os-seq-desc"><?php esc_html_e( 'AI summarizes and delivers answers—possibly citing you', 'rain-os-ai-readability-optimizer' ); ?></div>
                    </div>
                </div>

                <h4><?php esc_html_e( 'The Core Distinction', 'rain-os-ai-readability-optimizer' ); ?></h4>
                <div class="rain-os-distinction-grid">
                    <div class="rain-os-distinction-card rain-os-distinction-cyan">
                        <div class="rain-os-dist-label"><?php esc_html_e( 'AI Readability asks:', 'rain-os-ai-readability-optimizer' ); ?></div>
                        <div class="rain-os-dist-question"><?php esc_html_e( 'Can an AI understand this content?', 'rain-os-ai-readability-optimizer' ); ?></div>
                        <div class="rain-os-dist-note"><?php esc_html_e( 'Determines eligibility', 'rain-os-ai-readability-optimizer' ); ?></div>
                    </div>
                    <div class="rain-os-distinction-card rain-os-distinction-purple">
                        <div class="rain-os-dist-label"><?php esc_html_e( 'AEO asks:', 'rain-os-ai-readability-optimizer' ); ?></div>
                        <div class="rain-os-dist-question"><?php esc_html_e( 'Can this understood content be selected as the best answer?', 'rain-os-ai-readability-optimizer' ); ?></div>
                        <div class="rain-os-dist-note"><?php esc_html_e( 'Determines selection', 'rain-os-ai-readability-optimizer' ); ?></div>
                    </div>
                </div>

                <h4><?php esc_html_e( 'A Layered System', 'rain-os-ai-readability-optimizer' ); ?></h4>
                <p class="rain-os-system-intro"><?php esc_html_e( 'These are not competing strategies—they are sequential:', 'rain-os-ai-readability-optimizer' ); ?></p>
                <div class="rain-os-layer-flow">
                    <span class="rain-os-layer rain-os-layer-seo"><?php esc_html_e( 'SEO helps AI find your content', 'rain-os-ai-readability-optimizer' ); ?></span>
                    <span class="rain-os-layer-arrow">→</span>
                    <span class="rain-os-layer rain-os-layer-air"><?php esc_html_e( 'AI Readability ensures AI understands it', 'rain-os-ai-readability-optimizer' ); ?></span>
                    <span class="rain-os-layer-arrow">→</span>
                    <span class="rain-os-layer rain-os-layer-aeo"><?php esc_html_e( 'AEO determines if it becomes the answer', 'rain-os-ai-readability-optimizer' ); ?></span>
                </div>

                <div class="rain-os-warning-box">
                    <strong><?php esc_html_e( 'Why This Matters', 'rain-os-ai-readability-optimizer' ); ?></strong>
                    <p><?php esc_html_e( 'If you are not being interpreted, you are not being paraphrased. If you are not being paraphrased, you are not being mentioned. If you are not being mentioned, you do not exist in AI-generated answers. AI Readability is not optional—it is the cost of being understood.', 'rain-os-ai-readability-optimizer' ); ?></p>
                </div>
            </div>
        </div>
    </div>
</div>
