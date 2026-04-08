"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMailStore, type Attachment } from "@/Qubic/lib/store";
import { useQubicConnect } from "@/Qubic/lib/wallet-connect/QubicConnectContext";
import { fetchBalance } from "@/Qubic/services/rpc.services";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileArchive,
  Coins,
  Send,
  X,
  Trash2,
  Minus,
  Maximize2,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  ArrowLeft,
  ChevronDown,
  type LucideProps,
} from "lucide-react";

// ─── utility ──────────────────────────────────────────────────────────────────

function cx(...args: (string | boolean | null | undefined)[]): string {
  return args.filter(Boolean).join(" ");
}

// ─── types ────────────────────────────────────────────────────────────────────

type FileTypeKey = "image" | "document" | "archive" | "qu";

interface RecipientChip {
  id: string;
  address: string;
}

type LucideIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

// ─── constants ────────────────────────────────────────────────────────────────

const FILE_TYPE_ICONS: Record<FileTypeKey, LucideIcon> = {
  image: ImageIcon,
  document: FileText,
  archive: FileArchive,
  qu: Coins,
};

// Attachment chip colors use literal Tailwind classes so the JIT scanner picks
// them up. They intentionally keep their own palette since they convey file-type
// semantics that are independent of the light/dark surface.
const FILE_TYPE_STYLES: Record<FileTypeKey, string> = {
  image:
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 hover:border-sky-500/40",
  document:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40",
  archive:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40",
  qu: "bg-primary/10 text-primary border-primary/20 hover:border-primary/40",
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseAddress(raw: string): string {
  return raw.trim().replace(/^.*<(.+)>$/, "$1");
}

function isValidAddress(addr: string): boolean {
  return addr.length > 0 && addr.includes("@");
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ToolbarDivider() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

interface ToolbarBtnProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  accent?: boolean;
  className?: string;
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
  accent,
  className = "",
}: ToolbarBtnProps) {
  const btnClass = cx(
    "flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-100 outline-none",
    "focus-visible:ring-1 focus-visible:ring-ring/50",
    active
      ? "bg-accent text-accent-foreground"
      : danger
        ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        : accent
          ? "text-primary hover:text-primary/80 hover:bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
    className
  );
  return (
    <Tooltip>
      <TooltipTrigger aria-label={label} onClick={onClick} className={btnClass}>
        <Icon className="w-3.5 h-3.5" aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

interface AttachmentChipProps {
  att: Attachment;
  onRemove: (id: string) => void;
}

function AttachmentChip({ att, onRemove }: AttachmentChipProps) {
  const type = (att.type in FILE_TYPE_ICONS
    ? att.type
    : "document") as FileTypeKey;
  const Icon = FILE_TYPE_ICONS[type];
  const style = FILE_TYPE_STYLES[type];
  return (
    <div
      className={cx(
        "group flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
        "transition-colors duration-100",
        style
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span className="max-w-[120px] truncate">{att.name}</span>
      <span className="opacity-50 text-[10px] hidden sm:inline">{att.size}</span>
      <button
        type="button"
        aria-label={`Remove ${att.name}`}
        onClick={() => onRemove(att.id)}
        className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100 focus:opacity-100 rounded"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── recipient chips input ────────────────────────────────────────────────────

interface RecipientInputProps {
  chips: RecipientChip[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAddChip: (addr: string) => void;
  onRemoveChip: (id: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

function RecipientInput({
  chips,
  inputValue,
  onInputChange,
  onAddChip,
  onRemoveChip,
  onKeyDown,
  placeholder = "Add recipients…",
  inputRef,
}: RecipientInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const commitInput = useCallback(() => {
    const addr = parseAddress(inputValue);
    if (addr) onAddChip(addr);
  }, [inputValue, onAddChip]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (inputValue.trim()) {
        e.preventDefault();
        commitInput();
      }
    } else if (e.key === "Backspace" && !inputValue && chips.length > 0) {
      onRemoveChip(chips[chips.length - 1].id);
    }
    onKeyDown?.(e);
  };

  return (
    <div
      ref={containerRef}
      onClick={() => inputRef?.current?.focus()}
      className="flex flex-wrap items-center gap-1.5 min-h-[40px] cursor-text"
    >
      {chips.map((chip) => (
        <span
          key={chip.id}
          className={cx(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
            "bg-secondary text-secondary-foreground border border-border",
            !isValidAddress(chip.address) &&
              "border-destructive/40 text-destructive bg-destructive/10"
          )}
        >
          {chip.address}
          <button
            type="button"
            aria-label={`Remove ${chip.address}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveChip(chip.id);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors rounded"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitInput}
        placeholder={chips.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

// ─── QU popover content ───────────────────────────────────────────────────────

interface QuPopoverBodyProps {
  quAmount: string;
  onAmountChange: (v: string) => void;
  onAdd: () => void;
  walletBalance: number | null;
}

function QuPopoverBody({ quAmount, onAmountChange, onAdd, walletBalance }: QuPopoverBodyProps) {
  const valid = quAmount !== "" && parseFloat(quAmount) > 0;
  const balanceLabel =
    walletBalance == null
      ? "—"
      : `${walletBalance.toLocaleString()} QU`;
  return (
    <div className="space-y-3 p-1">
      <div>
        <p className="text-sm font-semibold text-foreground">Attach QU Tokens</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Send Qubic tokens with this message
        </p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            placeholder="0"
            value={quAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && valid && onAdd()}
            min="0"
            step="1"
            className={cx(
              "w-full h-9 rounded-lg bg-background border border-input text-sm text-foreground px-3 pr-10",
              "placeholder:text-muted-foreground/60 outline-none transition-colors",
              "focus:border-ring focus:ring-1 focus:ring-ring/30"
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary tracking-wide">
            QU
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!valid}
          className={cx(
            "h-9 px-3.5 rounded-lg text-sm font-medium transition-colors",
            valid
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Add
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Coins className="w-3 h-3 text-primary" />
        <span>Balance: {balanceLabel}</span>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function ComposeModal() {
  const { composeOpen, setComposeOpen, sendEmail } = useMailStore();
  const { wallet, connected } = useQubicConnect();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!connected || !wallet?.publicKey) {
      setWalletBalance(null);
      return;
    }
    fetchBalance(wallet.publicKey)
      .then((result) => setWalletBalance(result?.balance ?? null))
      .catch(() => setWalletBalance(null));
  }, [connected, wallet?.publicKey]);

  const [chips, setChips] = useState<RecipientChip[]>([]);
  const [toInput, setToInput] = useState("");
  const toInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [quAmount, setQuAmount] = useState("");
  const [quPopoverOpen, setQuPopoverOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasDraft = Boolean(
    chips.length > 0 ||
      toInput.trim() ||
      subject.trim() ||
      body.trim() ||
      attachments.length > 0
  );

  const allRecipients = useMemo(() => {
    const fromChips = chips.map((c) => c.address);
    const fromInput = toInput
      .split(/[,;]+/)
      .map((a) => a.trim())
      .filter(Boolean);
    return [...fromChips, ...fromInput];
  }, [chips, toInput]);

  const canSend = allRecipients.length > 0;

  // ── recipient chip management ──────────────────────────────────────────────

  const addChip = useCallback((addr: string) => {
    const clean = parseAddress(addr);
    if (!clean) return;
    setChips((prev) => [...prev, { id: crypto.randomUUID(), address: clean }]);
    setToInput("");
  }, []);

  const removeChip = useCallback((id: string) => {
    setChips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ── file handling ──────────────────────────────────────────────────────────

  const processFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      let type: Attachment["type"] = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (/zip|rar|tar|7z|gz/.test(file.type)) type = "archive";

      const size =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(0)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setAttachments((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: file.name, type, size },
      ]);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  // ── QU ─────────────────────────────────────────────────────────────────────

  const addQuAttachment = () => {
    const amount = parseFloat(quAmount);
    if (isNaN(amount) || amount <= 0) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `${amount.toLocaleString()} QU Transfer`,
        type: "qu",
        size: `${amount.toLocaleString()} QU`,
        quAmount: amount,
      },
    ]);
    setQuAmount("");
    setQuPopoverOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ── draft / send ───────────────────────────────────────────────────────────

  const resetDraft = useCallback(() => {
    setChips([]);
    setToInput("");
    setSubject("");
    setBody("");
    setAttachments([]);
    setQuAmount("");
    setQuPopoverOpen(false);
    setSent(false);
  }, []);

  const handleSend = useCallback(() => {
    if (!canSend || isSending) return;

    const pendingAddr = parseAddress(toInput);
    const finalRecipients = [
      ...chips.map((c) => c.address),
      ...(pendingAddr ? [pendingAddr] : []),
    ];
    if (finalRecipients.length === 0) return;

    setIsSending(true);
    setTimeout(() => {
      sendEmail({
        from: { name: "You", address: "user@qmail.qu" },
        to: finalRecipients.map((addr) => ({ name: addr, address: addr })),
        subject: subject || "(no subject)",
        preview: body.slice(0, 100),
        body: `<p>${body.replace(/\n/g, "</p><p>")}</p>`,
        attachments,
      });
      setIsSending(false);
      setSent(true);
      setTimeout(() => {
        setComposeOpen(false);
        setIsMinimized(false);
        resetDraft();
      }, 600);
    }, 400);
  }, [
    canSend,
    isSending,
    toInput,
    chips,
    subject,
    body,
    attachments,
    sendEmail,
    setComposeOpen,
    resetDraft,
  ]);

  const handleClose = useCallback(
    (force = false) => {
      if (!force && hasDraft && !window.confirm("Discard this draft?")) return;
      setComposeOpen(false);
      setIsMinimized(false);
      resetDraft();
    },
    [hasDraft, setComposeOpen, resetDraft]
  );

  const handleComposerKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // close on Escape
  useEffect(() => {
    if (!composeOpen || isMinimized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composeOpen, isMinimized, handleClose]);

  if (!composeOpen) return null;

  // ── minimized bar ──────────────────────────────────────────────────────────

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-72">
        <div
          role="button"
          tabIndex={0}
          aria-label="Restore compose window"
          onClick={() => setIsMinimized(false)}
          onKeyDown={(e) => e.key === "Enter" && setIsMinimized(false)}
          className="flex h-11 items-center justify-between rounded-t-xl px-4 cursor-pointer
            bg-card border border-b-0 border-border
            shadow-[0_-4px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)]
            hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {subject || "New Message"}
            </span>
            {hasDraft && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0 ml-2">
            <button
              type="button"
              aria-label="Restore draft"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Close draft"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── shared file input ──────────────────────────────────────────────────────

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      className="hidden"
      onChange={handleFileSelect}
      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.tar,.gz"
    />
  );

  // ── attachment chips row ───────────────────────────────────────────────────

  const attachmentRow = attachments.length > 0 && (
    <div className="px-4 pb-3 flex flex-wrap gap-1.5">
      {attachments.map((att) => (
        <AttachmentChip key={att.id} att={att} onRemove={removeAttachment} />
      ))}
    </div>
  );

  // ── field label shared class ───────────────────────────────────────────────

  const fieldLabel =
    "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 w-14";

  // ── mobile compose ─────────────────────────────────────────────────────────

  const mobileCompose = (
    <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
      {/* mobile header */}
      <div className="flex h-14 items-center gap-1 border-b border-border px-2 shrink-0 bg-card">
        <button
          type="button"
          aria-label="Close compose"
          onClick={() => handleClose()}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-base font-semibold text-foreground px-2">
          New Message
        </span>
        <button
          type="button"
          aria-label="Attach files"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <Popover open={quPopoverOpen} onOpenChange={setQuPopoverOpen}>
          <PopoverTrigger
            className="flex items-center justify-center w-10 h-10 rounded-xl text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
            aria-label="Attach QU tokens"
          >
            <Coins className="w-5 h-5" />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <QuPopoverBody
              quAmount={quAmount}
              onAmountChange={setQuAmount}
              onAdd={addQuAttachment}
              walletBalance={walletBalance}
            />
          </PopoverContent>
        </Popover>
        <button
          type="button"
          aria-label="Send message"
          onClick={handleSend}
          disabled={!canSend || isSending}
          className={cx(
            "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
            canSend && !isSending
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {fileInput}

      {/* fields */}
      <div className="flex flex-col border-b border-border">
        <div className="flex items-start gap-3 px-4 py-3 border-b border-border">
          <span className={cx(fieldLabel, "pt-1")}>To</span>
          <RecipientInput
            chips={chips}
            inputValue={toInput}
            onInputChange={setToInput}
            onAddChip={addChip}
            onRemoveChip={removeChip}
            onKeyDown={handleComposerKeyDown}
            inputRef={toInputRef}
          />
        </div>
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <span className={fieldLabel}>Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Subject"
            className="flex-1 h-12 bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
        </div>
      </div>

      {/* body */}
      <div className="flex-1 px-4 pt-4 pb-2 overflow-auto">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder="Write your message…"
          className="w-full h-full min-h-[200px] bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 outline-none resize-none leading-relaxed"
        />
      </div>

      {attachmentRow}
    </div>
  );

  // ── desktop compose ────────────────────────────────────────────────────────

  const desktopCompose = (
    <div
      className="fixed bottom-0 right-6 z-50 hidden md:flex flex-col w-[560px] max-h-[680px]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 rounded-t-2xl flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary/50 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Paperclip className="w-8 h-8" />
            <span className="text-sm font-medium">Drop files to attach</span>
          </div>
        </div>
      )}

      {/* modal card */}
      <div
        className={cx(
          "flex flex-col rounded-t-2xl overflow-hidden",
          // surface: card token gives correct bg in both modes
          "bg-card border border-b-0 border-border",
          // shadow: lighter in light mode, heavier in dark
          "shadow-[0_-4px_32px_rgba(0,0,0,0.1),0_-1px_0_rgba(0,0,0,0.06)]",
          "dark:shadow-[0_-8px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)]",
          "transition-all duration-200",
          sent ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}
      >
        {/* ── header ── */}
        <div className="flex items-center justify-between px-4 h-11 bg-muted/60 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              New Message
            </h2>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Minimize"
              onClick={() => setIsMinimized(true)}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={() => handleClose()}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {fileInput}

        {/* ── recipient row ── */}
        <div className="flex items-start gap-3 px-4 py-2.5 border-b border-border min-h-[44px]">
          <span className={cx(fieldLabel, "pt-[9px]")}>To</span>
          <div className="flex-1 py-1">
            <RecipientInput
              chips={chips}
              inputValue={toInput}
              onInputChange={setToInput}
              onAddChip={addChip}
              onRemoveChip={removeChip}
              onKeyDown={handleComposerKeyDown}
              inputRef={toInputRef}
            />
          </div>
          <button
            type="button"
            aria-label="Show CC and BCC fields"
            className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors pt-2.5 shrink-0"
          >
            <span>Cc</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* ── subject row ── */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <span className={fieldLabel}>Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Subject"
            className="flex-1 h-10 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
        </div>

        {/* ── body ── */}
        <div className="flex-1 px-4 pt-3 pb-1 overflow-y-auto min-h-0">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Write your message…"
            className="w-full min-h-[220px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none leading-[1.7]"
          />
        </div>

        {/* ── attachment chips ── */}
        {attachmentRow}

        {/* ── footer / toolbar ── */}
        <div className="flex items-center gap-1 px-3 py-2.5 border-t border-border bg-muted/40 shrink-0">
          {/* send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend || isSending}
            aria-label="Send message (Ctrl+Enter)"
            className={cx(
              "flex items-center gap-2 h-8 px-3.5 rounded-lg text-sm font-semibold transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              sent
                ? "bg-green-600 hover:bg-green-600 text-white"
                : canSend && !isSending
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sent ? "Sent!" : isSending ? "Sending…" : "Send"}</span>
            {!isSending && !sent && (
              <kbd className="hidden xl:inline-flex items-center gap-0.5 text-[10px] font-normal opacity-50 ml-0.5">
                <span>⌘</span>
                <span>↵</span>
              </kbd>
            )}
          </button>

          <ToolbarDivider />

          {/* formatting group */}
          <ToolbarBtn icon={Bold} label="Bold (Ctrl+B)" />
          <ToolbarBtn icon={Italic} label="Italic (Ctrl+I)" />
          <ToolbarBtn icon={Underline} label="Underline (Ctrl+U)" />
          <ToolbarBtn icon={List} label="Bullet list" />
          <ToolbarBtn icon={Link} label="Insert link" />

          <ToolbarDivider />

          {/* insert group */}
          <ToolbarBtn
            icon={Paperclip}
            label="Attach files"
            onClick={() => fileInputRef.current?.click()}
          />

          <Popover open={quPopoverOpen} onOpenChange={setQuPopoverOpen}>
            <PopoverTrigger
              className="flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-100 outline-none focus-visible:ring-1 focus-visible:ring-ring/50 text-primary hover:text-primary/80 hover:bg-primary/10"
              aria-label="Attach QU tokens"
            >
              <Coins className="w-3.5 h-3.5" />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start" side="top">
              <QuPopoverBody
                quAmount={quAmount}
                onAmountChange={setQuAmount}
                onAdd={addQuAttachment}
                walletBalance={walletBalance}
              />
            </PopoverContent>
          </Popover>

          {/* spacer */}
          <div className="flex-1" />

          {/* discard */}
          <ToolbarBtn
            icon={Trash2}
            label="Discard draft"
            onClick={() => handleClose()}
            danger
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileCompose}
      {desktopCompose}
    </>
  );
}
