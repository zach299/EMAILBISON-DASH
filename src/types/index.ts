// ─── Core Domain Types ───────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  logoUrl?: string;
  emailbisonWorkspaceId: string;
  defaultCampaignIds?: string[];
  createdAt: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  emailbisonCampaignId: string;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  createdAt: string;
}

export interface Lead {
  id: string;
  clientId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  status: string;
  customVariables?: Record<string, string>;
  rawPayload?: Record<string, unknown>;
}

export interface EmailEvent {
  id: string;
  clientId: string;
  campaignId: string;
  campaignName: string;
  leadId: string;
  senderEmail: string;
  eventType: "sent" | "reply" | "bounce" | "positive_reply";
  sentAt: string;
  repliedAt?: string;
  bouncedAt?: string;
  interested: boolean;
  subject: string;
  stepOrder: number;
  stepVariant?: string;
  leadFirstName?: string;
  leadLastName?: string;
  leadTitle?: string;
  leadCompany?: string;
  replySnippet?: string;
  rawPayload?: Record<string, unknown>;
}

export interface SenderEmail {
  email: string;
  clientId: string;
  dailyLimit: number;
  status: "healthy" | "warning" | "critical" | "paused";
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface DashboardFilters {
  clientId: string;
  dateRange: { from: string; to: string };
  campaignIds: string[];
  senderEmails: string[];
}

// ─── Metric Types ─────────────────────────────────────────────────────────────

export interface KPIMetrics {
  totalSent: number;
  totalReplies: number;
  totalPositiveReplies: number;
  totalBounces: number;
  replyRate: number;
  positiveReplyRate: number;
  bounceRate: number;
  avgSentPerDay: number;
  bestCampaignName: string;
  bestCampaignPositiveReplyRate: number;
}

export interface DailyMetric {
  date: string;
  sent: number;
  replies: number;
  positiveReplies: number;
  bounces: number;
}

export interface CampaignMetric {
  campaignId: string;
  campaignName: string;
  sent: number;
  replies: number;
  positiveReplies: number;
  bounces: number;
  replyRate: number;
  positiveReplyRate: number;
  bounceRate: number;
}

export interface VariantMetric {
  subject: string;
  step: number;
  variant: string;
  sent: number;
  replies: number;
  positiveReplies: number;
  replyRate: number;
  positiveReplyRate: number;
  bounceRate: number;
}

export interface SenderMetric {
  senderEmail: string;
  sent: number;
  replies: number;
  positiveReplies: number;
  bounces: number;
  bounceRate: number;
  dailyLimit: number;
  status: "healthy" | "warning" | "critical" | "paused";
}

export interface PositiveReplyEntry {
  leadName: string;
  title: string;
  company: string;
  email: string;
  campaign: string;
  subject: string;
  replySnippet?: string;
  date: string;
  senderInbox: string;
}

export interface FunnelStep {
  label: string;
  value: number;
  rate?: number;
}

export interface PerformanceInsight {
  type: "positive" | "warning" | "critical" | "neutral";
  title: string;
  description: string;
}

export interface DashboardData {
  kpis: KPIMetrics;
  dailyMetrics: DailyMetric[];
  campaignMetrics: CampaignMetric[];
  variantMetrics: VariantMetric[];
  senderMetrics: SenderMetric[];
  positiveReplies: PositiveReplyEntry[];
  funnel: FunnelStep[];
  insights: PerformanceInsight[];
}
