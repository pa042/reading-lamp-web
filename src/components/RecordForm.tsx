"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Book, BookStatus } from "@/lib/types";
import { createBook, createRecord } from "@/app/actions";
import { fmtDate } from "@/lib/utils";

const STATUS_GROUPS: { key: BookStatus; label: string }[] = [
  { key: "reading", label: "読んでいる" },
  { key: "want", label: "気になる" },
  { key: "done", label: "読み終えた" },
];

export default function RecordForm({ books, presetBookId }: { books: Book[]; presetBookId?: string }) {
  const router = useRouter();
  const [bookList, setBookList] = useState(books);
  const [bookId, setBookId] = useState(presetBookId ?? "");
  const [showNewBook, setShowNewBook] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [addingBook, setAddingBook] = useState(false);

  const [date, setDate] = useState(() => fmtDate(new Date()));
  const [pageFrom, setPageFrom] = useState("");
  const [pageTo, setPageTo] = useState("");
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState("");
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const groups = useMemo(() => {
    const byStatus: Record<BookStatus, Book[]> = { reading: [], want: [], done: [] };
    for (const b of bookList) byStatus[b.status].push(b);
    return byStatus;
  }, [bookList]);

  async function handleAddBook() {
    if (!newTitle.trim()) return;
    setAddingBook(true);
    try {
      const created = await createBook({ title: newTitle.trim(), author: newAuthor.trim(), status: "reading", cover: null });
      const book: Book = {
        id: created.id,
        user_id: "",
        title: newTitle.trim(),
        author: newAuthor.trim(),
        status: "reading",
        cover_path: null,
        created_at: new Date().toISOString(),
        finished_at: null,
      };
      setBookList((prev) => [...prev, book]);
      setBookId(book.id);
      setShowNewBook(false);
      setNewTitle("");
      setNewAuthor("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "本の登録に失敗しました");
    } finally {
      setAddingBook(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookId) {
      setError("本を選んでください");
      return;
    }
    if (!note.trim()) {
      setError("メモを書いてください");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const book = bookList.find((b) => b.id === bookId);
      const record = await createRecord({
        bookId,
        bookTitle: book?.title ?? "",
        date,
        pageFrom: pageFrom.trim() ? Math.max(0, parseInt(pageFrom, 10)) : null,
        pageTo: pageTo.trim() ? Math.max(0, parseInt(pageTo, 10)) : null,
        rawText: note.trim(),
        summary: summary.trim(),
        markFinished: finished,
      });
      router.push(`/detail/${record.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "記録の保存に失敗しました");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-xs font-bold text-ink-soft">本を選ぶ</label>
        <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
          <option value="">選択してください</option>
          {STATUS_GROUPS.map((g) =>
            groups[g.key].length ? (
              <optgroup key={g.key} label={g.label}>
                {groups[g.key].map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </optgroup>
            ) : null
          )}
        </select>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowNewBook((v) => !v)}
          className="rounded border border-line text-sm font-bold px-4 py-2 hover:border-accent"
        >
          {showNewBook ? "キャンセル" : "+ 新しい本を登録する"}
        </button>
      </div>

      {showNewBook && (
        <div className="rounded border border-line bg-surface-2 p-4 flex flex-col gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-soft">タイトル</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="本のタイトル" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-soft">著者（任意）</label>
            <input value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="著者名" />
          </div>
          <button
            type="button"
            onClick={handleAddBook}
            disabled={addingBook}
            className="rounded bg-accent text-on-accent font-bold text-sm px-4 py-2 w-fit disabled:opacity-50"
          >
            {addingBook ? "追加中…" : "追加する"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-xs font-bold text-ink-soft">日付</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2.5 mb-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
          <label className="text-xs font-bold text-ink-soft">〜ページから</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pageFrom}
            onChange={(e) => setPageFrom(e.target.value)}
            placeholder="120"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
          <label className="text-xs font-bold text-ink-soft">〜ページまで</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pageTo}
            onChange={(e) => setPageTo(e.target.value)}
            placeholder="145"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-xs font-bold text-ink-soft">書いたメモ</label>
        <textarea
          rows={8}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="心に残ったフレーズや、考えたこと、学びをそのまま書いてみましょう。"
        />
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-xs font-bold text-ink-soft">まとめ（印象に残った点を短く書く）</label>
        <textarea
          rows={5}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="・心に残ったポイントを3〜5個、短く書きましょう"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-soft mb-4.5">
        <input
          type="checkbox"
          checked={finished}
          onChange={(e) => setFinished(e.target.checked)}
          className="w-auto"
        />
        この本を読み終えた
      </label>

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-accent text-on-accent font-bold px-5 py-2.5 disabled:opacity-50"
        >
          {saving ? "保存中…" : "この記録を保存する"}
        </button>
      </div>
    </form>
  );
}
