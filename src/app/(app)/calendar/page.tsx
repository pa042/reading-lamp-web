import { createClient } from "@/lib/supabase/server";
import CalendarView from "@/components/CalendarView";
import type { BookStatus } from "@/lib/types";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  return <CalendarView records={records ?? []} bookStatus={bookStatus} />;
}
