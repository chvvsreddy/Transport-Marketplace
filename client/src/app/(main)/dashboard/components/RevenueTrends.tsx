import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type RevenueDataPoint = {
  date: string;
  price: number;
};

interface RevenueTrendChartProps {
  data: RevenueDataPoint[];
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  const COLORS = ["#ccc"];

  const fallbackData = [{ name: "No Data", value: 1 }];

  return (
    <div className="w-full h-72 p-4 bg-white rounded-xl shadow">
      <ResponsiveContainer width="100%" height="100%">
        {data.length > 0 ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <Tooltip formatter={(value: number) => `₹${value}`} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        ) : (
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
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart;
