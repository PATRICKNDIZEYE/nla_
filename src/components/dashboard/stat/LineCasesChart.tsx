import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function LineCasesChart({ month = [] }: { month: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={month}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="open"
          stroke="#FFB155"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="resolved" stroke="#22C55E" />
        <Line type="monotone" dataKey="rejected" stroke="#DC2626" />
        <Line type="monotone" dataKey="closed" stroke="#2563EB" />
        <Line type="monotone" dataKey="processing" stroke="#FFD43B" />
        <Line type="monotone" dataKey="appealed" stroke="#A855F7" />
        <Legend verticalAlign="top" height={36} />
      </LineChart>
    </ResponsiveContainer>
  );
}
