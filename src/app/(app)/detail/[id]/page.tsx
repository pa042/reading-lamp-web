import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateJa, formatPageRange } from "@/lib/utils";
import StatusChip from "@/components/StatusChip";
import DeleteRecordButton from "@/components/DeleteRecordButton";

export default async function RecordDetailPage({ params }: PageProps<"/detail/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: record } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!record) notFound();

  const { data: book } = await supabase
    .from("books")
    .select("id, status")
    .eq("id", record.book_id)
    .single();

  const pageText = formatPageRange(record);

  return (
    <section>
      <Link href="/" className="inline-block text-sm text-ink-soft mb-4.5 hover:text-accent">
        ← ホームに戻る
      </Link>

      <header className="mb-6">
        <StatusChip status={book?.status ?? "reading"} />
        <h1 className="text-2xl font-black mt-2">{record.book_title}</h1>
        <p className="text-sm text-ink-soft mt-1">
          {formatDateJa(record.date)}
          {pageText ? ` ・ ${pageText}` : ""}
        </p>
      </header>

      <div
        className="rounded border px-5 py-4.5 mb-4"
        style={{ borderColor: "var(--color-accent)", background: "var(--color-surface)" }}
      >
        <h2 className="text-sm font-bold text-ink-soft mb-2.5">まとめ</h2>
        <p className="text-[0.94rem] whitespace-pre-line">{record.summary}</p>
      </div>

      <div className="rounded border border-line bg-surface px-5 py-4.5 mb-4">
        <h2 className="text-sm font-bold text-ink-soft mb-2.5">書いたメモ</h2>
        <p className="text-[0.94rem] whitespace-pre-line">{record.raw_text}</p>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2.5">
        {book ? (
          <Link href={`/book/${book.id}`} className="rounded border border-line text-sm font-bold px-4 py-2 hover:border-accent">
            この本のページを見る
          </Link>
        ) : (
          <span />
        )}
        <DeleteRecordButton recordId={record.id} />
      </div>
    </section>
  );
}
