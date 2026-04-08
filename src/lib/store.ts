import { create } from "zustand";

export type Folder = "inbox" | "sent" | "drafts" | "starred" | "trash";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "archive" | "document" | "qu";
  size: string;
  quAmount?: number;
}

export interface Email {
  id: string;
  from: { name: string; address: string; avatar?: string };
  to: { name: string; address: string }[];
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: Folder;
  attachments: Attachment[];
  labels?: string[];
}

interface MailState {
  emails: Email[];
  selectedEmail: Email | null;
  selectedFolder: Folder;
  composeOpen: boolean;
  searchQuery: string;
  selectedIds: Set<string>;
  sidebarCollapsed: boolean;

  setSelectedEmail: (email: Email | null) => void;
  setSelectedFolder: (folder: Folder) => void;
  setComposeOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleStar: (id: string) => void;
  toggleRead: (id: string) => void;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  deleteSelected: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sendEmail: (email: Omit<Email, "id" | "date" | "read" | "starred" | "folder">) => void;
}

const mockEmails: Email[] = [
  {
    id: "1",
    from: { name: "Qubic Network", address: "team@qubic.org" },
    to: [{ name: "You", address: "user@qmail.qu" }],
    subject: "Welcome to Qmail - The Future of Decentralized Email",
    preview: "Your Qmail account is ready. Experience the power of Qubic-powered communication with end-to-end encryption...",
    body: `<p>Hello and welcome to <strong>Qmail</strong>!</p>
<p>Your decentralized email account is now active on the Qubic network. Here's what you can do:</p>
<ul>
<li><strong>Send & Receive Messages</strong> — Fully encrypted communication</li>
<li><strong>Attach Files</strong> — Images, documents, and archives</li>
<li><strong>Send QU Tokens</strong> — Attach native Qubic tokens directly to your emails</li>
</ul>
<p>Welcome to the future of communication.</p>
<p>— The Qubic Team</p>`,
    date: "2026-04-08T09:00:00Z",
    read: false,
    starred: true,
    folder: "inbox",
    attachments: [
      { id: "a1", name: "qubic-welcome.pdf", type: "document", size: "2.4 MB" },
    ],
    labels: ["important"],
  },
  {
    id: "2",
    from: { name: "Alice Chen", address: "alice@qmail.qu" },
    to: [{ name: "You", address: "user@qmail.qu" }],
    subject: "QU Transfer for the NFT marketplace project",
    preview: "Hey! Sending you 500 QU for the frontend work on the NFT marketplace. Let me know when you receive it...",
    body: `<p>Hey!</p>
<p>Sending you <strong>500 QU</strong> for the frontend work on the NFT marketplace project. Let me know when you receive it and we can discuss the next milestone.</p>
<p>Also, I've attached the updated design mockups. The client loved the 3D elements we proposed!</p>
<p>Cheers,<br/>Alice</p>`,
    date: "2026-04-08T08:30:00Z",
    read: false,
    starred: false,
    folder: "inbox",
    attachments: [
      { id: "a2", name: "nft-designs-v3.zip", type: "archive", size: "18.7 MB" },
      { id: "a3", name: "QU Transfer", type: "qu", size: "500 QU", quAmount: 500 },
    ],
  },
  {
    id: "3",
    from: { name: "Bob Martinez", address: "bob@qmail.qu" },
    to: [{ name: "You", address: "user@qmail.qu" }],
    subject: "Smart contract audit results",
    preview: "The audit is complete. No critical vulnerabilities found. Attached the full report for your review...",
    body: `<p>Hi,</p>
<p>The smart contract audit is complete. Great news — <strong>no critical vulnerabilities</strong> found. There are a few minor suggestions for gas optimization.</p>
<p>Full report is attached. Let me know if you want to schedule a call to go over the findings.</p>
<p>Best,<br/>Bob</p>`,
    date: "2026-04-07T16:45:00Z",
    read: true,
    starred: false,
    folder: "inbox",
    attachments: [
      { id: "a4", name: "audit-report.pdf", type: "document", size: "4.1 MB" },
      { id: "a5", name: "contract-screenshots.png", type: "image", size: "1.2 MB" },
    ],
  },
  {
    id: "4",
    from: { name: "Qubic Staking", address: "staking@qubic.org" },
    to: [{ name: "You", address: "user@qmail.qu" }],
    subject: "Your staking rewards are ready",
    preview: "Congratulations! Your epoch staking rewards of 1,250 QU are now available for claiming...",
    body: `<p>Congratulations!</p>
<p>Your epoch staking rewards of <strong>1,250 QU</strong> are now available for claiming. Your current staking position:</p>
<ul>
<li>Staked: 50,000 QU</li>
<li>APY: 12.5%</li>
<li>Rewards this epoch: 1,250 QU</li>
</ul>
<p>Claim your rewards through the Qubic wallet or reply to this email.</p>`,
    date: "2026-04-07T12:00:00Z",
    read: true,
    starred: true,
    folder: "inbox",
    attachments: [
      { id: "a6", name: "Staking Reward", type: "qu", size: "1,250 QU", quAmount: 1250 },
    ],
  },
  {
    id: "5",
    from: { name: "Carol Wang", address: "carol@qmail.qu" },
    to: [{ name: "You", address: "user@qmail.qu" }],
    subject: "Meeting notes from the DeFi integration call",
    preview: "Here are the meeting notes from today's call. Key decisions: we're going with the modular approach...",
    body: `<p>Hi team,</p>
<p>Here are the meeting notes from today's DeFi integration call:</p>
<ol>
<li><strong>Architecture:</strong> Going with modular approach</li>
<li><strong>Timeline:</strong> MVP by end of Q2</li>
<li><strong>Token integration:</strong> QU as the primary settlement layer</li>
<li><strong>Next steps:</strong> Carol to prepare the technical spec by Friday</li>
</ol>
<p>Let me know if I missed anything.</p>
<p>Carol</p>`,
    date: "2026-04-06T14:20:00Z",
    read: true,
    starred: false,
    folder: "inbox",
    attachments: [
      { id: "a7", name: "meeting-notes-apr6.docx", type: "document", size: "156 KB" },
    ],
  },
  {
    id: "6",
    from: { name: "You", address: "user@qmail.qu" },
    to: [{ name: "David Kim", address: "david@qmail.qu" }],
    subject: "Re: Partnership proposal",
    preview: "Thanks for the proposal, David. I've reviewed it and I think we can move forward with the integration...",
    body: `<p>Thanks for the proposal, David.</p>
<p>I've reviewed it and I think we can move forward with the integration. Sending you 100 QU as a good-faith deposit.</p>
<p>Let's schedule a call next week to iron out the details.</p>
<p>Best regards</p>`,
    date: "2026-04-06T10:00:00Z",
    read: true,
    starred: false,
    folder: "sent",
    attachments: [
      { id: "a8", name: "Good Faith Deposit", type: "qu", size: "100 QU", quAmount: 100 },
    ],
  },
  {
    id: "7",
    from: { name: "You", address: "user@qmail.qu" },
    to: [{ name: "Alice Chen", address: "alice@qmail.qu" }],
    subject: "Updated wireframes for the dashboard",
    preview: "Hey Alice, here are the updated wireframes incorporating your feedback on the token dashboard...",
    body: `<p>Hey Alice,</p>
<p>Here are the updated wireframes incorporating your feedback on the token dashboard. Key changes:</p>
<ul>
<li>Simplified the portfolio view</li>
<li>Added real-time QU price chart</li>
<li>New transaction history layout</li>
</ul>
<p>Let me know what you think!</p>`,
    date: "2026-04-05T18:30:00Z",
    read: true,
    starred: false,
    folder: "sent",
    attachments: [
      { id: "a9", name: "dashboard-wireframes-v2.png", type: "image", size: "3.8 MB" },
    ],
  },
  {
    id: "8",
    from: { name: "Security Alert", address: "security@qubic.org" },
    to: [{ name: "You", address: "user@qmail.qu" }],
    subject: "New login detected from a new device",
    preview: "We detected a new login to your account from Chrome on macOS. If this was you, no action is needed...",
    body: `<p><strong>Security Alert</strong></p>
<p>We detected a new login to your Qmail account:</p>
<ul>
<li><strong>Device:</strong> Chrome on macOS</li>
<li><strong>Location:</strong> San Francisco, CA</li>
<li><strong>Time:</strong> April 5, 2026 at 2:15 PM</li>
</ul>
<p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>`,
    date: "2026-04-05T14:15:00Z",
    read: true,
    starred: false,
    folder: "inbox",
    attachments: [],
  },
];

