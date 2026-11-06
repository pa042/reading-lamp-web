import { createClient, getUser } from "@/lib/supabase/server";
import RecordForm from "@/components/RecordForm";

export default async function NewRecordPage({ searchParams }: PageProps<"/new">) {
  const params = await searchParams;
  const presetBookId = typeof params.book === "string" ? params.book : undefined;

  const supabase = await createClient();
  const user = await getUser();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <section>
      <header className="mb-7">
        <p className="text-xs tracking-[0.16em] uppercase text-accent font-bold mb-2">記録する</p>
        <h1 className="text-2xl font-black mb-2">印象に残ったことを書く</h1>
        <p className="text-sm text-ink-soft">心に残ったフレーズや考えたことを、そのまま書いてみましょう。</p>
      </header>
      <RecordForm books={books ?? []} presetBookId={presetBookId} />
    </section>
  );
}
