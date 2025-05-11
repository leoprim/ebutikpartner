"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { day: "1", users: 1200 },
  { day: "2", users: 1300 },
  { day: "3", users: 1400 },
  { day: "4", users: 1350 },
  { day: "5", users: 1500 },
  { day: "6", users: 1450 },
  { day: "7", users: 1600 },
  { day: "8", users: 1700 },
  { day: "9", users: 1750 },
  { day: "10", users: 1800 },
  { day: "11", users: 1850 },
  { day: "12", users: 1900 },
  { day: "13", users: 1950 },
  { day: "14", users: 2000 },
  { day: "15", users: 2050 },
  { day: "16", users: 2100 },
  { day: "17", users: 2150 },
  { day: "18", users: 2200 },
  { day: "19", users: 2250 },
  { day: "20", users: 2300 },
  { day: "21", users: 2350 },
  { day: "22", users: 2400 },
  { day: "23", users: 2450 },
  { day: "24", users: 2500 },
  { day: "25", users: 2550 },
  { day: "26", users: 2600 },
  { day: "27", users: 2650 },
  { day: "28", users: 2700 },
  { day: "29", users: 2750 },
  { day: "30", users: 2800 },
]

export default function UserActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          label={{ value: "Day", position: "insideBottomRight", offset: 0 }}
          tickFormatter={(value) => {
            // Only show every 5th day to avoid crowding
            return Number.parseInt(value) % 5 === 0 ? value : ""
          }}
        />
        <YAxis />
        <Tooltip formatter={(value) => [`${value}`, "Active Users"]} labelFormatter={(label) => `Day ${label}`} />
        <Area type="monotone" dataKey="users" stroke="oklch(0.705 0.213 47.604)" strokeWidth={3} dot={false} fill="#ff6900" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
