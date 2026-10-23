import { createClient } from "@/lib/supabase/server";
import { coverUrl } from "@/lib/utils";
import ShelfView from "@/components/ShelfView";

export default async function ShelfPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: books }, { data: records }] = await Promise.all([
    supabase.from("books").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("records").select("book_id").eq("user_id", user!.id),
  ]);

  const recordCounts: Record<string, number> = {};
  for (const r of records ?? []) {
    const id = r.book_id as string;
    recordCounts[id] = (recordCounts[id] ?? 0) + 1;
  }

  const coverUrls: Record<string, string | null> = {};
  for (const b of books ?? []) {
    coverUrls[b.id] = coverUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, b.cover_path);
  }

  return <ShelfView books={books ?? []} coverUrls={coverUrls} recordCounts={recordCounts} />;
}
