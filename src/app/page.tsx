"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DesktopSidebar, MobileSidebar } from "@/components/sidebar";
import { EmailList } from "@/components/email-list";
import { EmailDetail } from "@/components/email-detail";
import { ComposeModal } from "@/components/compose-modal";
import { useMailStore } from "@/Qubic/lib/store";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const QubicScene = dynamic(
  () => import("@/components/qubic-scene").then((mod) => mod.QubicScene),
  { ssr: false }
);

export default function Home() {
  const { selectedEmail, sidebarCollapsed, setComposeOpen, composeOpen } = useMailStore();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <Header />

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar (hidden on mobile) */}
        <DesktopSidebar />

        {/* Mobile sidebar sheet overlay */}
        <MobileSidebar />

        {/* Content area */}
        <main className="flex flex-1 overflow-hidden min-w-0">
          {selectedEmail ? (
            <EmailDetail />
          ) : (
            <>
              <EmailList />
              {/* 3D Scene - shown on wide screens when no email selected */}
              {!sidebarCollapsed && (
                <div className="hidden xl:flex w-[280px] 2xl:w-[320px] shrink-0 border-l items-center justify-center bg-gradient-to-b from-background to-accent/20">
                  <div className="h-[240px] w-[240px] 2xl:h-[280px] 2xl:w-[280px]">
                    <QubicScene />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile FAB for compose */}
      {!selectedEmail && !composeOpen && (
        <Button
          onClick={() => setComposeOpen(true)}
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-2xl shadow-lg md:hidden"
          size="icon"
        >
          <Pencil className="h-6 w-6" />
        </Button>
      )}

      {/* Compose Modal */}
      <ComposeModal />
    </div>
  );
}
