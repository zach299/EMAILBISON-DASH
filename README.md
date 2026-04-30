# EmailBison Performance Dashboard

A premium, client-facing cold email performance dashboard powered by EmailBison data.

Built for outbound reporting — clean, executive-ready, and multi-client from day one.

---

## What It Shows

- **KPI Cards** — Emails Sent, Replies, Positive Replies, Reply Rate, Positive Reply Rate, Bounce Rate, Avg/Day, Best Campaign
- **Daily Charts** — Sent volume, replies, positive replies, bounces (individual + multi-series overview)
- **Reply Funnel** — Sent → Replies → Positive Replies with conversion rates
- **Campaign Leaderboard** — All campaigns ranked by positive reply rate
- **Subject Line / Variant Performance** — Per-subject, per-step, per-variant breakdown
- **Sender Inbox Health** — Bounce rate, daily limit, and status per inbox
- **Positive Reply Feed** — Live feed of interested leads with reply snippets
- **Performance Insights** — Auto-generated client-facing takeaways

> **Opens are not tracked.** No open rate, unique opens, or open-based engagement metrics exist anywhere in this app.

---

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS**
- **Recharts**
- **date-fns**
- **lucide-react**

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add credentials

Copy `.env.local.example` to `.env.local` and fill in your EmailBison API key:

```env
EMAILBISON_API_KEY=your_key_here
EMAILBISON_API_BASE=https://app.emailbison.com/api
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app ships with 90 days of realistic mock data for the **Deck** client so everything works immediately — no live API required.

### 4. Deploy

```bash
# Vercel (recommended)
vercel deploy

# Or build for any Node host
npm run build && npm start
```

Set your environment variables in Vercel → Project → Settings → Environment Variables.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Root — renders Dashboard
│   ├── layout.tsx
│   └── globals.css
│
├── types/index.ts          # All TypeScript types
│
├── data/
│   ├── clients.ts          # Client registry, campaigns, sender emails
│   └── mockEmailEvents.ts  # 90-day mock dataset for Deck
│
├── lib/
│   ├── metrics.ts          # All metric computation
│   ├── utils.ts            # Formatting and color helpers
│   └── emailbison.ts       # EmailBison API/webhook integration
│
└── components/
    ├── ui/                 # Card, KPICard, Badge, Select, EmptyState
    ├── charts/             # DailyChart, FunnelChart
    ├── dashboard/          # Hero, KPIGrid, Tables, Feed, Insights, Dashboard
    └── layout/             # TopNav
```

---

## Connecting Live EmailBison Data

See `src/lib/emailbison.ts` for the full integration guide and field mapping.

### Option A — Webhooks (recommended)

1. In EmailBison → Settings → Webhooks, add: `https://your-domain.com/api/webhooks/emailbison`
2. Create `src/app/api/webhooks/emailbison/route.ts`:

```ts
import { parseWebhookPayload } from "@/lib/emailbison";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const event = parseWebhookPayload(payload, "deck", "Campaign Name");
  if (event) {
    // store to your database
  }
  return NextResponse.json({ ok: true });
}
```

3. Replace `getMockEvents()` in `Dashboard.tsx` with a database query.

### Option B — API Polling

Set `EMAILBISON_API_KEY` in `.env.local` and use `fetchEmailBisonEvents()` from `src/lib/emailbison.ts`.

### EmailBison Field Mapping

| EmailBison Field | Dashboard Field |
|---|---|
| `scheduled_email.status = "sent"` | `eventType: "sent"` |
| `campaign_event.type = "reply"` | `eventType: "reply"` |
| `campaign_event.type = "bounce"` | `eventType: "bounce"` |
| `lead.interested = true` | `eventType: "positive_reply"` |
| `campaign_event.email_subject` | `subject` |
| `campaign_event.step_order` | `stepOrder` |
| `campaign_event.variant` | `stepVariant` |

---

## Adding a New Client

1. Add to `src/data/clients.ts` → `CLIENTS` array
2. Add their campaigns to `CAMPAIGNS` array
3. Add sender inboxes to `SENDER_EMAILS` array

The client selector in the nav appears automatically. All metrics filter by `clientId`.

---

## Metric Definitions

| Metric | Definition |
|---|---|
| Emails Sent | All emails that left the inbox |
| Replies | `eventType = "reply"` or `"positive_reply"` |
| Positive Replies | `interested = true` |
| Bounces | `eventType = "bounce"` |
| Bounce Rate | Bounces / Sent × 100 |
| Positive Reply Rate | Positive Replies / Sent × 100 (primary metric) |

**Bounce Rate Thresholds:** < 2% = Healthy · 2–5% = Warning · > 5% = Critical

---

## Environment Variables

```env
EMAILBISON_API_KEY=        # Your EmailBison API key
EMAILBISON_API_BASE=       # EmailBison API base URL
DATABASE_URL=              # Optional: database for storing live events
```
