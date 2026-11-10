import { createClient, getUser } from "@/lib/supabase/server";
import TimelineFeed from "@/components/TimelineFeed";
import { HomeIcon } from "@/components/NavIcons";
import type { BookStatus } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const user = await getUser();

  const [{ data: records }, { data: books }] = await Promise.all([
    supabase
      .from("records")
      .select("id, book_id, book_title, date, page_from, page_to, summary, raw_text")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("books").select("id, status").eq("user_id", user!.id),
  ]);

  const bookStatus: Record<string, BookStatus> = {};
  for (const b of books ?? []) bookStatus[b.id as string] = b.status as BookStatus;

  return (
    <section>
      <header className="mb-7">
        <p className="flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase text-accent font-bold mb-2">
          <HomeIcon className="w-3.5 h-3.5" />
          ホーム
        </p>
        <h1 className="text-2xl font-black mb-2">読んだ記録を振り返る</h1>
        <p className="text-sm text-ink-soft">新しい記録から順に並んでいます。</p>
      </header>
      <TimelineFeed records={records ?? []} bookStatus={bookStatus} />
    </section>
  );
}
