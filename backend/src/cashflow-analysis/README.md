# 📊 AI-Powered Business Cashflow Analysis System

A comprehensive backend solution that analyzes business cashflow data using Google Gemini AI to provide actionable business insights, recommendations, and data visualizations compatible with popular React chart libraries.

## 🌟 Features

### 📈 Smart Data Processing
- **Excel File Upload**: Supports .xlsx and .xls files up to 10MB
- **Intelligent Column Detection**: Automatically identifies Date, Amount, Description, Category, and other columns
- **Data Validation**: Comprehensive validation and error handling for malformed data
- **Flexible Date Formats**: Supports multiple date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)

### 🤖 AI-Powered Analysis
- **Google Gemini Integration**: Leverages Gemini 2.5 Flash for comprehensive business analysis
- **Executive Summary**: AI-generated business health overview
- **Health Score**: 0-100 overall financial health rating
- **Actionable Insights**: Categorized insights (profitability, liquidity, trends, risk assessment)
- **Smart Recommendations**: Priority-based recommendations with expected impact
- **Risk Assessment**: Identification of potential business risks

### 📊 Data Visualization Ready
- **Chart.js Compatible**: Direct integration with Chart.js
- **Recharts Support**: Formatted data for Recharts library
- **Victory.js Ready**: Compatible with Victory charting library
- **Multiple Chart Types**: Pie, bar, line, area, and donut charts
- **KPI Dashboards**: Formatted key performance indicators

### 🔐 Enterprise Security
- **User Authentication**: JWT-based authentication
- **Data Isolation**: User-specific data access
- **Input Validation**: Comprehensive data sanitization
- **Rate Limiting**: API rate limiting for stability
- **Error Handling**: Robust error handling and logging

## 🏗️ Architecture

```
src/cashflow-analysis/
├── models/
│   ├── CashflowData.js      # MongoDB schema for cashflow data
│   └── CashflowAnalysis.js  # MongoDB schema for analysis results
├── services/
│   ├── excelProcessor.js    # Excel file processing and validation
│   └── aiAnalysisService.js # Gemini AI integration service
├── routes/
│   └── cashflowRoutes.js    # Express.js API routes
├── utils/
│   └── chartDataFormatter.js # Chart library data formatters
└── index.js                 # Module exports
```

## 🚀 Quick Start

### 1. Installation

The dependencies are already installed with the main project. The cashflow analysis system uses:
- `xlsx` - Excel file processing
- `multer` - File upload handling
- `moment` - Date parsing and formatting
- `axios` - Gemini API communication

### 2. Environment Setup

Ensure your `.env` file includes:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Server Integration

The routes are automatically integrated into the main server at `/api/cashflow/*`

### 4. Database Models

The system automatically creates the necessary MongoDB collections:
- `cashflowdatas` - Stores uploaded cashflow data
- `cashflowanalyses` - Stores AI analysis results

## 📋 API Endpoints

### Core Endpoints
- `POST /api/cashflow/upload` - Upload Excel cashflow data
- `GET /api/cashflow/data` - List user's cashflow data
- `GET /api/cashflow/data/:id` - Get specific cashflow data
- `POST /api/cashflow/analyze/:id` - Start AI analysis
- `GET /api/cashflow/analysis/:id` - Get analysis results
- `GET /api/cashflow/analysis` - List user's analyses
- `GET /api/cashflow/visualization/:analysisId/:chartType` - Get chart data
- `DELETE /api/cashflow/data/:id` - Delete cashflow data

For detailed API documentation, see: [`docs/api/cashflow-analysis-api.md`](../docs/api/cashflow-analysis-api.md)

## 💻 Frontend Integration Examples

