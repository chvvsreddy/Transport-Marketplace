import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import React from "react";

type BidPriceTrend = {
  date: string; // e.g., "Jun 1"
  price: number;
};

const BidPriceTrendChart = ({ data }: { data: BidPriceTrend[] }) => {
  const isEmpty = data.length === 0;

  const fallbackData = [{ name: "No Bids", value: 1 }];
  const COLORS = ["#d1d5db"]; // Tailwind gray-300

  return (
    <div className="bg-white p-5 rounded-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Bid Price Trends
      </h2>
      <ResponsiveContainer width="100%" height={300}>
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(v) => `₹${v}`} />
            <Tooltip formatter={(value: number) => `₹${value}`} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default BidPriceTrendChart;
