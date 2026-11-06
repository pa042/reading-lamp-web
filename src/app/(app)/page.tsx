import { createClient, getUser } from "@/lib/supabase/server";
import { extractBullets } from "@/lib/utils";
import TimelineFeed, { type TimelineCard } from "@/components/TimelineFeed";

export default async function HomePage() {
  const supabase = await createClient();
  const user = await getUser();

  const { data: records } = await supabase
    .from("records")
    .select("id, book_title, raw_text, summary, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const cards: TimelineCard[] = [];
  for (const r of records ?? []) {
    for (const bullet of extractBullets({ summary: r.summary, raw_text: r.raw_text })) {
      cards.push({ recordId: r.id as string, bookTitle: r.book_title as string, bullet });
    }
  }

  return (
    <section>
      <header className="mb-7">
        <p className="text-xs tracking-[0.16em] uppercase text-accent font-bold mb-2">ホーム</p>
        <h1 className="text-2xl font-black mb-2">読んだ記録をスライドで振り返る</h1>
        <p className="text-sm text-ink-soft">カードが自動でスライドします。手でも操作できます。</p>
      </header>
      <TimelineFeed cards={cards} />
    </section>
  );
}
