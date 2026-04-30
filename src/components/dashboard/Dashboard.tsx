"use client";

import { useState, useMemo, useEffect } from "react";
import { format, subDays } from "date-fns";
import type { DashboardFilters } from "@/types";
import { CLIENTS, CAMPAIGNS, SENDER_EMAILS } from "@/data/clients";
import { getMockEvents } from "@/data/mockEmailEvents";
import { computeDashboardData } from "@/lib/metrics";
import { TopNav } from "@/components/layout/TopNav";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { VariantTable } from "@/components/dashboard/VariantTable";
import { SenderTable } from "@/components/dashboard/SenderTable";
import { PositiveReplyFeed } from "@/components/dashboard/PositiveReplyFeed";
import { InsightsSection } from "@/components/dashboard/InsightsSection";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</h2>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export function Dashboard() {
  const defaultFilters: DashboardFilters = {
    clientId: "deck",
    dateRange: {
      from: format(subDays(new Date(), 29), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    },
    campaignIds: [],
    senderEmails: [],
  };

  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  const allEvents = useMemo(() => getMockEvents(), []);

  const data = useMemo(() => computeDashboardData(allEvents, filters), [allEvents, filters]);

  const client = CLIENTS.find((c) => c.id === filters.clientId) ?? CLIENTS[0];

  // Simulate a brief load on filter change for UX
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(t);
  }, [filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        clients={CLIENTS}
        campaigns={CAMPAIGNS}
        senders={SENDER_EMAILS}
        filters={filters}
        onFiltersChange={setFilters}
        lastUpdated={new Date()}
      />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Hero */}
            <HeroSection
              clientName={client.name}
              dateRange={filters.dateRange}
              kpis={data.kpis}
            />

            {/* Performance Insights */}
            <InsightsSection insights={data.insights} />

            {/* KPIs */}
            <section>
              <SectionLabel>Key Metrics</SectionLabel>
              <KPIGrid kpis={data.kpis} />
            </section>

            {/* Charts */}
            <section>
              <SectionLabel>Performance Trends</SectionLabel>
              <ChartsSection dailyMetrics={data.dailyMetrics} funnel={data.funnel} />
            </section>

            {/* Campaign Leaderboard */}
            <section>
              <SectionLabel>Campaign Performance</SectionLabel>
              <CampaignTable data={data.campaignMetrics} />
            </section>

            {/* Variant Performance */}
            <section>
              <SectionLabel>Subject Line &amp; Variant Performance</SectionLabel>
              <VariantTable data={data.variantMetrics} />
            </section>

            {/* Sender Health + Positive Replies */}
            <section>
              <SectionLabel>Sender Inbox Health</SectionLabel>
              <SenderTable data={data.senderMetrics} />
            </section>

            <section>
              <SectionLabel>Positive Reply Feed</SectionLabel>
              <PositiveReplyFeed data={data.positiveReplies} />
            </section>

            {/* Footer */}
            <footer className="py-6 text-center text-xs text-slate-300 border-t border-slate-100">
              EmailBison Performance Dashboard · Data powered by EmailBison · Positive reply rate is the primary success metric
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-slate-200 h-32" />
      {/* Insights skeleton */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm h-24" />
      {/* KPI skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-sm h-24" />
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm h-72" />
    </div>
  );
}
