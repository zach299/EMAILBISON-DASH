"use client";
import type { FunnelStep } from "@/types";
import { ArrowDown } from "lucide-react";

interface FunnelChartProps {
  data: FunnelStep[];
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b"];
const WIDTHS = ["w-full", "w-4/5", "w-3/5"];

export function FunnelChart({ data }: FunnelChartProps) {
  if (!data.length || data[0].value === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No funnel data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {data.map((step, i) => (
        <div key={step.label} className="flex flex-col items-center w-full">
          {i > 0 && (
            <div className="flex flex-col items-center my-1">
              <ArrowDown className="w-4 h-4 text-slate-300" />
              {step.rate !== undefined && (
                <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {step.rate.toFixed(1)}% conversion
                </span>
              )}
            </div>
          )}
          <div className={`${WIDTHS[i]} flex flex-col`}>
            <div
              className="rounded-xl px-4 py-3.5 flex items-center justify-between"
              style={{ backgroundColor: COLORS[i] + "18", borderLeft: `3px solid ${COLORS[i]}` }}
            >
              <span className="text-sm font-semibold text-slate-700">{step.label}</span>
              <span className="text-lg font-bold" style={{ color: COLORS[i] }}>
                {step.value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
