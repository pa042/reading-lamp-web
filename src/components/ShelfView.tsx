"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Book, BookStatus } from "@/lib/types";
import AddBookForm from "./AddBookForm";
import BookCardTile from "./BookCardTile";

const SECTIONS: { key: BookStatus; title: string }[] = [
  { key: "reading", title: "読んでいる本" },
  { key: "done", title: "読み終えた本" },
  { key: "want", title: "気になる本" },
];

export default function ShelfView({
  books,
  coverUrls,
  recordCounts,
}: {
  books: Book[];
  coverUrls: Record<string, string | null>;
  recordCounts: Record<string, number>;
}) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const grouped: Record<BookStatus, Book[]> = { reading: [], done: [], want: [] };
  for (const b of books) grouped[b.status].push(b);

  return (
    <section>
      <header className="mb-7">
        <p className="text-xs tracking-[0.16em] uppercase text-accent font-bold mb-2">本棚</p>
        <h1 className="text-2xl font-black mb-2">積み上げてきた本たち</h1>
        <p className="text-sm text-ink-soft">本を押すと、その本に書いた記録を読み返せます。</p>
      </header>

      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded border border-line text-sm font-bold px-4 py-2 hover:border-accent"
        >
          {showForm ? "キャンセル" : "+ 本を登録する"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <AddBookForm
            onDone={() => {
              setShowForm(false);
              router.refresh();
            }}
          />
        </div>
      )}

      {books.length === 0 && !showForm && (
        <div className="rounded border border-dashed border-line px-5 py-16 text-center flex flex-col items-center gap-2.5">
          <p className="font-black text-lg">本棚はまだ空っぽです</p>
          <p className="text-sm text-ink-soft mb-2">気になる本や、今読んでいる本を登録してみましょう。</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded bg-accent text-on-accent font-bold text-sm px-4.5 py-2.5"
          >
            本を登録する
          </button>
        </div>
      )}

      {SECTIONS.map((section) => {
        const list = grouped[section.key];
        if (list.length === 0) return null;
        return (
          <div key={section.key} className="mt-7">
            <h2 className="flex items-baseline gap-2 text-lg font-bold mb-3.5">
              {section.title}
              <span className="font-mono text-xs font-normal text-ink-soft">{list.length}</span>
            </h2>
            <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}>
              {list.map((book) => (
                <BookCardTile
                  key={book.id}
                  book={book}
                  coverUrl={coverUrls[book.id] ?? null}
                  recordCount={recordCounts[book.id] ?? 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
