import type { EmailEvent } from "@/types";
import { subDays, format, addHours } from "date-fns";

// ─── Mock EmailBison Event Data ───────────────────────────────────────────────
// This dataset simulates what you'd receive from EmailBison webhooks or API.
// Fields map to EmailBison's campaign_event and scheduled_email objects.
//
// EmailBison field mapping:
//   scheduled_email.status = "sent"  →  eventType: "sent"
//   campaign_event.type = "reply"    →  eventType: "reply"
//   campaign_event.type = "bounce"   →  eventType: "bounce"
//   lead.interested = true           →  interested: true → eventType: "positive_reply"
//   campaign_event.email_subject     →  subject
//   campaign_event.step_order        →  stepOrder
//   campaign_event.variant           →  stepVariant

const LEADS = [
  { id: "l001", first: "Marcus", last: "Chen", title: "VP of Sales", company: "Catalyst AI", email: "marcus@catalystai.com" },
  { id: "l002", first: "Sarah", last: "Thornton", title: "Chief Revenue Officer", company: "Nexus Ventures", email: "sarah@nexusventures.io" },
  { id: "l003", first: "David", last: "Park", title: "CEO", company: "Orbit Software", email: "d.park@orbitsoftware.com" },
  { id: "l004", first: "Emily", last: "Walsh", title: "Head of Growth", company: "PivotPoint", email: "emily@pivotpoint.co" },
  { id: "l005", first: "James", last: "Okafor", title: "CFO", company: "Stackline", email: "james.o@stackline.com" },
  { id: "l006", first: "Rachel", last: "Kim", title: "Co-Founder", company: "Driftwood Labs", email: "rachel@driftwoodlabs.com" },
  { id: "l007", first: "Tyler", last: "Morris", title: "VP Engineering", company: "CloudScale", email: "tyler@cloudscale.io" },
  { id: "l008", first: "Anna", last: "Bergström", title: "Director of Ops", company: "Finvera", email: "a.bergstrom@finvera.se" },
  { id: "l009", first: "Kevin", last: "Nwosu", title: "Chief of Staff", company: "BuildFast", email: "knwosu@buildfast.com" },
  { id: "l010", first: "Olivia", last: "Santos", title: "Head of RevOps", company: "Meridian SaaS", email: "olivia@meridiansaas.com" },
  { id: "l011", first: "Brandon", last: "Liu", title: "CEO", company: "Forge Analytics", email: "b.liu@forgeanalytics.io" },
  { id: "l012", first: "Natalie", last: "Russo", title: "VP Marketing", company: "Halo Commerce", email: "nrusso@halocommerce.com" },
  { id: "l013", first: "Andre", last: "Dubois", title: "CFO", company: "Lumen Capital", email: "andre@lumencap.fr" },
  { id: "l014", first: "Priya", last: "Sharma", title: "CRO", company: "GrowthEngine", email: "priya@growthengine.in" },
  { id: "l015", first: "Chris", last: "Harmon", title: "Founder", company: "Basecamp AI", email: "chris@basecampai.com" },
  { id: "l016", first: "Megan", last: "Ostroff", title: "COO", company: "Vector Health", email: "megan@vectorhealth.com" },
  { id: "l017", first: "Sam", last: "Fitzgerald", title: "Director of Sales", company: "Pulsar Tech", email: "sfitz@pulsartech.com" },
  { id: "l018", first: "Yuki", last: "Tanaka", title: "CEO", company: "Synapse Data", email: "yuki@synapsedata.jp" },
  { id: "l019", first: "Carlos", last: "Mendez", title: "VP Product", company: "Launchpad SaaS", email: "carlos@launchpadsaas.com" },
  { id: "l020", first: "Alicia", last: "Fenton", title: "Head of Finance", company: "Northstar Group", email: "alicia.f@northstargroup.com" },
];

const CAMPAIGNS_META = [
  { id: "camp_001", name: "Enterprise SaaS Decision Makers", clientId: "deck" },
  { id: "camp_002", name: "Mid-Market CFOs Q1", clientId: "deck" },
  { id: "camp_003", name: "Startup Founders — Series B+", clientId: "deck" },
  { id: "camp_004", name: "RevOps Leaders Spring", clientId: "deck" },
];

const SENDERS = ["zach@deck.co", "outreach@deck.co", "growth@deck.co", "hello@deck.co"];

const SUBJECTS: Record<string, { subject: string; step: number; variant: string }[]> = {
  camp_001: [
    { subject: "Quick question about your sales stack", step: 1, variant: "A" },
    { subject: "{{first_name}}, worth a 10-min call?", step: 1, variant: "B" },
    { subject: "Following up on my last email", step: 2, variant: "A" },
    { subject: "Heard you're scaling your team", step: 2, variant: "B" },
    { subject: "Last nudge from me", step: 3, variant: "A" },
  ],
  camp_002: [
    { subject: "CFO-to-CFO: how Deck changes the game", step: 1, variant: "A" },
    { subject: "Quick thought on your Q2 planning", step: 1, variant: "B" },
    { subject: "Did my last email get lost?", step: 2, variant: "A" },
    { subject: "One more thought for {{first_name}}", step: 3, variant: "A" },
  ],
  camp_003: [
    { subject: "Series B founder? Deck was built for you", step: 1, variant: "A" },
    { subject: "Congrats on the raise — quick idea", step: 1, variant: "B" },
    { subject: "Still relevant?", step: 2, variant: "A" },
    { subject: "Checking in, {{first_name}}", step: 3, variant: "A" },
  ],
  camp_004: [
    { subject: "RevOps + Deck = fewer spreadsheets", step: 1, variant: "A" },
    { subject: "Are you still using Excel for this?", step: 1, variant: "B" },
    { subject: "Following up from last week", step: 2, variant: "A" },
  ],
};

