"use client";
import type { PerformanceInsight } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { insightColor } from "@/lib/utils";
import { TrendingUp, AlertTriangle, AlertCircle, Info, Zap, Sparkles, RefreshCw } from "lucide-react";

interface InsightsSectionProps {
  insights: PerformanceInsight[];
  isAi?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

function InsightIcon({ type }: { type: string }) {
  switch (type) {
    case "positive": return <TrendingUp className="w-4 h-4" />;
    case "warning": return <AlertTriangle className="w-4 h-4" />;
    case "critical": return <AlertCircle className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
}

export function InsightsSection({ insights, isAi, isLoading, onRefresh }: InsightsSectionProps) {
  if (insights.length === 0 && !isLoading) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        {isAi ? (
          <Sparkles className="w-4 h-4 text-indigo-500" />
        ) : (
          <Zap className="w-4 h-4 text-amber-500" />
        )}
        <CardTitle>
          {isAi ? "AI-Powered Insights" : "Performance Insights"}
        </CardTitle>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="ml-auto flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Generate AI insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            {isAi ? "Regenerate" : "Ask AI"}
          </button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && insights.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, i) => {
              const colors = insightColor(insight.type);
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 flex gap-3 ${colors.bg} ${colors.border}`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${colors.icon}`}>
                    <InsightIcon type={insight.type} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{insight.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
