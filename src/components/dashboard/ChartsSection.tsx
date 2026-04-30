"use client";
import type { DailyMetric, FunnelStep } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DailyChart, MultiSeriesChart } from "@/components/charts/DailyChart";
import { FunnelChart } from "@/components/charts/FunnelChart";

interface ChartsSectionProps {
  dailyMetrics: DailyMetric[];
  funnel: FunnelStep[];
}

export function ChartsSection({ dailyMetrics, funnel }: ChartsSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Main trend chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSeriesChart
            data={dailyMetrics}
            series={[
              { key: "sent", label: "Sent", color: "#6366f1" },
              { key: "replies", label: "Replies", color: "#10b981" },
              { key: "positiveReplies", label: "Positive Replies", color: "#f59e0b" },
              { key: "bounces", label: "Bounces", color: "#ef4444" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Individual charts + funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sent Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyChart data={dailyMetrics} metric="sent" title="Emails Sent" color="#6366f1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Replies</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyChart data={dailyMetrics} metric="replies" title="Replies" color="#10b981" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Positive Replies</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyChart data={dailyMetrics} metric="positiveReplies" title="Positive Replies" color="#f59e0b" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Bounces</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyChart data={dailyMetrics} metric="bounces" title="Bounces" color="#ef4444" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Reply Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
