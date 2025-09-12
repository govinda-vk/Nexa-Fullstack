// src/cashflow-analysis/index.js
const cashflowRoutes = require('./routes/cashflowRoutes');
const CashflowData = require('./models/CashflowData');
const CashflowAnalysis = require('./models/CashflowAnalysis');
const ExcelProcessor = require('./services/excelProcessor');
const AIAnalysisService = require('./services/aiAnalysisService');
const ChartDataFormatter = require('./utils/chartDataFormatter');

module.exports = {
  routes: {
    cashflow: cashflowRoutes
  },
  models: {
    CashflowData,
    CashflowAnalysis
  },
  services: {
    ExcelProcessor,
    AIAnalysisService
  },
  utils: {
    ChartDataFormatter
  }
};