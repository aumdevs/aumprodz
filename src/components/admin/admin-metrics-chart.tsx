"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AdminMetricsChartPoint = {
  day: string;
  leads: number;
  clicks: number;
};

export function AdminMetricsChart({
  data = [],
}: {
  data?: AdminMetricsChartPoint[];
}) {
  return (
    <div className="min-h-72 w-full">
      <ResponsiveContainer width="100%" height={288}>
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
          <defs>
            <linearGradient id="leadsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0c6b5c" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0c6b5c" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d8d0c0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#d8d0c0",
              background: "#fffdf8",
            }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            name="Clics"
            stroke="#0c6b5c"
            fill="url(#leadsFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="leads"
            name="Contactos"
            stroke="#c49a41"
            fill="transparent"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
