<?php
$sections = [
    'getting-started' => 'Getting Started',
    'what-is-aeo' => 'What is Answer Engine Optimization?',
    'five-pillars' => 'Understanding the Five Pillars',
    'improve-scores' => 'How to Improve Your Scores',
    'using-plugin' => 'Using the Plugin',
    'api-setup' => 'API Configuration',
    'troubleshooting' => 'Troubleshooting',
    'faq' => 'FAQ'
];

$current_section = isset($_GET['section']) ? htmlspecialchars($_GET['section']) : 'getting-started';
?>

<div class="rain-os-wrap">
    <div class="rain-os-header">
        <div class="rain-os-header-content">
            <div class="rain-os-logo">
                <span class="rain-os-title"><span class="rain-white">r</span><span class="rain-blue">ai</span><span class="rain-white">n</span></span>
                <span class="rain-os-badge">Documentation</span>
            </div>
            <div class="rain-os-header-actions">
                <a href="?tab=dashboard" class="rain-os-btn rain-os-btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Dashboard
                </a>
            </div>
        </div>
    </div>

    <div class="rain-os-content">
        <div class="rain-os-docs-layout">
            <aside class="rain-os-docs-sidebar">
                <nav class="rain-os-docs-nav">
                    <?php foreach ($sections as $key => $label): ?>
                    <a href="?tab=documentation&section=<?php echo $key; ?>" class="rain-os-docs-nav-item <?php echo $current_section === $key ? 'active' : ''; ?>">
                        <?php echo htmlspecialchars($label); ?>
                    </a>
                    <?php endforeach; ?>
                </nav>
            </aside>

            <main class="rain-os-docs-content">
                <?php if ($current_section === 'getting-started'): ?>
                <div class="rain-os-docs-section">
                    <h1>Getting Started with rain OS</h1>
                    <p class="rain-os-docs-intro">Welcome to rain OS! This guide will help you connect your plugin to your rain OS account and start optimizing your content for AI-powered search engines.</p>
                    
                    <div class="rain-os-docs-card">
                        <h2>Quick Setup (2 Minutes)</h2>
                        <ol class="rain-os-docs-steps">
                            <li>
                                <strong>Sign Up or Log In</strong>
                                <p>Visit <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a> to create your account or log in to your existing account.</p>
                            </li>
                            <li>
                                <strong>Copy Your API Key</strong>
                                <p>In your rain OS dashboard, find your API key and click the copy button to copy it to your clipboard.</p>
                            </li>
                            <li>
                                <strong>Open Plugin Settings</strong>
                                <p>In your WordPress admin, go to rain OS in the sidebar, then click Settings.</p>
                            </li>
                            <li>
                                <strong>Paste Your API Key</strong>
                                <p>Paste your API key into the API Key field and click Save Settings. That's it!</p>
                            </li>
                        </ol>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>What's Next?</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">Once connected, you can start analyzing your content right away:</p>
                        <ul class="rain-os-docs-list">
                            <li>View your overall content health score on the Dashboard</li>
                            <li>Analyze individual posts and pages using the AEO Analysis panel in the editor</li>
                            <li>Follow the personalized recommendations to improve your scores</li>
                            <li>Track your progress over time as you optimize your content</li>
                        </ul>
                    </div>
                </div>

                <?php elseif ($current_section === 'what-is-aeo'): ?>
                <div class="rain-os-docs-section">
                    <h1>What is Answer Engine Optimization?</h1>
                    <p class="rain-os-docs-intro">Answer Engine Optimization (AEO) is the practice of optimizing your content so that AI-powered systems can easily understand, trust, and recommend your information to their users.</p>

                    <div class="rain-os-docs-card">
                        <h2>The Rise of AI-Powered Search</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">The way people find information is changing rapidly. Instead of scrolling through pages of search results, users now ask AI assistants direct questions and expect immediate, accurate answers.</p>
                        <ul class="rain-os-docs-list">
                            <li><strong>ChatGPT & AI Assistants:</strong> Millions of users ask AI chatbots for recommendations, explanations, and advice every day</li>
                            <li><strong>Google AI Overviews:</strong> Search engines now provide AI-generated summaries at the top of results</li>
                            <li><strong>Voice Assistants:</strong> Siri, Alexa, and Google Assistant read answers aloud from trusted sources</li>
                            <li><strong>Perplexity & AI Search:</strong> New search engines are built entirely around AI-generated answers</li>
                        </ul>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Why AEO Matters</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">When AI systems answer questions, they cite sources. If your content is optimized for AI readability, you become one of those cited sources.</p>
                        <ul class="rain-os-docs-list">
                            <li><strong>Get Cited by AI:</strong> Well-structured content gets quoted and linked by AI systems</li>
                            <li><strong>Reach New Audiences:</strong> Users who never visit traditional search results can discover your content</li>
                            <li><strong>Build Authority:</strong> Being cited by AI systems builds trust and credibility</li>
                            <li><strong>Future-Proof Your Content:</strong> As AI search grows, AEO-optimized content will outperform traditional SEO</li>
                        </ul>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>AEO vs Traditional SEO</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">AEO builds on SEO principles but focuses on what AI systems need to understand and trust your content:</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                            <div style="background: rgba(34, 211, 238, 0.1); padding: 16px; border-radius: 8px; border-left: 3px solid #22D3EE;">
                                <h4 style="color: #22D3EE; margin: 0 0 8px 0;">Traditional SEO</h4>
                                <p style="color: #94A3B8; margin: 0; font-size: 13px;">Focuses on keywords, backlinks, and ranking in search result pages</p>
                            </div>
                            <div style="background: rgba(168, 85, 247, 0.1); padding: 16px; border-radius: 8px; border-left: 3px solid #A855F7;">
                                <h4 style="color: #A855F7; margin: 0 0 8px 0;">Answer Engine Optimization</h4>
                                <p style="color: #94A3B8; margin: 0; font-size: 13px;">Focuses on clarity, structure, and making content easy for AI to cite</p>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>How rain OS Helps</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">rain OS analyzes your content across five key pillars and provides actionable recommendations to improve your AI visibility:</p>
                        <ul class="rain-os-docs-list">
                            <li><strong>AI Readability:</strong> Can AI models parse and understand your content?</li>
                            <li><strong>Digital Authority:</strong> Is your content credible and trustworthy?</li>
                            <li><strong>Conversion Readiness:</strong> Is your content structured to provide direct answers?</li>
                            <li><strong>Product Discoverability:</strong> Can AI search and recommendation systems surface your product or service?</li>
                            <li><strong>RAG Readiness:</strong> Is your content structured for AI retrieval and vector database search?</li>
                        </ul>
                        <p style="color: #94A3B8; margin-top: 16px;"><a href="?tab=documentation&section=five-pillars" style="color: #22D3EE;">Learn more about the Five Pillars →</a></p>
                    </div>
                </div>

                <?php elseif ($current_section === 'five-pillars'): ?>
                <div class="rain-os-docs-section">
                    <h1>Understanding the Five Pillars</h1>
                    <p class="rain-os-docs-intro">rain OS analyzes your content based on five key pillars that determine how well AI systems can understand, trust, extract, and retrieve information from your content.</p>

                    <div class="rain-os-docs-pillar" style="--pillar-color: #22D3EE;">
                        <div class="rain-os-docs-pillar-header">
                            <div class="rain-os-docs-pillar-icon">
                                <img src="rain-logo.png" alt="rain logo" width="24" height="24" style="object-fit: contain;">
                            </div>
                            <h2>Pillar 1: AI Readability</h2>
                        </div>
                        <p>Can AI models parse and understand your content?</p>
                        <div class="rain-os-docs-subcategories">
                            <div class="rain-os-docs-subcategory">
                                <h4>Semantic Clarity</h4>
                                <p>Measures language precision and the use of unambiguous terms. Clear, specific language helps AI understand your intent.</p>
                            </div>
                            <div class="rain-os-docs-subcategory">
                                <h4>Logical Structure</h4>
                                <p>Evaluates heading hierarchy and section flow. Well-structured content with proper H1-H6 usage helps AI navigate your content.</p>
                            </div>
                            <div class="rain-os-docs-subcategory">
                                <h4>Readability</h4>
                                <p>Analyzes sentence flow and complexity. Content that's easy for humans to read is also easier for AI to process.</p>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-docs-pillar" style="--pillar-color: #10B981;">
                        <div class="rain-os-docs-pillar-header">
                            <div class="rain-os-docs-pillar-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <h2>Pillar 2: Digital Authority</h2>
                        </div>
                        <p>Is your content credible and trustworthy?</p>
                        <div class="rain-os-docs-subcategories">
                            <div class="rain-os-docs-subcategory">
                                <h4>Descriptive Metadata</h4>
                                <p>Checks for proper schema markup, alt tags, and semantic HTML. Rich metadata helps AI understand context.</p>
                            </div>
                            <div class="rain-os-docs-subcategory">
                                <h4>Entity Recognition</h4>
                                <p>Evaluates knowledge graph linking for key entities. Connecting to established entities builds trust.</p>
                            </div>
                            <div class="rain-os-docs-subcategory">
                                <h4>Citation Readiness</h4>
                                <p>Measures quotable snippets and extractable facts. Content that's easy to cite gets referenced more often.</p>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-docs-pillar" style="--pillar-color: #A855F7;">
                        <div class="rain-os-docs-pillar-header">
                            <div class="rain-os-docs-pillar-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <path d="M22 4L12 14.01l-3-3"/>
                                </svg>
                            </div>
                            <h2>Pillar 3: Conversion Readiness</h2>
                        </div>
                        <p>Is your content structured to provide answers?</p>
                        <div class="rain-os-docs-subcategories">
                            <div class="rain-os-docs-subcategory">
                                <h4>AEO Alignment</h4>
                                <p>Evaluates direct conversational answers suitable for voice and chat interfaces.</p>
                            </div>
                            <div class="rain-os-docs-subcategory">
                                <h4>Schema Extraction</h4>
                                <p>Detects FAQ schema, How-to schema, and other structured data that AI can easily extract.</p>
                            </div>
                            <div class="rain-os-docs-subcategory">
                                <h4>QA-Format Detection</h4>
                                <p>Measures question and answer formatting quality. Clear Q&A format helps AI provide direct answers.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <?php elseif ($current_section === 'improve-scores'): ?>
                <div class="rain-os-docs-section">
                    <h1>How to Improve Your Scores</h1>
                    <p class="rain-os-docs-intro">Practical strategies to boost your AI Readability, Digital Authority, and Conversion Readiness scores.</p>

                    <div class="rain-os-docs-card" style="border-left: 3px solid #22D3EE;">
                        <h2 style="color: #22D3EE;">Improving AI Readability</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">Help AI systems understand your content more clearly:</p>
                        <ul class="rain-os-docs-list">
                            <li><strong>Use Clear Headings:</strong> Structure content with H2 and H3 headings that describe each section</li>
                            <li><strong>Write Shorter Sentences:</strong> Aim for 15-20 words per sentence for optimal clarity</li>
                            <li><strong>Avoid Jargon:</strong> Use simple, specific language that AI can easily interpret</li>
                            <li><strong>Use Active Voice:</strong> "We recommend" instead of "It is recommended that"</li>
                            <li><strong>Break Up Long Paragraphs:</strong> Keep paragraphs to 3-4 sentences maximum</li>
                            <li><strong>Add Transition Words:</strong> Help AI understand relationships between ideas</li>
                        </ul>
                    </div>

                    <div class="rain-os-docs-card" style="border-left: 3px solid #10B981;">
                        <h2 style="color: #10B981;">Improving Digital Authority</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">Build trust and credibility for AI systems:</p>
                        <ul class="rain-os-docs-list">
                            <li><strong>Add Schema Markup:</strong> Use structured data to help AI understand your content type</li>
                            <li><strong>Include Image Alt Text:</strong> Describe images so AI knows what they show</li>
                            <li><strong>Cite Sources:</strong> Link to authoritative references and data sources</li>
                            <li><strong>Add Author Information:</strong> Include author bios with credentials</li>
                            <li><strong>Use Semantic HTML:</strong> Proper tags like &lt;article&gt;, &lt;section&gt;, &lt;aside&gt;</li>
                            <li><strong>Update Regularly:</strong> Fresh content signals ongoing relevance</li>
                        </ul>
                    </div>

                    <div class="rain-os-docs-card" style="border-left: 3px solid #A855F7;">
                        <h2 style="color: #A855F7;">Improving Conversion Readiness</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">Structure content for direct answers:</p>
                        <ul class="rain-os-docs-list">
                            <li><strong>Answer Questions Directly:</strong> Start with the answer, then provide details</li>
                            <li><strong>Use FAQ Sections:</strong> Add question-and-answer blocks that AI can extract</li>
                            <li><strong>Create How-To Content:</strong> Step-by-step instructions are easily cited</li>
                            <li><strong>Include Key Facts:</strong> Numbers, dates, and statistics are quotable</li>
                            <li><strong>Write Concise Summaries:</strong> Add TL;DR sections for quick extraction</li>
                            <li><strong>Use Bullet Points:</strong> Lists are easier for AI to parse and quote</li>
                        </ul>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Quick Wins Checklist</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">Start with these high-impact improvements:</p>
                        <ol class="rain-os-docs-steps">
                            <li>
                                <strong>Add a Clear Title Question</strong>
                                <p>Frame your title as a question users might ask AI assistants.</p>
                            </li>
                            <li>
                                <strong>Write a Summary Paragraph</strong>
                                <p>Add a 2-3 sentence summary at the top of your content.</p>
                            </li>
                            <li>
                                <strong>Create an FAQ Section</strong>
                                <p>Add 3-5 common questions with direct answers at the end.</p>
                            </li>
                            <li>
                                <strong>Check Your Headings</strong>
                                <p>Ensure each section has a descriptive H2 or H3 heading.</p>
                            </li>
                            <li>
                                <strong>Add Alt Text to Images</strong>
                                <p>Describe what each image shows in 10-15 words.</p>
                            </li>
                        </ol>
                    </div>
                </div>

                <?php elseif ($current_section === 'using-plugin'): ?>
                <div class="rain-os-docs-section">
                    <h1>Using the Plugin</h1>
                    <p class="rain-os-docs-intro">Learn how to analyze your content and improve your AEO scores.</p>

                    <div class="rain-os-docs-card">
                        <h2>Analyzing Your Content</h2>
                        <ol class="rain-os-docs-steps">
                            <li>
                                <strong>Open Any Post or Page</strong>
                                <p>In WordPress, go to Posts or Pages and click on the content you want to analyze.</p>
                            </li>
                            <li>
                                <strong>Find the AEO Analysis Panel</strong>
                                <p>Look for the rain OS panel in your editor sidebar or below the content area.</p>
                            </li>
                            <li>
                                <strong>Select Your Industry</strong>
                                <p>Choose the industry that best matches your content for more relevant recommendations.</p>
                            </li>
                            <li>
                                <strong>Click "Analyze Content"</strong>
                                <p>The plugin will analyze your content and show you detailed scores for each pillar.</p>
                            </li>
                        </ol>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Understanding Your Scores</h2>
                        <div class="rain-os-docs-score-guide">
                            <div class="rain-os-docs-score-item excellent">
                                <span class="rain-os-docs-score-range">90-100</span>
                                <span class="rain-os-docs-score-label">Excellent</span>
                                <p>Your content is highly optimized for AI engines.</p>
                            </div>
                            <div class="rain-os-docs-score-item good">
                                <span class="rain-os-docs-score-range">70-89</span>
                                <span class="rain-os-docs-score-label">Good</span>
                                <p>Your content performs well with room for improvement.</p>
                            </div>
                            <div class="rain-os-docs-score-item fair">
                                <span class="rain-os-docs-score-range">50-69</span>
                                <span class="rain-os-docs-score-label">Fair</span>
                                <p>Consider implementing the suggested improvements.</p>
                            </div>
                            <div class="rain-os-docs-score-item needs-work">
                                <span class="rain-os-docs-score-range">0-49</span>
                                <span class="rain-os-docs-score-label">Needs Work</span>
                                <p>Follow the recommendations to boost your AI visibility.</p>
                            </div>
                        </div>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Improving Your Scores</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">Each analysis comes with specific recommendations. Here are some general tips:</p>
                        <ul class="rain-os-docs-list">
                            <li><strong>Use clear headings:</strong> Break your content into logical sections with H2 and H3 headings</li>
                            <li><strong>Write concise sentences:</strong> Keep sentences under 20 words when possible</li>
                            <li><strong>Answer questions directly:</strong> Start paragraphs with direct answers, then add details</li>
                            <li><strong>Add structured data:</strong> Use FAQ blocks and clear question-answer formats</li>
                            <li><strong>Include relevant keywords:</strong> Add tags that describe your content's main topics</li>
                        </ul>
                    </div>
                </div>

                <?php elseif ($current_section === 'api-setup'): ?>
                <div class="rain-os-docs-section">
                    <h1>API Configuration</h1>
                    <p class="rain-os-docs-intro">Connect your rain OS account to start analyzing your content.</p>

                    <div class="rain-os-docs-card">
                        <h2>Finding Your API Key</h2>
                        <ol class="rain-os-docs-steps">
                            <li>
                                <strong>Go to Your Dashboard</strong>
                                <p>Visit <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a> and log in to your account.</p>
                            </li>
                            <li>
                                <strong>Find Your API Key</strong>
                                <p>Your API key is displayed on your dashboard. It looks like a long string of letters and numbers.</p>
                            </li>
                            <li>
                                <strong>Copy the Key</strong>
                                <p>Click the copy button next to your API key to copy it to your clipboard.</p>
                            </li>
                        </ol>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Connecting the Plugin</h2>
                        <ol class="rain-os-docs-steps">
                            <li>
                                <strong>Open Settings</strong>
                                <p>In WordPress, click on rain OS in the sidebar, then click Settings.</p>
                            </li>
                            <li>
                                <strong>Paste Your API Key</strong>
                                <p>Click in the API Key field and paste your key (Ctrl+V on Windows, Cmd+V on Mac).</p>
                            </li>
                            <li>
                                <strong>Test Connection</strong>
                                <p>Click the "Test Connection" button to make sure everything is working.</p>
                            </li>
                            <li>
                                <strong>Save Settings</strong>
                                <p>Click "Save Settings" to save your configuration. You're all set!</p>
                            </li>
                        </ol>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Connection Status</h2>
                        <p style="color: #94A3B8; margin-bottom: 16px;">You can check your connection status at any time:</p>
                        <ul class="rain-os-docs-list">
                            <li><strong style="color: #10B981;">Green indicator:</strong> Your plugin is connected and ready to analyze content</li>
                            <li><strong style="color: #EF4444;">Red indicator:</strong> There's a connection issue - check your API key</li>
                            <li><strong style="color: #F59E0B;">Yellow indicator:</strong> Connection is being verified</li>
                        </ul>
                    </div>
                </div>

                <?php elseif ($current_section === 'troubleshooting'): ?>
                <div class="rain-os-docs-section">
                    <h1>Troubleshooting</h1>
                    <p class="rain-os-docs-intro">Having issues? Here are solutions to common problems.</p>

                    <div class="rain-os-docs-card">
                        <h2>Connection Problems</h2>
                        <div class="rain-os-docs-trouble-item">
                            <h4>"API Connection Failed" Error</h4>
                            <p><strong>What to do:</strong> Double-check that you copied your entire API key from <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a>. Make sure there are no extra spaces before or after the key.</p>
                        </div>
                        <div class="rain-os-docs-trouble-item">
                            <h4>"Request Timeout" Error</h4>
                            <p><strong>What to do:</strong> This usually means a temporary network issue. Wait a moment and try again. If it keeps happening, check your internet connection.</p>
                        </div>
                        <div class="rain-os-docs-trouble-item">
                            <h4>Connection Shows Red</h4>
                            <p><strong>What to do:</strong> Your API key may have expired or been regenerated. Log in to <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a>, copy a fresh API key, and paste it in Settings.</p>
                        </div>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Analysis Issues</h2>
                        <div class="rain-os-docs-trouble-item">
                            <h4>Analysis Button Not Working</h4>
                            <p><strong>What to do:</strong> Make sure your content has at least 100 words. Very short content may not have enough text to analyze.</p>
                        </div>
                        <div class="rain-os-docs-trouble-item">
                            <h4>"Quota Exceeded" Message</h4>
                            <p><strong>What to do:</strong> You've used all your analyses for this period. Check your usage on <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a> or upgrade your plan for more.</p>
                        </div>
                        <div class="rain-os-docs-trouble-item">
                            <h4>Scores Seem Lower Than Expected</h4>
                            <p><strong>What to do:</strong> This is normal! AEO scoring is different from traditional SEO. Check the specific recommendations in each pillar to see what you can improve.</p>
                        </div>
                    </div>

                    <div class="rain-os-docs-card">
                        <h2>Still Need Help?</h2>
                        <p style="color: #94A3B8;">If you're still experiencing issues, contact our support team at <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a>. We're here to help!</p>
                    </div>
                </div>

                <?php elseif ($current_section === 'faq'): ?>
                <div class="rain-os-docs-section">
                    <h1>Frequently Asked Questions</h1>
                    <p class="rain-os-docs-intro">Answers to common questions about rain OS.</p>

                    <div class="rain-os-docs-faq">
                        <div class="rain-os-docs-faq-item">
                            <h3>What is Answer Engine Optimization (AEO)?</h3>
                            <p>AEO is the practice of optimizing your content so that AI-powered tools like ChatGPT, Google's AI Overview, and voice assistants can easily understand and share your information with their users.</p>
                        </div>

                        <div class="rain-os-docs-faq-item">
                            <h3>How is AEO different from SEO?</h3>
                            <p>Traditional SEO helps you rank higher in search results. AEO goes further by making your content easy for AI to understand, cite, and recommend as direct answers to user questions.</p>
                        </div>

                        <div class="rain-os-docs-faq-item">
                            <h3>How do I get my API key?</h3>
                            <p>Sign up or log in at <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a>. Your API key is displayed on your dashboard - just copy and paste it into the plugin settings.</p>
                        </div>

                        <div class="rain-os-docs-faq-item">
                            <h3>How many analyses can I run?</h3>
                            <p>The number of analyses depends on your subscription plan. You can see your usage and remaining analyses on your dashboard at <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a>.</p>
                        </div>

                        <div class="rain-os-docs-faq-item">
                            <h3>Does rain OS work with the block editor (Gutenberg)?</h3>
                            <p>Yes! rain OS works with both the classic editor and the Gutenberg block editor. The analysis panel appears in your editor sidebar.</p>
                        </div>

                        <div class="rain-os-docs-faq-item">
                            <h3>Can I analyze pages as well as posts?</h3>
                            <p>Absolutely! You can analyze any post, page, or custom post type on your WordPress site.</p>
                        </div>

                        <div class="rain-os-docs-faq-item">
                            <h3>Is my content stored anywhere?</h3>
                            <p>Your content is sent securely to our servers for analysis only. We don't store your content after the analysis is complete.</p>
                        </div>

                        <div class="rain-os-docs-faq-item">
                            <h3>What should I do if my API key isn't working?</h3>
                            <p>First, make sure you copied the entire key without any extra spaces. If it still doesn't work, try generating a new key from your dashboard at <a href="https://app.getrainos.com" target="_blank" style="color: #22D3EE;">app.getrainos.com</a>.</p>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </main>
        </div>

        <div class="rain-os-footer">
            rain OS AI Readability Optimization v1.0.0 &bull; <a href="?tab=documentation">Documentation</a> &bull; <a href="mailto:support@getrainos.com">support@getrainos.com</a>
        </div>
    </div>
</div>
