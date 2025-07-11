import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import React from "react";

type BidStatusData = {
  date: string; // "Jun 1"
  accepted: number;
  rejected: number;
};

const BidStatusBarChart = ({ data }: { data: BidStatusData[] }) => {
  const isEmpty = data.length === 0;

  const fallbackData = [{ name: "No Data", value: 1 }];
  const COLORS = ["#d1d5db"];

  return (
    <div className="bg-white p-5 rounded-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Bid Status Overview
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        {isEmpty ? (
          <PieChart>
            <Pie
              data={fallbackData}
              dataKey="value"
              nameKey="name"
              outerRadius={60}
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
            <Legend />
            <Bar
              dataKey="accepted"
              fill="#3B82F6"
              name="Accepted"
              barSize={15}
            />
            <Bar
              dataKey="rejected"
              fill="#EF4444"
              name="Rejected"
              barSize={15}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default BidStatusBarChart;
