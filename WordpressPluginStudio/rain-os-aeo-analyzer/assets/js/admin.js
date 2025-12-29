(function($) {
    'use strict';

    var RainOSAdmin = {
        init: function() {
            this.bindEvents();
            this.initEditor();
            this.initSearch();
            this.initNotifications();
            this.initLocalAudit();
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
                    } else {
                        $results.html('<div class="rain-os-error">' + (response.data.message || rainOsAeo.i18n.error) + '</div>');
                    }
                },
                error: function() {
                    $results.html('<div class="rain-os-error">' + rainOsAeo.i18n.error + '</div>');
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
            
            if (data.pillars) {
                html += this.renderPillarScore('AI Readability', data.pillars.ai_readability || 0, 'cyan');
                html += this.renderPillarScore('Digital Authority', data.pillars.digital_authority || 0, 'green');
                html += this.renderPillarScore('Conversion Readiness', data.pillars.conversion_readiness || 0, 'purple');
            }

            html += '</div>';

            if (data.recommendations && data.recommendations.length) {
                html += '<div class="rain-os-recommendations">';
                html += '<h4>Recommendations</h4>';
                html += '<ul>';
                $.each(data.recommendations, function(i, rec) {
                    html += '<li>' + rec + '</li>';
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
            var $results = $('#rain-os-search-results');
            var timeout;

            $search.on('input', function() {
                var query = $(this).val();
                clearTimeout(timeout);

                if (query.length < 2) {
                    $results.hide().empty();
                    return;
                }

                timeout = setTimeout(function() {
                    self.performSearch(query);
                }, 300);
            });

            $(document).on('click', function(e) {
                if (!$(e.target).closest('.rain-os-search-wrap').length) {
                    $results.hide();
                }
            });
        },

        performSearch: function(query) {
            var $results = $('#rain-os-search-results');

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_search_posts',
                    nonce: rainOsAeo.nonce,
                    query: query
                },
                success: function(response) {
                    if (response.success && response.data.posts.length) {
                        var html = '';
                        $.each(response.data.posts, function(i, post) {
                            html += '<div class="rain-os-search-item" data-id="' + post.post_id + '">';
                            html += '<div class="rain-os-search-title">' + post.post_title + '</div>';
                            html += '<div class="rain-os-search-score">Score: ' + post.overall_score + '</div>';
                            html += '</div>';
                        });
                        $results.html(html).show();
                    } else {
                        $results.html('<div class="rain-os-search-empty">No results found</div>').show();
                    }
                }
            });
        },

        initNotifications: function() {
            var self = this;
            var $btn = $('#rain-os-notifications-btn');
            var $dropdown = $('#rain-os-notifications-dropdown');
            var $badge = $('#rain-os-notification-badge');

            $btn.on('click', function(e) {
                e.stopPropagation();
                if ($dropdown.is(':visible')) {
                    $dropdown.hide();
                } else {
                    self.loadNotifications();
                    $dropdown.show();
                }
            });

            $(document).on('click', function(e) {
                if (!$(e.target).closest('.rain-os-notifications-wrap').length) {
                    $dropdown.hide();
                }
            });

            $(document).on('click', '.rain-os-notification-item', function() {
                var id = $(this).data('id');
                self.markNotificationRead(id);
            });
        },

        loadNotifications: function() {
            var $dropdown = $('#rain-os-notifications-dropdown');
            var $badge = $('#rain-os-notification-badge');

            $.ajax({
                url: rainOsAeo.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_get_notifications',
                    nonce: rainOsAeo.nonce
                },
                success: function(response) {
                    if (response.success) {
                        var notifications = response.data.notifications;
                        var unread = notifications.filter(function(n) { return !n.read; }).length;
                        
                        if (unread > 0) {
                            $badge.text(unread).show();
                        } else {
                            $badge.hide();
                        }

                        var html = '<div class="rain-os-notifications-header">Notifications</div>';
                        if (notifications.length) {
                            $.each(notifications, function(i, n) {
                                html += '<div class="rain-os-notification-item' + (n.read ? '' : ' unread') + '" data-id="' + n.id + '">';
                                html += '<div class="rain-os-notification-text">' + n.text + '</div>';
                                html += '<div class="rain-os-notification-time">' + n.time + '</div>';
                                html += '</div>';
                            });
                        } else {
                            html += '<div class="rain-os-notifications-empty">No notifications</div>';
                        }
                        $dropdown.html(html);
                    }
                }
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
        }
    };

    $(document).ready(function() {
        RainOSAdmin.init();
    });

    $(document).on('ajaxComplete', function() {
        $('.spin').parent().find('.spin').removeClass('spin');
    });

})(jQuery);
