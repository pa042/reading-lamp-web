import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { coverUrl } from "@/lib/utils";
import BookDetailView from "@/components/BookDetailView";
import RecordCard from "@/components/RecordCard";

export default async function BookPage({ params }: PageProps<"/book/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!book) notFound();

  const { data: records } = await supabase
    .from("records")
    .select("id, book_title, date, page_from, page_to, summary, raw_text")
    .eq("book_id", id)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <section>
      <Link href="/shelf" className="inline-block text-sm text-ink-soft mb-4.5 hover:text-accent">
        ← 本棚に戻る
      </Link>

      <BookDetailView
        book={book}
        coverUrl={coverUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, book.cover_path)}
      />

      <Link
        href={`/new?book=${book.id}`}
        className="inline-block rounded bg-accent text-on-accent font-bold text-sm px-4.5 py-2.5 mb-6"
      >
        + この本の記録を書く
      </Link>

      <div className="flex flex-col gap-3.5">
        {records && records.length > 0 ? (
          records.map((r) => <RecordCard key={r.id} record={r} status={book.status} />)
        ) : (
          <p className="text-sm text-ink-soft">まだこの本の記録はありません。</p>
        )}
      </div>
    </section>
  );
}
