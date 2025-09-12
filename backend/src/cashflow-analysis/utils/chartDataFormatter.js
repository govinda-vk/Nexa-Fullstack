// src/cashflow-analysis/utils/chartDataFormatter.js

/**
 * Utility class for formatting data for popular React chart libraries
 * Supports Chart.js, Recharts, and Victory.js formats
 */
class ChartDataFormatter {
  
  /**
   * Format data for Chart.js
   * @param {Object} visualizationData - Raw visualization data from analysis
   * @returns {Object} Chart.js compatible data structure
   */
  static formatForChartJS(visualizationData) {
    const { chartType, data, title } = visualizationData;
    
    switch (chartType) {
      case 'pie':
      case 'donut':
        return {
          type: chartType === 'donut' ? 'doughnut' : 'pie',
          data: {
            labels: data.labels || [],
            datasets: [{
              data: data.data || [],
              backgroundColor: data.backgroundColor || this.getDefaultColors(data.data?.length || 0),
              borderWidth: 1,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: title,
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                position: 'bottom',
                labels: { padding: 20 }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                  }
                }
              }
            }
          }
        };
      
      case 'bar':
        return {
          type: 'bar',
          data: {
            labels: data.labels || [],
            datasets: data.datasets ? data.datasets.map(dataset => ({
              ...dataset,
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false
            })) : []
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: title,
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  }
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        };
      
      case 'line':
      case 'area':
        return {
          type: 'line',
          data: {
            labels: data.labels || [],
            datasets: data.datasets ? data.datasets.map(dataset => ({
              ...dataset,
              fill: chartType === 'area',
              tension: 0.4,
              pointBackgroundColor: dataset.borderColor,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5
            })) : []
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: title,
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  }
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        };
      
