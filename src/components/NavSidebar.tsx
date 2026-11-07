"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CalendarIcon, HomeIcon, NewRecordIcon, ShelfIcon } from "./NavIcons";

const NAV_LINKS = [
  { href: "/", label: "ホーム", icon: HomeIcon, match: (p: string) => p === "/" },
  { href: "/new", label: "記録する", icon: NewRecordIcon, match: (p: string) => p.startsWith("/new") },
  { href: "/calendar", label: "カレンダー", icon: CalendarIcon, match: (p: string) => p.startsWith("/calendar") },
  {
    href: "/shelf",
    label: "本棚",
    icon: ShelfIcon,
    match: (p: string) => p.startsWith("/shelf") || p.startsWith("/book"),
  },
];

export default function NavSidebar({ streak, email }: { streak: number; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="hidden md:flex md:w-62 flex-shrink-0 flex-col gap-7 border-r border-line bg-surface px-5 py-7 sticky top-0 h-screen">
      <div>
        <p className="font-black text-lg">リーディングランプ</p>
      </div>
      <div className="flex items-center gap-3 rounded bg-surface-2 border border-line px-3.5 py-2.5">
        <span className="font-mono tabular-nums text-2xl font-bold text-accent-bright">
          {streak}
        </span>
        <span className="text-xs text-ink-soft leading-tight">
          日
          <br />
          連続で記録中
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = link.match(pathname);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-accent-tint text-accent font-bold"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              }`}
              style={active ? { backgroundColor: "var(--color-accent-tint)" } : undefined}
            >
              <Icon />
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col gap-2 text-xs text-ink-soft">
        <p className="truncate">{email}</p>
        <button onClick={handleSignOut} className="text-left hover:text-accent">
          ログアウト
        </button>
      </div>
    </nav>
  );
}
