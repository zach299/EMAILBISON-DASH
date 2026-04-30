"use client";
import type { KPIMetrics } from "@/types";
import { formatDate, pct } from "@/lib/utils";

interface HeroSectionProps {
  clientName: string;
  dateRange: { from: string; to: string };
  kpis: KPIMetrics;
}

function buildSummary(clientName: string, kpis: KPIMetrics): string {
  const parts: string[] = [];

  if (kpis.totalSent === 0) {
    return `No emails sent in this period. Expand the date range or check your filters.`;
  }

  parts.push(
    `${clientName} sent ${kpis.totalSent.toLocaleString()} emails during this period, generating ${kpis.totalReplies.toLocaleString()} ${kpis.totalReplies === 1 ? "reply" : "replies"} — a ${pct(kpis.replyRate)} reply rate.`
  );

  if (kpis.totalPositiveReplies > 0) {
    parts.push(
      `${kpis.totalPositiveReplies.toLocaleString()} ${kpis.totalPositiveReplies === 1 ? "response was" : "responses were"} marked as interested, putting the positive reply rate at ${pct(kpis.positiveReplyRate)}.`
    );
  }

  if (kpis.bestCampaignName && kpis.bestCampaignName !== "N/A") {
    parts.push(
      `"${kpis.bestCampaignName}" is the top-performing campaign by positive reply rate (${pct(kpis.bestCampaignPositiveReplyRate)}).`
    );
  }

  if (kpis.bounceRate < 2) {
    parts.push("Bounce rate is healthy and within acceptable limits.");
  } else if (kpis.bounceRate < 5) {
    parts.push(`Bounce rate is at ${pct(kpis.bounceRate)} — worth monitoring closely.`);
  } else {
    parts.push(`Bounce rate is elevated at ${pct(kpis.bounceRate)} — action recommended.`);
  }

  return parts.join(" ");
}

export function HeroSection({ clientName, dateRange, kpis }: HeroSectionProps) {
  const summary = buildSummary(clientName, kpis);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-7 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{clientName.charAt(0)}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{clientName}</h1>
        </div>
        <p className="text-slate-400 text-xs mb-4">
          {formatDate(dateRange.from)} — {formatDate(dateRange.to)}
        </p>
        <p className="text-slate-200 text-sm leading-relaxed max-w-2xl">{summary}</p>
      </div>
      <div className="flex gap-4 md:gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{kpis.totalSent.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-0.5">Sent</div>
        </div>
        <div className="w-px bg-white/10" />
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{kpis.totalPositiveReplies.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-0.5">Positive Replies</div>
        </div>
        <div className="w-px bg-white/10" />
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-400">{pct(kpis.positiveReplyRate)}</div>
          <div className="text-xs text-slate-400 mt-0.5">Positive Rate</div>
        </div>
      </div>
    </div>
  );
}
