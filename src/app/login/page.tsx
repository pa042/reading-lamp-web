"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthMark from "@/components/AuthMark";

const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_LOGIN_EMAIL ?? "";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setStatus("sending");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが違います。"
          : error.message
      );
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
          <h1 className="text-xl font-black mb-1.5">読書ノートにログイン</h1>
          <p className="text-sm text-ink-soft mb-7">
            メールアドレスとパスワードを入力してください。
          </p>

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
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-ink-soft">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                autoFocus={!!DEFAULT_EMAIL}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {status === "error" && <p className="text-sm text-danger">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded bg-accent text-on-accent font-bold py-2.5 mt-1 transition-colors hover:bg-accent-bright disabled:opacity-50"
            >
              {status === "sending" ? "ログイン中…" : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
