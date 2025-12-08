"use client";

import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  CheckCircle,
  PlayCircle,
  Save,
  X
} from "lucide-react";
import { memo, forwardRef, useImperativeHandle, useReducer, useState } from "react";
import type { VideoResponse, VideoAction, UserRole } from "@/types/videos";
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
  video: VideoResponse;
  userRole: UserRole;
  onEdit?: (video: VideoResponse) => void;
  onDelete: (id: number) => void;
  onVideoAction?: (videoId: number, action: VideoAction, qaNote?: string) => void;
  onSave: (videoId: number) => void;
  onCancel: (videoId: number) => void;
  pendingChangesRef: React.MutableRefObject<Record<number, any>>;
  getCurrentValue: (video: VideoResponse, field: keyof VideoResponse) => any;
}

const ActionCellComponent = forwardRef<
  { hasPendingChanges: (videoId: number) => boolean; forceUpdate: () => void },
  ActionCellProps
>(
  (
    {
      video,
      userRole,
      onEdit,
      onDelete,
      onVideoAction,
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
      hasPendingChanges: (videoId: number) => {
        return (
          pendingChangesRef.current[videoId] &&
          Object.keys(pendingChangesRef.current[videoId]).length > 0
        );
      },
      forceUpdate: forceUpdate,
    }));

    // Get available actions for a job based on role and job status
    const getAvailableActions = (video: VideoResponse): VideoAction[] => {
      const actions: VideoAction[] = [];

      if (userRole === "manager") {
        actions.push("edit", "delete");
        // Manager can complete job after QA review
        // QA can submit review for in-review jobs
        if (video.jobStatus === "DONE") {
          actions.push("complete-video");
        }
      } else if (userRole === "employee" || userRole === "special") {
        // Employee and special can take pending jobs
        if (video.jobStatus === "PENDING") {
          actions.push("take-video");
        }
        // Employee and special can mark in-progress jobs as done
        if (video.jobStatus === "IN_PROGRESS") {
          actions.push("done-video");
        }
      }

      return actions;
    };

    const hasPendingChanges =
      pendingChangesRef.current[video.id] &&
      Object.keys(pendingChangesRef.current[video.id]).length > 0;

    const availableActions = getAvailableActions(video);

    return (
      <>
        <div className="flex justify-center gap-2 flex-nowrap">
          {/* Show ONLY Save and Cancel buttons for Manager, Employee, Special if there are pending changes */}
          {(userRole === "manager" || userRole === "employee" || userRole === "special") && hasPendingChanges ? (
            <>
              <Button
                key="cancel"
                variant="outline"
                size="sm"
                onClick={() => onCancel(video.id)}
                className="border-orange-300 hover:bg-orange-100"
              >
                <X className="h-4 w-4 mr-1" />
              </Button>
              <Button
                key="save"
                variant="default"
                size="sm"
                onClick={() => onSave(video.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
              </Button>
            </>
          ) : (
            // Show normal actions when no pending changes
            availableActions.map((action) => {
            switch (action) {
              case "take-video":
                return (
                  <Button
                    key="take-video"
                    variant="default"
                    size="sm"
                    onClick={() => onVideoAction?.(video.id, "take-video")}
                    className="bg-blue-600 hover:bg-blue-700 text-center"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Nhận Việc
                  </Button>
                );

              case "done-video":
                return (
                  <Button
                    key="done-video"
                    variant="default"
                    size="sm"
                    onClick={async () => {
                      // Check if done link is filled
                      const currentDoneLink = getCurrentValue(
                        video,
                        "doneLink"
                      ) as string;
                      if (!currentDoneLink || currentDoneLink.trim() === "") {
                        toast.warning(
                          "Vui lòng dán Link Hoàn Thành trước khi hoàn tất công việc!"
                        );
                        return;
                      }
                      // If there are pending changes, save them first (for employee and special roles)
                      if (hasPendingChanges && (userRole === "employee" || userRole === "special")) {
                        await onSave(video.id);
                        // Wait a bit for the save to complete
                        await new Promise(resolve => setTimeout(resolve, 500));
                      }
                      onVideoAction?.(video.id, "done-video");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Hoàn Tất
                  </Button>
                );
              case "complete-video":
                return (
                  <Button
                    key="complete-video"
                    variant="default"
                    size="sm"
                    onClick={() => onVideoAction?.(video.id, "complete-video")}
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
                    onClick={() => onEdit?.(video)}
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
                    onClick={() => onDelete(video.id)}
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
              
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

ActionCellComponent.displayName = "ActionCell";

export const ActionCell = memo(ActionCellComponent);
