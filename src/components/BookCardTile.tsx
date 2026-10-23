import Link from "next/link";
import type { Book } from "@/lib/types";
import CoverBox from "./CoverBox";
import StatusChip from "./StatusChip";

export default function BookCardTile({
  book,
  coverUrl,
  recordCount,
}: {
  book: Book;
  coverUrl: string | null;
  recordCount: number;
}) {
  return (
    <Link
      href={`/book/${book.id}`}
      className="block rounded border border-line bg-surface p-3.5 transition-colors hover:border-accent"
    >
      <CoverBox url={coverUrl} title={book.title} size="md" />
      <div className="mt-2">
        <StatusChip status={book.status} />
      </div>
      <h3 className="text-base font-bold mt-2 mb-0.5">{book.title}</h3>
      {book.author && <p className="text-sm text-ink-soft mb-1.5">{book.author}</p>}
      <p className="text-xs text-ink-soft">{recordCount > 0 ? `${recordCount}件の記録` : "まだ記録なし"}</p>
    </Link>
  );
}
