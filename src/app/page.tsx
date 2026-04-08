"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Sidebar } from "@/components/sidebar";
import { EmailList } from "@/components/email-list";
import { EmailDetail } from "@/components/email-detail";
import { ComposeModal } from "@/components/compose-modal";
import { useMailStore } from "@/lib/store";

const QubicScene = dynamic(
  () => import("@/components/qubic-scene").then((mod) => mod.QubicScene),
  { ssr: false }
);

export default function Home() {
  const { selectedEmail, sidebarCollapsed } = useMailStore();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <Header />

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content area */}
        <main className="flex flex-1 overflow-hidden">
          {selectedEmail ? (
            <EmailDetail />
          ) : (
            <>
              <EmailList />
              {/* 3D Scene - shown when sidebar is expanded and no email is selected */}
              {!sidebarCollapsed && (
                <div className="hidden xl:flex w-[320px] shrink-0 border-l items-center justify-center bg-gradient-to-b from-background to-accent/20">
                  <div className="h-[280px] w-[280px]">
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

      {/* Compose Modal */}
      <ComposeModal />
    </div>
  );
}
