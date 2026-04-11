"use client";

import { cn } from "@/Qubic/utils/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMailStore, type Folder } from "@/Qubic/lib/store";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
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

function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
  const {
    selectedFolder,
    setSelectedFolder,
    setComposeOpen,
    emails,
    sidebarCollapsed,
    setMobileSidebarOpen,
  } = useMailStore();

  const collapsed = !isMobile && sidebarCollapsed;

  const getCount = (folder: Folder) => {
    if (folder === "starred") {
      return emails.filter((e) => e.starred && e.folder !== "trash").length;
    }
    if (folder === "inbox") {
      return emails.filter((e) => e.folder === "inbox" && !e.read).length;
    }
    return emails.filter((e) => e.folder === folder).length;
  };

  const handleCompose = () => {
    setComposeOpen(true);
    if (isMobile) setMobileSidebarOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 py-3 h-full",
        collapsed ? "px-2" : "px-3"
      )}
    >
      {/* Compose Button */}
      <div className={cn("mb-3", collapsed ? "px-0" : "px-1")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              onClick={handleCompose}
              className={cn(
                buttonVariants({ variant: "default", size: "icon" }),
                "h-12 w-12 rounded-2xl shadow-md hover:shadow-lg transition-all"
              )}
            >
              <Pencil className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent side="right">Compose</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            onClick={handleCompose}
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

          if (collapsed) {
            return (
              <Tooltip key={folder.id}>
                <TooltipTrigger
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
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
                "h-11 sm:h-9 justify-start gap-4 rounded-full px-4 font-normal",
                isActive &&
                  "bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
              )}
            >
              <Icon className="h-5 w-5 sm:h-4.5 sm:w-4.5 shrink-0" />
              <span className="flex-1 text-left text-[15px] sm:text-sm">
                {folder.label}
              </span>
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
      {!collapsed && (
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
    </div>
  );
}

/** Desktop sidebar - hidden on mobile */
export function DesktopSidebar() {
  const { sidebarCollapsed } = useMailStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background transition-all duration-200",
        sidebarCollapsed ? "w-[68px]" : "w-[256px] lg:w-[280px]"
      )}
    >
      <SidebarContent />
    </aside>
  );
}

/** Mobile sidebar - sheet overlay, only on mobile/tablet */
export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useMailStore();

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent isMobile />
      </SheetContent>
    </Sheet>
  );
}