const REPLY_SNIPPETS = [
  "Hey, actually this looks interesting — can you send me more details?",
  "Sure, let's set up a call. What does Thursday look like for you?",
  "I've been looking for something like this. Let me loop in my partner.",
  "Interesting timing — we're actually evaluating tools right now. Happy to chat.",
  "Yes, I'd love to see a demo. Can you book something this week?",
  "This caught my eye. Send me a one-pager and let's talk.",
  "We've been struggling with this exact problem. Open to a quick call.",
  "Forwarded to our ops lead — she'll reach out. Good pitch.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Generate 90 days of mock data
export function generateMockEvents(): EmailEvent[] {
  const events: EmailEvent[] = [];
  let eventIdx = 0;
  const today = new Date();

  // Distribution: camp_001=45%, camp_002=30%, camp_003=15%, camp_004=10%
  const campWeights = [
    { id: "camp_001", weight: 0.45 },
    { id: "camp_002", weight: 0.30 },
    { id: "camp_003", weight: 0.15 },
    { id: "camp_004", weight: 0.10 },
  ];

  // Sender distributions per campaign
  const senderByCamp: Record<string, string[]> = {
    camp_001: ["zach@deck.co", "outreach@deck.co"],
    camp_002: ["outreach@deck.co", "growth@deck.co"],
    camp_003: ["zach@deck.co", "outreach@deck.co"],
    camp_004: ["hello@deck.co", "growth@deck.co"],
  };

  // Volume per day varies — ramp up in middle, slow at start/end
  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const date = subDays(today, dayOffset);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();

    // Less volume on weekends
    const baseVolume = (dayOfWeek === 0 || dayOfWeek === 6) ? 8 : 30;
    const volumeVariance = Math.floor(seededRand(dayOffset * 7 + 3) * 20);
    const dailySent = baseVolume + volumeVariance;

    for (let e = 0; e < dailySent; e++) {
      const seed = dayOffset * 1000 + e;
      const rand = seededRand(seed);

      // Pick campaign by weight
      let cumWeight = 0;
      let campId = "camp_001";
      const campRand = seededRand(seed + 1);
      for (const c of campWeights) {
        cumWeight += c.weight;
        if (campRand < cumWeight) { campId = c.id; break; }
      }

      const camp = CAMPAIGNS_META.find(c => c.id === campId)!;
      const lead = LEADS[Math.floor(seededRand(seed + 2) * LEADS.length)];
      const senderPool = senderByCamp[campId];
      const sender = senderPool[Math.floor(seededRand(seed + 3) * senderPool.length)];
      const subjectPool = SUBJECTS[campId];
      const subjectMeta = subjectPool[Math.floor(seededRand(seed + 4) * subjectPool.length)];

      // Bounce rate: hello@deck.co = 7%, growth@deck.co = 3%, others = 1%
      const bounceProb = sender === "hello@deck.co" ? 0.07 : sender === "growth@deck.co" ? 0.03 : 0.01;
      const isBounce = seededRand(seed + 5) < bounceProb;

      // Reply rate ~8% for non-bounced
      const replyProb = isBounce ? 0 : 0.08;
      const isReply = seededRand(seed + 6) < replyProb;

      // Positive reply = ~35% of replies
      const positiveProb = isReply ? 0.35 : 0;
      const isPositive = seededRand(seed + 7) < positiveProb;

      const eventType = isBounce ? "bounce" : isPositive ? "positive_reply" : isReply ? "reply" : "sent";
      const hour = Math.floor(seededRand(seed + 8) * 10) + 7; // 7am-5pm
      const sentAt = format(addHours(date, hour), "yyyy-MM-dd'T'HH:mm:ss'Z'");
      const repliedAt = isReply ? format(addHours(date, hour + Math.floor(seededRand(seed + 9) * 48)), "yyyy-MM-dd'T'HH:mm:ss'Z'") : undefined;

      events.push({
        id: `evt_${++eventIdx}`,
        clientId: "deck",
        campaignId: campId,
        campaignName: camp.name,
        leadId: lead.id,
        senderEmail: sender,
        eventType,
        sentAt,
        repliedAt,
        bouncedAt: isBounce ? sentAt : undefined,
        interested: isPositive,
        subject: subjectMeta.subject,
        stepOrder: subjectMeta.step,
        stepVariant: subjectMeta.variant,
        leadFirstName: lead.first,
        leadLastName: lead.last,
        leadTitle: lead.title,
        leadCompany: lead.company,
        replySnippet: isPositive ? REPLY_SNIPPETS[Math.floor(seededRand(seed + 10) * REPLY_SNIPPETS.length)] : undefined,
        rawPayload: {
          _source: "mock",
          emailbison_campaign_event_type: eventType,
          emailbison_scheduled_email_status: isBounce ? "bounced" : "sent",
          emailbison_lead_interested: isPositive,
          _note: "Replace with live EmailBison API/webhook payload",
        },
      });
    }
  }

  return events;
}

// Singleton cache for the mock dataset
let _cachedEvents: EmailEvent[] | null = null;

export function getMockEvents(): EmailEvent[] {
  if (!_cachedEvents) {
    _cachedEvents = generateMockEvents();
  }
  return _cachedEvents;
}
