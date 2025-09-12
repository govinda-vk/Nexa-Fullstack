// src/components/ChartCard.jsx
import React from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const chartComponents = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
};

const ChartCard = ({ viz }) => {
  const ChartComp = chartComponents[viz.chartType] || Bar;

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5 shadow-md border border-[#6B6ED4]/30">
      <h3 className="text-[#6B6ED4] font-semibold mb-3">{viz.title}</h3>
      <ChartComp
        data={viz.data}
        options={{
          plugins: {
            legend: { labels: { color: "white" } },
          },
          scales:
            viz.chartType === "pie" || viz.chartType === "doughnut"
              ? {}
              : {
                  x: {
                    ticks: { color: "white" },
                    grid: { color: "rgba(107,110,212,0.2)" },
                  },
                  y: {
                    ticks: { color: "white" },
                    grid: { color: "rgba(107,110,212,0.2)" },
                  },
                },
        }}
      />
    </div>
  );
};

export default ChartCard;
