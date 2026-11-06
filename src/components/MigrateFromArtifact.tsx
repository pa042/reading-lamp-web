"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { migrateFromArtifact } from "@/app/actions";

export default function MigrateFromArtifact() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setStatus("running");
    setMessage("");
    try {
      const result = await migrateFromArtifact();
      setStatus("done");
      setMessage(
        `本 ${result.booksCreated}件を追加（${result.booksSkipped}件は既存のためスキップ）、` +
          `記録 ${result.recordsCreated}件を追加（${result.recordsSkipped}件はスキップ）しました。`
      );
      router.refresh();
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "取り込みに失敗しました。");
    }
  }

  return (
    <div className="rounded border border-line bg-surface p-4">
      <p className="text-sm font-bold mb-1">Claude版の記録を取り込む</p>
      <p className="text-sm text-ink-soft mb-3">
        _backup_from_artifact 内のデータ（本・記録・表紙画像）をこのアカウントに登録します。何度押しても重複登録はされません。
      </p>
      <button
        onClick={handleClick}
        disabled={status === "running"}
        className="rounded bg-accent text-on-accent font-bold py-2 px-4 text-sm disabled:opacity-50"
      >
        {status === "running" ? "取り込み中…" : "取り込む"}
      </button>
      {message && (
        <p className={`text-sm mt-3 ${status === "error" ? "text-danger" : "text-ink-soft"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
