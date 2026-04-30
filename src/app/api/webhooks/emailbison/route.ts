/**
 * EmailBison Webhook Handler
 *
 * Configure this URL in EmailBison → Settings → Webhooks:
 *   https://your-domain.com/api/webhooks/emailbison
 *
 * EmailBison will POST an event object for each campaign event.
 * This handler parses it and stores it for the dashboard to read.
 *
 * To enable persistence, replace the console.log with your database write.
 * Recommended: Supabase, PlanetScale, or any Postgres-compatible DB.
 */

import { NextRequest, NextResponse } from "next/server";
import { parseWebhookPayload } from "@/lib/emailbison";
import { CAMPAIGNS } from "@/data/clients";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as Record<string, unknown>;

    // Resolve campaign name from EmailBison campaign_id
    const ebCampaignId = payload.campaign_id as string | undefined;
    const campaign = CAMPAIGNS.find((c) => c.emailbisonCampaignId === ebCampaignId);
    const clientId = campaign?.clientId ?? "deck";
    const campaignName = campaign?.name ?? ebCampaignId ?? "Unknown Campaign";

    const event = parseWebhookPayload(payload, clientId, campaignName);

    if (!event) {
      return NextResponse.json({ ok: false, error: "Failed to parse event" }, { status: 400 });
    }

    // ─── Persist the event ────────────────────────────────────────────────────
    // Replace this with your actual database write, e.g.:
    //
    //   await db.emailEvent.create({ data: event });
    //
    // Until then, events are logged for debugging:
    console.log("[EmailBison Webhook] Event received:", JSON.stringify(event, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[EmailBison Webhook] Error:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}

// Return 405 for non-POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
