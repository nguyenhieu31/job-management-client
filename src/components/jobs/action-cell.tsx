"use client";

import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  CheckCircle,
  PlayCircle,
  Eye,
  Send,
  Save,
  X,
  XCircle,
} from "lucide-react";
import { memo, forwardRef, useImperativeHandle, useReducer, useState } from "react";
import type { JobResponse, JobAction, UserRole } from "@/types/jobs";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ActionCellProps {
  job: JobResponse;
  userRole: UserRole;
  onEdit: (job: JobResponse) => void;
  onDelete: (id: number) => void;
  onJobAction: (jobId: number, action: JobAction, qaNote?: string) => void;
  onSave: (jobId: number) => void;
  onCancel: (jobId: number) => void;
  pendingChangesRef: React.MutableRefObject<Record<number, any>>;
  getCurrentValue: (job: JobResponse, field: keyof JobResponse) => any;
}

const ActionCellComponent = forwardRef<
  { hasPendingChanges: (jobId: number) => boolean; forceUpdate: () => void },
  ActionCellProps
>(
  (
    {
      job,
      userRole,
      onEdit,
      onDelete,
      onJobAction,
      onSave,
      onCancel,
      pendingChangesRef,
      getCurrentValue,
    },
    ref
  ) => {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");

    // Expose hasPendingChanges and forceUpdate to parent
    useImperativeHandle(ref, () => ({
      hasPendingChanges: (jobId: number) => {
        return (
          pendingChangesRef.current[jobId] &&
          Object.keys(pendingChangesRef.current[jobId]).length > 0
        );
      },
      forceUpdate: forceUpdate,
    }));

    // Get available actions for a job based on role and job status
    const getAvailableActions = (job: JobResponse): JobAction[] => {
      const actions: JobAction[] = [];

      if (userRole === "manager") {
        actions.push("edit", "delete");
        // Manager can complete job after QA review
        if (job.jobStatus === "REVIEWED") {
          actions.push("complete-job");
        }
      } else if (userRole === "employee") {
        // Employee can take pending jobs
        if (job.jobStatus === "PENDING") {
          actions.push("take-job");
        }
        // Employee can mark in-progress jobs as done
        if (job.jobStatus === "IN_PROGRESS") {
          actions.push("done-job");
        }
      } else if (userRole === "qa") {
        // QA always sees take-review action (will be disabled if not DONE)
        // Show take-review for jobs that are not yet reviewed or completed
        if (
          job.jobStatus !== "IN_REVIEW" &&
          job.jobStatus !== "REVIEWED" &&
          job.jobStatus !== "COMPLETED"
        ) {
          actions.push("take-review");
        }
        // QA can submit review for in-review jobs
        if (job.jobStatus === "IN_REVIEW") {
          actions.push("submit-review");
          actions.push("rejected");
        }
      }

      return actions;
    };

    const hasPendingChanges =
      pendingChangesRef.current[job.id] &&
      Object.keys(pendingChangesRef.current[job.id]).length > 0;

    const availableActions = getAvailableActions(job);

    return (
      <>
        <div className="flex justify-center gap-2 flex-nowrap">
          {/* Show ONLY Save and Cancel buttons for Manager if there are pending changes */}
          {(userRole === "manager" || userRole === "employee") && hasPendingChanges ? (
            <>
              <Button
                key="cancel"
                variant="outline"
                size="sm"
                onClick={() => onCancel(job.id)}
                className="border-orange-300 hover:bg-orange-100"
              >
                <X className="h-4 w-4 mr-1" />
              </Button>
              <Button
                key="save"
                variant="default"
                size="sm"
                onClick={() => onSave(job.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
              </Button>
            </>
          ) : (
            // Show normal actions when no pending changes
            availableActions.map((action) => {
            switch (action) {
              case "take-job":
                return (
                  <Button
                    key="take-job"
                    variant="default"
                    size="sm"
                    onClick={() => onJobAction(job.id, "take-job")}
                    className="bg-blue-600 hover:bg-blue-700 text-center"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Nhận Việc
                  </Button>
                );

              case "done-job":
                return (
                  <Button
                    key="done-job"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      // Check if done link is filled
                      const currentDoneLink = getCurrentValue(
                        job,
                        "doneLink"
                      ) as string;
                      if (!currentDoneLink || currentDoneLink.trim() === "") {
                        toast.warning(
                          "Vui lòng dán Link Hoàn Thành trước khi hoàn tất công việc!"
                        );
                        return;
                      }
                      // If there are pending changes, save them first
                      if (hasPendingChanges) {
                        onSave(job.id);
                      }
                      onJobAction(job.id, "done-job");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Hoàn Tất
                  </Button>
                );

              case "take-review":
                // Check if job is actually in DONE status (QA can only review DONE jobs)
                const canReview = job.jobStatus === "DONE";

                if (!canReview) {
                  // Show disabled button for jobs not ready for review
                  return (
                    <Button
                      key="take-review-disabled"
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-center border-gray-300 text-gray-400 cursor-not-allowed"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Chưa Hoàn Thành
                    </Button>
                  );
                }

                return (
                  <Button
                    key="take-review"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      // Double check before allowing review
                      if (job.jobStatus !== "DONE") {
                        toast.warning(
                          "Công việc này chưa hoàn thành. Vui lòng đợi nhân viên hoàn tất công việc!"
                        );
                        return;
                      }
                      onJobAction(job.id, "take-review");
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Nhận Review
                  </Button>
                );

              case "submit-review":
                return (
                  <Button
                    key="submit-review"
                    variant="default"
                    size="sm"
                    onClick={() => onJobAction(job.id, "submit-review")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-center"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Gửi Review
                  </Button>
                );

              case "rejected":
                return (
                  <Button
                    key="rejected"
                    variant="default"
                    size="sm"
                    onClick={() => setRejectDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-center"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Từ Chối
                  </Button>
                );

              case "complete-job":
                return (
                  <Button
                    key="complete-job"
                    variant="default"
                    size="sm"
                    onClick={() => onJobAction(job.id, "complete-job")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Hoàn Thành
                  </Button>
                );

              case "edit":
                return (
                  <Button
                    key="edit"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(job)}
                    aria-label="Edit job"
                    className="text-center"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                );

              case "delete":
                return (
                  <Button
                    key="delete"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(job.id)}
                    aria-label="Delete job"
                    className="text-center"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                );

              default:
                return null;
            }
          })
        )}
        </div>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Từ Chối Công Việc</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Nhập lý do từ chối (bắt buộc)..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectNote("");
                }}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!rejectNote.trim()) {
                    toast.warning("Vui lòng nhập lý do từ chối");
                    return;
                  }
                  // Pass rejectNote with the action
                  onJobAction(job.id, "rejected", rejectNote);
                  setRejectDialogOpen(false);
                  setRejectNote("");
                }}
              >
                Từ Chối
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

ActionCellComponent.displayName = "ActionCell";

export const ActionCell = memo(ActionCellComponent);
