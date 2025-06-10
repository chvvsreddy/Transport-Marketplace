import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type DailyLoadData = {
  date: string; // e.g., "Jun 1"
  count: number;
};

const MonthlyLoadsChart = ({ data }: { data: DailyLoadData[] }) => {
  return (
    <div className="bg-white p-5 rounded-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Daily Loads - June
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyLoadsChart;
