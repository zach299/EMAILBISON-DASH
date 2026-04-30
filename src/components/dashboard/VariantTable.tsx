"use client";
import type { VariantMetric } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { pct, num } from "@/lib/utils";

interface VariantTableProps {
  data: VariantMetric[];
}

export function VariantTable({ data }: VariantTableProps) {
  const avgPR = data.length > 0
    ? data.reduce((s, v) => s + v.positiveReplyRate, 0) / data.length
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Variant &amp; Subject Line Performance</CardTitle>
        <span className="text-xs text-slate-400">{data.length} variants</span>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {data.length === 0 ? (
          <div className="px-6 py-4"><EmptyState /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Subject</th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Step</th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Variant</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Sent</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Replies</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Pos. Replies</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Reply Rate</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Pos. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row, i) => {
                  const isAboveAvg = row.positiveReplyRate > avgPR * 1.2;
                  return (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 max-w-xs">
                        <span className="text-slate-800 font-medium truncate block">{row.subject}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge className="bg-slate-100 text-slate-600 border border-slate-200">
                          Step {row.step}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200">
                          {row.variant}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{num(row.sent)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{num(row.replies)}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-amber-600">{num(row.positiveReplies)}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600">{pct(row.replyRate)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAboveAvg && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Above average" />
                          )}
                          <span className={`font-bold ${isAboveAvg ? "text-emerald-600" : "text-slate-900"}`}>
                            {pct(row.positiveReplyRate)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
