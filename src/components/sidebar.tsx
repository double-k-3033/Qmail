"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMailStore, type Folder } from "@/lib/store";
import {
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const folders: { id: Folder; label: string; icon: typeof Inbox }[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "starred", label: "Starred", icon: Star },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "trash", label: "Trash", icon: Trash2 },
];

export function Sidebar() {
  const {
    selectedFolder,
    setSelectedFolder,
    setComposeOpen,
    emails,
    sidebarCollapsed,
  } = useMailStore();

  const getCount = (folder: Folder) => {
    if (folder === "starred") {
      return emails.filter((e) => e.starred && e.folder !== "trash").length;
    }
    if (folder === "inbox") {
      return emails.filter((e) => e.folder === "inbox" && !e.read).length;
    }
    return emails.filter((e) => e.folder === folder).length;
  };

  return (
    <aside
      className={cn(
        "flex flex-col gap-1 border-r bg-background transition-all duration-200 py-3",
        sidebarCollapsed ? "w-[68px] px-2" : "w-[256px] px-3"
      )}
    >
      {/* Compose Button */}
      <div className={cn("mb-3", sidebarCollapsed ? "px-0" : "px-1")}>
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={() => setComposeOpen(true)}
                size="icon"
                className="h-12 w-12 rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                <Pencil className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Compose</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            onClick={() => setComposeOpen(true)}
            className="h-14 w-full gap-3 rounded-2xl shadow-md hover:shadow-lg text-base font-medium transition-all justify-start px-6"
          >
            <Plus className="h-5 w-5" />
            Compose
          </Button>
        )}
      </div>

      {/* Folder List */}
      <nav className="flex flex-col gap-0.5">
        {folders.map((folder) => {
          const count = getCount(folder.id);
          const isActive = selectedFolder === folder.id;
          const Icon = folder.icon;

          if (sidebarCollapsed) {
            return (
              <Tooltip key={folder.id}>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "h-10 w-full rounded-full relative",
                      isActive &&
                        "bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {folder.id === "inbox" && count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {folder.label}
                  {count > 0 ? ` (${count})` : ""}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Button
              key={folder.id}
              variant="ghost"
              onClick={() => setSelectedFolder(folder.id)}
              className={cn(
                "h-9 justify-start gap-4 rounded-full px-4 font-normal",
                isActive &&
                  "bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1 text-left">{folder.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Storage indicator */}
      {!sidebarCollapsed && (
        <div className="mt-auto px-4 pb-2">
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/60 transition-all"
              style={{ width: "15%" }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            0.15 GB of 1 GB used
          </p>
        </div>
      )}
    </aside>
  );
}
