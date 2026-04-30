import { isWithinInterval, parseISO, startOfDay, endOfDay, format } from "date-fns";
import type {
  EmailEvent,
  DashboardFilters,
  KPIMetrics,
  DailyMetric,
  CampaignMetric,
  VariantMetric,
  SenderMetric,
  PositiveReplyEntry,
  FunnelStep,
  PerformanceInsight,
  DashboardData,
} from "@/types";
import { SENDER_EMAILS } from "@/data/clients";

// ─── Filter ───────────────────────────────────────────────────────────────────

export function filterEvents(events: EmailEvent[], filters: DashboardFilters): EmailEvent[] {
  const from = startOfDay(parseISO(filters.dateRange.from));
  const to = endOfDay(parseISO(filters.dateRange.to));

  return events.filter((e) => {
    if (e.clientId !== filters.clientId) return false;
    const sentAt = parseISO(e.sentAt);
    if (!isWithinInterval(sentAt, { start: from, end: to })) return false;
    if (filters.campaignIds.length > 0 && !filters.campaignIds.includes(e.campaignId)) return false;
    if (filters.senderEmails.length > 0 && !filters.senderEmails.includes(e.senderEmail)) return false;
    return true;
  });
}

// ─── KPI Metrics ──────────────────────────────────────────────────────────────

export function computeKPIs(events: EmailEvent[], allCampaignMetrics: CampaignMetric[], dateRange: { from: string; to: string }): KPIMetrics {
  const sent = events.length;
  const replies = events.filter((e) => e.eventType === "reply" || e.eventType === "positive_reply").length;
  const positiveReplies = events.filter((e) => e.interested || e.eventType === "positive_reply").length;
  const bounces = events.filter((e) => e.eventType === "bounce").length;

  const replyRate = sent > 0 ? (replies / sent) * 100 : 0;
  const positiveReplyRate = sent > 0 ? (positiveReplies / sent) * 100 : 0;
  const bounceRate = sent > 0 ? (bounces / sent) * 100 : 0;

  const from = parseISO(dateRange.from);
  const to = parseISO(dateRange.to);
  const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const avgSentPerDay = sent / days;

  const best = allCampaignMetrics.reduce<CampaignMetric | null>((acc, c) => {
    if (!acc) return c;
    return c.positiveReplyRate > acc.positiveReplyRate ? c : acc;
  }, null);

  return {
    totalSent: sent,
    totalReplies: replies,
    totalPositiveReplies: positiveReplies,
    totalBounces: bounces,
    replyRate,
    positiveReplyRate,
    bounceRate,
    avgSentPerDay,
    bestCampaignName: best?.campaignName ?? "N/A",
    bestCampaignPositiveReplyRate: best?.positiveReplyRate ?? 0,
  };
}

// ─── Daily Metrics ────────────────────────────────────────────────────────────

