"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-page">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.18em] uppercase text-accent font-bold mb-2">
          リーディングランプ
        </p>
        <h1 className="text-2xl font-black mb-3">読書ノートにログイン</h1>
        <p className="text-sm text-ink-soft mb-8">
          メールアドレスを入力すると、ログイン用のリンクが届きます。パスワードは不要です。
        </p>

        {status === "sent" ? (
          <div className="rounded border border-line bg-surface p-4 text-sm">
            <p className="font-bold mb-1">メールを送信しました</p>
            <p className="text-ink-soft">
              {email} 宛にログインリンクを送りました。メール内のリンクを開いてログインしてください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-ink-soft">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded border border-line bg-surface px-3 py-2.5"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-danger">{errorMsg || "送信に失敗しました。もう一度お試しください。"}</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded bg-accent text-on-accent font-bold py-2.5 disabled:opacity-50"
            >
              {status === "sending" ? "送信中…" : "ログインリンクを送る"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
