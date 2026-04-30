import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { KPIMetrics, CampaignMetric, SenderMetric, VariantMetric, PerformanceInsight } from "@/types";

const client = new Anthropic();

interface InsightsRequest {
  kpis: KPIMetrics;
  campaigns: CampaignMetric[];
  senders: SenderMetric[];
  variants: VariantMetric[];
  dateRange: { from: string; to: string };
}

// Ensure a string is non-empty; fall back to a placeholder so content blocks
// are never empty (Anthropic API rejects empty text content blocks with 400).
function nonEmpty(value: string | undefined | null, fallback: string): string {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function buildSystemPrompt(): string {
  return [
    "You are an expert cold email performance analyst.",
    "Analyze the provided campaign metrics and return 3–5 concise, actionable insights.",
    "Return ONLY a valid JSON array of insight objects with this shape:",
    '  [{ "type": "positive"|"warning"|"critical"|"neutral", "title": "string", "description": "string" }]',
    "Keep each description under 120 characters. Do not include any text outside the JSON array.",
  ].join("\n");
}

function buildUserMessage(data: InsightsRequest): string {
  const { kpis, campaigns, senders, variants, dateRange } = data;

  const topCampaigns = campaigns.slice(0, 5).map((c) => ({
    name: nonEmpty(c.campaignName, "Unnamed Campaign"),
    sent: c.sent,
    replyRate: Number(c.replyRate.toFixed(2)),
    positiveReplyRate: Number(c.positiveReplyRate.toFixed(2)),
    bounceRate: Number(c.bounceRate.toFixed(2)),
  }));

  const topSenders = senders.slice(0, 5).map((s) => ({
    email: nonEmpty(s.senderEmail, "unknown@unknown.com"),
    sent: s.sent,
    bounceRate: Number(s.bounceRate.toFixed(2)),
    status: nonEmpty(s.status, "unknown"),
  }));

  const topVariants = variants.slice(0, 5).map((v) => ({
    subject: nonEmpty(v.subject, "(no subject)"),
    variant: nonEmpty(v.variant, "A"),
    step: v.step,
    sent: v.sent,
    positiveReplyRate: Number(v.positiveReplyRate.toFixed(2)),
  }));

  const summary = {
    dateRange,
    kpis: {
      totalSent: kpis.totalSent,
      totalReplies: kpis.totalReplies,
      totalPositiveReplies: kpis.totalPositiveReplies,
      totalBounces: kpis.totalBounces,
      replyRate: Number(kpis.replyRate.toFixed(2)),
      positiveReplyRate: Number(kpis.positiveReplyRate.toFixed(2)),
      bounceRate: Number(kpis.bounceRate.toFixed(2)),
      avgSentPerDay: Number(kpis.avgSentPerDay.toFixed(1)),
      bestCampaign: nonEmpty(kpis.bestCampaignName, "N/A"),
      bestCampaignPositiveReplyRate: Number(kpis.bestCampaignPositiveReplyRate.toFixed(2)),
    },
    topCampaigns,
    topSenders,
    topVariants,
  };

  const json = JSON.stringify(summary, null, 2);
  // Guard: the serialized JSON must never be empty (it won't be, but be explicit)
  return nonEmpty(json, "{}");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InsightsRequest;

    const systemPrompt = buildSystemPrompt();
    const userMessage = buildUserMessage(body);

    // Both blocks are guaranteed non-empty by the helpers above, but assert
    // here to make the invariant obvious and catch regressions fast.
    if (!systemPrompt.trim() || !userMessage.trim()) {
      return NextResponse.json(
        { error: "Message content must not be empty" },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const rawText =
      response.content[0]?.type === "text" ? response.content[0].text.trim() : "[]";

    let insights: PerformanceInsight[] = [];
    try {
      insights = JSON.parse(rawText) as PerformanceInsight[];
    } catch {
      insights = [];
    }

    return NextResponse.json({ insights });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
