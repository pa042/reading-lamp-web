"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Book, BookStatus } from "@/lib/types";
import { updateBookStatus, updateBookInfo } from "@/app/actions";
import CoverBox from "./CoverBox";
import StatusChip from "./StatusChip";

export default function BookDetailView({
  book,
  coverUrl,
}: {
  book: Book;
  coverUrl: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [preview, setPreview] = useState<string | null>(coverUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as BookStatus;
    setStatus(value);
    await updateBookStatus(book.id, value);
    router.refresh();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const cover = fileRef.current?.files?.[0] ?? null;
      await updateBookInfo(book.id, { title: title.trim(), author: author.trim(), cover });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="flex gap-4 items-start mb-6">
        <CoverBox url={preview} title={title} size="lg" />
        <div className="flex-1 min-w-0">
          <StatusChip status={status} />
          <h1 className="text-2xl font-black mt-2">{title}</h1>
          {author && <p className="text-sm text-ink-soft mt-1">{author}</p>}
        </div>
      </header>

      <div className="flex items-center gap-2.5 mb-5">
        <label className="text-xs font-bold text-ink-soft">状態を変える</label>
        <select value={status} onChange={handleStatusChange} className="w-auto">
          <option value="reading">読んでいる</option>
          <option value="want">気になる</option>
          <option value="done">読み終えた</option>
        </select>
      </div>

      <div className="mb-2">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded border border-line text-sm font-bold px-4 py-2 hover:border-accent"
        >
          {editing ? "キャンセル" : "本の情報を編集"}
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded border border-line bg-surface-2 p-4.5 flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-soft">タイトル</label>
            <input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-soft">著者（任意）</label>
            <input maxLength={80} value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink-soft">表紙の写真（任意）</label>
            <label className="inline-block w-fit text-xs text-accent border border-accent rounded px-3 py-1.5 cursor-pointer">
              写真を撮る／選ぶ
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-accent text-on-accent font-bold text-sm px-4.5 py-2.5 disabled:opacity-50"
            >
              {saving ? "保存中…" : "保存する"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
