(function($) {
    'use strict';

    function setMsg(msg, type) {
        var $el = $('#rain-os-checkout-message, #rain-os-upgrade-message');
        if (!$el.length) return;
        var color = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#22d3ee';
        $el.css({ color: color, display: 'block' }).text(msg);
    }

    $(document).on('click', '.rain-os-checkout-btn', function() {
        var $btn     = $(this);
        var priceId  = $btn.data('price-id');

        if (!priceId) {
            setMsg('Missing price configuration. Please contact support.', 'error');
            return;
        }

        $btn.prop('disabled', true).html(
            '<span class="dashicons dashicons-update spin"></span> ' +
            (rainOsUpgrade.i18n.redirecting || 'Redirecting to checkout…')
        );
        setMsg(rainOsUpgrade.i18n.redirecting || 'Redirecting to Stripe checkout…', 'info');

        $.ajax({
            url: rainOsUpgrade.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_create_checkout_session',
                nonce:    rainOsUpgrade.nonce,
                price_id: priceId,
            },
            success: function(response) {
                if (response.success && response.data && response.data.url) {
                    window.location.href = response.data.url;
                } else {
                    var msg = (response.data && response.data.message)
                        ? response.data.message
                        : (rainOsUpgrade.i18n.error || 'Checkout failed. Please try again.');
                    setMsg(msg, 'error');
                    $btn.prop('disabled', false).html(
                        '<span class="dashicons dashicons-cloud"></span> ' +
                        $btn.data('label')
                    );
                }
            },
            error: function() {
                setMsg(rainOsUpgrade.i18n.error || 'Network error. Please try again.', 'error');
                $btn.prop('disabled', false);
            }
        });
    });

    $(document).on('click', '#rain-os-portal-btn', function() {
        var $btn = $(this);
        $btn.prop('disabled', true).html(
            '<span class="dashicons dashicons-update spin"></span> ' +
            (rainOsUpgrade.i18n.opening || 'Opening billing portal…')
        );

        $.ajax({
            url: rainOsUpgrade.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_create_portal_session',
                nonce:   rainOsUpgrade.nonce,
            },
            success: function(response) {
                if (response.success && response.data && response.data.url) {
                    window.location.href = response.data.url;
                } else {
                    var msg = (response.data && response.data.message)
                        ? response.data.message
                        : (rainOsUpgrade.i18n.error || 'Could not open billing portal. Please try again.');
                    alert(msg);
                    $btn.prop('disabled', false).html(
                        '<span class="dashicons dashicons-admin-users"></span> Manage Billing'
                    );
                }
            },
            error: function() {
                alert(rainOsUpgrade.i18n.error || 'Network error. Please try again.');
                $btn.prop('disabled', false);
            }
        });
    });

    $(document).on('click', '#rain-os-regen-key', function() {
        var $btn = $(this);

        if (!confirm(rainOsUpgrade.i18n.regenConfirm || 'Regenerate your API key? Your current key will stop working immediately.')) {
            return;
        }

        $btn.prop('disabled', true).html(
            '<span class="dashicons dashicons-update spin"></span> ' +
            (rainOsUpgrade.i18n.regenerating || 'Regenerating…')
        );

        $.ajax({
            url: rainOsUpgrade.ajaxUrl,
            type: 'POST',
            data: {
                action: 'rain_os_regenerate_api_key',
                nonce:   rainOsUpgrade.nonce,
            },
            success: function(response) {
                $btn.prop('disabled', false).html(
                    '<span class="dashicons dashicons-randomize"></span> Regenerate Key'
                );
                if (response.success && response.data && response.data.api_key) {
                    $('#rain_os_api_key').val(response.data.api_key);
                    alert(response.data.message || 'API key regenerated successfully.');
                } else {
                    var msg = (response.data && response.data.message) ? response.data.message : 'Regeneration failed.';
                    alert(msg);
                }
            },
            error: function() {
                $btn.prop('disabled', false);
                alert(rainOsUpgrade.i18n.error || 'Network error. Please try again.');
            }
        });
    });

    $(document).on('click', '.rain-os-checkout-btn', function() {
        $(this).data('label', $(this).text().trim());
    });

})(jQuery);
