/**
 * rain OS SEO Analyzer - Preview JavaScript
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initTabs();
        initPasswordToggle();
        initProTabs();
        initDrilldown();
        initCopyButtons();
    });

    function initTabs() {
        var tabButtons = document.querySelectorAll('.rain-os-tab-btn');
        
        tabButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tabId = this.getAttribute('data-tab');
                
                document.querySelectorAll('.rain-os-tab-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                document.querySelectorAll('.rain-os-tab-panel').forEach(function(panel) {
                    panel.classList.remove('active');
                });
                document.getElementById('tab-' + tabId).classList.add('active');
            });
        });
    }

    function initPasswordToggle() {
        var toggleBtns = document.querySelectorAll('.rain-os-toggle-password');
        
        toggleBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var input = this.parentElement.querySelector('input');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.add('active');
                } else {
                    input.type = 'password';
                    this.classList.remove('active');
                }
            });
        });
    }

    function initProTabs() {
        var proTabButtons = document.querySelectorAll('.rain-os-pro-tab');
        
        proTabButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tabId = this.getAttribute('data-tab');
                
                document.querySelectorAll('.rain-os-pro-tab').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                document.querySelectorAll('.rain-os-pro-tab-content').forEach(function(panel) {
                    panel.classList.remove('active');
                });
                var targetPanel = document.getElementById('tab-' + tabId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    function initDrilldown() {
        var subscoreItems = document.querySelectorAll('.rain-os-subscore-item');
        var drawer = document.getElementById('drilldown-drawer');
        var closeBtn = drawer ? drawer.querySelector('.rain-os-drilldown-close') : null;

        var drilldownData = {
            'semantic-clarity': {
                title: 'Semantic Clarity',
                score: 92,
                scoreClass: 'good',
                why: 'Semantic clarity measures how precisely and unambiguously your content communicates its message. High semantic clarity helps AI systems accurately understand and represent your content in search results.',
                recommendations: [
                    'Use specific, concrete language instead of vague terms',
                    'Define technical terms when first introduced',
                    'Ensure pronouns have clear antecedents',
                    'Avoid ambiguous phrases that could be misinterpreted'
                ]
            },
            'logical-structure': {
                title: 'Logical Structure',
                score: 85,
                scoreClass: 'good',
                why: 'Logical structure evaluates how well your content is organized. A clear hierarchy of headings and logical flow helps both readers and AI systems navigate and understand your content.',
                recommendations: [
                    'Use proper heading hierarchy (H1 > H2 > H3)',
                    'Group related content under appropriate headings',
                    'Use transition sentences between sections',
                    'Ensure each section has a clear purpose'
                ]
            },
            'readability': {
                title: 'Readability',
                score: 87,
                scoreClass: 'good',
                why: 'Readability measures how easy your content is to read and understand. Content with high readability is more likely to be quoted by AI systems and engage readers.',
                recommendations: [
                    'Keep sentences concise (under 25 words)',
                    'Use active voice when possible',
                    'Break up long paragraphs',
                    'Use bullet points for lists'
                ]
            },
            'entity-recognition': {
                title: 'Entity Recognition',
                score: 75,
                scoreClass: 'ok',
                why: 'Entity recognition measures how well your content identifies and connects to known entities (people, places, concepts). This helps AI systems understand context.',
                recommendations: [
                    'Link to authoritative sources',
                    'Mention full names on first reference',
                    'Include structured data markup',
                    'Reference established concepts explicitly'
                ]
            },
            'citation-readiness': {
                title: 'Citation Readiness',
                score: 77,
                scoreClass: 'ok',
                why: 'Citation readiness evaluates how quotable your content is. AI systems prefer to cite clear, definitive statements that can stand alone.',
                recommendations: [
                    'Include clear, quotable statements',
                    'Use definitions and statistics',
                    'Avoid hedging language',
                    'Provide concrete examples'
                ]
            },
            'aeo-alignment': {
                title: 'AEO Alignment',
                score: 86,
                scoreClass: 'good',
                why: 'AEO (Answer Engine Optimization) alignment measures how well your content is structured to provide direct answers to common questions.',
                recommendations: [
                    'Answer questions directly in the first sentence',
                    'Use question-based headings',
                    'Include FAQ sections',
                    'Provide concise, complete answers'
                ]
            }
        };

        subscoreItems.forEach(function(item) {
            item.addEventListener('click', function() {
                var subscoreId = this.getAttribute('data-subscore');
                var data = drilldownData[subscoreId];
                
                if (data && drawer) {
                    drawer.querySelector('.rain-os-drilldown-title').textContent = data.title;
                    var valueEl = drawer.querySelector('.rain-os-drilldown-value');
                    valueEl.textContent = data.score;
                    valueEl.className = 'rain-os-drilldown-value ' + data.scoreClass;
                    
                    var contentEl = drawer.querySelector('.rain-os-drilldown-content');
                    var recHtml = data.recommendations.map(function(r) { return '<li>' + r + '</li>'; }).join('');
                    contentEl.innerHTML = '<h6>Why This Matters</h6><p>' + data.why + '</p><h6>Recommendations</h6><ul>' + recHtml + '</ul>';
                    
                    drawer.classList.add('open');
                }
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                drawer.classList.remove('open');
            });
        }

        document.addEventListener('click', function(e) {
            if (drawer && drawer.classList.contains('open') && 
                !drawer.contains(e.target) && 
                !e.target.closest('.rain-os-subscore-item')) {
                drawer.classList.remove('open');
            }
        });
    }

    function initCopyButtons() {
        var copyBtns = document.querySelectorAll('.rain-os-copy-btn, .rain-os-action-btn[title="Copy"]');
        
        copyBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var textToCopy = '';
                
                var hashEl = this.closest('.rain-os-provenance-value-wrap');
                if (hashEl) {
                    textToCopy = hashEl.querySelector('.rain-os-provenance-hash').textContent;
                }
                
                var suggestionEl = this.closest('.rain-os-suggestion-item');
                if (suggestionEl) {
                    textToCopy = suggestionEl.querySelector('.rain-os-suggestion-text').textContent;
                }
                
                if (textToCopy) {
                    navigator.clipboard.writeText(textToCopy).then(function() {
                        btn.style.color = '#10B981';
                        setTimeout(function() {
                            btn.style.color = '';
                        }, 1500);
                    });
                }
            });
        });

        var applyBtns = document.querySelectorAll('.rain-os-action-btn[title="Apply title"]');
        applyBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var suggestionEl = this.closest('.rain-os-suggestion-item');
                if (suggestionEl) {
                    var newTitle = suggestionEl.querySelector('.rain-os-suggestion-text').textContent;
                    var titleInput = document.querySelector('.rain-os-editor-title');
                    if (titleInput) {
                        titleInput.value = newTitle;
                        btn.style.color = '#10B981';
                        setTimeout(function() {
                            btn.style.color = '';
                        }, 1500);
                    }
                }
            });
        });
    }
})();