      default:
        throw new Error(`Unsupported chart type for Chart.js: ${chartType}`);
    }
  }

  /**
   * Format data for Recharts
   * @param {Object} visualizationData - Raw visualization data from analysis
   * @returns {Object} Recharts compatible data structure
   */
  static formatForRecharts(visualizationData) {
    const { chartType, data, title } = visualizationData;
    
    switch (chartType) {
      case 'pie':
      case 'donut':
        return {
          chartType: 'PieChart',
          data: data.labels ? data.labels.map((label, index) => ({
            name: label,
            value: data.data[index],
            fill: data.backgroundColor ? data.backgroundColor[index] : this.getDefaultColors(1)[0]
          })) : [],
          config: {
            title,
            innerRadius: chartType === 'donut' ? 40 : 0,
            outerRadius: 80,
            paddingAngle: 2,
            dataKey: 'value',
            nameKey: 'name'
          }
        };
      
      case 'bar':
        const barData = data.labels ? data.labels.map((label, index) => {
          const item = { name: label };
          data.datasets?.forEach(dataset => {
            item[dataset.label] = dataset.data[index];
          });
          return item;
        }) : [];
        
        return {
          chartType: 'BarChart',
          data: barData,
          config: {
            title,
            xAxisDataKey: 'name',
            bars: data.datasets ? data.datasets.map(dataset => ({
              dataKey: dataset.label,
              fill: dataset.backgroundColor || '#8884d8',
              name: dataset.label
            })) : []
          }
        };
      
      case 'line':
      case 'area':
        const lineData = data.labels ? data.labels.map((label, index) => {
          const item = { name: label };
          data.datasets?.forEach(dataset => {
            item[dataset.label] = dataset.data[index];
          });
          return item;
        }) : [];
        
        return {
          chartType: chartType === 'area' ? 'AreaChart' : 'LineChart',
          data: lineData,
          config: {
            title,
            xAxisDataKey: 'name',
            lines: data.datasets ? data.datasets.map(dataset => ({
              dataKey: dataset.label,
              stroke: dataset.borderColor || '#8884d8',
              fill: chartType === 'area' ? (dataset.backgroundColor || '#8884d8') : 'none',
              name: dataset.label
            })) : []
          }
        };
      
      default:
        throw new Error(`Unsupported chart type for Recharts: ${chartType}`);
    }
  }

  /**
   * Format data for Victory.js
   * @param {Object} visualizationData - Raw visualization data from analysis
   * @returns {Object} Victory compatible data structure
   */
  static formatForVictory(visualizationData) {
    const { chartType, data, title } = visualizationData;
    
    switch (chartType) {
      case 'pie':
      case 'donut':
        return {
          chartType: 'VictoryPie',
          data: data.labels ? data.labels.map((label, index) => ({
            x: label,
            y: data.data[index]
          })) : [],
          config: {
            title,
            innerRadius: chartType === 'donut' ? 40 : 0,
            colorScale: data.backgroundColor || this.getDefaultColors(data.data?.length || 0)
          }
        };
      
      case 'bar':
        return {
          chartType: 'VictoryChart',
          data: data.datasets ? data.datasets.map(dataset => ({
            name: dataset.label,
            data: data.labels ? data.labels.map((label, index) => ({
              x: label,
              y: dataset.data[index]
            })) : [],
            style: { data: { fill: dataset.backgroundColor || '#8884d8' } }
          })) : [],
          config: {
            title,
            domainPadding: 20
          }
        };
      
      case 'line':
      case 'area':
        return {
          chartType: 'VictoryChart',
          data: data.datasets ? data.datasets.map(dataset => ({
            name: dataset.label,
            data: data.labels ? data.labels.map((label, index) => ({
              x: label,
              y: dataset.data[index]
            })) : [],
            style: { 
              data: { 
                stroke: dataset.borderColor || '#8884d8',
                fill: chartType === 'area' ? (dataset.backgroundColor || '#8884d8') : 'none'
              } 
            }
          })) : [],
          config: {
            title,
            lineType: chartType
          }
        };
      
      default:
        throw new Error(`Unsupported chart type for Victory: ${chartType}`);
    }
  }

  /**
   * Get chart data in multiple formats for maximum compatibility
   * @param {Object} visualizationData - Raw visualization data from analysis
   * @returns {Object} Data formatted for multiple chart libraries
   */
  static getMultiFormatData(visualizationData) {
    try {
      return {
        chartjs: this.formatForChartJS(visualizationData),
        recharts: this.formatForRecharts(visualizationData),
        victory: this.formatForVictory(visualizationData),
        raw: visualizationData
      };
    } catch (error) {
      console.error('Error formatting chart data:', error);
      return {
        error: error.message,
        raw: visualizationData
      };
    }
  }

  /**
   * Get default color palette
   * @param {number} count - Number of colors needed
   * @returns {Array} Array of color strings
   * @private
   */
  static getDefaultColors(count) {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    
    return colors.slice(0, Math.max(count, 1));
  }

  /**
   * Generate KPI card data for dashboard display
   * @param {Array} keyMetrics - Array of key metrics from analysis
   * @returns {Array} Formatted KPI data for dashboard cards
   */
  static formatKPICards(keyMetrics) {
    return keyMetrics.map(metric => ({
      title: metric.name,
      value: this.formatValue(metric.value, metric.unit),
      trend: metric.trend || 'stable',
      change: metric.changePercentage || 0,
      description: metric.description,
      color: this.getTrendColor(metric.trend),
      icon: this.getMetricIcon(metric.name, metric.unit)
    }));
  }

  /**
   * Format value based on unit type
   * @param {number} value - The numeric value
   * @param {string} unit - The unit type
   * @returns {string} Formatted value string
   * @private
   */
  static formatValue(value, unit) {
    switch (unit) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'ratio':
        return value.toFixed(2);
      case 'count':
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
  }

  /**
   * Get color based on trend
   * @param {string} trend - The trend direction
   * @returns {string} Color code
   * @private
   */
  static getTrendColor(trend) {
    switch (trend) {
      case 'up':
        return '#4CAF50'; // Green
      case 'down':
        return '#F44336'; // Red
      case 'stable':
      default:
        return '#2196F3'; // Blue
    }
  }

  /**
   * Get icon suggestion based on metric name and unit
   * @param {string} name - Metric name
   * @param {string} unit - Metric unit
   * @returns {string} Icon suggestion
   * @private
   */
  static getMetricIcon(name, unit) {
    const lowerName = name.toLowerCase();
    
    if (unit === 'currency' || lowerName.includes('revenue') || lowerName.includes('profit')) {
      return 'dollar-sign';
    }
    if (lowerName.includes('expense') || lowerName.includes('cost')) {
      return 'credit-card';
    }
    if (lowerName.includes('growth') || lowerName.includes('increase')) {
      return 'trending-up';
    }
    if (lowerName.includes('ratio') || lowerName.includes('margin')) {
      return 'percent';
    }
    if (lowerName.includes('transaction') || lowerName.includes('count')) {
      return 'hash';
    }
    
    return 'bar-chart';
  }

  /**
   * Generate insights summary for dashboard
   * @param {Array} insights - Array of insights from analysis
   * @returns {Object} Summarized insights data
   */
  static formatInsightsSummary(insights) {
    const summary = {
      total: insights.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byType: {},
      actionable: insights.filter(i => i.actionable).length,
      positive: insights.filter(i => i.impact === 'positive').length,
      negative: insights.filter(i => i.impact === 'negative').length,
      topInsights: insights
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)
        .map(insight => ({
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          confidence: insight.confidence
        }))
    };

    insights.forEach(insight => {
      summary.bySeverity[insight.severity]++;
      summary.byType[insight.type] = (summary.byType[insight.type] || 0) + 1;
    });

    return summary;
  }

  /**
   * Generate recommendations summary
   * @param {Array} recommendations - Array of recommendations from analysis
   * @returns {Object} Summarized recommendations data
   */
  static formatRecommendationsSummary(recommendations) {
    const summary = {
      total: recommendations.length,
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      byCategory: {},
      immediate: recommendations.filter(r => r.timeframe === 'immediate').length,
      topRecommendations: recommendations
        .filter(r => r.priority === 'urgent' || r.priority === 'high')
        .slice(0, 5)
        .map(rec => ({
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          category: rec.category,
          expectedImpact: rec.expectedImpact
        }))
    };

    recommendations.forEach(rec => {
      summary.byPriority[rec.priority]++;
      summary.byCategory[rec.category] = (summary.byCategory[rec.category] || 0) + 1;
    });

    return summary;
  }
}

module.exports = ChartDataFormatter;