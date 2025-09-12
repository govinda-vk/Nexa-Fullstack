# Cashflow Analysis API Documentation

## Overview

The Cashflow Analysis API provides AI-powered business intelligence capabilities for analyzing Excel-based cashflow data. Using Google Gemini AI, it generates comprehensive insights, recommendations, and visualizations to help businesses understand their financial performance.

## Base URL
```
/api/cashflow
```

## Authentication

All endpoints require user authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Upload Cashflow Data

**POST** `/upload`

Upload and process an Excel file containing cashflow data.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `cashflowFile`: Excel file (.xlsx or .xls) - **Required**
  - `businessName`: Business name (string) - **Required**
  - `businessType`: Business type/industry (string) - *Optional*

#### Response
```json
{
  "success": true,
  "message": "Cashflow data uploaded successfully",
  "data": {
    "id": "674a5b8f1234567890abcdef",
    "businessName": "Acme Corp",
    "reportPeriod": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z"
    },
    "summary": {
      "totalRevenue": 150000,
      "totalExpenses": 120000,
      "netCashflow": 30000,
      "entriesCount": 245
    },
    "status": "uploaded"
  },
  "stats": {
    "totalRows": 246,
    "validEntries": 245,
    "errorCount": 1
  }
}
```

#### Excel File Requirements
- **Supported formats**: .xlsx, .xls
- **Maximum file size**: 10MB
- **Required columns**: Date, Amount
- **Optional columns**: Description, Category, Subcategory, Payment Method, Reference

#### Expected Column Names
The system automatically detects columns using these names (case-insensitive):
- **Date**: date, transaction date, entry date, timestamp
- **Amount**: amount, value, transaction amount, money, cash
- **Description**: description, transaction description, details, memo, note
- **Category**: category, type, transaction type, category type
- **Subcategory**: subcategory, sub category, sub-category
- **Payment Method**: payment method, method, payment type
- **Reference**: reference, ref, reference number, transaction id

### 2. Get Cashflow Data List

**GET** `/data`

Retrieve user's cashflow data with pagination and filtering.

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `businessName`: Filter by business name (partial match)
- `status`: Filter by status (uploaded, processing, analyzed, error)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a5b8f1234567890abcdef",
      "businessName": "Acme Corp",
      "businessType": "Retail",
      "reportPeriod": {
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T00:00:00.000Z"
      },
      "summary": {
        "totalRevenue": 150000,
        "totalExpenses": 120000,
        "netCashflow": 30000,
        "entriesCount": 245
      },
      "status": "analyzed",
      "uploadDate": "2024-12-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

### 3. Get Specific Cashflow Data

**GET** `/data/:id`

Retrieve specific cashflow data including all entries.

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "674a5b8f1234567890abcdef",
    "businessName": "Acme Corp",
    "entries": [
      {
        "date": "2024-01-15T00:00:00.000Z",
        "description": "Product Sales",
        "category": "revenue",
        "subcategory": "Product Sales",
        "amount": 5000,
        "currency": "USD",
        "paymentMethod": "bank_transfer"
      }
    ],
    // ... other fields
  }
}
```

### 4. Start AI Analysis

**POST** `/analyze/:id`

Trigger AI analysis for specific cashflow data.

#### Response
```json
{
  "success": true,
  "message": "Analysis started successfully",
  "data": {
    "analysisId": "674a5c1f1234567890abcdef",
    "status": "processing"
  }
}
```

### 5. Get Analysis Results

**GET** `/analysis/:id`

Retrieve completed analysis results.

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "674a5c1f1234567890abcdef",
    "cashflowDataId": "674a5b8f1234567890abcdef",
    "analysisDate": "2024-12-01T11:00:00.000Z",
    "executiveSummary": "The business shows strong profitability with positive cashflow of $30,000. Revenue growth is consistent, but expense management could be optimized.",
    "overallHealthScore": 78,
    "status": "completed",
    "insights": [
      {
        "type": "profitability",
        "title": "Strong Profit Margins",
        "description": "The business maintains healthy profit margins at 20%",
        "severity": "low",
        "actionable": false,
        "impact": "positive",
        "confidence": 85
      }
    ],
    "keyMetrics": [
      {
        "name": "Net Profit Margin",
        "value": 20,
        "unit": "percentage",
        "trend": "up",
        "changePercentage": 5.2,
        "description": "Percentage of revenue remaining after all expenses"
      }
    ],
    "recommendations": [
      {
        "priority": "medium",
        "category": "cost_reduction",
        "title": "Optimize Operating Expenses",
        "description": "Review recurring operating expenses for potential savings",
        "expectedImpact": "Could save 5-10% on monthly expenses",
        "timeframe": "short_term"
      }
    ],
    "riskFactors": [
      {
        "type": "cashflow",
        "description": "Seasonal revenue fluctuations may impact cash flow",
        "likelihood": "medium",
        "impact": "medium"
      }
    ],
    "visualizations": [
      {
        "chartType": "pie",
        "title": "Expense Breakdown",
        "category": "expenses",
        "data": {
          "labels": ["Operations", "Marketing", "Salaries"],
          "data": [45000, 25000, 50000],
          "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
        }
      }
    ]
  }
}
```

