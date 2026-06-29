"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { revenueSeries } from "@/data/gym";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { number, rupiah } from "@/lib/format";

function compactRupiah(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}jt`
  if (value >= 1_000) return `${Math.round(value / 1_000)}rb`
  return number.format(value)
}

export function RevenueChart() {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Pendapatan vs Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueSeries} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickFormatter={compactRupiah} tickLine={false} axisLine={false} width={44} />
            <Tooltip
              formatter={(value, name) => [rupiah.format(Number(value)), name === "revenue" ? "Pendapatan" : "Pengeluaran"]}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revenue)" strokeWidth={2} />
            <Area type="monotone" dataKey="expense" stroke="#0ea5e9" fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AttendanceChart() {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Frekuensi Attendance</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueSeries} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} width={34} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
            <Bar dataKey="attendance" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
