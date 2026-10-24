"use client";

import { JobApplication, Column } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  deleteJobApplication,
  updateJobApplication,
} from "@/lib/actions/job-applications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import React, { useState } from "react";
interface JobApplicationCardProps {
  job: JobApplication;
  columns: Column[];
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export default function JobApplicationCard({
  job,
  columns,
  dragHandleProps,
}: JobApplicationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const getFormData = () => ({
    company: job.company,
    position: job.position,
    location: job.location || "",
    notes: job.notes || "",
    salary: job.salary || "",
    jobUrl: job.jobUrl || "",
    columnId: job.columnId || "",
    tags: job.tags?.join(", ") || "",
    description: job.description || "",
  });
  const [formData, setFormData] = useState(getFormData);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await updateJobApplication(job.id, {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      });

      if (!result.error) {
        setIsEditing(false);
      } else {
        setError(result.error || "Failed to update job application");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const result = await deleteJobApplication(job.id);

      if (result.error) {
        setDeleteError(result.error);
      } else {
        setIsDeleteConfirmOpen(false);
      }
    } catch {
      setDeleteError("Could not delete this application. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleMove(newColumnId: string) {
    try {
      const result = await updateJobApplication(job.id, {
        columnId: newColumnId,
      });
      if (result.error) setActionError(result.error);
    } catch {
      setActionError("Could not move this application. Please try again.");
    }
  }
  return (
    <>
      <Card
        className="group cursor-pointer shadow-sm transition-shadow hover:shadow-lg"
        {...dragHandleProps}
      >
        <CardContent className="p-4">
          {actionError && (
            <p role="alert" className="mb-3 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {actionError}
            </p>
          )}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="mb-1 break-words text-sm font-semibold">{job.position}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {job.company}
              </p>
              {job.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {job.description}
                </p>
              )}
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open job listing for ${job.position} at ${job.company}`}
                  className="mt-1 inline-flex min-h-9 items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View listing</span>
                </a>
              )}
              {job.notes && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotes(!showNotes);
                  }}
                  type="button"
                  aria-expanded={showNotes}
                  aria-controls={`job-notes-${job.id}`}
                  className="mt-1 inline-flex min-h-9 items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showNotes ? "Hide Notes" : "Show Notes"}
                </button>
              )}
            </div>
            <div className="flex items-start gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      aria-label={`Actions for ${job.position} at ${job.company}`}
                    >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {columns.length > 1 && (
                    <>
                      {columns
                        .filter((c) => c.id !== job.columnId)
                        .map((column) => (
                          <DropdownMenuItem
                            key={column.id}
                            onClick={() => handleMove(column.id)}
                          >
                            Move to {column.name}
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
        {showNotes && job.notes && (
          <div className="px-4 pb-4 pt-0">
            <div
              id={`job-notes-${job.id}`}
              className="mt-2 break-words whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs text-muted-foreground"
            >
              {job.notes}
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          if (open) {
            setFormData(getFormData());
            setError("");
          }
          setIsEditing(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Application</DialogTitle>
            <DialogDescription>Update job application details</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdate}>
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    required
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    placeholder="e.g., $100k - $150k"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobUrl">Job URL</Label>
                <Input
                  id="jobUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.jobUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, jobUrl: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="React, Tailwind, High Pay"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Brief description of the role..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setIsDeleteConfirmOpen(false);
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete application?</DialogTitle>
            <DialogDescription>
              This will permanently remove {job.position} at {job.company} from
              your board.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setDeleteError("");
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
