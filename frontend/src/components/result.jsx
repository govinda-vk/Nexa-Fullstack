import React from "react";
import Card from "./card.jsx";
import ChartCard from "./chartCard.jsx";

const Results = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-8">
      {/* Overall Business Health */}
      <Card title="📈 Overall Business Health">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-light text-gray-600">Health Score</span>
            <span className="text-2xl font-light text-black">{analysis.overallHealthScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-black h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${analysis.overallHealthScore}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <Card title="💰 Key Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-black">
            <p className="text-sm text-gray-500 font-light mb-2">Net Cashflow</p>
            <p className="text-2xl font-light text-black">
              {analysis.keyMetrics?.netCashflow || "$0"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-black">
            <p className="text-sm text-gray-500 font-light mb-2">Gross Profit Margin</p>
            <p className="text-2xl font-light text-black">
              {analysis.keyMetrics?.grossProfitMargin || "0%"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-black">
            <p className="text-sm text-gray-500 font-light mb-2">Employee Salary Expense</p>
            <p className="text-2xl font-light text-black">
              {analysis.keyMetrics?.employeeSalary || "$0"}
            </p>
          </div>
        </div>
      </Card>

      {/* Insights */}
      {analysis.insights && (
        <Card title="🧠 AI Insights">
          <div className="space-y-4">
            {analysis.insights.map((insight, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-xl border-l-4 border-blue-500">
                <p className="font-medium text-black mb-2">{insight.title}</p>
                <p className="text-gray-600 font-light">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations && (
        <Card title="💡 AI Recommendations">
          <div className="space-y-4">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-xl border-l-4 border-green-500">
                <p className="font-medium text-green-700 mb-2">{rec.title}</p>
                <p className="text-gray-600 font-light">{rec.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Visualizations */}
      {analysis.visualizations && (
        <Card title="📊 Visualizations">
          <div className="grid md:grid-cols-2 gap-8">
            {analysis.visualizations.map((viz, idx) => (
              <ChartCard key={idx} viz={viz} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Results;
