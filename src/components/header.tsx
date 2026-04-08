"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useMailStore } from "@/lib/store";
import {
  Search,
  Menu,
  Sun,
  Moon,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { searchQuery, setSearchQuery, sidebarCollapsed, setSidebarCollapsed } =
    useMailStore();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress] = useState("QJKL...X8M9");

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b bg-background/80 backdrop-blur-lg px-4">
      {/* Left: Logo + Menu */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Main menu</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">Q</span>
          </div>
          <span className="text-xl font-semibold tracking-tight hidden sm:inline">
            Qmail
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="mx-auto flex w-full max-w-2xl items-center">
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
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
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
              className="hidden sm:inline-flex"
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
        {walletConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                className="gap-2 rounded-full h-9 pl-2 pr-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium hidden md:inline">
                  {walletAddress}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <Wallet className="h-4 w-4" />
                <span>12,450 QU</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-destructive"
                onClick={() => setWalletConnected(false)}
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => setWalletConnected(true)}
            className="gap-2 rounded-full h-9"
            size="sm"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
          </Button>
        )}

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 ml-1"
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
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
