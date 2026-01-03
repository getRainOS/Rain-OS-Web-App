(function($) {
    'use strict';

    var RainOSAIScorePanel = {
        init: function() {
            var $panel = $('#rain-os-ai-score-panel');
            if (!$panel.length) {
                return;
            }

            this.$panel = $panel;
            this.contentId = $panel.data('content-id');
            this.postId = $panel.data('post-id');

            if (this.contentId || this.postId) {
                this.loadScores();
            } else {
                this.showUnavailable();
            }
        },

        loadScores: function() {
            var self = this;

            $.ajax({
                url: rainOsAiPanel.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'rain_os_get_ai_scores',
                    nonce: rainOsAiPanel.nonce,
                    content_id: this.contentId,
                    post_id: this.postId
                },
                success: function(response) {
                    if (response.success && response.data && response.data.scores) {
                        self.displayScores(response.data);
                    } else {
                        self.showUnavailable();
                    }
                },
                error: function() {
                    self.showError();
                }
            });
        },

        displayScores: function(data) {
            var scores = data.scores || {};
            var $content = this.$panel.find('.rain-os-ai-panel-content');
            var $loading = this.$panel.find('.rain-os-ai-panel-loading');

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
                    var $item = $content.find('[data-score="' + key + '"] .score-value');
                    
                    if (typeof value === 'number') {
                        $item.text(value);
                        $item.removeClass('score-high score-medium score-low');
                        
                        if (value >= 80) {
                            $item.addClass('score-high');
                        } else if (value >= 60) {
                            $item.addClass('score-medium');
                        } else {
                            $item.addClass('score-low');
                        }
                    } else {
                        $item.text('--');
                    }
                }
            }

            if (data.profileId) {
                $content.find('.version-value').text(data.profileId);
            }
            if (data.version) {
                $content.find('.version-value').text(data.version);
            }

            $loading.hide();
            $content.show();
        },

        showError: function() {
            this.$panel.find('.rain-os-ai-panel-loading').hide();
            this.$panel.find('.rain-os-ai-panel-error').show();
        },

        showUnavailable: function() {
            this.$panel.find('.rain-os-ai-panel-loading').hide();
            this.$panel.find('.rain-os-ai-panel-unavailable').show();
        }
    };

    $(document).ready(function() {
        RainOSAIScorePanel.init();
    });

})(jQuery);
