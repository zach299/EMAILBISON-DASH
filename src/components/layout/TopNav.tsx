"use client";
import { Select, MultiSelect } from "@/components/ui/Select";
import type { Client, Campaign, SenderEmail, DashboardFilters } from "@/types";
import { format, subDays } from "date-fns";
import { BarChart3, RefreshCw } from "lucide-react";

const DATE_PRESETS = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 14 Days", value: "14" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 60 Days", value: "60" },
  { label: "Last 90 Days", value: "90" },
];

interface TopNavProps {
  clients: Client[];
  campaigns: Campaign[];
  senders: SenderEmail[];
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  lastUpdated?: Date;
}

export function TopNav({ clients, campaigns, senders, filters, onFiltersChange, lastUpdated }: TopNavProps) {
  const clientCampaigns = campaigns.filter((c) => c.clientId === filters.clientId);
  const clientSenders = senders.filter((s) => s.clientId === filters.clientId);

  function setDatePreset(days: string) {
    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), parseInt(days) - 1), "yyyy-MM-dd");
    onFiltersChange({ ...filters, dateRange: { from, to } });
  }

  const daysDiff = Math.round(
    (new Date(filters.dateRange.to).getTime() - new Date(filters.dateRange.from).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  const activePreset = DATE_PRESETS.find((p) => parseInt(p.value) === daysDiff)?.value ?? "";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm hidden sm:block">EmailBison</span>
            <span className="text-slate-300 hidden sm:block">/</span>
            <span className="text-xs font-medium text-slate-500 hidden sm:block">Performance</span>
          </div>

          <div className="flex-1" />

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Client selector */}
            <Select
              value={filters.clientId}
              onChange={(clientId) => onFiltersChange({ ...filters, clientId, campaignIds: [], senderEmails: [] })}
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              className="min-w-[100px]"
            />

            {/* Date range */}
            <Select
              value={activePreset}
              onChange={setDatePreset}
              options={DATE_PRESETS}
              className="min-w-[130px]"
              placeholder="Custom Range"
            />

            {/* Campaign filter */}
            {clientCampaigns.length > 0 && (
              <MultiSelect
                values={filters.campaignIds}
                onChange={(ids) => onFiltersChange({ ...filters, campaignIds: ids })}
                options={clientCampaigns.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="All Campaigns"
                className="min-w-[140px]"
              />
            )}

            {/* Sender filter */}
            {clientSenders.length > 0 && (
              <MultiSelect
                values={filters.senderEmails}
                onChange={(emails) => onFiltersChange({ ...filters, senderEmails: emails })}
                options={clientSenders.map((s) => ({ value: s.email, label: s.email }))}
                placeholder="All Inboxes"
                className="min-w-[130px]"
              />
            )}
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0 hidden md:flex">
              <RefreshCw className="w-3 h-3" />
              <span>Updated {format(lastUpdated, "h:mm a")}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
