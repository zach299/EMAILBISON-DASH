"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  highlight?: boolean;
  status?: "healthy" | "warning" | "critical";
  className?: string;
}

export function KPICard({
  label,
  value,
  subLabel,
  icon: Icon,
  highlight,
  status,
  className,
}: KPICardProps) {
  const statusColors: Record<string, string> = {
    healthy: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
    warning: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
    critical: "border-red-200 bg-gradient-to-br from-red-50 to-white",
  };

  const iconColors: Record<string, string> = {
    healthy: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    critical: "bg-red-100 text-red-600",
  };

  const valueColors: Record<string, string> = {
    healthy: "text-emerald-700",
    warning: "text-amber-700",
    critical: "text-red-700",
  };

  const borderClass = status ? statusColors[status] : highlight
    ? "border-slate-900 bg-gradient-to-br from-slate-900 to-slate-800"
    : "border-slate-100 bg-white";

  const valueClass = status ? valueColors[status] : highlight ? "text-white" : "text-slate-900";
  const labelClass = highlight ? "text-slate-300" : "text-slate-500";
  const subLabelClass = highlight ? "text-slate-400" : "text-slate-400";
  const iconClass = status ? iconColors[status] : highlight ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600";

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm flex flex-col gap-3", borderClass, className)}>
      <div className="flex items-start justify-between">
        <span className={cn("text-xs font-semibold uppercase tracking-wider", labelClass)}>
          {label}
        </span>
        {Icon && (
          <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center", iconClass)}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <div>
        <div className={cn("text-3xl font-bold tracking-tight", valueClass)}>
          {value}
        </div>
        {subLabel && (
          <div className={cn("text-xs mt-1", subLabelClass)}>
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-3 animate-pulse">
      <div className="h-3 bg-slate-100 rounded w-24" />
      <div className="h-8 bg-slate-100 rounded w-20" />
      <div className="h-3 bg-slate-100 rounded w-32" />
    </div>
  );
}
