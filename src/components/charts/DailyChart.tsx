"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DailyMetric } from "@/types";
import { format, parseISO } from "date-fns";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendingUp } from "lucide-react";

const CHART_COLORS = {
  sent: "#6366f1",
  replies: "#10b981",
  positiveReplies: "#f59e0b",
  bounces: "#ef4444",
};

function formatXAxis(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d");
  } catch {
    return dateStr;
  }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const date = label ? (() => { try { return format(parseISO(label), "EEEE, MMMM d"); } catch { return label; } })() : "";
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-2">{date}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-500">{p.name}</span>
          </div>
          <span className="font-semibold text-slate-800">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

interface DailyChartProps {
  data: DailyMetric[];
  metric: "sent" | "replies" | "positiveReplies" | "bounces";
  title: string;
  type?: "bar" | "line";
  color?: string;
}

export function DailyChart({ data, metric, color }: DailyChartProps) {
  if (!data.length) return <EmptyState icon={TrendingUp} />;

  const chartColor = color ?? CHART_COLORS[metric];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={metric} fill={chartColor} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface MultiSeriesChartProps {
  data: DailyMetric[];
  series: Array<{ key: keyof DailyMetric; label: string; color: string }>;
}

export function MultiSeriesChart({ data, series }: MultiSeriesChartProps) {
  if (!data.length) return <EmptyState icon={TrendingUp} />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value: string) => <span className="text-slate-500">{value}</span>}
        />
        {series.map((s) => (
          <Line
            key={String(s.key)}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
