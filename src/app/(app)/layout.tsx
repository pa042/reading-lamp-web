import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/utils";
import NavSidebar from "@/components/NavSidebar";
import MobileNav from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: records } = await supabase
    .from("records")
    .select("date")
    .eq("user_id", user.id);

  const dateSet = new Set((records ?? []).map((r) => r.date as string));
  const streak = computeStreak(dateSet);

  return (
    <div className="flex min-h-screen">
      <NavSidebar streak={streak} email={user.email ?? ""} />
      <main className="flex-1 px-6 py-8 pb-24 md:pb-10 md:px-10 md:py-10 outline-none">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
