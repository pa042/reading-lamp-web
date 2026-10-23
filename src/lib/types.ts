export type BookStatus = "reading" | "done" | "want";

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  status: BookStatus;
  cover_path: string | null;
  created_at: string;
  finished_at: string | null;
};

export type ReadingRecord = {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  date: string; // YYYY-MM-DD
  page_from: number | null;
  page_to: number | null;
  raw_text: string;
  summary: string;
  created_at: string;
};

export const STATUS_LABEL: Record<BookStatus, string> = {
  reading: "読んでいる",
  done: "読み終えた",
  want: "気になる",
};
