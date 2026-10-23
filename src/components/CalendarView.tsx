"use client";

import { useMemo, useState } from "react";
import type { BookStatus, ReadingRecord } from "@/lib/types";
import {
  buildMonthGrid,
  computeStreak,
  formatDateJa,
  longestStreak,
} from "@/lib/utils";
import RecordCard from "./RecordCard";

type RecordRow = Pick<
  ReadingRecord,
  "id" | "book_title" | "date" | "page_from" | "page_to" | "summary" | "raw_text" | "book_id"
>;

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarView({
  records,
  bookStatus,
}: {
  records: RecordRow[];
  bookStatus: Record<string, BookStatus>;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dateSet = useMemo(() => new Set(records.map((r) => r.date)), [records]);
  const current = useMemo(() => computeStreak(dateSet), [dateSet]);
  const longest = useMemo(() => longestStreak(dateSet), [dateSet]);
  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month, dateSet), [cursor, dateSet]);

  function shiftMonth(delta: number) {
    setSelectedDay(null);
    setCursor((c) => {
      let month = c.month + delta;
      let year = c.year;
      if (month < 0) {
        month = 11;
        year--;
      }
      if (month > 11) {
        month = 0;
        year++;
      }
      return { year, month };
    });
  }

  const dayRecords = selectedDay
    ? records.filter((r) => r.date === selectedDay).sort((a, b) => (a.id < b.id ? 1 : -1))
    : [];

  return (
    <section>
      <header className="mb-7">
        <p className="text-xs tracking-[0.16em] uppercase text-accent font-bold mb-2">カレンダー</p>
        <h1 className="text-2xl font-black mb-2">記録した日をふりかえる</h1>
        <p className="text-sm text-ink-soft">日付を押すと、その日の記録を読み返せます。</p>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "現在の連続日数", value: current },
          { label: "最長の連続記録", value: longest },
          { label: "記録した回数", value: records.length },
        ].map((s) => (
          <div key={s.label} className="rounded border border-line bg-surface px-4 py-4 text-center">
            <span className="block font-mono tabular-nums text-2xl font-bold text-accent-bright">{s.value}</span>
            <span className="text-xs text-ink-soft">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded border border-line bg-surface p-4.5">
        <div className="flex items-center justify-between mb-3.5">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="前の月"
            className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent"
          >
            ←
          </button>
          <p className="font-black">
            {cursor.year}年{cursor.month + 1}月
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="次の月"
            className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-ink-soft mb-1.5">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, i) =>
            cell.inMonth ? (
              <button
                key={cell.date ?? i}
                type="button"
                onClick={() => setSelectedDay(cell.date!)}
                className={`aspect-square rounded border flex flex-col items-center justify-center gap-0.5 ${
                  selectedDay === cell.date ? "border-transparent" : "border-transparent hover:bg-surface-2"
                } ${cell.isToday ? "border-line" : ""}`}
                style={selectedDay === cell.date ? { backgroundColor: "var(--color-accent-tint)" } : undefined}
              >
                <span
                  className={`font-mono text-xs tabular-nums ${
                    cell.hasRecord ? "text-accent font-bold" : cell.isToday ? "text-ink font-bold" : "text-ink-soft"
                  }`}
                >
                  {cell.day}
                </span>
                {cell.hasRecord && <span className="w-1.5 h-1.5 rounded-full bg-accent-bright" />}
              </button>
            ) : (
              <div key={`out-${i}`} className="aspect-square flex items-center justify-center opacity-30">
                <span className="font-mono text-xs text-ink-soft">{cell.day}</span>
              </div>
            )
          )}
        </div>
      </div>

      {selectedDay && (
        <div className="mt-5">
          {dayRecords.length === 0 ? (
            <p className="text-sm text-ink-soft mt-3.5">{formatDateJa(selectedDay)}の記録はありません。</p>
          ) : (
            <>
              <h2 className="text-base font-bold mt-5 mb-2.5">{formatDateJa(selectedDay)}の記録</h2>
              <div className="flex flex-col gap-3.5">
                {dayRecords.map((r) => (
                  <RecordCard key={r.id} record={r} status={bookStatus[r.book_id] ?? "reading"} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
