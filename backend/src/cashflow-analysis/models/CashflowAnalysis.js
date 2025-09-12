// src/cashflow-analysis/models/CashflowAnalysis.js
const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'profitability', 
      'liquidity', 
      'trend_analysis', 
      'expense_breakdown', 
      'revenue_analysis', 
      'seasonal_patterns',
      'risk_assessment',
      'growth_potential',
      'cost_optimization',
      'forecasting'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  actionable: {
    type: Boolean,
    default: false
  },
  recommendation: {
    type: String
  },
  impact: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  }
});

const visualizationDataSchema = new mongoose.Schema({
  chartType: {
    type: String,
    required: true,
    enum: ['pie', 'bar', 'line', 'area', 'donut', 'scatter', 'radar']
  },
  title: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  options: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  category: {
    type: String,
    enum: ['revenue', 'expenses', 'trends', 'comparisons', 'forecasts']
  }
});

const kpiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'currency'
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  changePercentage: {
    type: Number,
    default: 0
  },
  benchmark: {
    type: Number
  },
  description: {
    type: String
  }
});

const cashflowAnalysisSchema = new mongoose.Schema({
  cashflowDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CashflowData',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  analysisDate: {
    type: Date,
    default: Date.now
  },
  executiveSummary: {
    type: String,
    required: false, // Allow initial save without summary
    default: ''
  },
  overallHealthScore: {
    type: Number,
    min: 0,
    max: 100,
    required: false, // Allow initial save without score
    default: 0
  },
  insights: [insightSchema],
  visualizations: [visualizationDataSchema],
  keyMetrics: [kpiSchema],
  recommendations: [{
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      required: true
    },
    category: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    expectedImpact: {
      type: String
    },
    timeframe: {
      type: String
    }
  }],
  riskFactors: [{
    type: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    likelihood: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    }
  }],
  geminiPrompt: {
    type: String
  },
  geminiResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  processingTime: {
    type: Number // in milliseconds
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
cashflowAnalysisSchema.index({ userId: 1, analysisDate: -1 });
cashflowAnalysisSchema.index({ cashflowDataId: 1 });
cashflowAnalysisSchema.index({ status: 1 });

module.exports = mongoose.model('CashflowAnalysis', cashflowAnalysisSchema);