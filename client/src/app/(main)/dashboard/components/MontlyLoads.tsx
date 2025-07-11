import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DailyLoadData = {
  date: string; // e.g., "Jun 1"
  count: number;
};

const MonthlyLoadsChart = ({ data }: { data: DailyLoadData[] }) => {
  const isEmpty = data.length === 0;

  const fallbackData = [{ name: "No Loads", value: 1 }];

  const COLORS = ["#ccc"];

  return (
    <div className="bg-white py-5 rounded-md border border-gray-200 w-full">
      <ResponsiveContainer width="100%" height={250}>
        {isEmpty ? (
          <PieChart>
            <Pie
              data={fallbackData}
              dataKey="value"
              nameKey="name"
              outerRadius={60}
              fill="#ccc"
              label
            >
              {fallbackData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2a004e" barSize={15} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyLoadsChart;
