import Link from "next/link";
import type { BookStatus, ReadingRecord } from "@/lib/types";
import RecordCard from "./RecordCard";

type RecordRow = Pick<
  ReadingRecord,
  "id" | "book_title" | "date" | "page_from" | "page_to" | "summary" | "raw_text" | "book_id"
>;

export default function TimelineFeed({
  records,
  bookStatus,
}: {
  records: RecordRow[];
  bookStatus: Record<string, BookStatus>;
}) {
  if (records.length === 0) {
    return (
      <div className="rounded border border-dashed border-line px-5 py-16 text-center flex flex-col items-center gap-2.5">
        <p className="font-black text-lg">まだ記録がありません</p>
        <p className="text-sm text-ink-soft mb-2">最初の一冊を記録して、タイムラインを灯しましょう。</p>
        <Link href="/new" className="rounded bg-accent text-on-accent font-bold text-sm px-4.5 py-2.5">
          最初の記録を書く
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {records.map((r) => (
        <RecordCard key={r.id} record={r} status={bookStatus[r.book_id] ?? "reading"} />
      ))}
    </div>
  );
}
