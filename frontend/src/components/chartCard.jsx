// src/components/ChartCard.jsx
import React, { useState } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Card, Button, Badge, Dropdown, Tooltip } from "flowbite-react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";

ChartJS.register(
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);

const chartComponents = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
};

const chartIcons = {
  bar: ChartBarIcon,
  line: ChartBarIcon,
  pie: ChartPieIcon,
  doughnut: ChartPieIcon,
};

const ChartCard = ({ viz, className = "" }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const ChartComp = chartComponents[viz.chartType] || Bar;
  const IconComponent = chartIcons[viz.chartType] || ChartBarIcon;

  // Enhanced chart options with better styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: viz.chartType === "pie" || viz.chartType === "doughnut" ? 1 : 2,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          color: "#374151",
          font: {
            family: "Inter, system-ui, -apple-system, sans-serif",
            size: 12,
            weight: "500"
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          generateLabels: function(chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            labels.forEach(function(label) {
              label.pointStyle = 'circle';
            });
            
            return labels;
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: '600'
        },
        bodyFont: {
          size: 12,
          weight: '400'
        },
        padding: 12,
        caretPadding: 6,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            
            // Handle pie/doughnut charts differently
            if (viz.chartType === "pie" || viz.chartType === "doughnut") {
              const value = context.parsed;
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(value);
              label += ` (${percentage}%)`;
            } else {
              // Handle other chart types (bar, line)
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(context.parsed.y);
              }
            }
            return label;
          }
        }
      }
    },
    scales: viz.chartType === "pie" || viz.chartType === "doughnut" ? {} : {
      x: {
        ticks: {
          color: "#6B7280",
          font: {
            family: "Inter, system-ui, -apple-system, sans-serif",
            size: 11,
            weight: "400"
          },
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
      y: {
        ticks: {
          color: "#6B7280",
          font: {
            family: "Inter, system-ui, -apple-system, sans-serif",
            size: 11,
            weight: "400"
          },
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
          }
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const handleExport = async (format) => {
    setIsLoading(true);
    try {
      // Add export functionality here
      console.log(`Exporting chart as ${format}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate export
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartTypeColor = (chartType) => {
    const colors = {
      bar: "blue",
      line: "green", 
      pie: "purple",
      doughnut: "pink"
    };
    return colors[chartType] || "gray";
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg border-0 bg-white ${className}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <IconComponent className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
              {viz.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge color={getChartTypeColor(viz.chartType)} size="sm">
                {viz.chartType.toUpperCase()}
              </Badge>
              {viz.data?.datasets?.[0]?.data && (
                <span className="text-xs text-gray-500">
                  {viz.data.datasets[0].data.length} data points
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Menu */}
        <Dropdown
          arrowIcon={false}
          inline
          label={<EllipsisVerticalIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
        >
          <Dropdown.Item 
            icon={EyeIcon}
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          </Dropdown.Item>
          <Dropdown.Item 
            icon={ArrowDownTrayIcon}
            onClick={() => handleExport('png')}
          >
            Export as PNG
          </Dropdown.Item>
          <Dropdown.Item 
            icon={ArrowDownTrayIcon}
            onClick={() => handleExport('pdf')}
          >
            Export as PDF
          </Dropdown.Item>
          <Dropdown.Item 
            icon={PrinterIcon}
            onClick={() => window.print()}
          >
            Print Chart
          </Dropdown.Item>
        </Dropdown>
      </div>

      {/* Chart Container */}
      <div className={`relative bg-gray-50 rounded-xl p-4 ${isFullscreen ? 'fixed inset-4 z-50 bg-white shadow-2xl' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Processing...</span>
            </div>
          </div>
        )}
        
        <div className={isFullscreen ? 'h-full p-8' : 'h-80'}>
          <ChartComp
            data={viz.data}
            options={chartOptions}
          />
        </div>
        
        {isFullscreen && (
          <Button
            className="absolute top-4 right-4"
            size="sm"
            color="gray"
            onClick={() => setIsFullscreen(false)}
          >
            Close
          </Button>
        )}
      </div>

      {/* Chart Summary */}
      {viz.summary && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            💡 {viz.summary}
          </p>
        </div>
      )}
    </Card>
  );
};

export default ChartCard;
