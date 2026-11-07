type IconProps = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3.5v-5.5a1.5 1.5 0 0 1 1.5-1.5v0a1.5 1.5 0 0 1 1.5 1.5V20H17a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function NewRecordIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M14.5 4.5 19 9l-9.5 9.5L5 20l1.5-4.5Z" />
      <path d="M13 6l4.5 4.5" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 3.5v4M16 3.5v4" />
      <circle cx="9" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="9" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShelfIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M5 4v16" />
      <path d="M9.5 4.5v15" />
      <path d="M14 4l3 15" />
      <path d="M18.5 4.2l3.3 14.6" />
      <path d="M4 20h18" />
    </svg>
  );
}