### 6. Get Analysis List

**GET** `/analysis`

Retrieve user's analyses with pagination.

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by analysis status

#### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a5c1f1234567890abcdef",
      "cashflowDataId": {
        "businessName": "Acme Corp",
        "reportPeriod": { "startDate": "...", "endDate": "..." },
        "summary": { "netCashflow": 30000 }
      },
      "analysisDate": "2024-12-01T11:00:00.000Z",
      "overallHealthScore": 78,
      "status": "completed"
    }
  ],
  "pagination": { ... }
}
```

### 7. Get Visualization Data

**GET** `/visualization/:analysisId/:chartType`

Get specific visualization data for chart rendering.

#### Response
```json
{
  "success": true,
  "data": {
    "chartType": "pie",
    "title": "Expense Breakdown",
    "category": "expenses",
    "data": {
      "labels": ["Operations", "Marketing", "Salaries"],
      "data": [45000, 25000, 50000],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
    }
  }
}
```

### 8. Delete Cashflow Data

**DELETE** `/data/:id`

Delete cashflow data and all associated analyses.

#### Response
```json
{
  "success": true,
  "message": "Cashflow data and associated analyses deleted successfully"
}
```

## Data Formats

### Chart Data for React Libraries

The API provides visualization data compatible with popular React chart libraries:

#### Chart.js Format
```javascript
import { Chart } from 'chart.js/auto';

// Use the data directly from the API
const chartData = response.data.visualizations[0].data;
```

#### Recharts Format
```javascript
import { PieChart, Pie, Cell } from 'recharts';

// Transform API data for Recharts
const data = labels.map((label, index) => ({
  name: label,
  value: chartData.data[index],
  fill: chartData.backgroundColor[index]
}));
```

#### Victory Format
```javascript
import { VictoryPie } from 'victory';

// Transform API data for Victory
const data = labels.map((label, index) => ({
  x: label,
  y: chartData.data[index]
}));
```

## Error Responses

### Common Error Codes

- **400 Bad Request**: Invalid input data or missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Requested resource not found
- **409 Conflict**: Analysis already in progress
- **413 Payload Too Large**: File size exceeds 10MB limit
- **500 Internal Server Error**: Server processing error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Rate Limits

- Upload endpoints: 10 requests per minute per user
- Analysis endpoints: 5 requests per minute per user
- Data retrieval endpoints: 60 requests per minute per user

## Usage Examples

### Frontend Integration with React

```javascript
// Upload cashflow file
const uploadCashflow = async (file, businessName) => {
  const formData = new FormData();
  formData.append('cashflowFile', file);
  formData.append('businessName', businessName);
  
  const response = await fetch('/api/cashflow/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Start analysis
const startAnalysis = async (dataId) => {
  const response = await fetch(`/api/cashflow/analyze/${dataId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};

// Get analysis results
const getAnalysis = async (analysisId) => {
  const response = await fetch(`/api/cashflow/analysis/${analysisId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Chart Component Example

```javascript
import { Pie } from 'react-chartjs-2';

const ExpenseBreakdownChart = ({ analysisId }) => {
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    fetch(`/api/cashflow/visualization/${analysisId}/pie`)
      .then(res => res.json())
      .then(data => setChartData(data.data));
  }, [analysisId]);
  
  if (!chartData) return <div>Loading...</div>;
  
  return (
    <Pie 
      data={{
        labels: chartData.data.labels,
        datasets: [{
          data: chartData.data.data,
          backgroundColor: chartData.data.backgroundColor
        }]
      }}
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: chartData.title
          }
        }
      }}
    />
  );
};
```

## Environment Variables

Ensure these environment variables are set:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Support

For questions or issues with the Cashflow Analysis API, please refer to the main project documentation or contact the development team.