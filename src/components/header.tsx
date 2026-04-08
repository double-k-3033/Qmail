"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useMailStore } from "@/Qubic/lib/store";
import {
  Search,
  Menu,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ConnectLink from "@/Qubic/lib/wallet-connect/ConnectLink";
import { useQubicConnect } from "@/Qubic/lib/wallet-connect/QubicConnectContext";

export function Header() {
  const { theme, setTheme } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    sidebarCollapsed,
    setSidebarCollapsed,
    setMobileSidebarOpen,
  } = useMailStore();
  const { connected, wallet, disconnect } = useQubicConnect();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const walletAddress = wallet?.publicKey
    ? wallet.publicKey.slice(0, 6) + "..." + wallet.publicKey.slice(-4)
    : "";

  // Mobile: expanded search takes over the header
  if (mobileSearchOpen) {
    return (
      <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background/80 backdrop-blur-lg px-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => {
            setMobileSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search mail"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full bg-secondary/60 pl-10 pr-4 border-none focus-visible:bg-background focus-visible:ring-1 transition-all"
            autoFocus
          />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 md:h-16 items-center gap-1 md:gap-2 border-b bg-background/80 backdrop-blur-lg px-2 md:px-4">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setMobileSidebarOpen(true);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 px-1 md:px-2">
          <Image
            src="/logo.svg"
            alt="Qmail logo"
            width={60}
            height={60}
            className="shrink-0"
            priority
          />
          <span className="text-lg md:text-xl font-semibold tracking-tight hidden sm:inline">
            Qmail
          </span>
        </div>
      </div>

      {/* Center: Search (desktop/tablet only) */}
      <div className="hidden md:flex mx-auto w-full max-w-2xl items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search mail"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full bg-secondary/60 pl-10 pr-4 border-none focus-visible:bg-background focus-visible:ring-1 focus-visible:shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5 md:gap-1 ml-auto shrink-0">
        {/* Mobile search trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:hidden"
          onClick={() => setMobileSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hidden lg:inline-flex"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Support</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hidden lg:inline-flex"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </TooltipContent>
        </Tooltip>

        {/* Wallet Connect */}
        {connected ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                className="gap-1.5 md:gap-2 rounded-full h-9 pl-2 pr-2 md:pr-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  Q
                </div>
                <span className="text-sm font-medium hidden md:inline">
                  {walletAddress}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="gap-2 h-11 text-destructive"
                onClick={() => disconnect()}
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ConnectLink />
        )}

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  U
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col px-3 py-2">
              <span className="text-sm font-medium">Qubic User</span>
              <span className="text-xs text-muted-foreground">
                user@qmail.qu
              </span>
            </div>
            <DropdownMenuItem className="gap-2 h-11">
              <Settings className="h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 h-11 text-destructive">
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
