"use client";
import type { PerformanceInsight } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { insightColor } from "@/lib/utils";
import { TrendingUp, AlertTriangle, AlertCircle, Info, Zap } from "lucide-react";

interface InsightsSectionProps {
  insights: PerformanceInsight[];
}

function InsightIcon({ type }: { type: string }) {
  switch (type) {
    case "positive": return <TrendingUp className="w-4 h-4" />;
    case "warning": return <AlertTriangle className="w-4 h-4" />;
    case "critical": return <AlertCircle className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" />
        <CardTitle>Performance Insights</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
