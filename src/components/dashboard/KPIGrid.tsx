"use client";
import type { KPIMetrics } from "@/types";
import { KPICard } from "@/components/ui/KPICard";
import { pct, bounceRateStatus, num } from "@/lib/utils";
import {
  Send,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  TrendingUp,
  Percent,
  Calendar,
  Trophy,
} from "lucide-react";

interface KPIGridProps {
  kpis: KPIMetrics;
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <KPICard
        label="Emails Sent"
        value={num(kpis.totalSent)}
        icon={Send}
        subLabel={`${kpis.avgSentPerDay.toFixed(0)} avg per day`}
      />
      <KPICard
        label="Replies"
        value={num(kpis.totalReplies)}
        icon={MessageSquare}
        subLabel={`${pct(kpis.replyRate)} reply rate`}
      />
      <KPICard
        label="Positive Replies"
        value={num(kpis.totalPositiveReplies)}
        icon={ThumbsUp}
        highlight
        subLabel={`${pct(kpis.positiveReplyRate)} positive rate`}
      />
      <KPICard
        label="Bounces"
        value={num(kpis.totalBounces)}
        icon={AlertTriangle}
        status={bounceRateStatus(kpis.bounceRate)}
        subLabel={`${pct(kpis.bounceRate)} bounce rate`}
      />
      <KPICard
        label="Reply Rate"
        value={pct(kpis.replyRate)}
        icon={TrendingUp}
        subLabel="of all emails sent"
      />
      <KPICard
        label="Positive Reply Rate"
        value={pct(kpis.positiveReplyRate)}
        icon={Percent}
        subLabel="primary success metric"
      />
      <KPICard
        label="Avg Emails / Day"
        value={kpis.avgSentPerDay.toFixed(0)}
        icon={Calendar}
        subLabel="business days included"
      />
      <KPICard
        label="Best Campaign"
        value={pct(kpis.bestCampaignPositiveReplyRate)}
        icon={Trophy}
        subLabel={kpis.bestCampaignName}
      />
    </div>
  );
}