### React Component with Chart.js
```javascript
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';

const CashflowAnalysisDashboard = ({ analysisId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch analysis data
    fetch(`/api/cashflow/analysis/${analysisId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setAnalysis(data.data);
      
      // Get expense breakdown chart
      const expenseChart = data.data.visualizations.find(v => v.chartType === 'pie');
      setChartData(expenseChart);
    });
  }, [analysisId]);

  return (
    <div className="dashboard">
      {analysis && (
        <>
          <div className="executive-summary">
            <h2>Executive Summary</h2>
            <p>{analysis.executiveSummary}</p>
            <div className="health-score">
              Health Score: {analysis.overallHealthScore}/100
            </div>
          </div>

          {chartData && (
            <div className="chart-container">
              <Pie data={chartData.data} />
            </div>
          )}

          <div className="insights">
            {analysis.insights.map((insight, index) => (
              <div key={index} className={`insight ${insight.severity}`}>
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
                {insight.recommendation && (
                  <div className="recommendation">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
```

### Upload Component
```javascript
import { useState } from 'react';

const CashflowUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !businessName) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('cashflowFile', file);
    formData.append('businessName', businessName);

    try {
      const response = await fetch('/api/cashflow/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        onUploadSuccess(result.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form">
      <input
        type="text"
        placeholder="Business Name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={uploading || !file || !businessName}>
        {uploading ? 'Uploading...' : 'Upload & Analyze'}
      </button>
    </div>
  );
};
```

### Chart Data Formatter Usage
```javascript
import { ChartDataFormatter } from './cashflow-analysis/utils/chartDataFormatter';

// Format data for different chart libraries
const formatDataForCharts = (analysisData) => {
  const visualizations = analysisData.visualizations.map(viz => ({
    ...viz,
    chartjs: ChartDataFormatter.formatForChartJS(viz),
    recharts: ChartDataFormatter.formatForRecharts(viz),
    victory: ChartDataFormatter.formatForVictory(viz)
  }));

  // Format KPIs for dashboard cards
  const kpiCards = ChartDataFormatter.formatKPICards(analysisData.keyMetrics);

  // Format insights summary
  const insightsSummary = ChartDataFormatter.formatInsightsSummary(analysisData.insights);

  return { visualizations, kpiCards, insightsSummary };
};
```

## 📊 Sample Data Format

### Expected Excel Structure
```
| Date       | Description           | Category | Amount | Subcategory  | Payment Method |
|------------|----------------------|----------|---------|--------------|----------------|
| 2024-01-15 | Product Sales        | revenue  | 5000    | Online Sales | bank_transfer  |
| 2024-01-20 | Office Rent          | expense  | -2000   | Rent         | bank_transfer  |
| 2024-01-25 | Marketing Campaign   | expense  | -1500   | Marketing    | credit_card    |
```

For a complete sample template, see: [`docs/examples/sample-cashflow-data.md`](../docs/examples/sample-cashflow-data.md)

## 🎯 Analysis Output Examples

### Executive Summary
> "The business demonstrates strong financial health with a positive net cashflow of $30,000 over the analysis period. Revenue streams are well-diversified, though seasonal patterns suggest potential cash flow challenges in Q1. Operating expenses are within industry standards, but there are opportunities for cost optimization in marketing and operational categories."

### Key Insights Types
- **Profitability Analysis**: Profit margins, revenue growth, cost efficiency
- **Liquidity Assessment**: Cash flow patterns, working capital management
- **Trend Analysis**: Seasonal patterns, growth trajectories, cyclical behaviors
- **Risk Assessment**: Cash flow volatility, expense concentration, revenue dependencies
- **Growth Potential**: Expansion opportunities, scalability factors
- **Cost Optimization**: Expense reduction opportunities, efficiency improvements

### Visualization Types
- **Expense Breakdown** (Pie Chart): Category-wise expense distribution
- **Revenue vs Expenses** (Bar Chart): Monthly comparison trends
- **Net Cashflow Trend** (Line Chart): Cashflow evolution over time
- **KPI Cards**: Key metrics with trends and benchmarks

## 🔧 Customization

### Adding Custom Analysis Types
1. Extend the `insightSchema` in `CashflowAnalysis.js`
2. Update the AI prompt in `aiAnalysisService.js`
3. Add visualization logic in `chartDataFormatter.js`

### Custom Chart Types
1. Add new chart type to `visualizationDataSchema`
2. Implement formatting logic in `ChartDataFormatter`
3. Update frontend components accordingly

### Business Rules
1. Modify category detection in `excelProcessor.js`
2. Adjust AI analysis prompts for industry-specific insights
3. Customize KPI calculations in `aiAnalysisService.js`

## 🚨 Error Handling

The system includes comprehensive error handling for:
- Invalid file formats or corrupted Excel files
- Missing required columns or malformed data
- Gemini AI API failures or rate limiting
- Database connection issues
- Authentication and authorization errors

## 📈 Performance Considerations

- **File Processing**: Handles files up to 10MB efficiently
- **AI Analysis**: Background processing to avoid request timeouts
- **Database Optimization**: Indexed queries for fast data retrieval
- **Caching**: Analysis results cached to avoid redundant AI calls
- **Rate Limiting**: Prevents API abuse and ensures stability

## 🔮 Future Enhancements

- **Multi-currency Support**: Handle different currencies in analysis
- **Industry Benchmarking**: Compare metrics against industry standards
- **Predictive Modeling**: Forecast future cashflow patterns
- **Advanced Visualizations**: 3D charts, interactive dashboards
- **PDF Reports**: Generate comprehensive PDF analysis reports
- **Real-time Monitoring**: Live cashflow tracking and alerts

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all endpoints have proper authentication
5. Validate all user inputs thoroughly

## 📄 License

This feature is part of the main project and follows the same licensing terms.

---

**Built with ❤️ using Node.js, Express, MongoDB, and Google Gemini AI**