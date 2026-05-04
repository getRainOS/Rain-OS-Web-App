(function($) {
    'use strict';

    $('#toggle-api-key').on('click', function() {
        var input = $('#rain_os_api_key');
        var icon = $(this).find('.dashicons');
        var text = $(this).find('.rain-os-toggle-text');
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('dashicons-visibility').addClass('dashicons-hidden');
            text.text(rainOsAeo.i18n.hide);
        } else {
            input.attr('type', 'password');
            icon.removeClass('dashicons-hidden').addClass('dashicons-visibility');
            text.text(rainOsAeo.i18n.view);
        }
    });

    $('input[name="rain_os_score_alerts"]').on('change', function() {
        if ($(this).is(':checked')) {
            $('#threshold-container').slideDown(200);
        } else {
            $('#threshold-container').slideUp(200);
        }
    });

    $('#rain_os_ai_backend_enabled').on('change', function() {
        if ($(this).is(':checked')) {
            $('#ai-backend-options').slideDown(200);
        } else {
            $('#ai-backend-options').slideUp(200);
        }
    });

    $('#test-connection').on('click', function() {
        var $btn = $(this);
        var $status = $('#connection-status');

        $btn.prop('disabled', true);
        $btn.find('.dashicons').addClass('rain-os-spin');
        $status.hide();

        $.ajax({
            url: rainOsAeo.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_test_connection',
                nonce: rainOsAeo.nonce
            },
            success: function(response) {
                $btn.prop('disabled', false);
                $btn.find('.dashicons').removeClass('rain-os-spin');

                if (response.success) {
                    $status
                        .removeClass('rain-os-error')
                        .addClass('rain-os-success')
                        .html('<span class="dashicons dashicons-yes-alt"></span> Connected! Account: ' + response.data.user.email)
                        .show();
                } else {
                    $status
                        .removeClass('rain-os-success')
                        .addClass('rain-os-error')
                        .html('<span class="dashicons dashicons-warning"></span> ' + response.data.message)
                        .show();
                }
            },
            error: function() {
                $btn.prop('disabled', false);
                $btn.find('.dashicons').removeClass('rain-os-spin');
                $status
                    .removeClass('rain-os-success')
                    .addClass('rain-os-error')
                    .html('<span class="dashicons dashicons-warning"></span> ' + rainOsAeo.i18n.connectionFailed)
                    .show();
            }
        });
    });
})(jQuery);
