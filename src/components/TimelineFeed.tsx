"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export type TimelineCard = {
  recordId: string;
  bookTitle: string;
  bullet: string;
};

const SLIDE_SPEED = 0.05; // px / ms

export default function TimelineFeed({ cards }: { cards: TimelineCard[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    function stop() {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      vp?.classList.remove("auto-sliding");
    }

    function start() {
      stop();
      vp!.classList.add("auto-sliding");
      let last: number | null = null;
      function tick(now: number) {
        if (!vp || !document.body.contains(vp)) {
          stop();
          return;
        }
        if (last != null) {
          const maxScroll = vp.scrollWidth - vp.clientWidth;
          if (maxScroll > 0) {
            const next = vp.scrollLeft + SLIDE_SPEED * (now - last);
            vp.scrollLeft = next >= maxScroll ? 0 : next;
          }
        }
        last = now;
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    const onPointerDown = () => stop();
    vp.addEventListener("pointerdown", onPointerDown);
    start();

    return () => {
      stop();
      vp.removeEventListener("pointerdown", onPointerDown);
    };
  }, [cards]);

  function step(dir: 1 | -1) {
    const vp = viewportRef.current;
    if (!vp) return;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    vp.classList.remove("auto-sliding");
    const card = vp.querySelector<HTMLElement>("[data-feed-card]");
    const width = card ? card.getBoundingClientRect().width + 14 : 300;
    vp.scrollBy({ left: dir * width, behavior: "smooth" });
  }

  if (cards.length === 0) {
    return (
      <div className="rounded border border-dashed border-line px-5 py-16 text-center flex flex-col items-center gap-2.5">
        <p className="font-black text-lg">まだ記録がありません</p>
        <p className="text-sm text-ink-soft mb-2">最初の一冊を記録して、タイムラインを灯しましょう。</p>
        <Link
          href="/new"
          className="rounded bg-accent text-on-accent font-bold text-sm px-4.5 py-2.5"
        >
          最初の記録を書く
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-2.5">
        <button
          type="button"
          aria-label="前の記録"
          onClick={() => step(-1)}
          className="w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="次の記録"
          onClick={() => step(1)}
          className="w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center text-ink-soft hover:text-accent hover:border-accent"
        >
          →
        </button>
      </div>
      <div
        ref={viewportRef}
        className="feed-viewport overflow-x-auto overflow-y-hidden pb-1.5 -mx-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div className="flex gap-3.5 px-1">
          {cards.map((c, i) => (
            <Link
              key={`${c.recordId}-${i}`}
              data-feed-card
              href={`/detail/${c.recordId}`}
              className="rounded border border-line border-l-[3px] bg-surface px-4 py-3.5 transition-colors hover:border-accent"
              style={{
                flex: "0 0 min(300px, 80vw)",
                scrollSnapAlign: "start",
                borderLeftColor: "var(--color-accent)",
              }}
            >
              {c.bookTitle && (
                <p className="text-[11px] font-bold tracking-wide uppercase text-accent mb-1.5">
                  {c.bookTitle}
                </p>
              )}
              <p className="text-sm text-ink line-clamp-3 whitespace-pre-line">{c.bullet}</p>
            </Link>
          ))}
        </div>
      </div>
      <style jsx global>{`
        .feed-viewport.auto-sliding {
          scroll-snap-type: none;
        }
      `}</style>
    </div>
  );
}
