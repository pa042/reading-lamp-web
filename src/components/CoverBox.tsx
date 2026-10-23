import Image from "next/image";

export default function CoverBox({
  url,
  title,
  size = "md",
}: {
  url: string | null;
  title: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: 56, md: 128, lg: 160 }[size];
  const initial = title.trim() ? Array.from(title.trim())[0] : "";

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded bg-surface-2 border border-line"
      style={{ width: dims, aspectRatio: "2 / 3" }}
    >
      {url ? (
        <Image src={url} alt="" fill sizes={`${dims}px`} className="object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(160deg, var(--color-accent-tint), var(--color-status-done-tint))",
          }}
        >
          <span className="font-black text-accent opacity-80" style={{ fontSize: dims * 0.26 }}>
            {initial}
          </span>
        </div>
      )}
    </div>
  );
}
