(function($) {
    'use strict';

    var RainOSUrlScanner = {

        init: function() {
            this.bindEvents();
        },

        bindEvents: function() {
            $(document).on('click', '#rain-os-scan-btn', this.scanUrl.bind(this));
            $(document).on('keypress', '#rain-os-scanner-url', function(e) {
                if (e.which === 13) {
                    $('#rain-os-scan-btn').trigger('click');
                }
            });
        },

        scanUrl: function() {
            var self = this;
            var url = $('#rain-os-scanner-url').val().trim();
            var industry = $('#rain-os-scanner-industry').val();
            var $btn = $('#rain-os-scan-btn');
            var $results = $('#rain-os-scan-results');
            var $error = $('#rain-os-scan-error');

            $error.hide();
            $results.hide();

            if (!url) {
                this.showError(rainOsScanner.i18n.urlRequired || 'Please enter a URL to scan.');
                return;
            }

            if (!/^https?:\/\/.+/.test(url)) {
                this.showError(rainOsScanner.i18n.urlInvalid || 'Please enter a valid URL including http:// or https://');
                return;
            }

            $btn.prop('disabled', true).html(
                '<span class="dashicons dashicons-update spin"></span> ' +
                (rainOsScanner.i18n.scanning || 'Scanning URL…')
            );

            $.ajax({
                url: rainOsScanner.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_scan_url',
                    nonce: rainOsScanner.nonce,
                    url: url,
                    industry: industry,
                    post_id: 0,
                },
                success: function(response) {
                    $btn.prop('disabled', false).html(
                        '<span class="dashicons dashicons-search"></span> ' +
                        (rainOsScanner.i18n.scan || 'Scan URL')
                    );

                    if (response.success && response.data) {
                        self.displayResults(response.data, url);
                    } else {
                        var msg = (response.data && response.data.message)
                            ? response.data.message
                            : (rainOsScanner.i18n.error || 'Scan failed. Please try again.');
                        self.showError(msg);
                    }
                },
                error: function() {
                    $btn.prop('disabled', false).html(
                        '<span class="dashicons dashicons-search"></span> ' +
                        (rainOsScanner.i18n.scan || 'Scan URL')
                    );
                    self.showError(rainOsScanner.i18n.networkError || 'Network error. Please try again.');
                }
            });
        },

        displayResults: function(data, scannedUrl) {
            var $results = $('#rain-os-scan-results');
            var analysis = data.analysis || data;
            var overall = analysis.overall_score || 0;
            var pillars = analysis.pillars || {};
            var recommendations = analysis.recommendations || [];
            var technical = data.technical || analysis.technical_signals || null;
            var techRecs = data.tech_recs || analysis.technical_recommendations || [];
            var usage = data.usage || null;

            var overallColor = overall >= 80 ? '#10b981' : (overall >= 60 ? '#f59e0b' : '#ef4444');
            var html = '';

            // Scanned URL banner
            html += '<div class="rain-os-scan-result-banner">';
            html += '<span class="dashicons dashicons-admin-links"></span>';
            html += '<a href="' + this.escHtml(scannedUrl) + '" target="_blank" rel="noopener noreferrer">' + this.escHtml(scannedUrl) + '</a>';
            html += '</div>';

            // Overall score + pillars
            html += '<div class="rain-os-scan-scores-grid">';

            html += '<div class="rain-os-scan-overall-card">';
            html += '<div class="rain-os-scan-overall-label">' + (rainOsScanner.i18n.overallScore || 'Overall Score') + '</div>';
            html += '<div class="rain-os-scan-overall-score" style="color:' + overallColor + '">' + overall + '</div>';
            html += '<div class="rain-os-scan-overall-sub">/ 100</div>';
            html += '</div>';

            html += '<div class="rain-os-scan-pillars">';
            var pillarConfig = [
                { key: 'ai_readability',          label: 'AI Readability',          color: '#22d3ee', cssClass: 'cyan'   },
                { key: 'digital_authority',        label: 'Digital Authority',        color: '#10b981', cssClass: 'green'  },
                { key: 'conversion_readiness',     label: 'Conversion Readiness',     color: '#a855f7', cssClass: 'purple' },
                { key: 'product_discoverability',  label: 'Product Discoverability',  color: '#f97316', cssClass: 'orange' },
            ];
            pillarConfig.forEach(function(p) {
                var score = pillars[p.key] || 0;
                html += '<div class="rain-os-scan-pillar-item">';
                html += '<div class="rain-os-scan-pillar-header">';
                html += '<span class="rain-os-scan-pillar-dot" style="background:' + p.color + '"></span>';
                html += '<span class="rain-os-scan-pillar-label">' + p.label + '</span>';
                html += '<span class="rain-os-scan-pillar-score" style="color:' + p.color + '">' + score + '</span>';
                html += '</div>';
                html += '<div class="rain-os-scan-pillar-bar-bg"><div class="rain-os-scan-pillar-bar-fill rain-os-pillar-' + p.cssClass + '" style="width:' + score + '%"></div></div>';
                html += '</div>';
            });
            html += '</div>';

            html += '</div>';

            // Usage info
            if (usage && usage.count !== undefined) {
                html += '<div class="rain-os-scan-usage">';
                html += '<span class="dashicons dashicons-chart-bar"></span> ';
                html += (rainOsScanner.i18n.usageInfo || 'API Usage') + ': ' + usage.count + ' / ' + (usage.limit || '—');
                html += '</div>';
            }

            // Technical signals
            if (technical && typeof technical === 'object') {
                html += this.renderTechnicalSignals(technical, techRecs);
            }

            // Recommendations
            if (recommendations.length > 0) {
                html += '<div class="rain-os-card rain-os-scan-recs">';
                html += '<div class="rain-os-card-header"><h3>' + (rainOsScanner.i18n.recommendations || 'Recommendations') + '</h3></div>';
                html += '<div class="rain-os-card-body"><ul class="rain-os-recs-list">';
                recommendations.forEach(function(rec) {
                    var text = typeof rec === 'string' ? rec : (rec.text || rec.message || JSON.stringify(rec));
                    html += '<li>' + RainOSUrlScanner.escHtml(text) + '</li>';
                });
                html += '</ul></div></div>';
            }

            $results.html(html).show();
        },

        renderTechnicalSignals: function(signals, techRecs) {
            var html = '<div class="rain-os-card rain-os-technical-signals">';
            html += '<div class="rain-os-card-header">';
            html += '<h3>' + (rainOsScanner.i18n.technicalSignals || 'Technical HTML Signals') + '</h3>';
            html += '<span class="rain-os-badge rain-os-badge-info">' + (rainOsScanner.i18n.urlScanOnly || 'URL Scan Only') + '</span>';
            html += '</div>';
            html += '<div class="rain-os-card-body">';

            var signalDefs = [
                { key: 'hasSchemaMarkup',           label: 'Schema Markup',          type: 'positive' },
                { key: 'hasFaqSchema',               label: 'FAQ Schema',             type: 'positive' },
                { key: 'hasSemanticHtml',            label: 'Semantic HTML',          type: 'positive' },
                { key: 'hasProperHeadingHierarchy',  label: 'Heading Hierarchy',      type: 'positive' },
                { key: 'hasMetaDescription',         label: 'Meta Description',       type: 'positive' },
                { key: 'hasCanonicalTag',            label: 'Canonical Tag',          type: 'positive' },
                { key: 'hasOpenGraphTags',           label: 'Open Graph Tags',        type: 'positive' },
                { key: 'hasLlmsTxt',                label: 'llms.txt Present',       type: 'positive' },
                { key: 'isJsRendered',               label: 'JS Rendering (AI Risk)', type: 'negative' },
            ];

            html += '<div class="rain-os-signals-grid">';
            signalDefs.forEach(function(def) {
                if (!(def.key in signals)) return;
                var val = signals[def.key];
                var isGood = def.type === 'positive' ? !!val : !val;
                var icon = isGood ? '✓' : '✗';
                var cssClass = isGood ? 'rain-os-signal-pass' : 'rain-os-signal-fail';
                html += '<div class="rain-os-signal-item ' + cssClass + '">';
                html += '<span class="rain-os-signal-icon">' + icon + '</span>';
                html += '<span class="rain-os-signal-label">' + RainOSUrlScanner.escHtml(def.label) + '</span>';
                html += '</div>';
            });
            html += '</div>';

            if (signals.jsRenderingWarning) {
                html += '<div class="rain-os-alert rain-os-alert-warning">' + RainOSUrlScanner.escHtml(signals.jsRenderingWarning) + '</div>';
            }

            if (techRecs && techRecs.length > 0) {
                html += '<div class="rain-os-tech-recs">';
                html += '<h4>' + (rainOsScanner.i18n.technicalRecommendations || 'Technical Recommendations') + '</h4>';
                html += '<ul>';
                techRecs.forEach(function(rec) {
                    var text = typeof rec === 'string' ? rec : (rec.text || rec.message || JSON.stringify(rec));
                    html += '<li>' + RainOSUrlScanner.escHtml(text) + '</li>';
                });
                html += '</ul></div>';
            }

            html += '</div></div>';
            return html;
        },

        showError: function(message) {
            var $error = $('#rain-os-scan-error');
            $error.text(message).show();
        },

        escHtml: function(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        },
    };

    $(document).ready(function() {
        RainOSUrlScanner.init();
    });

})(jQuery);
