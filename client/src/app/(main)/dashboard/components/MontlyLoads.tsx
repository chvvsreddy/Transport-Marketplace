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
    <div className="bg-white py-5 rounded-md border border-gray-200">

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#2a004e" barSize={15}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyLoadsChart;
