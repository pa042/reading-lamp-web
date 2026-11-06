"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LOGIN_EMAIL = process.env.NEXT_PUBLIC_LOGIN_EMAIL!;

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: LOGIN_EMAIL,
      password,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "パスワードが違います。"
          : error.message
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-page">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.18em] uppercase text-accent font-bold mb-2">
          リーディングランプ
        </p>
        <h1 className="text-2xl font-black mb-3">読書ノートにログイン</h1>
        <p className="text-sm text-ink-soft mb-8">パスワードを入力してください。</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold text-ink-soft">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-line bg-surface px-3 py-2.5"
            />
          </div>
          {status === "error" && <p className="text-sm text-danger">{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded bg-accent text-on-accent font-bold py-2.5 disabled:opacity-50"
          >
            {status === "sending" ? "ログイン中…" : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
