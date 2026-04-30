"use client";
import type { SenderMetric } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { pct, bounceRateBadge, statusBadge, num } from "@/lib/utils";
import { Mail } from "lucide-react";

interface SenderTableProps {
  data: SenderMetric[];
}

const STATUS_LABELS: Record<string, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  paused: "Paused",
};

export function SenderTable({ data }: SenderTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sender Inbox Health</CardTitle>
        <span className="text-xs text-slate-400">{data.length} inboxes</span>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {data.length === 0 ? (
          <div className="px-6 py-4"><EmptyState icon={Mail} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Sender</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Sent</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Replies</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Pos. Replies</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Bounces</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Bounce Rate</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Daily Limit</th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row) => (
                  <tr key={row.senderEmail} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Mail className="w-3 h-3 text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-800">{row.senderEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{num(row.sent)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{num(row.replies)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-amber-600">{num(row.positiveReplies)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{num(row.bounces)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Badge className={bounceRateBadge(row.bounceRate)}>
                        {pct(row.bounceRate)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{row.dailyLimit}/day</td>
                    <td className="px-6 py-3.5 text-center">
                      <Badge className={statusBadge(row.status)}>
                        {STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
