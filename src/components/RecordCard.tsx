import Link from "next/link";
import type { BookStatus, ReadingRecord } from "@/lib/types";
import { formatDateJa, formatPageRange } from "@/lib/utils";
import StatusChip from "./StatusChip";

export default function RecordCard({
  record,
  status,
}: {
  record: Pick<ReadingRecord, "id" | "book_title" | "date" | "page_from" | "page_to" | "summary" | "raw_text">;
  status: BookStatus;
}) {
  const pageText = formatPageRange(record);
  return (
    <Link
      href={`/detail/${record.id}`}
      className="flex gap-3 items-start rounded border border-line bg-surface px-4 py-3.5 transition-colors hover:border-accent"
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2 gap-2">
          <StatusChip status={status} />
          <time className="font-mono text-xs text-ink-soft tabular-nums shrink-0">
            {formatDateJa(record.date)}
            {pageText ? ` ・ ${pageText}` : ""}
          </time>
        </div>
        <h3 className="text-base font-bold mb-1.5">{record.book_title}</h3>
        <p className="text-sm text-ink-soft line-clamp-3 whitespace-pre-line">
          {record.summary || record.raw_text}
        </p>
      </div>
    </Link>
  );
}
