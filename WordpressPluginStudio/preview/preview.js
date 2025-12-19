/**
 * rain OS SEO Analyzer - Preview JavaScript
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initTabs();
        initPasswordToggle();
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
})();
