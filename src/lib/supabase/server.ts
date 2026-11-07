import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出し時は無視してよい（middleware がセッションを更新する）
          }
        },
      },
    }
  );
}

// getClaims() はJWTの署名検証のみで済み、getUser() のように毎回Supabaseサーバーへ
// 問い合わせる必要がない（プロジェクトの鍵設定次第ではネットワーク通信すら発生しない）。
// 同一リクエスト内では React cache() で結果を使い回し、layout + page の重複呼び出しもなくす。
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) return null;
  return { id: data.claims.sub, email: data.claims.email ?? null };
});
