(function($) {
    'use strict';

    var RainOSCharts = {
        colors: {
            cyan: '#22d3ee',
            green: '#10b981',
            purple: '#a855f7',
            yellow: '#f59e0b',
            red: '#ef4444',
            bg: '#1f2937',
            border: 'rgba(255, 255, 255, 0.1)',
            text: '#94a3b8',
            baseline: 'rgba(245, 158, 11, 0.5)'
        },

        init: function() {
            this.initPerformanceChart();
            this.initScatterChart();
            this.initGauges();
        },

        initPerformanceChart: function() {
            var canvas = document.getElementById('rain-os-performance-chart');
            if (!canvas) return;

            var ctx = canvas.getContext('2d');
            
            if (typeof Chart === 'undefined') {
                this.loadChartJS(function() {
                    RainOSCharts.createPerformanceChart(ctx);
                });
            } else {
                this.createPerformanceChart(ctx);
            }
        },

        createPerformanceChart: function(ctx) {
            var self = this;
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'AI Readability',
                        data: [72, 78, 82, 85],
                        borderColor: self.colors.cyan,
                        backgroundColor: self.hexToRgba(self.colors.cyan, 0.1),
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Digital Authority',
                        data: [68, 72, 75, 80],
                        borderColor: self.colors.green,
                        backgroundColor: self.hexToRgba(self.colors.green, 0.1),
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Conversion Readiness',
                        data: [65, 70, 78, 82],
                        borderColor: self.colors.purple,
                        backgroundColor: self.hexToRgba(self.colors.purple, 0.1),
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: self.colors.text,
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: self.colors.border
                            },
                            ticks: {
                                color: self.colors.text
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            grid: {
                                color: self.colors.border
                            },
                            ticks: {
                                color: self.colors.text
                            }
                        }
                    }
                }
            });
        },

        initScatterChart: function() {
            var canvas = document.getElementById('rain-os-scatter-chart');
            if (!canvas) return;

            var ctx = canvas.getContext('2d');
            
            if (typeof Chart === 'undefined') {
                this.loadChartJS(function() {
                    RainOSCharts.createScatterChart(ctx);
                });
            } else {
                this.createScatterChart(ctx);
            }
        },

        createScatterChart: function(ctx) {
            var self = this;
            
            var scatterData = [
                { x: 500, y: 65 },
                { x: 800, y: 72 },
                { x: 1200, y: 78 },
                { x: 1500, y: 85 },
                { x: 2000, y: 88 },
                { x: 2500, y: 92 },
                { x: 3000, y: 90 },
                { x: 1800, y: 75 },
                { x: 2200, y: 82 },
                { x: 1000, y: 68 }
            ];

            new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Content Performance',
                        data: scatterData,
                        backgroundColor: self.colors.cyan,
                        pointRadius: 8,
                        pointHoverRadius: 12
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        annotation: {
                            annotations: {
                                baseline: {
                                    type: 'line',
                                    yMin: 70,
                                    yMax: 70,
                                    borderColor: self.colors.baseline,
                                    borderWidth: 2,
                                    borderDash: [5, 5],
                                    label: {
                                        content: 'Baseline (70)',
                                        enabled: true,
                                        position: 'start'
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Word Count',
                                color: self.colors.text
                            },
                            grid: {
                                color: self.colors.border
                            },
                            ticks: {
                                color: self.colors.text
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            title: {
                                display: true,
                                text: 'AEO Score',
                                color: self.colors.text
                            },
                            grid: {
                                color: self.colors.border
                            },
                            ticks: {
                                color: self.colors.text
                            }
                        }
                    }
                }
            });
        },

        initGauges: function() {
            var self = this;
            $('.rain-os-kpi-gauge').each(function() {
                var $gauge = $(this);
                var value = parseInt($gauge.data('value')) || 0;
                var color = $gauge.data('color') || self.colors.cyan;
                self.createGauge($gauge[0], value, color);
            });
        },

        createGauge: function(container, value, color) {
            var size = 60;
            var strokeWidth = 6;
            var radius = (size - strokeWidth) / 2;
            var circumference = 2 * Math.PI * radius;
            var percent = value / 100;
            var dashOffset = circumference * (1 - percent * 0.75);

            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', size);
            svg.setAttribute('height', size);
            svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
            svg.style.transform = 'rotate(-135deg)';

            var bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bgCircle.setAttribute('cx', size / 2);
            bgCircle.setAttribute('cy', size / 2);
            bgCircle.setAttribute('r', radius);
            bgCircle.setAttribute('fill', 'none');
            bgCircle.setAttribute('stroke', this.colors.bg);
            bgCircle.setAttribute('stroke-width', strokeWidth);
            bgCircle.setAttribute('stroke-dasharray', (circumference * 0.75) + ' ' + (circumference * 0.25));
            svg.appendChild(bgCircle);

            var valueCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            valueCircle.setAttribute('cx', size / 2);
            valueCircle.setAttribute('cy', size / 2);
            valueCircle.setAttribute('r', radius);
            valueCircle.setAttribute('fill', 'none');
            valueCircle.setAttribute('stroke', color);
            valueCircle.setAttribute('stroke-width', strokeWidth);
            valueCircle.setAttribute('stroke-linecap', 'round');
            valueCircle.setAttribute('stroke-dasharray', circumference);
            valueCircle.setAttribute('stroke-dashoffset', dashOffset);
            svg.appendChild(valueCircle);

            container.appendChild(svg);
        },

        loadChartJS: function(callback) {
            if (typeof Chart !== 'undefined') {
                callback();
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = callback;
            document.head.appendChild(script);
        },

        hexToRgba: function(hex, alpha) {
            var r = parseInt(hex.slice(1, 3), 16);
            var g = parseInt(hex.slice(3, 5), 16);
            var b = parseInt(hex.slice(5, 7), 16);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
        }
    };

    $(document).ready(function() {
        RainOSCharts.init();
    });

})(jQuery);
