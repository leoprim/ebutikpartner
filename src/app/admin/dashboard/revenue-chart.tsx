"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Accepts data and granularity as props
export default function RevenueChart({ data, granularity }: { data: any[], granularity: 'hour' | 'day' }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={granularity === 'hour' ? 'hour' : 'day'} />
        <YAxis />
        <Tooltip formatter={(value) => [`kr ${value}`, "Revenue"]} labelFormatter={(label) => granularity === 'hour' ? `Timme: ${label}` : `Dag: ${label}`}  />
        <Legend />
        <Bar dataKey="revenue" fill="#1e4841" radius={[15, 15, 0, 0]} name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}
