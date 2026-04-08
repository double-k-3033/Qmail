"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletConnectProvider } from "@/Qubic/lib/wallet-connect/WalletConnectContext";
import { QubicConnectProvider } from "@/Qubic/lib/wallet-connect/QubicConnectContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <WalletConnectProvider>
        <QubicConnectProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </QubicConnectProvider>
      </WalletConnectProvider>
    </ThemeProvider>
  );
}
