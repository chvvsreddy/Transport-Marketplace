import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import React from "react";

type BidStatusData = {
  date: string; // "Jun 1"
  accepted: number;
  rejected: number;
};

const BidStatusBarChart = ({ data }: { data: BidStatusData[] }) => {
  return (
    <div className="bg-white p-5 rounded-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Bid Status Overview
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="accepted" fill="#3B82F6" name="Accepted" />
          <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BidStatusBarChart;