export function computeDailyMetrics(events: EmailEvent[], dateRange: { from: string; to: string }): DailyMetric[] {
  const byDay: Record<string, DailyMetric> = {};

  // Pre-populate all days in range
  const from = parseISO(dateRange.from);
  const to = parseISO(dateRange.to);
  const cursor = new Date(from);
  while (cursor <= to) {
    const key = format(cursor, "yyyy-MM-dd");
    byDay[key] = { date: key, sent: 0, replies: 0, positiveReplies: 0, bounces: 0 };
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const e of events) {
    const key = format(parseISO(e.sentAt), "yyyy-MM-dd");
    if (!byDay[key]) continue;
    byDay[key].sent++;
    if (e.eventType === "reply" || e.eventType === "positive_reply") byDay[key].replies++;
    if (e.interested || e.eventType === "positive_reply") byDay[key].positiveReplies++;
    if (e.eventType === "bounce") byDay[key].bounces++;
  }

  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Campaign Metrics ─────────────────────────────────────────────────────────

export function computeCampaignMetrics(events: EmailEvent[]): CampaignMetric[] {
  const byCamp: Record<string, CampaignMetric> = {};

  for (const e of events) {
    if (!byCamp[e.campaignId]) {
      byCamp[e.campaignId] = {
        campaignId: e.campaignId,
        campaignName: e.campaignName,
        sent: 0, replies: 0, positiveReplies: 0, bounces: 0,
        replyRate: 0, positiveReplyRate: 0, bounceRate: 0,
      };
    }
    const c = byCamp[e.campaignId];
    c.sent++;
    if (e.eventType === "reply" || e.eventType === "positive_reply") c.replies++;
    if (e.interested || e.eventType === "positive_reply") c.positiveReplies++;
    if (e.eventType === "bounce") c.bounces++;
  }

  return Object.values(byCamp).map((c) => ({
    ...c,
    replyRate: c.sent > 0 ? (c.replies / c.sent) * 100 : 0,
    positiveReplyRate: c.sent > 0 ? (c.positiveReplies / c.sent) * 100 : 0,
    bounceRate: c.sent > 0 ? (c.bounces / c.sent) * 100 : 0,
  })).sort((a, b) => b.positiveReplyRate - a.positiveReplyRate);
}

// ─── Variant Metrics ──────────────────────────────────────────────────────────

export function computeVariantMetrics(events: EmailEvent[]): VariantMetric[] {
  const byVariant: Record<string, VariantMetric> = {};

  for (const e of events) {
    const key = `${e.subject}__step${e.stepOrder}__${e.stepVariant ?? "A"}`;
    if (!byVariant[key]) {
      byVariant[key] = {
        subject: e.subject,
        step: e.stepOrder,
        variant: e.stepVariant ?? "A",
        sent: 0, replies: 0, positiveReplies: 0,
        replyRate: 0, positiveReplyRate: 0, bounceRate: 0,
      };
    }
    const v = byVariant[key];
    v.sent++;
    if (e.eventType === "reply" || e.eventType === "positive_reply") v.replies++;
    if (e.interested || e.eventType === "positive_reply") v.positiveReplies++;
  }

  return Object.values(byVariant).map((v) => ({
    ...v,
    replyRate: v.sent > 0 ? (v.replies / v.sent) * 100 : 0,
    positiveReplyRate: v.sent > 0 ? (v.positiveReplies / v.sent) * 100 : 0,
    bounceRate: 0, // bounces don't have subjects in our model; N/A per-variant
  })).sort((a, b) => b.positiveReplyRate - a.positiveReplyRate);
}

// ─── Sender Metrics ───────────────────────────────────────────────────────────

export function computeSenderMetrics(events: EmailEvent[], clientId: string): SenderMetric[] {
  const bySender: Record<string, SenderMetric> = {};
  const senderConfig = SENDER_EMAILS.filter((s) => s.clientId === clientId);

  for (const e of events) {
    if (!bySender[e.senderEmail]) {
      const cfg = senderConfig.find((s) => s.email === e.senderEmail);
      bySender[e.senderEmail] = {
        senderEmail: e.senderEmail,
        sent: 0, replies: 0, positiveReplies: 0, bounces: 0,
        bounceRate: 0,
        dailyLimit: cfg?.dailyLimit ?? 50,
        status: cfg?.status ?? "healthy",
      };
    }
    const s = bySender[e.senderEmail];
    s.sent++;
    if (e.eventType === "reply" || e.eventType === "positive_reply") s.replies++;
    if (e.interested || e.eventType === "positive_reply") s.positiveReplies++;
    if (e.eventType === "bounce") s.bounces++;
  }

  return Object.values(bySender).map((s) => {
    const bounceRate = s.sent > 0 ? (s.bounces / s.sent) * 100 : 0;
    let status: SenderMetric["status"] = s.status;
    if (bounceRate > 5) status = "critical";
    else if (bounceRate > 2) status = "warning";
    return { ...s, bounceRate, status };
  }).sort((a, b) => b.sent - a.sent);
}

// ─── Positive Reply Feed ──────────────────────────────────────────────────────

export function computePositiveReplies(events: EmailEvent[]): PositiveReplyEntry[] {
  return events
    .filter((e) => e.interested || e.eventType === "positive_reply")
    .sort((a, b) => (b.repliedAt ?? b.sentAt).localeCompare(a.repliedAt ?? a.sentAt))
    .slice(0, 50)
    .map((e) => ({
      leadName: [e.leadFirstName, e.leadLastName].filter(Boolean).join(" ") || "Unknown",
      title: e.leadTitle ?? "N/A",
      company: e.leadCompany ?? "N/A",
      email: e.leadId,
      campaign: e.campaignName,
      subject: e.subject,
      replySnippet: e.replySnippet,
      date: e.repliedAt ?? e.sentAt,
      senderInbox: e.senderEmail,
    }));
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

export function computeFunnel(kpis: KPIMetrics): FunnelStep[] {
  return [
    { label: "Emails Sent", value: kpis.totalSent },
    { label: "Replies", value: kpis.totalReplies, rate: kpis.replyRate },
    { label: "Positive Replies", value: kpis.totalPositiveReplies, rate: kpis.positiveReplyRate },
  ];
}

// ─── Performance Insights ─────────────────────────────────────────────────────

export function computeInsights(
  kpis: KPIMetrics,
  daily: DailyMetric[],
  campaigns: CampaignMetric[],
  senders: SenderMetric[],
  variants: VariantMetric[]
): PerformanceInsight[] {
  const insights: PerformanceInsight[] = [];

  // Best day by positive replies
  const bestDay = daily.reduce((a, b) => (b.positiveReplies > a.positiveReplies ? b : a), daily[0]);
  if (bestDay && bestDay.positiveReplies > 0) {
    const d = new Date(bestDay.date);
    insights.push({
      type: "positive",
      title: "Best Day for Positive Replies",
      description: `${format(d, "MMMM d")} delivered the most positive replies (${bestDay.positiveReplies}), with ${bestDay.sent} emails sent that day.`,
    });
  }

  // Best campaign by positive reply rate
  const bestCamp = campaigns[0];
  if (bestCamp && bestCamp.positiveReplies > 0) {
    insights.push({
      type: "positive",
      title: "Top Campaign",
      description: `"${bestCamp.campaignName}" is driving the strongest reply quality with a ${bestCamp.positiveReplyRate.toFixed(1)}% positive reply rate.`,
    });
  }

  // Campaigns with high send volume but low replies
  const avgReplyRate = kpis.replyRate;
  const underperforming = campaigns.filter(
    (c) => c.sent > 100 && c.replyRate < avgReplyRate * 0.5
  );
  for (const c of underperforming.slice(0, 2)) {
    insights.push({
      type: "warning",
      title: "Low Reply Rate",
      description: `"${c.campaignName}" has sent ${c.sent.toLocaleString()} emails but is only hitting a ${c.replyRate.toFixed(1)}% reply rate — below average. Review the messaging or target list.`,
    });
  }

  // Worst sender by bounce rate
  const worstSender = senders.reduce<SenderMetric | null>((acc, s) => {
    if (!acc) return s;
    return s.bounceRate > acc.bounceRate ? s : acc;
  }, null);
  if (worstSender && worstSender.bounceRate > 2) {
    insights.push({
      type: worstSender.bounceRate > 5 ? "critical" : "warning",
      title: "Sender Bounce Rate Alert",
      description: `${worstSender.senderEmail} has a ${worstSender.bounceRate.toFixed(1)}% bounce rate — ${worstSender.bounceRate > 5 ? "above the 5% critical threshold. Pause and warm up this inbox." : "in the warning zone. Monitor closely."}`,
    });
  }

  // Overall bounce rate
  if (kpis.bounceRate < 2) {
    insights.push({
      type: "positive",
      title: "Bounce Rate is Healthy",
      description: `Overall bounce rate is ${kpis.bounceRate.toFixed(1)}%, well below the 2% threshold. Your lists are clean.`,
    });
  }

  // Best performing variant
  const avgVariantPositiveRate = variants.length > 0
    ? variants.reduce((s, v) => s + v.positiveReplyRate, 0) / variants.length
    : 0;
  const topVariants = variants.filter((v) => v.positiveReplyRate > avgVariantPositiveRate * 1.5 && v.sent > 30);
  if (topVariants.length > 0) {
    const tv = topVariants[0];
    insights.push({
      type: "positive",
      title: "Top Subject Line",
      description: `Variant ${tv.variant} ("${tv.subject.substring(0, 40)}${tv.subject.length > 40 ? "…" : ""}") is outperforming the average with a ${tv.positiveReplyRate.toFixed(1)}% positive reply rate.`,
    });
  }

  // Positive reply rate trend (last 7 days vs prior 7)
  if (daily.length >= 14) {
    const last7 = daily.slice(-7);
    const prior7 = daily.slice(-14, -7);
    const last7Avg = last7.reduce((s, d) => s + d.positiveReplies, 0) / 7;
    const prior7Avg = prior7.reduce((s, d) => s + d.positiveReplies, 0) / 7;
    if (last7Avg > prior7Avg * 1.1) {
      insights.push({
        type: "positive",
        title: "Positive Replies Trending Up",
        description: `Positive replies are up ${((last7Avg / Math.max(prior7Avg, 0.01) - 1) * 100).toFixed(0)}% vs. the previous 7 days. Momentum is building.`,
      });
    } else if (last7Avg < prior7Avg * 0.8 && prior7Avg > 0) {
      insights.push({
        type: "warning",
        title: "Positive Replies Trending Down",
        description: `Positive replies dropped ${((1 - last7Avg / prior7Avg) * 100).toFixed(0)}% vs. the prior week. Review recent campaigns and copy quality.`,
      });
    }
  }

  return insights;
}

// ─── Master Compute ───────────────────────────────────────────────────────────

export function computeDashboardData(
  allEvents: EmailEvent[],
  filters: DashboardFilters
): DashboardData {
  const filtered = filterEvents(allEvents, filters);
  const campaigns = computeCampaignMetrics(filtered);
  const kpis = computeKPIs(filtered, campaigns, filters.dateRange);
  const daily = computeDailyMetrics(filtered, filters.dateRange);
  const variants = computeVariantMetrics(filtered);
  const senders = computeSenderMetrics(filtered, filters.clientId);
  const positiveReplies = computePositiveReplies(filtered);
  const funnel = computeFunnel(kpis);
  const insights = computeInsights(kpis, daily, campaigns, senders, variants);

  return { kpis, dailyMetrics: daily, campaignMetrics: campaigns, variantMetrics: variants, senderMetrics: senders, positiveReplies, funnel, insights };
}
