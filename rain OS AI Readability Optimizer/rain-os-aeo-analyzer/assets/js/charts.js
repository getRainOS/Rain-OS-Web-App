(function($) {
    'use strict';

    var RainOSCharts = {
        colors: {
            cyan: '#22d3ee',
            green: '#10b981',
            purple: '#a855f7',
            yellow: '#f59e0b',
            red: '#ef4444',
            bg: '#111827',
            border: 'rgba(255, 255, 255, 0.05)',
            text: 'rgba(255, 255, 255, 0.5)',
            baseline: 'rgba(245, 158, 11, 0.5)'
        },

        init: function() {
            this.initGauges();
            this.initPerformanceChart();
            this.initScatterChart();
        },

        initPerformanceChart: function() {
            var canvas = document.getElementById('rain-os-performance-chart');
            if (!canvas) return;

            var ctx = canvas.getContext('2d');
            var self = this;

            $.ajax({
                url: typeof rainOsAeo !== 'undefined' ? rainOsAeo.ajaxUrl : ajaxurl,
                type: 'POST',
                data: {
                    action: 'rain_os_get_dashboard_data',
                    nonce: typeof rainOsAeo !== 'undefined' ? rainOsAeo.nonce : '',
                    period: 30
                },
                success: function(response) {
                    if (response.success && response.data.trend_data) {
                        self.createPerformanceChartWithData(ctx, response.data.trend_data);
                    } else {
                        self.createPerformanceChartWithData(ctx, []);
                    }
                },
                error: function() {
                    self.createPerformanceChartWithData(ctx, []);
                }
            });
        },

        createPerformanceChartWithData: function(ctx, trendData) {
            var self = this;
            var labels = [];
            var aiData = [];
            var authorityData = [];
            var conversionData = [];
            var discoverabilityData = [];

            if (trendData && trendData.length > 0) {
                trendData.forEach(function(item) {
                    labels.push(item.date);
                    aiData.push(parseInt(item.avg_ai) || 0);
                    authorityData.push(parseInt(item.avg_authority) || 0);
                    conversionData.push(parseInt(item.avg_conversion) || 0);
                    discoverabilityData.push(parseInt(item.avg_discoverability) || 0);
                });
            } else {
                labels = ['No Data'];
                aiData = [0];
                authorityData = [0];
                conversionData = [0];
                discoverabilityData = [0];
            }

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'AI Readability',
                        data: aiData,
                        borderColor: self.colors.cyan,
                        backgroundColor: self.hexToRgba(self.colors.cyan, 0.1),
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Digital Authority',
                        data: authorityData,
                        borderColor: self.colors.green,
                        backgroundColor: self.hexToRgba(self.colors.green, 0.1),
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Conversion Readiness',
                        data: conversionData,
                        borderColor: self.colors.purple,
                        backgroundColor: self.hexToRgba(self.colors.purple, 0.1),
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Product Discoverability',
                        data: discoverabilityData,
                        borderColor: self.colors.yellow,
                        backgroundColor: self.hexToRgba(self.colors.yellow, 0.1),
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: self.colors.text,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 20,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#ffffff',
                            bodyColor: 'rgba(255,255,255,0.7)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            padding: 12
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: self.colors.border,
                                drawBorder: false
                            },
                            ticks: {
                                color: self.colors.text,
                                font: { size: 11 }
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            grid: {
                                color: self.colors.border,
                                drawBorder: false
                            },
                            ticks: {
                                color: self.colors.text,
                                font: { size: 11 },
                                stepSize: 10
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        },
                        line: {
                            borderWidth: 2
                        }
                    }
                }
            });
        },

        initScatterChart: function() {
            var canvas = document.getElementById('rain-os-scatter-chart');
            if (!canvas) return;

            if (canvas.getAttribute('data-chart-initialized')) return;
            canvas.setAttribute('data-chart-initialized', 'true');

            var ctx = canvas.getContext('2d');
            var self = this;

            // Use pre-loaded signals data if available (Content Signals page),
            // otherwise fall back to AJAX (Dashboard).
            if (typeof rainOsSignalsData !== 'undefined' && rainOsSignalsData.length > 0) {
                self.createScatterChartFromSignals(ctx, rainOsSignalsData);
                return;
            }

            $.ajax({
                url: typeof rainOsAeo !== 'undefined' ? rainOsAeo.ajaxUrl : ajaxurl,
                type: 'POST',
                data: {
                    action: 'rain_os_get_score_history',
                    nonce: typeof rainOsAeo !== 'undefined' ? rainOsAeo.nonce : '',
                    period: 30,
                    limit: 50
                },
                success: function(response) {
                    if (response.success && response.data.posts) {
                        self.createScatterChartWithData(ctx, response.data.posts);
                    } else {
                        self.createScatterChartWithData(ctx, []);
                    }
                },
                error: function() {
                    self.createScatterChartWithData(ctx, []);
                }
            });
        },

        createScatterChartFromSignals: function(ctx, data) {
            var self = this;
            var dataPoints = [];
            var pointColors = [];
            var titles = [];

            data.forEach(function(row) {
                var wordCount = parseInt(row.word_count) || 0;
                var score     = parseFloat(row.overall_score) || 0;
                var title     = row.post_title || 'Untitled';

                dataPoints.push({ x: wordCount, y: score });
                titles.push(title);

                if (score >= 80) {
                    pointColors.push('#10b981');
                } else if (score >= 65) {
                    pointColors.push('#f59e0b');
                } else {
                    pointColors.push('#ef4444');
                }
            });

            new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Posts',
                        data: dataPoints,
                        backgroundColor: pointColors,
                        borderColor: pointColors,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: '#fff',
                            bodyColor: 'rgba(255,255,255,0.75)',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            callbacks: {
                                title: function(context) {
                                    return titles[context[0].dataIndex];
                                },
                                label: function(context) {
                                    return 'Word Count: ' + context.parsed.x + ' | Score: ' + context.parsed.y;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: 'Word Count', color: 'rgba(255,255,255,0.75)' },
                            grid:  { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(255,255,255,0.75)' }
                        },
                        y: {
                            title: { display: true, text: 'AEO Score', color: 'rgba(255,255,255,0.75)' },
                            grid:  { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(255,255,255,0.75)' },
                            min: 0,
                            max: 100
                        }
                    }
                }
            });
        },

        createScatterChartWithData: function(ctx, posts) {
            var self = this;
            var scatterData = [];

            if (posts && posts.length > 0) {
                posts.forEach(function(post) {
                    var avgScore = Math.round((
                        parseInt(post.ai_readability || 0) + 
                        parseInt(post.digital_authority || 0) + 
                        parseInt(post.conversion_readiness || 0) +
                        parseInt(post.product_discoverability || 0)
                    ) / 4);
                    
                    var wordCount = parseInt(post.word_count || 0);
                    
                    scatterData.push({
                        x: wordCount,
                        y: avgScore
                    });
                });
            }

            if (scatterData.length === 0) {
                scatterData = [{ x: 0, y: 0 }];
            }

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
            bgCircle.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
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
