"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthMark from "@/components/AuthMark";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("error");
      setErrorMsg("パスワードは8文字以上にしてください。");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setErrorMsg("パスワードが一致しません。");
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-surface">
      <div className="w-full max-w-sm">
        <AuthMark />

        <div className="rounded-lg border border-line bg-page px-7 py-8 shadow-[var(--shadow-card)]">
          <h1 className="text-xl font-black mb-1.5">新しいパスワードを設定</h1>
          <p className="text-sm text-ink-soft mb-7">
            次回からはこのパスワードでログインできます。
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-ink-soft">
                新しいパスワード
              </label>
              <input
                id="password"
                type="password"
                required
                autoFocus
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-xs font-bold text-ink-soft">
                新しいパスワード（確認）
              </label>
              <input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {status === "error" && <p className="text-sm text-danger">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded bg-accent text-on-accent font-bold py-2.5 mt-1 transition-colors hover:bg-accent-bright disabled:opacity-50"
            >
              {status === "saving" ? "保存中…" : "パスワードを設定する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
