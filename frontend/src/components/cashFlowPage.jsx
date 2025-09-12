import React, { useState } from "react";
import UploadForm from "./uploadForm.jsx";
import Results from "./result.jsx";

const CashflowPage = () => {
  const [analysisData, setAnalysisData] = useState(null);

  // Ye function UploadForm se call hoga
  const handleAnalysis = (data) => {
    // Yaha tera analysis logic, ya dummy data example
    const result = {
      overallHealthScore: 82,
      keyMetrics: {
        netCashflow: "$12,000",
        grossProfitMargin: "55%",
        employeeSalary: "$8,000",
      },
      insights: [
        { title: "Good Cashflow", description: "Your net cashflow is positive." },
        { title: "Salary Heavy", description: "Employee salary is 40% of expenses." },
      ],
      recommendations: [
        { title: "Cut Marketing Spend", description: "Reduce marketing spend by 10% to save $2000/month." },
        { title: "Increase Savings", description: "Divert 5% of revenue into a reserve fund." },
      ],
      visualizations: [
        {
          title: "Expenses by Category",
          chartType: "pie",
          data: {
            labels: ["Transport", "Food", "Rent", "Misc"],
            datasets: [
              {
                data: [8000, 7000, 10000, 5000],
                backgroundColor: ["#6B6ED4", "#FF6384", "#36A2EB", "#FFCE56"],
              },
            ],
          },
        },

         {
    title: "Monthly Expenses Trend",
    chartType: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun","July","August","September","Octomber","November","December"],
      datasets: [
        {
          label: "Expenses",
          data: [5000, 7000, 8000, 6000, 9000, 7500, 8500, 5500, 9500, 8000, 9000, 10000],
          borderColor: "#6B6ED4",
          backgroundColor: "rgba(107, 110, 212, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
  },
      ],
    };

    


    setAnalysisData(result);
  };

  return (
    <div className="space-y-6">
      <UploadForm onSubmit={handleAnalysis} />
      {analysisData && <Results analysis={analysisData} />}
    </div>
  );
};

export default CashflowPage;
