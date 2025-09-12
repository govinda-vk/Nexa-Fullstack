import React from "react";
import Card from "./card.jsx";
import ChartCard from "./chartCard.jsx";

const Results = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Existing Result UI */}
      <Card title=" Overall Business Health">
        <div className="w-full bg-gray-800 rounded-full h-6">
          <div
            className="bg-[#323686] h-6 rounded-full text-right pr-2 text-sm font-bold text-black"
            style={{ width: `${analysis.overallHealthScore}%` }}
          >
            {analysis.overallHealthScore}/100
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <Card title=" Key Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] rounded-lg p-4 shadow border-l-4 border-[#6B6ED4]">
            <p className="text-sm text-gray-400">Net Cashflow</p>
            <p className="text-xl font-bold text-white">
              {analysis.keyMetrics?.netCashflow || "$0"}
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 shadow border-l-4 border-[#6B6ED4]">
            <p className="text-sm text-gray-400">Gross Profit Margin</p>
            <p className="text-xl font-bold text-white">
              {analysis.keyMetrics?.grossProfitMargin || "0%"}
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 shadow border-l-4 border-[#6B6ED4]">
            <p className="text-sm text-gray-400">Employee Salary Expense</p>
            <p className="text-xl font-bold text-white">
              {analysis.keyMetrics?.employeeSalary || "$0"}
            </p>
          </div>
        </div>
      </Card>

      {/* Insights */}
      {analysis.insights && (
        <Card title=" AI Insights">
          {analysis.insights.map((insight, idx) => (
            <div key={idx} className="bg-[#1a1a1a] p-4 mb-3 rounded-lg border-l-4 border-[#6B6ED4]">
              <p className="font-bold text-white">{insight.title}</p>
              <p className="text-gray-300">{insight.description}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations && (
        <Card title=" AI Recommendations">
          {analysis.recommendations.map((rec, idx) => (
            <div key={idx} className="bg-[#1a1a1a] p-4 mb-3 rounded-lg border-l-4 border-green-400">
              <p className="font-bold text-green-400">{rec.title}</p>
              <p className="text-gray-300">{rec.description}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Visualizations */}
      {analysis.visualizations && (
        <Card title=" Visualizations">
          <div className="grid md:grid-cols-2 gap-6">
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
