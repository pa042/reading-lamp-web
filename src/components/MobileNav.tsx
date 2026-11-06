"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "ホーム", match: (p: string) => p === "/" },
  { href: "/new", label: "記録する", match: (p: string) => p.startsWith("/new") },
  { href: "/calendar", label: "カレンダー", match: (p: string) => p.startsWith("/calendar") },
  { href: "/shelf", label: "本棚", match: (p: string) => p.startsWith("/shelf") || p.startsWith("/book") },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-line bg-surface">
      {NAV_LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-[11px] active:bg-page ${
              active ? "text-accent font-bold" : "text-ink-soft"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
