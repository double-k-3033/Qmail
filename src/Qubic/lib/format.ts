const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseEmailDate(dateStr: string): Date {
  const trimmed = dateStr.trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const d = Number(ymd[3]);
    return new Date(Date.UTC(y, m, d, 12, 0, 0));
  }
  return new Date(trimmed);
}

function utcCalendarDayStart(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function formatDate(dateStr: string): string {
  const date = parseEmailDate(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (utcCalendarDayStart(now.getTime()) - utcCalendarDayStart(date.getTime())) /
      MS_PER_DAY
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (diffDays === 1) return "Yesterday";

  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });
  }

  if (date.getUTCFullYear() === now.getUTCFullYear()) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatFileSize(size: string): string {
  return size;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
