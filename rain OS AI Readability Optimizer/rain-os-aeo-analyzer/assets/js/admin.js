(function($) {
    'use strict';

    var RainOSAdmin = {
        currentContentId: null,

        init: function() {
            this.bindEvents();
            this.initEditor();
            this.initSearch();
            this.initNotifications();
            this.initLocalAudit();
            this.initAIBackend();
            this.initModeToggle();
        },

        initModeToggle: function() {
            var modeBtns = document.querySelectorAll('.rain-os-mode-btn');
            var urlArea = document.getElementById('rain-os-url-input-area');
            var pasteArea = document.getElementById('rain-os-content-editor');

            modeBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    modeBtns.forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');

                    var mode = btn.dataset.mode;
                    if (mode === 'url') {
                        if (urlArea) urlArea.style.display = 'block';
                        if (pasteArea) pasteArea.style.display = 'none';
                    } else {
                        if (urlArea) urlArea.style.display = 'none';
                        if (pasteArea) pasteArea.style.display = 'block';
                    }
                });
            });
        },

        bindEvents: function() {
            $(document).on('click', '#rain-os-analyze-btn', this.analyzeContent.bind(this));
            $(document).on('click', '#rain-os-clear-btn', this.clearEditor.bind(this));
            $(document).on('click', '.rain-os-toolbar-btn', this.handleToolbarClick.bind(this));
            $(document).on('click', '#toggle-heatmap', this.toggleHeatmap.bind(this));
            $(document).on('click', '.rain-os-quick-tool', this.handleQuickTool.bind(this));
            $(document).on('change', '#rain-os-period', this.handlePeriodChange.bind(this));
            $(document).on('input', '#rain-os-content-editor', this.updateWordCount.bind(this));
            $(document).on('input', '#rain-os-content-editor, #rain-os-content-title', this.runLocalAudit.bind(this));
            $(document).on('click', '#rain-os-normalize-btn', this.normalizeContent.bind(this));
            $(document).on('click', '#rain-os-reanalyze-btn', this.reanalyzeContent.bind(this));
        },

        initEditor: function() {
            var $editor = $('#rain-os-content-editor');
            if ($editor.length) {
                this.updateWordCount();
                this.runLocalAudit();
            }
        },

        handleToolbarClick: function(e) {
            e.preventDefault();
            var $btn = $(e.currentTarget);
            var command = $btn.data('command');
            var value = $btn.data('value') || null;

            if (command === 'formatBlock' && value) {
                document.execCommand(command, false, '<' + value + '>');
            } else if (command === 'createLink') {
                var url = prompt(rainOsAeo.i18n.linkPrompt || 'Enter URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, value);
            }

            $('#rain-os-content-editor').focus();
        },

        toggleHeatmap: function(e) {
            e.preventDefault();
            var $btn = $(e.currentTarget);
            var $editor = $('#rain-os-content-editor');
            var $legend = $('.rain-os-heatmap-legend');

            if ($btn.hasClass('active')) {
                $btn.removeClass('active');
                $legend.hide();
                this.removeHeatmap($editor);
            } else {
                $btn.addClass('active');
                $legend.show();
                this.applyHeatmap($editor);
            }
        },

        applyHeatmap: function($editor) {
            var content = $editor.html();
            var keywords = {
                cyan: ['semantic', 'readability', 'clarity', 'structure', 'heading', 'paragraph', 'AI', 'machine learning', 'natural language'],
                green: ['authority', 'credibility', 'trust', 'citation', 'source', 'expert', 'research', 'data', 'study'],
                purple: ['conversion', 'action', 'CTA', 'engage', 'click', 'subscribe', 'buy', 'download', 'sign up'],
                yellow: ['claim', 'according to', 'research shows', 'studies indicate', 'evidence']
            };

            $.each(keywords, function(color, words) {
                $.each(words, function(i, word) {
                    var regex = new RegExp('\\b(' + word + ')\\b', 'gi');
                    var className = 'rain-os-highlight-' + color;
                    content = content.replace(regex, '<span class="' + className + '">$1</span>');
                });
            });

            $editor.html(content);
        },

        removeHeatmap: function($editor) {
            var content = $editor.html();
            content = content.replace(/<span class="rain-os-highlight-\w+">(.*?)<\/span>/gi, '$1');
            $editor.html(content);
        },

        updateWordCount: function() {
            var $editor = $('#rain-os-content-editor');
            var text = $editor.text().trim();
            var wordCount = text ? text.split(/\s+/).length : 0;
            $('.rain-os-word-count').text(wordCount + ' ' + (rainOsAeo.i18n.words || 'words'));
        },

        runLocalAudit: function() {
            var $title = $('#rain-os-content-title');
            var $editor = $('#rain-os-content-editor');
            var title = $title.val().trim();
            var content = $editor.html();
            var text = $editor.text().trim();
            var wordCount = text ? text.split(/\s+/).length : 0;

            this.setAuditStatus('title', title.length > 0);
            this.setAuditStatus('length', wordCount >= 300);
            this.setAuditStatus('headings', /<h[1-6]/i.test(content));
            this.setAuditStatus('links', /<a\s/i.test(content));
            this.setAuditStatus('lists', /<(ul|ol)/i.test(content));
            this.setAuditStatus('paragraphs', (content.match(/<\/p>/gi) || []).length >= 3);
        },

        setAuditStatus: function(check, passed) {
            var $item = $('[data-check="' + check + '"]');
            $item.removeClass('pass fail').addClass(passed ? 'pass' : 'fail');
        },

        analyzeContent: function(e) {
            e.preventDefault();
            var self = this;
            var $btn = $(e.currentTarget);
            var activeMode = document.querySelector('.rain-os-mode-btn.active');
            
            // Handle URL scan mode
            if (activeMode && activeMode.dataset.mode === 'url') {
                this.scanUrl($btn);
                return;
            }

            // Handle paste content mode
            var $editor = $('#rain-os-content-editor');
            var $title = $('#rain-os-content-title');
            var $results = $('#rain-os-analysis-results');

            var content = $editor.html();
            var title = $title.val();

            if (!content.trim()) {
                alert(rainOsAeo.i18n.contentRequired || 'Please enter content to analyze.');
                return;
            }

            $btn.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> ' + rainOsAeo.i18n.analyzing);

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_analyze_content',
                    nonce: rainOsAeo.nonce,
                    content: content,
                    title: title
                },
                success: function(response) {
                    if (response.success) {
                        self.displayResults(response.data);
                        if (response.data.recommendations) {
                            self.displayRecommendations(response.data.recommendations);
                        }
                        if (response.data.ai_scores) {
                            self.displayAIScores(response.data.ai_scores);
                        }
                        if (response.data.crawler_signals) {
                            self.displayCrawlerSignals(response.data.crawler_signals);
                        }
                    } else {
                        $results.html('<div class="rain-os-error">' + (response.data.message || rainOsAeo.i18n.error) + '</div>');
                    }
                },
                error: function(response) {
                    var message = rainOsAeo.i18n.error;
                    if (response && response.responseJSON && response.responseJSON.data) {
                        var data = response.responseJSON.data;
                        if (data.code === 'content_too_short') {
                            message = data.message || 'Content is too short to analyze. Please add more content.';
                        } else if (data.message) {
                            message = data.message;
                        }
                    }
                    $results.html('<div class="rain-os-error">' + message + '</div>');
                },
                complete: function() {
                    $btn.prop('disabled', false).html('<span class="dashicons dashicons-search"></span> Analyze Content');
                }
            });
        },

        displayResults: function(data) {
            var html = '<div class="rain-os-results-content">';
            
            html += '<div class="rain-os-result-score">';
            html += '<div class="rain-os-score-big">' + (data.overall_score || 0) + '</div>';
            html += '<div class="rain-os-score-label">Overall Score</div>';
            html += '</div>';

            html += '<div class="rain-os-result-pillars">';
            
            var pdEnabled = (rainOsAeo.pdEnabled !== false && rainOsAeo.pdEnabled !== 'false');
            if (data.pillars) {
                html += this.renderPillarScore('AI Readability', data.pillars.ai_readability || 0, 'cyan');
                html += this.renderPillarScore('Digital Authority', data.pillars.digital_authority || 0, 'green');
                html += this.renderPillarScore('Conversion Readiness', data.pillars.conversion_readiness || 0, 'purple');
                if (pdEnabled) {
                    html += this.renderPillarScore('Product Discoverability', data.pillars.product_discoverability || 0, 'orange');
                }
            }

            html += '</div>';

            var visibleRecs = (data.recommendations || []).filter(function(rec) {
                if (pdEnabled) return true;
                var p = typeof rec === 'object' ? (rec.pillar || '') : '';
                return p !== 'product_discoverability';
            });
            if (visibleRecs.length) {
                html += '<div class="rain-os-recommendations">';
                html += '<h4>Recommendations</h4>';
                html += '<ul>';
                $.each(visibleRecs, function(i, rec) {
                    if (typeof rec === 'string') {
                        html += '<li>' + rec + '</li>';
                    } else {
                        html += '<li><strong>' + (rec.title || '') + '</strong>';
                        if (rec.description) html += ' — ' + rec.description;
                        if (rec.pillar && pdEnabled) html += ' <span class="rain-os-rec-pillar">[' + rec.pillar.replace(/_/g, ' ') + ']</span>';
                        html += '</li>';
                    }
                });
                html += '</ul>';
                html += '</div>';
            }

            html += '</div>';
            $('#rain-os-analysis-results').html(html);
        },

        renderPillarScore: function(name, score, color) {
            var html = '<div class="rain-os-pillar-result">';
            html += '<div class="rain-os-pillar-name">' + name + '</div>';
            html += '<div class="rain-os-pillar-bar-result">';
            html += '<div class="rain-os-pillar-fill-result rain-os-pillar-' + color + '" style="width:' + score + '%;"></div>';
            html += '</div>';
            html += '<div class="rain-os-pillar-score-result">' + score + '</div>';
            html += '</div>';
            return html;
        },

        scanUrl: function($btn) {
            var self = this;
            var urlInput = document.getElementById('rain-os-scan-url');
            var url = urlInput ? urlInput.value.trim() : '';
            if (!url || url === 'http://' || url === 'https://') {
                alert(rainOsAeo.i18n.urlRequired || 'Please enter a URL to scan.');
                return;
            }
            var industry = $('#rain_os_industry').length ? $('#rain_os_industry').val() : '';
            var postId = rainOsAeo.postId || 0;

            $btn.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> ' + (rainOsAeo.i18n.scanning || 'Scanning URL…'));

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_scan_url',
                    nonce: rainOsAeo.nonce,
                    url: url,
                    industry: industry,
                    post_id: postId,
                },
                success: function(response) {
                    $btn.prop('disabled', false).html('<span class="dashicons dashicons-search"></span> ' + (rainOsAeo.i18n.analyze || 'Analyze Content'));
                    if (response.success && response.data) {
                        var event = new CustomEvent('rain_os:analysisComplete', { detail: response.data });
                        document.dispatchEvent(event);
                    } else {
                        var msg = (response.data && response.data.message) ? response.data.message : 'URL scan failed.';
                        alert(msg);
                    }
                },
                error: function() {
                    $btn.prop('disabled', false).html('<span class="dashicons dashicons-search"></span> ' + (rainOsAeo.i18n.analyze || 'Analyze Content'));
                    alert('Network error during URL scan. Please try again.');
                }
            });
        },

        clearEditor: function(e) {
            e.preventDefault();
            $('#rain-os-content-title').val('');
            $('#rain-os-content-editor').html('');
            $('#rain-os-analysis-results').html('<div class="rain-os-no-results"><span class="dashicons dashicons-analytics"></span><p>Click "Analyze Content" to see your AEO scores</p></div>');
            this.updateWordCount();
            this.runLocalAudit();
        },

        handleQuickTool: function(e) {
            e.preventDefault();
            var $btn = $(e.currentTarget);
            var tool = $btn.data('tool');
            var content = $('#rain-os-content-editor').html();

            if (!content.trim()) {
                alert('Please enter content first.');
                return;
            }

            $btn.prop('disabled', true);

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_quick_tool',
                    nonce: rainOsAeo.nonce,
                    tool: tool,
                    content: content
                },
                success: function(response) {
                    if (response.success && response.data.result) {
                        alert(response.data.result);
                    } else {
                        alert(response.data.message || 'Tool execution failed.');
                    }
                },
                error: function() {
                    alert('An error occurred.');
                },
                complete: function() {
                    $btn.prop('disabled', false);
                }
            });
        },

        initSearch: function() {
            var self = this;
            var $search = $('#rain-os-search');
            var $table = $('.rain-os-table');
            var timeout;

            $search.on('input', function() {
                var query = $(this).val().toLowerCase();
                clearTimeout(timeout);

                timeout = setTimeout(function() {
                    if (query.length < 2) {
                        $table.find('tbody tr').show();
                        return;
                    }
                    $table.find('tbody tr').each(function() {
                        var title = $(this).find('.rain-os-post-title').text().toLowerCase();
                        var slug = $(this).find('.rain-os-post-slug').text().toLowerCase();
                        if (title.indexOf(query) > -1 || slug.indexOf(query) > -1) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                }, 200);
            });
        },

        initNotifications: function() {
            var $btn = $('#rain-os-notifications-btn');
            var $dropdown = $('#rain-os-notification-dropdown');
            var $badge = $('#rain-os-notification-count');
            var $list = $('#rain-os-notification-list');
            var $markAll = $('#rain-os-mark-all-read');

            var notifications = [
                { id: 1, type: 'success', icon: '\u2713', text: 'Content health improved by 5% this week', time: '2 hours ago', read: false },
                { id: 2, type: 'warning', icon: '\u26A0', text: 'API usage at 47% of monthly quota', time: '1 day ago', read: false },
                { id: 3, type: 'info', icon: '\u2139', text: '3 posts need re-analysis after updates', time: '3 days ago', read: true }
            ];

            function renderNotifications() {
                var html = '';
                var unread = 0;
                $.each(notifications, function(i, n) {
                    if (!n.read) unread++;
                    html += '<div class="rain-os-notification-item' + (n.read ? '' : ' rain-os-unread') + '" data-id="' + n.id + '">';
                    html += '<div class="rain-os-notification-icon rain-os-type-' + n.type + '">' + n.icon + '</div>';
                    html += '<div class="rain-os-notification-body">';
                    html += '<p>' + n.text + '</p>';
                    html += '<span>' + n.time + '</span>';
                    html += '</div></div>';
                });
                $list.html(html);
                if (unread > 0) {
                    $badge.text(unread).show();
                } else {
                    $badge.hide();
                }
            }

            renderNotifications();

            $btn.on('click', function(e) {
                e.stopPropagation();
                $dropdown.toggleClass('rain-os-open');
            });

            $(document).on('click', function(e) {
                if (!$(e.target).closest('.rain-os-notifications').length) {
                    $dropdown.removeClass('rain-os-open');
                }
            });

            $list.on('click', '.rain-os-notification-item', function() {
                var id = parseInt($(this).data('id'));
                $.each(notifications, function(i, n) {
                    if (n.id === id) n.read = true;
                });
                renderNotifications();
            });

            $markAll.on('click', function() {
                $.each(notifications, function(i, n) { n.read = true; });
                renderNotifications();
            });
        },

        markNotificationRead: function(id) {
            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_mark_notification_read',
                    nonce: rainOsAeo.nonce,
                    notification_id: id
                },
                success: function() {
                    $('[data-id="' + id + '"]').removeClass('unread');
                }
            });
        },

        handlePeriodChange: function(e) {
            var period = $(e.target).val();
            var url = new URL(window.location.href);
            url.searchParams.set('period', period);
            window.location.href = url.toString();
        },

        initAIBackend: function() {
            var self = this;
            var $status = $('#rain-os-ai-backend-status');
            
            if (!$status.length) {
                return;
            }

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_check_ai_backend',
                    nonce: rainOsAeo.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.updateBackendStatus(response.data.available, response.data.enabled);
                    } else {
                        self.updateBackendStatus(false, false);
                    }
                },
                error: function() {
                    self.updateBackendStatus(false, false);
                }
            });
        },

        updateBackendStatus: function(available, enabled) {
            var $status = $('#rain-os-ai-backend-status');
            var $dot = $status.find('.rain-os-status-dot');
            var $text = $status.find('.rain-os-status-text');

            $dot.removeClass('rain-os-status-checking rain-os-status-connected rain-os-status-offline rain-os-status-disabled');

            if (!enabled) {
                $dot.addClass('rain-os-status-disabled');
                $text.text('Disabled in Settings');
            } else if (available) {
                $dot.addClass('rain-os-status-connected');
                $text.text('Connected');
            } else {
                $dot.addClass('rain-os-status-offline');
                $text.text('Offline');
            }
        },

        normalizeContent: function(e) {
            e.preventDefault();
            var self = this;
            var $btn = $(e.currentTarget);
            var $editor = $('#rain-os-content-editor');
            var html = $editor.html();
            var text = $editor.text();

            if (!html.trim()) {
                alert('Please enter content first.');
                return;
            }

            $btn.prop('disabled', true);
            $btn.find('.dashicons').addClass('spin');

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_normalize_content',
                    nonce: rainOsAeo.nonce,
                    content_id: self.currentContentId || '',
                    html: html,
                    text: text
                },
                success: function(response) {
                    if (response.success) {
                        self.currentContentId = response.data.content_id;
                        self.showNormalizeSuccess(response.data.message);
                        setTimeout(function() {
                            self.fetchAIScores(self.currentContentId);
                        }, 2000);
                    } else {
                        self.showNormalizeError(response.data.message);
                    }
                },
                error: function() {
                    self.showNormalizeError('Failed to send content for normalization.');
                },
                complete: function() {
                    $btn.prop('disabled', false);
                    $btn.find('.dashicons').removeClass('spin');
                }
            });
        },

        showNormalizeSuccess: function(message) {
            var $wrap = $('.rain-os-ai-normalize-wrap');
            var $msg = $wrap.find('.rain-os-normalize-message');
            
            if (!$msg.length) {
                $wrap.append('<div class="rain-os-normalize-message rain-os-normalize-success"></div>');
                $msg = $wrap.find('.rain-os-normalize-message');
            }
            
            $msg.removeClass('rain-os-normalize-error').addClass('rain-os-normalize-success').text(message).show();
            setTimeout(function() {
                $msg.fadeOut();
            }, 5000);
        },

        showNormalizeError: function(message) {
            var $wrap = $('.rain-os-ai-normalize-wrap');
            var $msg = $wrap.find('.rain-os-normalize-message');
            
            if (!$msg.length) {
                $wrap.append('<div class="rain-os-normalize-message rain-os-normalize-error"></div>');
                $msg = $wrap.find('.rain-os-normalize-message');
            }
            
            $msg.removeClass('rain-os-normalize-success').addClass('rain-os-normalize-error').text(message).show();
        },

        fetchAIScores: function(contentId) {
            var self = this;

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_get_ai_readiness_scores',
                    nonce: rainOsAeo.nonce,
                    content_id: contentId
                },
                success: function(response) {
                    if (response.success && response.data.scores) {
                        self.displayAIScores(response.data.scores);
                    }
                }
            });
        },

        displayAIScores: function(scores) {
            var scoreMap = {
                'readability': scores.readability,
                'structure': scores.structure,
                'freshness': scores.freshness,
                'citation': scores.citation,
                'visibility': scores.visibility
            };

            for (var key in scoreMap) {
                if (scoreMap.hasOwnProperty(key)) {
                    var value = scoreMap[key];
                    var $el = $('[data-score="' + key + '"]');
                    
                    if (typeof value === 'number') {
                        $el.text(value);
                        $el.removeClass('score-high score-medium score-low');
                        
                        if (value >= 80) {
                            $el.addClass('score-high');
                        } else if (value >= 60) {
                            $el.addClass('score-medium');
                        } else {
                            $el.addClass('score-low');
                        }
                    }
                }
            }
        },

        displayCrawlerSignals: function(signals) {
            if (!signals) return;
            var $container = $('#rain-os-crawler-signals');
            if (!$container.length) return;

            var statusLabel = function(val) {
                var map = { open: 'Open', restricted: 'Restricted', blocked: 'Blocked', unknown: 'Unknown',
                        present: 'Present', missing: 'Missing', partial: 'Partial', blocking: 'Blocking',
                        none: 'None', low: 'Low', medium: 'Medium', high: 'High' };
                return map[val] || val;
            };

            var html = '<div class="rain-os-crawler-grid">';
            html += '<div class="rain-os-crawler-item"><span>AI Crawler Access</span><strong>' + statusLabel(signals.ai_crawler_access) + ' (' + (signals.ai_crawler_access_score || 0) + ')</strong></div>';
            html += '<div class="rain-os-crawler-item"><span>LLMs.txt Status</span><strong>' + statusLabel(signals.llms_txt_status) + ' (' + (signals.llms_txt_permissions || 0) + ')</strong></div>';
            html += '<div class="rain-os-crawler-item"><span>Conversion Risk</span><strong>' + statusLabel(signals.crawler_conversion_risk) + ' (' + (signals.crawler_conversion_score || 0) + ')</strong></div>';
            html += '<div class="rain-os-crawler-item"><span>Schema Maturity</span><strong>' + statusLabel(signals.schema_maturity_level) + ' (' + (signals.schema_completeness || 0) + ')</strong></div>';
            html += '</div>';

            $container.html(html).show();
        },

        reanalyzeContent: function(e) {
            e.preventDefault();
            var self = this;
            var $btn = $(e.currentTarget);
            var $editor = $('#rain-os-content-editor');
            var $title = $('#rain-os-content-title');
            var $results = $('#rain-os-analysis-results');

            var content = $editor.html();
            var title = $title.val();

            if (!content.trim()) {
                alert(rainOsAeo.i18n.contentRequired || 'Please enter content to analyze.');
                return;
            }

            $btn.prop('disabled', true);
            $btn.find('.dashicons').addClass('spin');

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_analyze_content',
                    nonce: rainOsAeo.nonce,
                    content: content,
                    title: title
                },
                success: function(response) {
                    if (response.success) {
                        self.displayResults(response.data);
                        if (response.data.recommendations) {
                            self.displayRecommendations(response.data.recommendations);
                        }
                        if (response.data.ai_scores) {
                            self.displayAIScores(response.data.ai_scores);
                        }
                        if (response.data.crawler_signals) {
                            self.displayCrawlerSignals(response.data.crawler_signals);
                        }
                    } else {
                        $results.html('<div class="rain-os-error">' + (response.data.message || rainOsAeo.i18n.error) + '</div>');
                    }
                },
                error: function() {
                    $results.html('<div class="rain-os-error">' + rainOsAeo.i18n.error + '</div>');
                },
                complete: function() {
                    $btn.prop('disabled', false);
                    $btn.find('.dashicons').removeClass('spin');
                }
            });
        },

        displayRecommendations: function(recommendations) {
            var $container = $('#rain-os-recommendations');
            var pdEnabled = (rainOsAeo.pdEnabled !== false && rainOsAeo.pdEnabled !== 'false');

            // Filter out PD recommendations when PD is muted
            var filtered = (recommendations || []).filter(function(rec) {
                if (pdEnabled) return true;
                var pillar = typeof rec === 'object' ? (rec.pillar || rec.category || '') : '';
                return pillar !== 'product_discoverability';
            });

            if (!filtered.length) {
                $container.html('<p class="rain-os-no-recommendations">' + (rainOsAeo.i18n.noRecommendations || 'No recommendations at this time.') + '</p>');
                return;
            }

            var html = '';
            for (var i = 0; i < filtered.length; i++) {
                var rec = filtered[i];
                if (typeof rec === 'string') {
                    html += '<div class="rain-os-rec-item"><p>' + rec + '</p></div>';
                } else if (rec.title) {
                    var priorityClass = rec.priority === 1 ? 'critical' : rec.priority === 2 ? 'important' : 'enhancement';
                    html += '<div class="rain-os-rec-item rain-os-rec-' + priorityClass + '">';
                    html += '<div class="rain-os-rec-header">';
                    html += '<span class="rain-os-rec-title">' + rec.title + '</span>';
                    html += '<span class="rain-os-rec-pillar">' + (rec.pillar || '').replace(/_/g, ' ') + '</span>';
                    html += '</div>';
                    html += '<p class="rain-os-rec-description">' + (rec.description || '') + '</p>';
                    html += '</div>';
                } else if (rec.issue) {
                    var cat = rec.category || 'other';
                    html += '<div class="rain-os-rec-item">';
                    html += '<span class="rain-os-recommendation-issue">' + rec.issue + '</span>';
                    html += ' <span class="rain-os-recommendation-arrow">&rarr;</span> ';
                    html += '<span class="rain-os-recommendation-action">' + rec.recommendation + '</span>';
                    html += '</div>';
                }
            }

            $container.html(html);
        }
    };

    $(document).ready(function() {
        RainOSAdmin.init();
    });

    $(document).on('ajaxComplete', function() {
        $('.spin').parent().find('.spin').removeClass('spin');
    });

})(jQuery);
