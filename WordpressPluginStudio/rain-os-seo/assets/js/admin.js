/**
 * Rain OS SEO Analyzer - Admin JavaScript
 * jQuery-based interactions and AJAX integration
 */

(function($) {
    'use strict';

    window.RainOS = window.RainOS || {};

    RainOS.init = function() {
        this.bindEvents();
        this.initTabs();
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
            success: function(response) {
                if (response.success) {
                    RainOS.displayResults(response.data);
                    RainOS.saveResults(response.data);
                    RainOS.updateUsageDisplay();
                } else {
                    RainOS.showAlert('error', 'Analysis Failed', response.data.message || rainOS.strings.error);
                }
            },
            error: function() {
                RainOS.showAlert('error', 'Connection Error', rainOS.strings.error);
            },
            complete: function() {
                $btn.prop('disabled', false).removeClass('rain-os-loading');
                $analyzeText.text(rainOS.strings.analyze);
                $analyzeIcon.show();
                $spinnerIcon.hide();
            }
        });
    };

    RainOS.displayResults = function(data) {
        var $results = $('#rain-os-results');
        var $placeholder = $('#rain-os-placeholder');
        
        $placeholder.hide();
        $results.show();
        
        var overallScore = data.overallScore || 0;
        $('#rain-os-overall-score').text(overallScore);
        
        var dashOffset = 502.65 - (502.65 * overallScore / 100);
        $('#rain-os-overall-gauge').css('stroke-dashoffset', dashOffset);
        
        var gaugeColor = this.getScoreColor(overallScore);
        $('#rain-os-overall-gauge').css('stroke', gaugeColor);
        
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
        
        var subScoresHtml = '';
        if (data.subScores && data.subScores.length) {
            data.subScores.forEach(function(item) {
                subScoresHtml += '<div class="rain-os-sub-score-item">';
                subScoresHtml += '<span>' + RainOS.escapeHtml(item.category) + '</span>';
                subScoresHtml += '<span>' + item.score + '/100</span>';
                subScoresHtml += '</div>';
            });
        }
        $('#rain-os-sub-scores .rain-os-sub-scores-list').html(subScoresHtml);
        $('#rain-os-sub-scores').toggle(subScoresHtml.length > 0);
        
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
        
        $('.rain-os-usage-bar-fill').css('width', percentage + '%');
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
            '<button type="button" class="rain-os-alert-close">' +
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
