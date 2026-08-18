"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = { month: string; receita: number };

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={{ stroke: "#3f3f46" }} />
          <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={{ stroke: "#3f3f46" }} width={40} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            labelStyle={{ color: "#e4e4e7" }}
            itemStyle={{ color: "#eab308" }}
            cursor={{ fill: "#27272a" }}
            formatter={(value) =>
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value))
            }
          />
          <Bar dataKey="receita" fill="#eab308" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
