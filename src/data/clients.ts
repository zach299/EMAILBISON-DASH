import type { Client, Campaign, SenderEmail } from "@/types";

// ─── Client Registry ──────────────────────────────────────────────────────────
// Add new clients here. Each client needs an emailbisonWorkspaceId.

export const CLIENTS: Client[] = [
  {
    id: "deck",
    name: "Deck",
    emailbisonWorkspaceId: "ws_deck_001",
    createdAt: "2024-01-01",
  },
  // Add future clients here:
  // {
  //   id: "acme",
  //   name: "Acme Corp",
  //   emailbisonWorkspaceId: "ws_acme_002",
  //   createdAt: "2024-06-01",
  // },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "camp_001",
    clientId: "deck",
    emailbisonCampaignId: "eb_camp_001",
    name: "Enterprise SaaS Decision Makers",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "camp_002",
    clientId: "deck",
    emailbisonCampaignId: "eb_camp_002",
    name: "Mid-Market CFOs Q1",
    status: "active",
    createdAt: "2024-02-01",
  },
  {
    id: "camp_003",
    clientId: "deck",
    emailbisonCampaignId: "eb_camp_003",
    name: "Startup Founders — Series B+",
    status: "completed",
    createdAt: "2024-01-01",
  },
  {
    id: "camp_004",
    clientId: "deck",
    emailbisonCampaignId: "eb_camp_004",
    name: "RevOps Leaders Spring",
    status: "paused",
    createdAt: "2024-03-01",
  },
];

export const SENDER_EMAILS: SenderEmail[] = [
  { email: "zach@deck.co", clientId: "deck", dailyLimit: 50, status: "healthy" },
  { email: "outreach@deck.co", clientId: "deck", dailyLimit: 75, status: "healthy" },
  { email: "growth@deck.co", clientId: "deck", dailyLimit: 50, status: "warning" },
  { email: "hello@deck.co", clientId: "deck", dailyLimit: 40, status: "critical" },
];
