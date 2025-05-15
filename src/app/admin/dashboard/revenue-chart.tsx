"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    Free: 4000,
    Premium: 8000,
  },
  {
    name: "Feb",
    Free: 4200,
    Premium: 8500,
  },
  {
    name: "Mar",
    Free: 4500,
    Premium: 9000,
  },
  {
    name: "Apr",
    Free: 4800,
    Premium: 9500,
  },
  {
    name: "May",
    Free: 5000,
    Premium: 10000,
  },
]

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} labelFormatter={(label) => `Month: ${label}`}  />
        <Legend />
        <Bar dataKey="Free" fill="#1e4841" radius={[15, 15, 0, 0]} name="Free Plan" />
        <Bar dataKey="Premium" fill="#bbf49c" radius={[15, 15, 0, 0]}name="Premium Plan" />
      </BarChart>
    </ResponsiveContainer>
  )
}
