"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ExternalLink,
  Loader2,
  AlertCircle,
  Briefcase,
  Film,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { searchJobByConditions } from "@/services/JobApi";
import { searchVideoByConditions } from "@/services/VideoApi";
import type { JobResponse } from "@/types/jobs";
import type { VideoResponse } from "@/types/videos";

interface RelatedItem {
  id: number;
  type: "job" | "video";
  code: string;
  caseName: string;
  assigneeName: string;
  jobStatus: string;
  doneLink: string | null;
  note: string;
  createdAt: string;
}

interface RelatedWorkSectionProps {
  customerCode: string;
  currentItemId: number;
  currentItemType: "job" | "video";
  onViewItem: (id: number, type: "job" | "video") => void;
  customerNote?: string;
  hideSeparator?: boolean;
  title?: string;
}

const jobStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  DONE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  IN_REVIEW: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  REVIEWED: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

const jobStatusLabels: Record<string, string> = {
  PENDING: "Đang chờ",
  IN_PROGRESS: "Đang tiến hành",
  DONE: "Đã hoàn thành",
  IN_REVIEW: "Đang xem xét",
  REVIEWED: "Đã được xem xét",
  COMPLETED: "Đã hoàn tất",
};

function mapVideoToItem(video: VideoResponse): RelatedItem {
  return {
    id: video.id,
    type: "video",
    code: video.code,
    caseName: video.caseName,
    assigneeName: video.assignee?.fullName || "",
    jobStatus: video.jobStatus,
    doneLink: video.doneLink || null,
    note: video.note || "",
    createdAt: video.createdAt?.toString?.() || "",
  };
}

function mapJobToItem(job: JobResponse): RelatedItem {
  return {
    id: job.id,
    type: "job",
    code: job.code,
    caseName: job.caseName,
    assigneeName: job.assignee?.fullName || "",
    jobStatus: job.jobStatus,
    doneLink: job.doneLink || null,
    note: job.note || "",
    createdAt: job.createdAt?.toString?.() || "",
  };
}

export function RelatedWorkSection({
  customerCode,
  currentItemId,
  currentItemType,
  onViewItem,
  customerNote,
  hideSeparator = false,
  title,
}: RelatedWorkSectionProps) {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelated = useCallback(async () => {
    if (!customerCode) return;
    setLoading(true);
    setError(null);

    const baseParams = {
      pageNumber: 0,
      pageSize: 5,
      keyword: null as string | null,
      startDate: null as string | null,
      endDate: null as string | null,
      customerCode: customerCode,
    };

    const results: RelatedItem[] = [];
    let hasError = false;

    if (currentItemType === "video") {
      try {
        const res = await searchVideoByConditions({
          ...baseParams,
          videoStatus: null as string | null,
          paymentStatus: null as string | null,
        });
        const data = res.data?.data || [];
        for (const v of data) {
          if (v.id !== currentItemId) {
            results.push(mapVideoToItem(v));
          }
        }
      } catch {
        hasError = true;
      }
    } else {
      try {
        const res = await searchJobByConditions({
          ...baseParams,
          jobStatus: null as string | null,
          paymentStatus: null as string | null,
          paymentEmployee: null as string | null,
        });
        const data = res.data?.data || [];
        for (const j of data) {
          if (j.id !== currentItemId) {
            results.push(mapJobToItem(j));
          }
        }
      } catch {
        hasError = true;
      }
    }

    setItems(results);
    if (hasError) {
      setError(
        results.length > 0
          ? "Một số dữ liệu không thể tải được"
          : "Không thể tải dữ liệu",
      );
    }
    setLoading(false);
  }, [customerCode, currentItemId, currentItemType]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  if (!customerCode) return null;

  return (
    <div className="space-y-3">
      {!hideSeparator && <Separator />}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {currentItemType === "video" ? <Film className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
          {title || `${currentItemType === "video" ? "Video" : "Photo"} cùng khách hàng`}
          <span className="text-xs text-muted-foreground font-normal">
            (mã KH: {customerCode})
          </span>
        </h3>

        {customerNote && (
          <div className="rounded border border-blue-200/50 bg-blue-50/60 p-3 text-sm text-blue-800 dark:border-blue-800/30 dark:bg-blue-950/20 dark:text-blue-200 whitespace-pre-wrap break-words">
            <span className="font-medium">Ghi chú khách hàng:</span> {customerNote}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchRelated}
              className="ml-auto text-xs underline-offset-4 hover:underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            Không có công việc nào khác cho khách hàng này
          </p>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => onViewItem(item.id, item.type)}
              >
                <Badge
                  variant="outline"
                  className={
                    item.type === "video"
                      ? "bg-blue-500/10 text-blue-700 border-blue-500/20 shrink-0"
                      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shrink-0"
                  }
                >
                  <a
                      href={item.doneLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1"
                  >
                    {item.type === "video" ? (
                      <Film className="mr-1 h-3 w-3 cursor-pointer" />
                    ) : (
                      <Briefcase className="mr-1 h-3 w-3" />
                    )}
                    {item.type === "video" ? "Video" : "Photo"}
                  </a>
                </Badge>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {item.code} - {item.caseName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        jobStatusColors[item.jobStatus] || ""
                      }`}
                    >
                      {jobStatusLabels[item.jobStatus] || item.jobStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{item.assigneeName}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {/* {item.note && (
                    <div className="mt-1.5 rounded border border-amber-200/50 bg-amber-50/60 p-1.5 text-xs text-amber-800 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-200 truncate max-w-md" dangerouslySetInnerHTML={{ __html: item.note }} />
                  )} */}
                </div>

                {item.doneLink && (
                  <a
                    href={item.doneLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors"
                    title="Xem kết quả"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
