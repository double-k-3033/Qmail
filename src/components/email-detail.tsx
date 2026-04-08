"use client";

import { useMailStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
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
    image: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    document: "bg-red-500/10 text-red-600 dark:text-red-400",
    archive: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    qu: "bg-primary/10 text-primary",
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/50 cursor-pointer">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
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
        <Button size="sm" variant="outline" className="gap-1.5 rounded-full h-8 text-xs">
          <Coins className="h-3.5 w-3.5" />
          Claim
        </Button>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="flex h-10 items-center gap-1 border-b px-2 shrink-0">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedEmail(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to inbox</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Archive className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Archive</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Printer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>More</TooltipContent>
        </Tooltip>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          {/* Subject */}
          <div className="flex items-start gap-3 mb-6">
            <h1 className="text-xl font-normal flex-1">{selectedEmail.subject}</h1>
            <button onClick={() => toggleStar(selectedEmail.id)}>
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
            <div className="flex gap-2 mb-4">
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
          <div className="flex items-start gap-3 mb-6">
            <Avatar className="h-10 w-10 mt-0.5">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">
                  {selectedEmail.from.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  &lt;{selectedEmail.from.address}&gt;
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                to{" "}
                {selectedEmail.to.map((t) => t.name || t.address).join(", ")}
              </div>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
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
            className="prose prose-sm dark:prose-invert max-w-none mb-8 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
          />

          {/* Attachments */}
          {selectedEmail.attachments.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium mb-3">
                  {selectedEmail.attachments.length} Attachment
                  {selectedEmail.attachments.length !== 1 && "s"}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedEmail.attachments.map((att) => (
                    <AttachmentCard key={att.id} attachment={att} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reply area */}
          <Separator className="my-6" />
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-full">
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button variant="outline" className="gap-2 rounded-full">
              <ReplyAll className="h-4 w-4" />
              Reply All
            </Button>
            <Button variant="outline" className="gap-2 rounded-full">
              <Forward className="h-4 w-4" />
              Forward
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
