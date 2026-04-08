"use client";

import { cn } from "@/lib/utils";
import { useMailStore, type Email } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Star,
  Paperclip,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Coins,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

function EmailRow({ email }: { email: Email }) {
  const { setSelectedEmail, toggleStar, toggleSelected, toggleRead, selectedIds } =
    useMailStore();
  const isSelected = selectedIds.has(email.id);
  const hasQuAttachment = email.attachments.some((a) => a.type === "qu");
  const hasFileAttachment = email.attachments.some((a) => a.type !== "qu");

  return (
    <div
      className={cn(
        "group flex items-center gap-1 border-b px-2 py-0.5 cursor-pointer transition-colors",
        !email.read && "bg-card font-semibold",
        email.read && "bg-background",
        isSelected && "bg-primary/5",
        "hover:shadow-[inset_0_-1px_0_0] hover:shadow-border hover:z-10 hover:bg-accent/50"
      )}
      onClick={() => setSelectedEmail(email)}
    >
      {/* Checkbox */}
      <div
        className="flex items-center px-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelected(email.id)}
          className="h-4 w-4"
        />
      </div>

      {/* Star */}
      <button
        className="flex items-center px-1"
        onClick={(e) => {
          e.stopPropagation();
          toggleStar(email.id);
        }}
      >
        <Star
          className={cn(
            "h-4 w-4 transition-colors",
            email.starred
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/40 hover:text-yellow-400"
          )}
        />
      </button>

      {/* Sender */}
      <div className="w-[180px] shrink-0 truncate px-2 text-sm">
        {email.from.name}
      </div>

      {/* Subject + Preview */}
      <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
        <span
          className={cn(
            "truncate text-sm",
            !email.read ? "text-foreground" : "text-foreground/80"
          )}
        >
          {email.subject}
        </span>
        <span className="hidden truncate text-sm text-muted-foreground sm:inline">
          — {email.preview}
        </span>
      </div>

      {/* Attachment indicators */}
      <div className="flex items-center gap-1 shrink-0">
        {hasQuAttachment && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex h-5 items-center gap-0.5 rounded-full bg-primary/10 px-1.5">
                <Coins className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary">QU</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Contains QU token transfer</TooltipContent>
          </Tooltip>
        )}
        {hasFileAttachment && (
          <Paperclip className="h-4 w-4 text-muted-foreground/60" />
        )}
      </div>

      {/* Quick actions (visible on hover) */}
      <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                toggleRead(email.id);
              }}
            >
              {email.read ? (
                <Mail className="h-3.5 w-3.5" />
              ) : (
                <MailOpen className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {email.read ? "Mark as unread" : "Mark as read"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Archive</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>

      {/* Date (hidden on hover, replaced by actions) */}
      <div className="shrink-0 px-2 text-xs text-muted-foreground group-hover:hidden whitespace-nowrap">
        {formatDate(email.date)}
      </div>
    </div>
  );
}

export function EmailList() {
  const {
    emails,
    selectedFolder,
    searchQuery,
    selectedIds,
    selectAll,
    deselectAll,
    deleteSelected,
  } = useMailStore();

  const filteredEmails = emails.filter((e) => {
    const inFolder =
      selectedFolder === "starred"
        ? e.starred && e.folder !== "trash"
        : e.folder === selectedFolder;

    if (!inFolder) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.subject.toLowerCase().includes(q) ||
        e.from.name.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const allSelected =
    filteredEmails.length > 0 &&
    filteredEmails.every((e) => selectedIds.has(e.id));

  return (
    <div className="flex flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex h-10 items-center gap-1 border-b px-2">
        <div
          className="flex items-center px-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => {
              if (allSelected) deselectAll();
              else selectAll();
            }}
            className="h-4 w-4"
          />
        </div>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>More</TooltipContent>
        </Tooltip>

        {selectedIds.size > 0 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={deleteSelected}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} selected
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <span>
            1–{filteredEmails.length} of {filteredEmails.length}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email rows */}
      <div className="flex-1 overflow-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
            <Mail className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No messages</p>
            <p className="text-sm">
              {searchQuery
                ? "No messages match your search"
                : `Your ${selectedFolder} is empty`}
            </p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <EmailRow key={email.id} email={email} />
          ))
        )}
      </div>
    </div>
  );
}
