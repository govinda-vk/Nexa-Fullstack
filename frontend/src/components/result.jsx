import React from "react";
import Card from "./card.jsx";
import ChartCard from "./chartCard.jsx";

const Results = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      {analysis.executiveSummary && (
        <Card title="📋 Executive Summary">
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
            <p className="text-gray-800 font-light leading-relaxed text-lg">
              {analysis.executiveSummary}
            </p>
          </div>
        </Card>
      )}

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
          <div className="text-center text-sm text-gray-600">
            {analysis.overallHealthScore >= 80 ? '🟢 Excellent' : 
             analysis.overallHealthScore >= 60 ? '🟡 Good' : 
             analysis.overallHealthScore >= 40 ? '🟠 Fair' : '🔴 Needs Attention'}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      {analysis.keyMetrics && (
        <Card title="💰 Key Metrics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(analysis.keyMetrics) ? (
              // New format: keyMetrics is an array
              analysis.keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6 border-l-4 border-black">
                  <p className="text-sm text-gray-500 font-light mb-2">{metric.name}</p>
                  <p className="text-2xl font-light text-black">
                    {metric.unit === 'currency' ? `$${metric.value.toLocaleString()}` : 
                     metric.unit === 'percentage' ? `${metric.value}%` : 
                     metric.value.toLocaleString()}
                  </p>
                  {metric.trend && (
                    <p className="text-xs text-gray-500 mt-1">
                      {metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️'} 
                      {metric.trend}
                    </p>
                  )}
                </div>
              ))
            ) : (
              // Legacy format: keyMetrics is an object
              <>
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
              </>
            )}
          </div>
        </Card>
      )}

      {/* Insights */}
      {analysis.insights && (
        <Card title="🧠 AI Insights">
          <div className="space-y-4">
            {analysis.insights.map((insight, idx) => {
              const severityColor = insight.severity === 'high' ? 'border-red-500' : 
                                  insight.severity === 'medium' ? 'border-yellow-500' : 
                                  'border-green-500';
              const severityIcon = insight.severity === 'high' ? '🔴' : 
                                  insight.severity === 'medium' ? '🟡' : 
                                  '🟢';
              
              return (
                <div key={idx} className={`bg-gray-50 p-6 rounded-xl border-l-4 ${severityColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-black">{severityIcon} {insight.title}</p>
                    {insight.confidence && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {insight.confidence}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 font-light mb-3">{insight.description}</p>
                  {insight.recommendation && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">💡 Recommendation:</p>
                      <p className="text-sm text-blue-700">{insight.recommendation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations && (
        <Card title="💡 AI Recommendations">
          <div className="space-y-4">
            {analysis.recommendations.map((rec, idx) => {
              const priorityColor = rec.priority === 'high' ? 'border-red-500 bg-red-50' : 
                                   rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                                   'border-green-500 bg-green-50';
              const priorityIcon = rec.priority === 'high' ? '🚨' : 
                                  rec.priority === 'medium' ? '⚡' : 
                                  '💡';
              
              return (
                <div key={idx} className={`p-6 rounded-xl border-l-4 ${priorityColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-black">{priorityIcon} {rec.title}</p>
                    <span className={`text-xs px-2 py-1 rounded text-white ${
                      rec.priority === 'high' ? 'bg-red-500' : 
                      rec.priority === 'medium' ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}>
                      {rec.priority?.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-gray-600 font-light mb-3">{rec.description}</p>
                  {rec.expectedImpact && (
                    <div className="bg-white p-3 rounded-lg mb-2">
                      <p className="text-sm font-medium text-gray-800 mb-1">📊 Expected Impact:</p>
                      <p className="text-sm text-gray-700">{rec.expectedImpact}</p>
                    </div>
                  )}
                  {rec.timeframe && (
                    <p className="text-xs text-gray-500">
                      ⏱️ Timeframe: {rec.timeframe.replace('_', ' ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Risk Factors */}
      {analysis.riskFactors && (
        <Card title="⚠️ Risk Factors">
          <div className="space-y-4">
            {analysis.riskFactors.map((risk, idx) => {
              const riskColor = risk.impact === 'high' ? 'border-red-500 bg-red-50' : 
                               risk.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                               'border-orange-500 bg-orange-50';
              const riskIcon = risk.impact === 'high' ? '🚨' : 
                              risk.impact === 'medium' ? '⚠️' : 
                              '🔶';
              
              return (
                <div key={idx} className={`p-6 rounded-xl border-l-4 ${riskColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-black">{riskIcon} {risk.type.charAt(0).toUpperCase() + risk.type.slice(1)} Risk</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {risk.likelihood} likelihood
                      </span>
                      <span className={`text-xs px-2 py-1 rounded text-white ${
                        risk.impact === 'high' ? 'bg-red-500' : 
                        risk.impact === 'medium' ? 'bg-yellow-500' : 
                        'bg-orange-500'
                      }`}>
                        {risk.impact} impact
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 font-light">{risk.description}</p>
                </div>
              );
            })}
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
