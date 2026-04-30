"use client";
import type { PositiveReplyEntry } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { ThumbsUp, Building2, Briefcase, Send } from "lucide-react";

interface PositiveReplyFeedProps {
  data: PositiveReplyEntry[];
}

function Initials({ name }: { name: string }) {
  const parts = name.split(" ").filter(Boolean);
  const init = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0]?.[0] ?? "?";
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {init.toUpperCase()}
    </div>
  );
}

export function PositiveReplyFeed({ data }: PositiveReplyFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-amber-500" />
          <CardTitle>Positive Reply Feed</CardTitle>
        </div>
        <span className="text-xs text-slate-400">{data.length} interested leads</span>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {data.length === 0 ? (
          <div className="px-6 py-4">
            <EmptyState
              icon={ThumbsUp}
              title="No positive replies yet"
              description="Positive replies will appear here as interested leads respond."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((entry, i) => (
              <div key={i} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex gap-3">
                  <Initials name={entry.leadName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-900 text-sm">{entry.leadName}</span>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {entry.title && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Briefcase className="w-3 h-3" />
                              {entry.title}
                            </span>
                          )}
                          {entry.company && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Building2 className="w-3 h-3" />
                              {entry.company}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(entry.date)}</span>
                    </div>

                    {entry.replySnippet && (
                      <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-emerald-800 italic leading-relaxed">
                          &ldquo;{entry.replySnippet}&rdquo;
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        📧 {entry.subject}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Send className="w-3 h-3" />
                        {entry.senderInbox}
                      </span>
                      <span className="text-xs text-indigo-500 font-medium">{entry.campaign}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
