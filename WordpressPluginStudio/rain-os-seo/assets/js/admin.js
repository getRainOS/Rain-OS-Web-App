/**
 * Rain OS SEO Analyzer - Admin JavaScript
 * jQuery-based interactions and AJAX integration with Pro features
 */

(function($) {
    'use strict';

    window.RainOS = window.RainOS || {};

    RainOS.currentAnalysisData = null;
    RainOS.subScoreDescriptions = {};

    RainOS.init = function() {
        this.bindEvents();
        this.initTabs();
        this.initMetaboxTabs();
        this.loadSavedResults();
    };

    RainOS.bindEvents = function() {
        $(document).on('click', '#rain-os-analyze-btn', this.analyzeContent.bind(this));
        $(document).on('click', '#rain-os-save-api', this.saveApiSettings.bind(this));
        $(document).on('click', '#rain-os-save-general', this.saveGeneralSettings.bind(this));
        $(document).on('click', '#rain-os-test-connection', this.testConnection.bind(this));
        $(document).on('click', '#rain-os-refresh-usage', this.updateUsage.bind(this));
        $(document).on('click', '#rain-os-clear-results', this.clearResults.bind(this));
        $(document).on('click', '.rain-os-toggle-password', this.togglePassword.bind(this));
        $(document).on('click', '.rain-os-alert-close', this.closeAlert.bind(this));
        
        $(document).on('click', '.rain-os-quick-tool-btn', this.handleQuickTool.bind(this));
        $(document).on('click', '#rain-os-rewrite-btn', this.handleRewrite.bind(this));
        $(document).on('click', '#rain-os-close-results', this.closeToolResults.bind(this));
        $(document).on('click', '.rain-os-copy-btn', this.copyToClipboard.bind(this));
        $(document).on('click', '.rain-os-apply-title-btn', this.applyTitle.bind(this));
        $(document).on('click', '#rain-os-copy-provenance', this.copyProvenance.bind(this));
        $(document).on('change', '#rain-os-save-provenance-toggle', this.toggleSaveProvenance.bind(this));
        $(document).on('click', '.rain-os-subscore-item', this.openSubScoreDrawer.bind(this));
        $(document).on('click', '#rain-os-close-drawer, .rain-os-drawer-overlay', this.closeSubScoreDrawer.bind(this));
    };

    RainOS.initTabs = function() {
        $(document).on('click', '.rain-os-tab-btn', function() {
            var $btn = $(this);
            var tabId = $btn.data('tab');
            
            $('.rain-os-tab-btn').removeClass('active');
            $btn.addClass('active');
            
            $('.rain-os-tab-panel').removeClass('active');
            $('#tab-' + tabId).addClass('active');
        });
    };

    RainOS.initMetaboxTabs = function() {
        $(document).on('click', '.rain-os-metabox-tab', function() {
            var $btn = $(this);
            var tabId = $btn.data('tab');
            
            $('.rain-os-metabox-tab').removeClass('active');
            $btn.addClass('active');
            
            $('.rain-os-metabox-panel').removeClass('active');
            $('#rain-os-panel-' + tabId).addClass('active');
        });
    };

    RainOS.getEditorContent = function() {
        var content = '';
        
        if (typeof wp !== 'undefined' && wp.data && wp.data.select('core/editor')) {
            var editor = wp.data.select('core/editor');
            content = editor.getEditedPostContent();
            var title = editor.getEditedPostAttribute('title');
            if (title) {
                content = title + '\n\n' + content;
            }
        } else if (typeof tinyMCE !== 'undefined' && tinyMCE.activeEditor) {
            content = tinyMCE.activeEditor.getContent({format: 'text'});
            var $title = $('#title');
            if ($title.length) {
                content = $title.val() + '\n\n' + content;
            }
        } else {
            var $content = $('#content');
            if ($content.length) {
                content = $content.val();
                var $title = $('#title');
                if ($title.length) {
                    content = $title.val() + '\n\n' + content;
                }
            }
        }
        
        content = content.replace(/<[^>]*>/g, ' ');
        content = content.replace(/\s+/g, ' ').trim();
        
        return content;
    };

    RainOS.analyzeContent = function(e) {
        e.preventDefault();
        
        var content = this.getEditorContent();
        
        if (!content || content.length < 50) {
            this.showAlert('warning', 'Content Required', rainOS.strings.noContent);
            return;
        }
        
        var industry = $('#rain-os-industry').val() || rainOS.defaultIndustry;
        var $btn = $('#rain-os-analyze-btn');
        var $analyzeText = $btn.find('.rain-os-analyze-text');
        var $analyzeIcon = $btn.find('.rain-os-analyze-icon');
        var $spinnerIcon = $btn.find('.rain-os-spinner-icon');
        
        $btn.prop('disabled', true).addClass('rain-os-loading');
        $analyzeText.text(rainOS.strings.analyzing);
        $analyzeIcon.hide();
        $spinnerIcon.show();
        
        $.ajax({
            url: rainOS.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_analyze_content',
                nonce: rainOS.nonce,
                content: content,
                industry: industry
            },
            success: function(response, textStatus, xhr) {
                if (response.success) {
                    RainOS.currentAnalysisData = response.data;
                    if (response.data.subScoreDescriptions) {
                        RainOS.subScoreDescriptions = response.data.subScoreDescriptions;
                    }
                    RainOS.displayResults(response.data);
                    RainOS.saveResults(response.data);
                    RainOS.updateUsageFromHeader(xhr);
                    RainOS.updateUsageDisplay();
                } else {
                    RainOS.showAlert('error', 'Analysis Failed', response.data.message || rainOS.strings.error);
                }
            },
            error: function(xhr) {
                var message = rainOS.strings.error;
                if (xhr.status === 401) {
                    message = 'Invalid API key. Please check your settings.';
                } else if (xhr.status === 402) {
                    message = 'Subscription inactive. Please renew your subscription.';
                } else if (xhr.status === 429) {
                    message = 'Rate limit exceeded. Please try again later.';
                } else if (xhr.status >= 500) {
                    message = 'Server error. Please try again later.';
                }
                RainOS.showAlert('error', 'Connection Error', message);
            },
            complete: function() {
                $btn.prop('disabled', false).removeClass('rain-os-loading');
                $analyzeText.text(rainOS.strings.analyze);
                $analyzeIcon.show();
                $spinnerIcon.hide();
            }
        });
    };

    RainOS.updateUsageFromHeader = function(xhr) {
        try {
            var usageInfoRaw = xhr.getResponseHeader('X-Usage-Info');
            if (usageInfoRaw) {
                var usageInfo = JSON.parse(usageInfoRaw);
                if (usageInfo && typeof usageInfo.used !== 'undefined' && typeof usageInfo.limit !== 'undefined') {
                    RainOS.updateUsageDisplay({
                        count: usageInfo.used,
                        limit: usageInfo.limit
                    });
                }
            }
        } catch (e) {
            console.log('Could not parse X-Usage-Info header');
        }
    };

    RainOS.displayResults = function(data) {
        var $results = $('#rain-os-results');
        var $placeholder = $('#rain-os-placeholder');
        
        $placeholder.hide();
        $results.show();
        
        var overallScore = data.overallScore || 0;
        $('#rain-os-overall-score').text(overallScore);
        
        var circumference = 2 * Math.PI * 35;
        var dashOffset = circumference - (circumference * overallScore / 100);
        $('#rain-os-overall-gauge').css({
            'stroke-dasharray': circumference,
            'stroke-dashoffset': dashOffset
        });
        
        var gaugeColor = this.getScoreColor(overallScore);
        $('#rain-os-overall-gauge').css('stroke', gaugeColor);

        var scoreLabel = overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Needs Work' : 'Poor';
        $('#rain-os-score-label').text(scoreLabel);
        $('#rain-os-score-message').text(this.getScoreMessage(overallScore));
        
        var $tag = $('#rain-os-score-tag');
        $tag.removeClass('success warning info');
        if (overallScore >= 80) {
            $tag.addClass('success').text('AEO Optimized');
        } else if (overallScore >= 60) {
            $tag.addClass('info').text('Partially Optimized');
        } else {
            $tag.addClass('warning').text('Needs Improvement');
        }
        
        var pillarHtml = '';
        if (data.pillarScores) {
            var pillars = [
                { key: 'aiReadability', name: 'AI Readability', colorClass: 'rain-os-progress-primary' },
                { key: 'digitalAuthority', name: 'Digital Authority', colorClass: 'rain-os-progress-success' },
                { key: 'conversionReadiness', name: 'Conversion Readiness', colorClass: 'rain-os-progress-warning' }
            ];
            
            pillars.forEach(function(pillar) {
                var score = data.pillarScores[pillar.key] || 0;
                pillarHtml += '<div class="rain-os-pillar-score-card">';
                pillarHtml += '<h5>' + pillar.name + '</h5>';
                pillarHtml += '<div class="rain-os-pillar-score-value">' + score + '</div>';
                pillarHtml += '<div class="rain-os-pillar-progress">';
                pillarHtml += '<div class="rain-os-pillar-progress-fill ' + pillar.colorClass + '" style="width: ' + score + '%"></div>';
                pillarHtml += '</div>';
                pillarHtml += '</div>';
            });
        }
        $('#rain-os-pillar-scores').html(pillarHtml);

        if (data.subScores && data.subScores.length) {
            var subScoresHtml = '';
            data.subScores.forEach(function(item) {
                var scoreClass = item.score >= 80 ? 'good' : item.score >= 60 ? 'ok' : 'needs-work';
                subScoresHtml += '<div class="rain-os-subscore-item" data-category="' + RainOS.escapeHtml(item.category) + '" data-score="' + item.score + '">';
                subScoresHtml += '<div class="rain-os-subscore-info">';
                subScoresHtml += '<span class="rain-os-subscore-name">' + RainOS.escapeHtml(item.category) + '</span>';
                subScoresHtml += '<span class="rain-os-subscore-value ' + scoreClass + '">' + item.score + '</span>';
                subScoresHtml += '</div>';
                subScoresHtml += '<div class="rain-os-subscore-bar"><div class="rain-os-subscore-fill ' + scoreClass + '" style="width: ' + item.score + '%"></div></div>';
                subScoresHtml += '</div>';
            });
            $('#rain-os-subscores-grid').html(subScoresHtml);
            $('#rain-os-subscores-section').show();
        } else {
            $('#rain-os-subscores-section').hide();
        }

        if (data.authorship) {
            $('#rain-os-authorship-hash').text(data.authorship.hash || '-');
            $('#rain-os-authorship-timestamp').text(data.authorship.timestamp || '-');
            $('#rain-os-authorship-status').text(data.authorship.status || '-');
            $('#rain-os-authorship-section').show();
        } else {
            $('#rain-os-authorship-section').hide();
        }
        
        var recommendationsHtml = '';
        if (data.recommendations && data.recommendations.length) {
            data.recommendations.forEach(function(rec) {
                recommendationsHtml += '<li>' + RainOS.escapeHtml(rec) + '</li>';
            });
        }
        $('#rain-os-recommendations .rain-os-recommendations-list').html(recommendationsHtml);
        $('#rain-os-recommendations').toggle(recommendationsHtml.length > 0);
        
        var keywordsHtml = '';
        if (data.keywords && data.keywords.length) {
            data.keywords.forEach(function(keyword) {
                keywordsHtml += '<span class="rain-os-keyword-badge">' + RainOS.escapeHtml(keyword) + '</span>';
            });
        }
        $('#rain-os-keywords .rain-os-keywords-list').html(keywordsHtml);
        $('#rain-os-keywords').toggle(keywordsHtml.length > 0);
    };

    RainOS.getScoreMessage = function(score) {
        if (score >= 80) return 'Your content is well-optimized for AI readability and answer engines.';
        if (score >= 60) return 'Good foundation. A few improvements could boost your AI visibility.';
        if (score >= 40) return 'Several areas need attention to improve AI comprehension.';
        return 'Significant improvements needed for AI-friendly content.';
    };

    RainOS.getScoreColor = function(score) {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#6366f1';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    RainOS.escapeHtml = function(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    };

    RainOS.handleQuickTool = function(e) {
        e.preventDefault();
        
        var $btn = $(e.currentTarget);
        var action = $btn.data('action');
        var content = this.getEditorContent();
        
        if (!content || content.length < 50) {
            this.showAlert('warning', 'Content Required', rainOS.strings.noContent);
            return;
        }
        
        $btn.addClass('rain-os-loading');
        var $allBtns = $('.rain-os-quick-tool-btn');
        $allBtns.prop('disabled', true);
        
        var ajaxAction = '';
        var ajaxData = {
            action: '',
            nonce: rainOS.nonce,
            content: content
        };
        
        switch (action) {
            case 'suggest_titles':
                ajaxData.action = 'rain_os_suggest_titles';
                break;
            case 'generate_description':
                ajaxData.action = 'rain_os_generate_description';
                break;
            case 'summarize_content':
                ajaxData.action = 'rain_os_summarize_content';
                break;
        }
        
        $.ajax({
            url: rainOS.ajaxUrl,
            type: 'POST',
            data: ajaxData,
            success: function(response, textStatus, xhr) {
                if (response.success) {
                    RainOS.displayToolResults(action, response.data);
                    RainOS.updateUsageFromHeader(xhr);
                } else {
                    RainOS.showAlert('error', 'Tool Failed', response.data.message || rainOS.strings.error);
                }
            },
            error: function(xhr) {
                var message = rainOS.strings.error;
                if (xhr.status === 401) message = 'Invalid API key.';
                else if (xhr.status === 402) message = 'Subscription inactive.';
                else if (xhr.status === 429) message = 'Rate limit exceeded.';
                RainOS.showAlert('error', 'Error', message);
            },
            complete: function() {
                $btn.removeClass('rain-os-loading');
                $allBtns.prop('disabled', false);
            }
        });
    };

    RainOS.handleRewrite = function(e) {
        e.preventDefault();
        
        var sentence = $('#rain-os-rewrite-input').val().trim();
        
        if (!sentence || sentence.length < 10) {
            this.showAlert('warning', 'Input Required', 'Please enter a sentence to rewrite.');
            return;
        }
        
        var $btn = $('#rain-os-rewrite-btn');
        var $icon = $btn.find('.rain-os-rewrite-icon');
        var $spinner = $btn.find('.rain-os-rewrite-spinner');
        
        $btn.prop('disabled', true);
        $icon.hide();
        $spinner.show();
        
        $.ajax({
            url: rainOS.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_rewrite_sentence',
                nonce: rainOS.nonce,
                sentence: sentence
            },
            success: function(response, textStatus, xhr) {
                if (response.success) {
                    RainOS.displayToolResults('rewrite_sentence', response.data);
                    RainOS.updateUsageFromHeader(xhr);
                } else {
                    RainOS.showAlert('error', 'Rewrite Failed', response.data.message || rainOS.strings.error);
                }
            },
            error: function(xhr) {
                var message = rainOS.strings.error;
                if (xhr.status === 401) message = 'Invalid API key.';
                else if (xhr.status === 402) message = 'Subscription inactive.';
                else if (xhr.status === 429) message = 'Rate limit exceeded.';
                RainOS.showAlert('error', 'Error', message);
            },
            complete: function() {
                $btn.prop('disabled', false);
                $icon.show();
                $spinner.hide();
            }
        });
    };

    RainOS.displayToolResults = function(action, data) {
        var $container = $('#rain-os-tool-results');
        var $title = $('#rain-os-tool-results-title');
        var $content = $('#rain-os-tool-results-content');
        
        var html = '';
        
        switch (action) {
            case 'suggest_titles':
                $title.text('Title Suggestions');
                if (data.titles && data.titles.length) {
                    html = '<div class="rain-os-titles-list">';
                    data.titles.forEach(function(title, index) {
                        html += '<div class="rain-os-title-item">';
                        html += '<span class="rain-os-title-text">' + RainOS.escapeHtml(title) + '</span>';
                        html += '<div class="rain-os-title-actions">';
                        html += '<button type="button" class="rain-os-btn rain-os-btn-xs rain-os-copy-btn" data-text="' + RainOS.escapeHtml(title) + '" title="Copy"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>';
                        html += '<button type="button" class="rain-os-btn rain-os-btn-xs rain-os-btn-primary rain-os-apply-title-btn" data-title="' + RainOS.escapeHtml(title) + '" title="Use as Title">Apply</button>';
                        html += '</div>';
                        html += '</div>';
                    });
                    html += '</div>';
                } else {
                    html = '<p class="rain-os-no-results">No suggestions available.</p>';
                }
                break;
                
            case 'generate_description':
                $title.text('Meta Description');
                if (data.description) {
                    html = '<div class="rain-os-description-result">';
                    html += '<p class="rain-os-description-text">' + RainOS.escapeHtml(data.description) + '</p>';
                    html += '<div class="rain-os-description-meta"><span class="rain-os-char-count">' + data.description.length + ' characters</span></div>';
                    html += '<div class="rain-os-description-actions">';
                    html += '<button type="button" class="rain-os-btn rain-os-btn-sm rain-os-btn-secondary rain-os-copy-btn" data-text="' + RainOS.escapeHtml(data.description) + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>';
                    html += '</div>';
                    html += '</div>';
                } else {
                    html = '<p class="rain-os-no-results">No description generated.</p>';
                }
                break;
                
            case 'summarize_content':
                $title.text('Content Summary');
                if (data.summary) {
                    html = '<div class="rain-os-summary-result">';
                    html += '<p class="rain-os-summary-text">' + RainOS.escapeHtml(data.summary) + '</p>';
                    html += '<div class="rain-os-summary-actions">';
                    html += '<button type="button" class="rain-os-btn rain-os-btn-sm rain-os-btn-secondary rain-os-copy-btn" data-text="' + RainOS.escapeHtml(data.summary) + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>';
                    html += '</div>';
                    html += '</div>';
                } else {
                    html = '<p class="rain-os-no-results">No summary generated.</p>';
                }
                break;
                
            case 'rewrite_sentence':
                $title.text('Rewritten Sentence');
                if (data.rewritten) {
                    html = '<div class="rain-os-rewrite-result">';
                    html += '<div class="rain-os-rewrite-comparison">';
                    html += '<div class="rain-os-rewrite-original"><span class="rain-os-label">Original:</span><p>' + RainOS.escapeHtml($('#rain-os-rewrite-input').val()) + '</p></div>';
                    html += '<div class="rain-os-rewrite-new"><span class="rain-os-label">Rewritten:</span><p>' + RainOS.escapeHtml(data.rewritten) + '</p></div>';
                    html += '</div>';
                    html += '<div class="rain-os-rewrite-actions">';
                    html += '<button type="button" class="rain-os-btn rain-os-btn-sm rain-os-btn-secondary rain-os-copy-btn" data-text="' + RainOS.escapeHtml(data.rewritten) + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>';
                    html += '</div>';
                    html += '</div>';
                } else {
                    html = '<p class="rain-os-no-results">No rewrite generated.</p>';
                }
                break;
        }
        
        $content.html(html);
        $container.slideDown(200);
    };

    RainOS.closeToolResults = function(e) {
        e.preventDefault();
        $('#rain-os-tool-results').slideUp(200);
    };

    RainOS.copyToClipboard = function(e) {
        e.preventDefault();
        var $btn = $(e.currentTarget);
        var text = $btn.data('text');
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                RainOS.showCopyFeedback($btn);
            }).catch(function() {
                RainOS.fallbackCopy(text);
                RainOS.showCopyFeedback($btn);
            });
        } else {
            RainOS.fallbackCopy(text);
            RainOS.showCopyFeedback($btn);
        }
    };

    RainOS.fallbackCopy = function(text) {
        var $temp = $('<textarea>');
        $('body').append($temp);
        $temp.val(text).select();
        document.execCommand('copy');
        $temp.remove();
    };

    RainOS.showCopyFeedback = function($btn) {
        var originalHtml = $btn.html();
        $btn.html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>');
        setTimeout(function() {
            $btn.html(originalHtml);
        }, 1500);
    };

    RainOS.applyTitle = function(e) {
        e.preventDefault();
        var title = $(e.currentTarget).data('title');
        
        if (typeof wp !== 'undefined' && wp.data && wp.data.dispatch('core/editor')) {
            wp.data.dispatch('core/editor').editPost({ title: title });
            this.showAlert('success', 'Title Applied', 'The title has been set for your post.');
        } else {
            var $titleInput = $('#title');
            if ($titleInput.length) {
                $titleInput.val(title).trigger('change');
                this.showAlert('success', 'Title Applied', 'The title has been set for your post.');
            } else {
                this.copyToClipboard({ currentTarget: { dataset: { text: title } }, preventDefault: function() {} });
                this.showAlert('info', 'Title Copied', 'Title copied to clipboard. Paste it in the title field.');
            }
        }
    };

    RainOS.copyProvenance = function(e) {
        e.preventDefault();
        
        var hash = $('#rain-os-authorship-hash').text();
        var timestamp = $('#rain-os-authorship-timestamp').text();
        var status = $('#rain-os-authorship-status').text();
        
        var provenanceString = 'Hash: ' + hash + ' | Timestamp: ' + timestamp + ' | Status: ' + status;
        
        var $btn = $(e.currentTarget);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(provenanceString).then(function() {
                RainOS.showCopyFeedback($btn);
            });
        } else {
            RainOS.fallbackCopy(provenanceString);
            RainOS.showCopyFeedback($btn);
        }
    };

    RainOS.toggleSaveProvenance = function(e) {
        var enabled = $(e.target).is(':checked');
        
        if (enabled && RainOS.currentAnalysisData && RainOS.currentAnalysisData.authorship) {
            var postId = RainOS.getPostId();
            if (postId) {
                $.ajax({
                    url: rainOS.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'rain_os_save_provenance',
                        nonce: rainOS.nonce,
                        post_id: postId,
                        hash: RainOS.currentAnalysisData.authorship.hash || '',
                        timestamp: RainOS.currentAnalysisData.authorship.timestamp || '',
                        status: RainOS.currentAnalysisData.authorship.status || ''
                    },
                    success: function(response) {
                        if (response.success) {
                            RainOS.showAlert('success', 'Provenance Saved', 'Authorship data saved to post meta.');
                        }
                    }
                });
            }
        }
    };

    RainOS.openSubScoreDrawer = function(e) {
        var $item = $(e.currentTarget);
        var category = $item.data('category');
        var score = $item.data('score');
        
        $('#rain-os-drawer-title').text(category);
        $('#rain-os-drawer-score .rain-os-drawer-score-value').text(score);
        
        var description = RainOS.subScoreDescriptions[category] || 'This metric measures an important aspect of your content\'s optimization for AI and answer engines.';
        $('#rain-os-drawer-why-text').text(description);
        
        var recommendations = [];
        if (RainOS.currentAnalysisData && RainOS.currentAnalysisData.recommendations) {
            var categoryKeywords = category.toLowerCase().split(' ');
            RainOS.currentAnalysisData.recommendations.forEach(function(rec) {
                var recLower = rec.toLowerCase();
                var isRelevant = categoryKeywords.some(function(keyword) {
                    return keyword.length > 3 && recLower.indexOf(keyword) > -1;
                });
                if (isRelevant) {
                    recommendations.push(rec);
                }
            });
            
            if (recommendations.length === 0) {
                recommendations = RainOS.currentAnalysisData.recommendations.slice(0, 3);
            }
        }
        
        var recHtml = '';
        recommendations.forEach(function(rec) {
            recHtml += '<li>' + RainOS.escapeHtml(rec) + '</li>';
        });
        $('#rain-os-drawer-recommendations-list').html(recHtml || '<li>No specific recommendations for this category.</li>');
        
        $('#rain-os-subscore-drawer').fadeIn(200);
        $('body').addClass('rain-os-drawer-open');
    };

    RainOS.closeSubScoreDrawer = function(e) {
        e.preventDefault();
        $('#rain-os-subscore-drawer').fadeOut(200);
        $('body').removeClass('rain-os-drawer-open');
    };

    RainOS.clearResults = function(e) {
        e.preventDefault();
        $('#rain-os-results').hide();
        $('#rain-os-placeholder').show();
        this.clearSavedResults();
    };

    RainOS.saveResults = function(data) {
        try {
            var postId = this.getPostId();
            if (postId) {
                localStorage.setItem('rain_os_results_' + postId, JSON.stringify(data));
            }
        } catch (e) {
            console.log('Could not save results to localStorage');
        }
    };

    RainOS.loadSavedResults = function() {
        try {
            var postId = this.getPostId();
            if (postId) {
                var saved = localStorage.getItem('rain_os_results_' + postId);
                if (saved) {
                    var data = JSON.parse(saved);
                    RainOS.currentAnalysisData = data;
                    if (data.subScoreDescriptions) {
                        RainOS.subScoreDescriptions = data.subScoreDescriptions;
                    }
                    this.displayResults(data);
                }
            }
        } catch (e) {
            console.log('Could not load saved results');
        }
    };

    RainOS.clearSavedResults = function() {
        try {
            var postId = this.getPostId();
            if (postId) {
                localStorage.removeItem('rain_os_results_' + postId);
            }
        } catch (e) {
            console.log('Could not clear saved results');
        }
    };

    RainOS.getPostId = function() {
        var $postId = $('#post_ID');
        if ($postId.length) {
            return $postId.val();
        }
        
        if (typeof wp !== 'undefined' && wp.data && wp.data.select('core/editor')) {
            return wp.data.select('core/editor').getCurrentPostId();
        }
        
        return null;
    };

    RainOS.saveApiSettings = function(e) {
        e.preventDefault();
        
        var $btn = $(e.target);
        var originalText = $btn.text();
        
        $btn.prop('disabled', true).text(rainOS.strings.saving);
        
        $.ajax({
            url: rainOS.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_save_settings',
                nonce: rainOS.nonce,
                api_endpoint: $('#rain-os-api-endpoint').val(),
                api_key: $('#rain-os-api-key').val()
            },
            success: function(response) {
                if (response.success) {
                    RainOS.showAlert('success', 'Settings Saved', response.data.message);
                } else {
                    RainOS.showAlert('error', 'Save Failed', response.data.message || rainOS.strings.error);
                }
            },
            error: function() {
                RainOS.showAlert('error', 'Connection Error', rainOS.strings.error);
            },
            complete: function() {
                $btn.prop('disabled', false).text(originalText);
            }
        });
    };

    RainOS.saveGeneralSettings = function(e) {
        e.preventDefault();
        
        var $btn = $(e.target);
        var originalText = $btn.text();
        var postTypes = [];
        
        $('input[name="post_types[]"]:checked').each(function() {
            postTypes.push($(this).val());
        });
        
        $btn.prop('disabled', true).text(rainOS.strings.saving);
        
        $.ajax({
            url: rainOS.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_save_settings',
                nonce: rainOS.nonce,
                default_industry: $('#rain-os-default-industry').val(),
                post_types: postTypes
            },
            success: function(response) {
                if (response.success) {
                    RainOS.showAlert('success', 'Settings Saved', response.data.message);
                } else {
                    RainOS.showAlert('error', 'Save Failed', response.data.message || rainOS.strings.error);
                }
            },
            error: function() {
                RainOS.showAlert('error', 'Connection Error', rainOS.strings.error);
            },
            complete: function() {
                $btn.prop('disabled', false).text(originalText);
            }
        });
    };

    RainOS.testConnection = function(e) {
        e.preventDefault();
        
        var $btn = $(e.target).closest('button');
        var originalHtml = $btn.html();
        
        $btn.prop('disabled', true).html('<svg class="rain-os-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> ' + rainOS.strings.testing);
        
        $.ajax({
            url: rainOS.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_test_connection',
                nonce: rainOS.nonce
            },
            success: function(response) {
                if (response.success) {
                    RainOS.showAlert('success', 'Connection Successful', rainOS.strings.connectionSuccess);
                    if (response.data.user) {
                        RainOS.updateUsageDisplay(response.data.user.usage);
                    }
                } else {
                    RainOS.showAlert('error', 'Connection Failed', response.data.message || rainOS.strings.connectionFailed);
                }
            },
            error: function() {
                RainOS.showAlert('error', 'Connection Error', rainOS.strings.connectionFailed);
            },
            complete: function() {
                $btn.prop('disabled', false).html(originalHtml);
            }
        });
    };

    RainOS.updateUsage = function(e) {
        if (e) e.preventDefault();
        
        var $btn = $('#rain-os-refresh-usage');
        $btn.prop('disabled', true);
        $btn.find('svg').addClass('rain-os-spinner');
        
        $.ajax({
            url: rainOS.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_get_usage',
                nonce: rainOS.nonce
            },
            success: function(response) {
                if (response.success && response.data.usage) {
                    RainOS.updateUsageDisplay(response.data.usage);
                }
            },
            complete: function() {
                $btn.prop('disabled', false);
                $btn.find('svg').removeClass('rain-os-spinner');
            }
        });
    };

    RainOS.updateUsageDisplay = function(usage) {
        if (!usage) return;
        
        var count = usage.count || 0;
        var limit = usage.limit || 5;
        var percentage = limit > 0 ? Math.min(100, (count / limit) * 100) : 0;
        
        $('#rain-os-usage-count').text(count);
        $('#rain-os-usage-limit').text(limit);
        
        var $gauge = $('.rain-os-usage-gauge');
        if ($gauge.length) {
            $gauge.attr('data-percentage', percentage);
            var dashOffset = 502.65 - (502.65 * percentage / 100);
            $gauge.find('.rain-os-gauge-fill').css('stroke-dashoffset', dashOffset);
        }
        
        $('.rain-os-usage-bar-fill, .rain-os-usage-fill').css('width', percentage + '%');
        $('.rain-os-usage-text').text(count + ' / ' + limit + ' analyses');
    };

    RainOS.togglePassword = function(e) {
        e.preventDefault();
        
        var $btn = $(e.target).closest('.rain-os-toggle-password');
        var $input = $btn.siblings('input');
        
        if ($input.attr('type') === 'password') {
            $input.attr('type', 'text');
            $btn.addClass('active');
        } else {
            $input.attr('type', 'password');
            $btn.removeClass('active');
        }
    };

    RainOS.showAlert = function(type, title, message) {
        var $alert = $('#rain-os-alert');
        
        if (!$alert.length) {
            $alert = $('<div id="rain-os-alert" class="rain-os-alert"></div>');
            $('body').append($alert);
        }
        
        var iconSvg = '';
        switch (type) {
            case 'success':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>';
                break;
            case 'error':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
                break;
            case 'warning':
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
                break;
            default:
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
        }
        
        $alert.removeClass('rain-os-alert-success rain-os-alert-error rain-os-alert-warning rain-os-alert-info');
        $alert.addClass('rain-os-alert-' + type);
        
        $alert.html(
            '<div class="rain-os-alert-icon">' + iconSvg + '</div>' +
            '<div class="rain-os-alert-content">' +
            '<strong class="rain-os-alert-title">' + RainOS.escapeHtml(title) + '</strong>' +
            '<p class="rain-os-alert-message">' + RainOS.escapeHtml(message) + '</p>' +
            '</div>' +
            '<button type="button" class="rain-os-alert-close" aria-label="Close">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>'
        );
        
        $alert.show();
        
        setTimeout(function() {
            $alert.fadeOut();
        }, 5000);
    };

    RainOS.closeAlert = function(e) {
        e.preventDefault();
        $(e.target).closest('.rain-os-alert').fadeOut();
    };

    $(document).ready(function() {
        RainOS.init();
    });

})(jQuery);
