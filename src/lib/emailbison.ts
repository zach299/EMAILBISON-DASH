/**
 * EmailBison API / Webhook Integration
 *
 * This file is the single integration point for live EmailBison data.
 * Replace the mock data calls with real API calls here.
 *
 * ─── EmailBison Object Mapping ────────────────────────────────────────────────
 *
 * EmailBison Object          → Our EmailEvent fields
 * ─────────────────────────────────────────────────
 * scheduled_email.id         → id
 * scheduled_email.status     → eventType ("sent" | "bounced")
 * scheduled_email.sent_at    → sentAt
 * scheduled_email.email_from → senderEmail
 * scheduled_email.subject    → subject
 * scheduled_email.step_order → stepOrder
 * scheduled_email.variant    → stepVariant
 *
 * campaign_event.type        → eventType ("sent" | "reply" | "bounce")
 * campaign_event.created_at  → sentAt / repliedAt / bouncedAt
 * campaign_event.campaign_id → campaignId
 *
 * lead.id                    → leadId
 * lead.email                 → (stored on lead)
 * lead.first_name            → leadFirstName
 * lead.last_name             → leadLastName
 * lead.title                 → leadTitle
 * lead.company               → leadCompany
 * lead.interested            → interested (true = positive reply)
 *
 * ─── How to Connect Live Data ─────────────────────────────────────────────────
 *
 * Option A — Webhook (recommended):
 *   1. In EmailBison, configure a webhook pointing to /api/webhooks/emailbison
 *   2. The webhook handler in src/app/api/webhooks/emailbison/route.ts
 *      parses incoming events, maps them to EmailEvent, and stores them.
 *   3. Replace getMockEvents() calls in the dashboard with a database query.
 *
 * Option B — API Polling:
 *   1. Set EMAILBISON_API_KEY in your .env file
 *   2. Implement fetchEmailBisonEvents() below to call the EmailBison REST API
 *   3. Schedule it with a cron job or on-demand via the /api/sync route
 *
 * Option C — CSV Export:
 *   1. Export campaign_event and lead data from EmailBison
 *   2. Run the import script: npm run import-csv
 *   3. Data will be parsed and inserted into your database
 */

import type { EmailEvent } from "@/types";

// EmailBison serves its API from dedi.emailbison.com/api
// The API requires the calling IP to be whitelisted in EmailBison → Settings → Developer API
// Set EMAILBISON_API_BASE in .env.local if your account uses a different base URL
const EMAILBISON_API_BASE = process.env.EMAILBISON_API_BASE ?? "https://dedi.emailbison.com/api";
const EMAILBISON_API_KEY = process.env.EMAILBISON_API_KEY ?? "";

export interface EmailBisonRawEvent {
  id: string;
  type: "sent" | "reply" | "bounce" | "interested";
  campaign_id: string;
  lead_id: string;
  created_at: string;
  email_from?: string;
  email_subject?: string;
  step_order?: number;
  variant?: string;
  lead?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    title?: string;
    company?: string;
    interested?: boolean;
  };
  raw?: Record<string, unknown>;
}

/**
 * Fetch events from the EmailBison API.
 * Returns an empty array with a warning if no API key is configured.
 * Wire this up to replace mock data when you have live credentials.
 */
export async function fetchEmailBisonEvents(
  workspaceId: string,
  fromDate: string,
  toDate: string
): Promise<EmailBisonRawEvent[]> {
  if (!EMAILBISON_API_KEY) {
    console.warn("[EmailBison] No API key configured. Using mock data.");
    return [];
  }

  // EmailBison API endpoint — adjust path if needed based on your plan
  // Common patterns: /campaigns/{id}/events, /campaign-events, /replies, /bounces
  const url = new URL(`${EMAILBISON_API_BASE}/campaigns`);
  url.searchParams.set("workspace_id", workspaceId);
  url.searchParams.set("from", fromDate);
  url.searchParams.set("to", toDate);
  url.searchParams.set("per_page", "1000");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${EMAILBISON_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 }, // cache 5 min in Next.js
  });

  if (!res.ok) {
    throw new Error(`EmailBison API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.events ?? [];
}

/**
 * Map a raw EmailBison event to our internal EmailEvent type.
 * Adjust field names here if EmailBison changes their API schema.
 */
export function mapEmailBisonEvent(
  raw: EmailBisonRawEvent,
  clientId: string,
  campaignName: string
): EmailEvent {
  const isPositive = raw.type === "interested" || raw.lead?.interested === true;
  const eventType = isPositive ? "positive_reply" : raw.type === "reply" ? "reply" : raw.type === "bounce" ? "bounce" : "sent";

  return {
    id: raw.id,
    clientId,
    campaignId: raw.campaign_id,
    campaignName,
    leadId: raw.lead_id,
    senderEmail: raw.email_from ?? "unknown@unknown.com",
    eventType,
    sentAt: raw.created_at,
    repliedAt: raw.type === "reply" || isPositive ? raw.created_at : undefined,
    bouncedAt: raw.type === "bounce" ? raw.created_at : undefined,
    interested: isPositive,
    subject: raw.email_subject ?? "N/A",
    stepOrder: raw.step_order ?? 1,
    stepVariant: raw.variant ?? "A",
    leadFirstName: raw.lead?.first_name,
    leadLastName: raw.lead?.last_name,
    leadTitle: raw.lead?.title,
    leadCompany: raw.lead?.company,
    rawPayload: { _source: "emailbison_api", ...raw.raw },
  };
}

/**
 * Webhook handler helper — call this from your webhook route.
 * See: src/app/api/webhooks/emailbison/route.ts
 */
export function parseWebhookPayload(
  payload: Record<string, unknown>,
  clientId: string,
  campaignName: string
): EmailEvent | null {
  try {
    const raw = payload as unknown as EmailBisonRawEvent;
    return mapEmailBisonEvent(raw, clientId, campaignName);
  } catch (err) {
    console.error("[EmailBison] Failed to parse webhook payload:", err, payload);
    return null;
  }
}
