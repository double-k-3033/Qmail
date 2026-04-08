"use client";

import { useState, useRef } from "react";
import { useMailStore, type Attachment } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

const fileTypeIcons = {
  image: ImageIcon,
  document: FileText,
  archive: FileArchive,
  qu: Coins,
} as const;

type FileTypeKey = keyof typeof fileTypeIcons;

const fileTypeBg: Record<string, string> = {
  image: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  document: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  archive: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  qu: "bg-primary/10 text-primary border-primary/20",
};

export function ComposeModal() {
  const { composeOpen, setComposeOpen, sendEmail } = useMailStore();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [quAmount, setQuAmount] = useState("");
  const [quPopoverOpen, setQuPopoverOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      let type: Attachment["type"] = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (
        file.type.includes("zip") ||
        file.type.includes("rar") ||
        file.type.includes("tar") ||
        file.type.includes("7z") ||
        file.type.includes("gz")
      )
        type = "archive";

      const size =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(0)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      setAttachments((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: file.name,
          type,
          size,
        },
      ]);
    });

    e.target.value = "";
  };

  const addQuAttachment = () => {
    const amount = parseFloat(quAmount);
    if (isNaN(amount) || amount <= 0) return;

    setAttachments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `${amount} QU Transfer`,
        type: "qu",
        size: `${amount} QU`,
        quAmount: amount,
      },
    ]);
    setQuAmount("");
    setQuPopoverOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if (!to.trim()) return;

    sendEmail({
      from: { name: "You", address: "user@qmail.qu" },
      to: to.split(",").map((addr) => ({
        name: addr.trim(),
        address: addr.trim(),
      })),
      subject: subject || "(no subject)",
      preview: body.slice(0, 100),
      body: `<p>${body.replace(/\n/g, "</p><p>")}</p>`,
      attachments,
    });

    setTo("");
    setSubject("");
    setBody("");
    setAttachments([]);
  };

  const handleClose = () => {
    setComposeOpen(false);
    setIsMinimized(false);
    setTo("");
    setSubject("");
    setBody("");
    setAttachments([]);
  };

  if (!composeOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-72">
        <div
          className="flex h-10 items-center justify-between rounded-t-lg bg-foreground px-4 cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <span className="text-sm font-medium text-background truncate">
            {subject || "New Message"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="text-background/70 hover:text-background"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-background/70 hover:text-background"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={composeOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 rounded-xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-foreground/5 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-medium">
              New Message
            </DialogTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="rounded p-1 hover:bg-foreground/10"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Fields */}
        <div className="flex flex-col">
          <div className="flex items-center border-b px-4">
            <span className="text-sm text-muted-foreground w-12 shrink-0">
              To
            </span>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 h-10 text-sm px-0"
              placeholder="Recipients"
            />
          </div>
          <div className="flex items-center border-b px-4">
            <span className="text-sm text-muted-foreground w-12 shrink-0">
              Subject
            </span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 h-10 text-sm px-0"
              placeholder="Subject"
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            className="min-h-[200px] border-0 shadow-none focus-visible:ring-0 resize-none text-sm p-0"
          />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-4 pb-2">
            <Separator className="mb-3" />
            <div className="flex flex-wrap gap-2">
              {attachments.map((att) => {
                const Icon = (att.type in fileTypeIcons ? fileTypeIcons[att.type as FileTypeKey] : FileText);
                return (
                  <div
                    key={att.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                      fileTypeBg[att.type] || ""
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-[140px]">{att.name}</span>
                    <span className="text-xs opacity-70">{att.size}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="ml-1 opacity-50 hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-1 border-t px-3 py-2">
          <Button
            onClick={handleSend}
            className="gap-2 rounded-full h-9"
            size="sm"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>

          {/* Formatting */}
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>List</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert link</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Attach file */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.tar,.gz"
          />
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach files</TooltipContent>
          </Tooltip>

          {/* Attach QU */}
          <Popover open={quPopoverOpen} onOpenChange={setQuPopoverOpen}>
            <Tooltip>
              <TooltipTrigger>
                <PopoverTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                  >
                    <Coins className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Attach QU tokens</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Send QU</label>
                  <p className="text-xs text-muted-foreground">
                    Attach Qubic tokens to this email
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={quAmount}
                      onChange={(e) => setQuAmount(e.target.value)}
                      className="pr-10 h-9"
                      min="0"
                      step="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary">
                      QU
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="h-9"
                    onClick={addQuAttachment}
                    disabled={!quAmount || parseFloat(quAmount) <= 0}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Coins className="h-3 w-3" />
                  <span>Balance: 12,450 QU</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Delete draft */}
          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleClose}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discard draft</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
