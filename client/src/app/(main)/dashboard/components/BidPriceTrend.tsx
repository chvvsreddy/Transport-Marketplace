import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import React from "react";

type BidPriceTrend = {
  date: string; // e.g., "Jun 1"
  price: number;
};

const BidPriceTrendChart = ({ data }: { data: BidPriceTrend[] }) => {
  return (
    <div className="bg-white p-5 rounded-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Bid Price Trends
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#10B981"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BidPriceTrendChart;
