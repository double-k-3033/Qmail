"use client";

import { cn } from "@/Qubic/utils/utils";
import { useMailStore, type Email } from "@/Qubic/lib/store";
import { formatDate } from "@/Qubic/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
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
        "group flex items-center gap-1 md:gap-1 border-b cursor-pointer transition-colors",
        "px-2 py-2 md:px-2 md:py-0.5",
        !email.read && "bg-card font-semibold",
        email.read && "bg-background",
        isSelected && "bg-primary/5",
        "hover:shadow-[inset_0_-1px_0_0] hover:shadow-border hover:z-10 hover:bg-accent/50",
        "active:bg-accent/70 md:active:bg-accent/50"
      )}
      onClick={() => setSelectedEmail(email)}
    >
      {/* Checkbox - larger touch target on mobile */}
      <div
        className="flex items-center p-1.5 md:px-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelected(email.id)}
          className="h-5 w-5 md:h-4 md:w-4"
        />
      </div>

      {/* Star */}
      <button
        className="flex items-center p-1.5 md:px-1"
        onClick={(e) => {
          e.stopPropagation();
          toggleStar(email.id);
        }}
      >
        <Star
          className={cn(
            "h-5 w-5 md:h-4 md:w-4 transition-colors",
            email.starred
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/40 hover:text-yellow-400"
          )}
        />
      </button>

      {/* Mobile layout: stacked sender + subject */}
      <div className="flex md:hidden flex-1 min-w-0 flex-col gap-0.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{email.from.name}</span>
          <span
            className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0"
            suppressHydrationWarning
          >
            {formatDate(email.date)}
          </span>
        </div>
        <span
          className={cn(
            "truncate text-sm",
            !email.read ? "text-foreground" : "text-foreground/80"
          )}
        >
          {email.subject}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs text-muted-foreground flex-1">
            {email.preview}
          </span>
          {hasQuAttachment && (
            <div className="flex h-4 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 shrink-0">
              <Coins className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-bold text-primary">QU</span>
            </div>
          )}
          {hasFileAttachment && (
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          )}
        </div>
      </div>

      {/* Desktop layout: horizontal row */}
      {/* Sender */}
      <div className="hidden md:block w-[180px] lg:w-[200px] shrink-0 truncate px-2 text-sm">
        {email.from.name}
      </div>

      {/* Subject + Preview */}
      <div className="hidden md:flex min-w-0 flex-1 items-center gap-2 px-1">
        <span
          className={cn(
            "truncate text-sm",
            !email.read ? "text-foreground" : "text-foreground/80"
          )}
        >
          {email.subject}
        </span>
        <span className="hidden lg:inline truncate text-sm text-muted-foreground">
          — {email.preview}
        </span>
      </div>

      {/* Attachment indicators (desktop) */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {hasQuAttachment && (
          <Tooltip>
            <TooltipTrigger
              className={cn(
                "inline-flex h-5 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 font-sans shadow-none ring-0 outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <Coins className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-primary">QU</span>
            </TooltipTrigger>
            <TooltipContent>Contains QU token transfer</TooltipContent>
          </Tooltip>
        )}
        {hasFileAttachment && (
          <Paperclip className="h-4 w-4 text-muted-foreground/60" />
        )}
      </div>

      {/* Quick actions (desktop hover only) */}
      <div className="hidden shrink-0 items-center gap-0.5 md:group-hover:flex">
        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-7 w-7"
            )}
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
          </TooltipTrigger>
          <TooltipContent>
            {email.read ? "Mark as unread" : "Mark as read"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-7 w-7"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Archive className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent>Archive</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-7 w-7"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>

      {/* Date (desktop, hidden on hover when actions show) */}
      <div
        className="hidden md:block shrink-0 px-2 text-xs text-muted-foreground md:group-hover:hidden whitespace-nowrap"
        suppressHydrationWarning
      >
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
    <div className="flex flex-1 flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex h-10 md:h-10 items-center gap-1 border-b px-2 shrink-0">
        <div
          className="flex items-center p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => {
              if (allSelected) deselectAll();
              else selectAll();
            }}
            className="h-5 w-5 md:h-4 md:w-4"
          />
        </div>

        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9 md:h-8 md:w-8"
            )}
          >
            <RefreshCw className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9 md:h-8 md:w-8"
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>More</TooltipContent>
        </Tooltip>

        {selectedIds.size > 0 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-8 md:w-8"
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
          <span className="hidden sm:inline">
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
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20 px-4">
            <Mail className="h-12 w-12 md:h-16 md:w-16 mb-4 opacity-20" />
            <p className="page-title text-base md:text-lg font-medium">No messages</p>
            <p className="text-sm text-center">
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
