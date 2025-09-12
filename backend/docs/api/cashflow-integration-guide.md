# Cashflow Analysis API Integration Guide

## Overview

The Cashflow Analysis API provides AI-powered business financial analysis using Google Gemini. It processes Excel files containing cashflow data and returns comprehensive business insights, visualizations, and recommendations.

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Data Upload Process](#data-upload-process)
4. [Analysis Process](#analysis-process)
5. [Response Data Structures](#response-data-structures)
6. [Chart Data Processing](#chart-data-processing)
7. [Error Handling](#error-handling)
8. [Frontend Integration Workflow](#frontend-integration-workflow)
9. [Excel File Format Requirements](#excel-file-format-requirements)
10. [Rate Limits & Best Practices](#rate-limits--best-practices)

## Authentication

All cashflow API endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Upload Cashflow Data

**Endpoint:** `POST /api/cashflow/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: Excel file (.xlsx format)
```

**Response:**
```json
{
  "message": "File uploaded and processed successfully",
  "data": {
    "_id": "68c3d90b644af741a89e1619",
    "filename": "sample-cashflow-data.xlsx",
    "businessName": "Test Business Corp",
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-03-31"
    },
    "summary": {
      "totalRevenue": 37350,
      "totalExpenses": 24700,
      "netCashflow": 12650,
      "transactionCount": 15
    },
    "createdAt": "2025-09-12T08:25:47.123Z"
  }
}
```

### 2. Get Cashflow Data List

**Endpoint:** `GET /api/cashflow/data`

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
{
  "data": [
    {
      "_id": "68c3d90b644af741a89e1619",
      "filename": "sample-cashflow-data.xlsx",
      "businessName": "Test Business Corp",
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-03-31"
      },
      "summary": {
        "totalRevenue": 37350,
        "totalExpenses": 24700,
        "netCashflow": 12650,
        "transactionCount": 15
      },
      "createdAt": "2025-09-12T08:25:47.123Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 3. Get Single Cashflow Data

**Endpoint:** `GET /api/cashflow/data/:id`

**Response:**
```json
{
  "data": {
    "_id": "68c3d90b644af741a89e1619",
    "filename": "sample-cashflow-data.xlsx",
    "businessName": "Test Business Corp",
    "entries": [
      {
        "date": "2024-01-15",
        "description": "Product Sales - Online",
        "category": "revenue",
        "amount": 8500,
        "subcategory": "Product Sales",
        "paymentMethod": "Credit Card",
        "reference": "INV-001"
      }
    ],
    "summary": {
      "totalRevenue": 37350,
      "totalExpenses": 24700,
      "netCashflow": 12650,
      "transactionCount": 15
    }
  }
}
```

### 4. Start AI Analysis

**Endpoint:** `POST /api/cashflow/analyze/:cashflowDataId`

**Response:**
```json
{
  "message": "Analysis started successfully",
  "analysisId": "68c3d90f644af741a89e1643"
}
```

### 5. Get Analysis Status/Result

**Endpoint:** `GET /api/cashflow/analysis/:analysisId`

**Response (In Progress):**
```json
{
  "status": "processing",
  "message": "Analysis in progress...",
  "progress": 50,
  "estimatedTimeRemaining": "30 seconds"
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "analysis": {
    "executiveSummary": "Test Business Corp shows a positive net cashflow of $12,650...",
    "overallHealthScore": 70,
    "insights": [...],
    "keyMetrics": [...],
    "recommendations": [...],
    "riskFactors": [...],
    "visualizations": [...]
  },
  "completedAt": "2025-09-12T08:26:02.123Z"
}
```

### 6. Get All Analyses

**Endpoint:** `GET /api/cashflow/analysis`

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10)
- `status` (optional): Filter by status (`processing`, `completed`, `failed`)

**Response:**
```json
{
  "data": [
    {
      "_id": "68c3d90f644af741a89e1643",
      "cashflowDataId": "68c3d90b644af741a89e1619",
      "status": "completed",
      "executiveSummary": "Brief summary...",
      "overallHealthScore": 70,
      "createdAt": "2025-09-12T08:25:51.123Z",
      "completedAt": "2025-09-12T08:26:02.123Z"
    }
  ]
}
```

### 7. Delete Cashflow Data

**Endpoint:** `DELETE /api/cashflow/data/:id`

**Response:**
```json
{
  "message": "Cashflow data deleted successfully"
}
```

### 8. Delete Analysis

**Endpoint:** `DELETE /api/cashflow/analysis/:id`

**Response:**
```json
{
  "message": "Analysis deleted successfully"
}
```

## Data Upload Process

### Step-by-Step Upload Flow

1. **File Validation**: System validates Excel file format and structure
2. **Data Extraction**: Extracts transaction data from Excel sheets
3. **Data Processing**: Categorizes and validates each transaction
4. **Storage**: Saves processed data to MongoDB
5. **Response**: Returns upload confirmation with data summary

### Expected Excel Format

The Excel file must contain these columns (case-insensitive):
- **Date**: Transaction date (various formats supported)
- **Description**: Transaction description
- **Category**: `revenue` or `expense`
- **Amount**: Numerical amount
- **Subcategory**: Optional subcategory for grouping
- **Payment Method**: Optional payment method
- **Reference**: Optional reference number

## Analysis Process

### AI Analysis Workflow

1. **Data Preparation**: System formats cashflow data for AI analysis
2. **Prompt Generation**: Creates comprehensive analysis prompt
3. **AI Processing**: Sends data to Google Gemini API
4. **Response Parsing**: Validates and structures AI response
5. **Visualization Generation**: Creates chart data structures
6. **Storage**: Saves complete analysis to database

### Analysis Components

The AI generates:
- **Executive Summary**: High-level business health overview
- **Health Score**: 0-100 numerical score
- **Insights**: Detailed financial insights with actionability
- **Key Metrics**: Important financial indicators
- **Recommendations**: Prioritized action items
- **Risk Factors**: Potential business risks
- **Visualizations**: Chart data for frontend rendering

## Response Data Structures

### Insight Object

```json
{
  "type": "profitability|liquidity|trend_analysis|expense_breakdown|revenue_analysis",
  "title": "Insight Title",
  "description": "Detailed insight description",
  "severity": "low|medium|high|critical",
  "actionable": true,
  "recommendation": "Specific recommendation text",
  "impact": "positive|negative|neutral",
  "confidence": 85
}
```

### Key Metric Object

```json
{
  "name": "Net Cashflow",
  "value": 12650,
  "unit": "currency|percentage|count|ratio",
  "trend": "up|down|stable",
  "changePercentage": 15.5,
  "description": "Metric explanation"
}
```

### Recommendation Object

```json
{
  "priority": "low|medium|high|urgent",
  "category": "cost_reduction|revenue_growth|cash_management|risk_mitigation",
  "title": "Recommendation Title",
  "description": "Detailed recommendation",
  "expectedImpact": "Expected business impact",
  "timeframe": "immediate|short_term|medium_term|long_term"
}
```

### Risk Factor Object

```json
{
  "type": "cashflow|operational|market|financial",
  "description": "Risk description",
  "likelihood": "low|medium|high",
  "impact": "low|medium|high"
}
```

## Chart Data Processing

### Available Chart Types

1. **Pie Chart** - Expense Breakdown
2. **Bar Chart** - Revenue vs Expenses by Month
3. **Line Chart** - Cashflow Trends (if available)

### Visualization Object Structure

```json
{
  "chartType": "pie|bar|line|area|doughnut",
  "title": "Chart Title",
  "category": "expenses|comparisons|trends",
  "data": {
    // Chart.js compatible data structure
  }
}
```

### Pie Chart Data Format

```json
{
  "chartType": "pie",
  "title": "Expense Breakdown",
  "category": "expenses",
  "data": {
    "labels": ["Salaries", "Rent", "Marketing", "Utilities", "Supplies"],
    "datasets": [{
      "data": [16000, 3000, 2000, 1000, 500],
      "backgroundColor": [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
        "#9966FF", "#FF9F40", "#E7E9ED", "#71B37C"
      ]
    }]
  }
}
```

### Bar Chart Data Format

```json
{
  "chartType": "bar",
  "title": "Revenue vs Expenses by Month",
  "category": "comparisons",
  "data": {
    "labels": ["Jan 2024", "Feb 2024", "Mar 2024"],
    "datasets": [
      {
        "label": "Revenue",
        "data": [8500, 11200, 17650],
        "backgroundColor": "#36A2EB"
      },
      {
        "label": "Expenses",
        "data": [11500, 8400, 4800],
        "backgroundColor": "#FF6384"
      }
    ]
  }
}
```

### Chart.js Integration

The visualization data is fully compatible with Chart.js. Use directly:

```javascript
// Example for frontend integration
const chartConfig = {
  type: visualization.chartType,
  data: visualization.data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: visualization.title
      }
    }
  }
};
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Invalid file format. Please upload an Excel (.xlsx) file.",
  "code": "INVALID_FILE_FORMAT"
}
```

#### 401 Unauthorized
```json
{
  "error": "Authentication Error",
  "message": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Cashflow data not found",
  "code": "DATA_NOT_FOUND"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Analysis Error",
  "message": "Failed to analyze cashflow data",
  "code": "ANALYSIS_FAILED",
  "details": "AI service temporarily unavailable"
}
```

### File Processing Errors

#### Invalid Excel Structure
```json
{
  "error": "Processing Error",
  "message": "Required columns missing: date, amount, category",
  "code": "MISSING_COLUMNS",
  "missingColumns": ["date", "amount"]
}
```

#### Data Validation Errors
```json
{
  "error": "Data Validation Error",
  "message": "Invalid data found in rows",
  "code": "INVALID_DATA",
  "invalidRows": [
    {
      "row": 5,
      "issue": "Invalid date format",
      "value": "invalid-date"
    }
  ]
}
```

## Frontend Integration Workflow

### 1. File Upload Component

```javascript
// Recommended file upload flow
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/cashflow/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### 2. Analysis Polling

```javascript
// Poll for analysis completion
const pollAnalysis = async (analysisId) => {
  const poll = async () => {
    const response = await fetch(`/api/cashflow/analysis/${analysisId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.status === 'completed') {
      return data.analysis;
    } else if (data.status === 'failed') {
      throw new Error('Analysis failed');
    }
    
    // Continue polling
    setTimeout(poll, 2000);
  };
  
  return poll();
};
```

### 3. Chart Rendering

```javascript
// Process visualization data for Chart.js
const processVisualizationData = (visualizations) => {
  return visualizations.map(viz => ({
    type: viz.chartType,
    title: viz.title,
    data: viz.data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: viz.title }
      },
      scales: viz.chartType === 'pie' ? {} : {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => '$' + value.toLocaleString()
          }
        }
      }
    }
  }));
};
```

### 4. Data Display Components

```javascript
// Format metric values
const formatMetricValue = (metric) => {
  switch (metric.unit) {
    case 'currency':
      return '$' + metric.value.toLocaleString();
    case 'percentage':
      return metric.value.toFixed(1) + '%';
    default:
      return metric.value.toLocaleString();
  }
};

// Priority indicators
const getPriorityColor = (priority) => {
  const colors = {
    urgent: '#ff4757',
    high: '#ff6348',
    medium: '#ffa502',
    low: '#2ed573'
  };
  return colors[priority] || '#747d8c';
};
```

## Excel File Format Requirements

### Required Columns

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| Date | Date | Yes | Transaction date (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD) |
| Description | Text | Yes | Transaction description |
| Category | Text | Yes | Must be 'revenue' or 'expense' |
| Amount | Number | Yes | Transaction amount (positive numbers) |
| Subcategory | Text | No | Expense/revenue subcategory |
| Payment Method | Text | No | Payment method used |
| Reference | Text | No | Reference number or code |

### Sample Data Format

| Date | Description | Category | Amount | Subcategory | Payment Method | Reference |
|------|-------------|----------|--------|-------------|----------------|-----------|
| 01/15/2024 | Product Sales - Online | revenue | 8500 | Product Sales | Credit Card | INV-001 |
| 01/15/2024 | Employee Salaries | expense | 5000 | Salaries | Bank Transfer | PAY-001 |
| 01/20/2024 | Office Rent | expense | 1500 | Rent | Check | RENT-JAN |

### Data Validation Rules

1. **Dates**: Must be valid date format
2. **Category**: Only 'revenue' or 'expense' accepted
3. **Amount**: Must be positive number
4. **Description**: Cannot be empty
5. **Duplicates**: System allows but flags potential duplicates

## Rate Limits & Best Practices

### API Rate Limits

- **File Upload**: 5 files per minute per user
- **Analysis Request**: 3 analyses per minute per user
- **Data Retrieval**: 60 requests per minute per user

### Best Practices

1. **File Size**: Keep Excel files under 10MB
2. **Data Volume**: Maximum 10,000 transactions per file
3. **Polling**: Use 2-second intervals for analysis polling
4. **Caching**: Cache analysis results on frontend
5. **Error Handling**: Implement retry logic for failed requests
6. **Loading States**: Show progress indicators during processing

### Performance Optimization

1. **Lazy Loading**: Load analysis data only when needed
2. **Pagination**: Use pagination for large datasets
3. **Chart Optimization**: Render charts only when visible
4. **Memory Management**: Cleanup chart instances when unmounting

## Security Considerations

1. **File Validation**: Always validate file types and content
2. **Token Management**: Securely store and refresh JWT tokens
3. **Data Sanitization**: Sanitize user inputs before display
4. **HTTPS**: Use HTTPS for all API communications
5. **Error Messages**: Don't expose sensitive information in errors

## Support & Troubleshooting

### Common Issues

1. **Upload Failures**: Check file format and column headers
2. **Analysis Timeout**: Large datasets may take longer to process
3. **Chart Rendering**: Ensure Chart.js is properly loaded
4. **Authentication**: Verify token validity and expiration

### Debugging

- Enable detailed error logging in development
- Use browser network tab to inspect API responses
- Check console for JavaScript errors
- Verify authentication headers in requests

For additional support, refer to the main API documentation or contact the development team.