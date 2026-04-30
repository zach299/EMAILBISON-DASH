import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function num(value: number): string {
  return value.toLocaleString();
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d");
  } catch {
    return dateStr;
  }
}

export function bounceRateStatus(rate: number): "healthy" | "warning" | "critical" {
  if (rate > 5) return "critical";
  if (rate > 2) return "warning";
  return "healthy";
}

export function bounceRateColor(rate: number): string {
  if (rate > 5) return "text-red-500";
  if (rate > 2) return "text-amber-500";
  return "text-emerald-500";
}

export function bounceRateBadge(rate: number): string {
  if (rate > 5) return "bg-red-100 text-red-700 border border-red-200";
  if (rate > 2) return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
}

export function statusBadge(status: string): string {
  switch (status) {
    case "healthy": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "warning": return "bg-amber-100 text-amber-700 border border-amber-200";
    case "critical": return "bg-red-100 text-red-700 border border-red-200";
    case "paused": return "bg-slate-100 text-slate-600 border border-slate-200";
    default: return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

export function insightColor(type: string): { bg: string; border: string; icon: string; dot: string } {
  switch (type) {
    case "positive": return { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500", dot: "bg-emerald-500" };
    case "warning": return { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", dot: "bg-amber-500" };
    case "critical": return { bg: "bg-red-50", border: "border-red-200", icon: "text-red-500", dot: "bg-red-500" };
    default: return { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-500", dot: "bg-slate-400" };
  }
}
