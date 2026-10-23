import type { ReadingRecord } from "./types";

export function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateJa(dateStr: string): string {
  const dt = parseLocalDate(dateStr);
  const week = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${dt.getMonth() + 1}月${dt.getDate()}日(${week})`;
}

export function formatPageRange(r: Pick<ReadingRecord, "page_from" | "page_to">): string {
  if (r.page_from != null && r.page_to != null) return `${r.page_from}〜${r.page_to}ページ`;
  if (r.page_from != null) return `${r.page_from}ページから`;
  if (r.page_to != null) return `${r.page_to}ページまで`;
  return "";
}

export function extractBullets(r: Pick<ReadingRecord, "summary" | "raw_text">): string[] {
  const text = (r.summary || r.raw_text || "").trim();
  if (!text) return [];
  const lines = text
    .split("\n")
    .map((l) => l.replace(/^[・\-\s]+/, "").trim())
    .filter(Boolean);
  return lines.length ? lines : [text];
}

export function computeStreak(dateSet: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  if (!dateSet.has(fmtDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dateSet.has(fmtDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function longestStreak(dateSet: Set<string>): number {
  const dates = Array.from(dateSet).sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of dates) {
    if (prev) {
      const diff = (parseLocalDate(d).getTime() - parseLocalDate(prev).getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = d;
  }
  return longest;
}

export type CalendarCell = {
  day: number;
  inMonth: boolean;
  date?: string;
  isToday?: boolean;
  hasRecord?: boolean;
};

export function buildMonthGrid(year: number, month: number, dateSet: Set<string>): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayStr = fmtDate(new Date());
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: daysInPrevMonth - startOffset + 1 + i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = fmtDate(dateObj);
    cells.push({
      day: d,
      inMonth: true,
      date: dateStr,
      isToday: dateStr === todayStr,
      hasRecord: dateSet.has(dateStr),
    });
  }
  let trail = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: trail++, inMonth: false });
  }
  return cells;
}

export function coverUrl(supabaseUrl: string, coverPath: string | null): string | null {
  if (!coverPath) return null;
  return `${supabaseUrl}/storage/v1/object/public/covers/${coverPath}`;
}
