import { STATUS_LABEL, type BookStatus } from "@/lib/types";

const STYLE: Record<BookStatus, string> = {
  reading: "text-accent",
  done: "text-status-done",
  want: "text-status-want",
};

const BG: Record<BookStatus, string> = {
  reading: "var(--color-accent-tint)",
  done: "var(--color-status-done-tint)",
  want: "var(--color-status-want-tint)",
};

export default function StatusChip({ status }: { status: BookStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${STYLE[status]}`}
      style={{ backgroundColor: BG[status] }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