export const useMailStore = create<MailState>((set, get) => ({
  emails: mockEmails,
  selectedEmail: null,
  selectedFolder: "inbox",
  composeOpen: false,
  searchQuery: "",
  selectedIds: new Set<string>(),
  sidebarCollapsed: false,

  setSelectedEmail: (email) => {
    if (email) {
      set((state) => ({
        selectedEmail: email,
        emails: state.emails.map((e) =>
          e.id === email.id ? { ...e, read: true } : e
        ),
      }));
    } else {
      set({ selectedEmail: null });
    }
  },

  setSelectedFolder: (folder) =>
    set({ selectedFolder: folder, selectedEmail: null, selectedIds: new Set() }),

  setComposeOpen: (open) => set({ composeOpen: open }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleStar: (id) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === id ? { ...e, starred: !e.starred } : e
      ),
    })),

  toggleRead: (id) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === id ? { ...e, read: !e.read } : e
      ),
    })),

  toggleSelected: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return { selectedIds: newSet };
    }),

  selectAll: () => {
    const state = get();
    const folderEmails = state.emails.filter(
      (e) => e.folder === state.selectedFolder
    );
    set({ selectedIds: new Set(folderEmails.map((e) => e.id)) });
  },

  deselectAll: () => set({ selectedIds: new Set() }),

  deleteSelected: () =>
    set((state) => ({
      emails: state.emails.map((e) =>
        state.selectedIds.has(e.id) ? { ...e, folder: "trash" as Folder } : e
      ),
      selectedIds: new Set(),
      selectedEmail: null,
    })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  sendEmail: (email) =>
    set((state) => ({
      emails: [
        {
          ...email,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          read: true,
          starred: false,
          folder: "sent" as Folder,
        },
        ...state.emails,
      ],
      composeOpen: false,
    })),
}));
