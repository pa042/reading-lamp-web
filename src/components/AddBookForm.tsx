"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBook } from "@/app/actions";
import type { BookStatus } from "@/lib/types";

export default function AddBookForm({
  onDone,
  redirectAfter = false,
}: {
  onDone?: (book: { id: string; title: string }) => void;
  redirectAfter?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("reading");
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const cover = fileRef.current?.files?.[0] ?? null;
      const book = await createBook({ title: title.trim(), author: author.trim(), status, cover });
      router.refresh();
      if (redirectAfter) {
        router.push(`/book/${book.id}`);
        return;
      }
      onDone?.({ id: book.id, title: title.trim() });
      setTitle("");
      setAuthor("");
      setStatus("reading");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded border border-line bg-surface-2 p-4.5 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-ink-soft">タイトル</label>
        <input
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="本のタイトル"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-ink-soft">著者（任意）</label>
        <input maxLength={80} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="著者名" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-ink-soft">状態</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
          <option value="reading">読んでいる</option>
          <option value="want">気になる</option>
          <option value="done">読み終えた</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-ink-soft">表紙の写真（任意）</label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-14 aspect-2/3 object-cover rounded border border-line" />
        )}
        <label className="inline-block w-fit text-xs text-accent border border-accent rounded px-3 py-1.5 cursor-pointer">
          写真を撮る／選ぶ
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2.5">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-accent text-on-accent font-bold text-sm px-4.5 py-2.5 disabled:opacity-50"
        >
          {saving ? "登録中…" : "登録する"}
        </button>
      </div>
    </form>
  );
}
