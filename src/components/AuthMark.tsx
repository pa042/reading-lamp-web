export default function AuthMark() {
  return (
    <div className="flex items-center gap-2.5 mb-7 justify-center">
      <svg viewBox="0 0 100 100" className="w-9 h-9 flex-shrink-0" aria-hidden>
        <rect width="100" height="100" rx="22" fill="var(--color-accent)" />
        <circle cx="50" cy="30" r="10" fill="#ffe9b3" />
        <path
          d="M50 14 L50 20 M34 24 L39 28 M66 24 L61 28"
          stroke="#ffe9b3"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M20 78 L48 68 L48 46 L20 56 Z" fill="var(--color-surface)" />
        <path d="M80 78 L52 68 L52 46 L80 56 Z" fill="var(--color-surface)" />
        <rect x="48" y="46" width="4" height="22" fill="var(--color-surface-2)" />
      </svg>
      <p className="text-sm tracking-[0.2em] uppercase text-accent font-bold">リーディングランプ</p>
    </div>
  );
}
