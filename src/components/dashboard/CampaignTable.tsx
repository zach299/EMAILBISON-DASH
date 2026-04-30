"use client";
import type { CampaignMetric } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { pct, bounceRateBadge, num } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface CampaignTableProps {
  data: CampaignMetric[];
}

export function CampaignTable({ data }: CampaignTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campaign Leaderboard</CardTitle>
        <span className="text-xs text-slate-400">{data.length} campaigns</span>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {data.length === 0 ? (
          <div className="px-6 py-4"><EmptyState /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3 w-8">#</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Campaign</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Sent</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Replies</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Reply Rate</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Pos. Replies</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Pos. Rate</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Bounces</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Bounce Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((row, i) => (
                  <tr key={row.campaignId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-400">
                      {i === 0 ? <Trophy className="w-3.5 h-3.5 text-amber-500" /> : i + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-800">{row.campaignName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{num(row.sent)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{num(row.replies)}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800">{pct(row.replyRate)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-amber-600">{num(row.positiveReplies)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-slate-900">{pct(row.positiveReplyRate)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{num(row.bounces)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Badge className={bounceRateBadge(row.bounceRate)}>
                        {pct(row.bounceRate)}
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
