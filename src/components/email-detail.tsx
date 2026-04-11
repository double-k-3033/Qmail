"use client";

import { useMailStore } from "@/Qubic/lib/store";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/Qubic/utils/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Star,
  Reply,
  ReplyAll,
  Forward,
  MoreVertical,
  Trash2,
  Archive,
  Printer,
  FileText,
  Image as ImageIcon,
  FileArchive,
  Download,
  Coins,
} from "lucide-react";

function AttachmentCard({
  attachment,
}: {
  attachment: { id: string; name: string; type: string; size: string; quAmount?: number };
}) {
  const iconMap: Record<string, typeof FileText> = {
    image: ImageIcon,
    document: FileText,
    archive: FileArchive,
    qu: Coins,
  };
  const Icon = iconMap[attachment.type] ?? FileText;

  const bgMap: Record<string, string> = {
    image: "bg-accent-secondary/10 text-accent-secondary",
    document: "bg-warm-primary/10 text-warm-strong",
    archive: "bg-accent-muted/15 text-accent-deep",
    qu: "bg-primary/10 text-primary",
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/50 active:bg-accent/70 cursor-pointer">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          bgMap[attachment.type] || "bg-muted"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">{attachment.size}</p>
      </div>
      {attachment.type === "qu" ? (
        <Button size="sm" variant="outline" className="gap-1.5 rounded-full h-9 text-xs shrink-0">
          <Coins className="h-3.5 w-3.5" />
          Claim
        </Button>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function EmailDetail() {
  const { selectedEmail, setSelectedEmail, toggleStar } = useMailStore();

  if (!selectedEmail) return null;

  const initials = selectedEmail.from.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top toolbar */}
      <div className="flex h-12 md:h-10 items-center gap-0.5 md:gap-1 border-b px-2 shrink-0">
        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-10 w-10 md:h-8 md:w-8"
            )}
            onClick={() => setSelectedEmail(null)}
          >
            <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
          </TooltipTrigger>
          <TooltipContent>Back to inbox</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-10 w-10 md:h-8 md:w-8"
            )}
          >
            <Archive className="h-5 w-5 md:h-4 md:w-4" />
          </TooltipTrigger>
          <TooltipContent>Archive</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-10 w-10 md:h-8 md:w-8"
            )}
          >
            <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-10 w-10 md:h-8 md:w-8 hidden sm:inline-flex"
            )}
          >
            <Printer className="h-5 w-5 md:h-4 md:w-4" />
          </TooltipTrigger>
          <TooltipContent>Print</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-10 w-10 md:h-8 md:w-8"
            )}
          >
            <MoreVertical className="h-5 w-5 md:h-4 md:w-4" />
          </TooltipTrigger>
          <TooltipContent>More</TooltipContent>
        </Tooltip>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-4 md:px-6 py-4 md:py-6">
          {/* Subject */}
          <div className="flex items-start gap-2 md:gap-3 mb-4 md:mb-6">
            <h1 className="page-title text-lg md:text-xl font-normal flex-1 leading-snug">
              {selectedEmail.subject}
            </h1>
            <button
              className="p-1 shrink-0"
              onClick={() => toggleStar(selectedEmail.id)}
            >
              <Star
                className={
                  selectedEmail.starred
                    ? "h-5 w-5 fill-yellow-400 text-yellow-400"
                    : "h-5 w-5 text-muted-foreground/40 hover:text-yellow-400"
                }
              />
            </button>
          </div>

          {/* Labels */}
          {selectedEmail.labels && selectedEmail.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedEmail.labels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="rounded-md text-xs font-normal capitalize"
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}

          {/* Sender info */}
          <div className="flex items-start gap-3 mb-4 md:mb-6">
            <Avatar className="h-9 w-9 md:h-10 md:w-10 mt-0.5 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-semibold text-sm">
                  {selectedEmail.from.name}
                </span>
                <span className="text-[11px] md:text-xs text-muted-foreground truncate">
                  &lt;{selectedEmail.from.address}&gt;
                </span>
              </div>
              <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
                to{" "}
                {selectedEmail.to.map((t) => t.name || t.address).join(", ")}
              </div>
              {/* Date on mobile shown below sender */}
              <div className="text-[11px] text-muted-foreground mt-1 md:hidden">
                {new Date(selectedEmail.date).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
            {/* Date on desktop shown on the right */}
            <div className="hidden md:block text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {new Date(selectedEmail.date).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>

          {/* Body */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none mb-6 md:mb-8 text-[13px] md:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
          />

          {/* Attachments */}
          {selectedEmail.attachments.length > 0 && (
            <>
              <Separator className="my-4 md:my-6" />
              <div>
                <h3 className="text-sm font-medium mb-3">
                  {selectedEmail.attachments.length} Attachment
                  {selectedEmail.attachments.length !== 1 && "s"}
                </h3>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {selectedEmail.attachments.map((att) => (
                    <AttachmentCard key={att.id} attachment={att} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reply area */}
          <Separator className="my-4 md:my-6" />
          <div className="flex flex-wrap gap-2 pb-4">
            <Button variant="outline" className="gap-2 rounded-full h-10 md:h-9 text-sm">
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button variant="outline" className="gap-2 rounded-full h-10 md:h-9 text-sm hidden sm:inline-flex">
              <ReplyAll className="h-4 w-4" />
              Reply All
            </Button>
            <Button variant="outline" className="gap-2 rounded-full h-10 md:h-9 text-sm">
              <Forward className="h-4 w-4" />
              Forward
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
