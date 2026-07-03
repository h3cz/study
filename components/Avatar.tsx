"use client";

/**
 * Avatar — circular profile picture with a graceful fallback.
 * If `url` is set, renders the image (cover-cropped, rounded, bordered).
 * Otherwise draws a fallback circle (--surface-2) with the first letter of
 * `name` in --fg-muted. Always sets alt text for accessibility.
 */
interface AvatarProps {
  url?: string | null;
  name: string;
  size: number;
}

// Only render avatar URLs from our own Supabase storage bucket. Defense-in-depth
// alongside the DB CHECK constraint: never load an arbitrary external <img> on a
// public page (IP-tracking pixels / offensive images). Anything else → fallback.
const STORAGE_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/avatars/`
  : null;

function isTrustedAvatarUrl(url: string): boolean {
  return STORAGE_PREFIX !== null && url.startsWith(STORAGE_PREFIX);
}

export function Avatar({ url, name, size }: AvatarProps) {
  const letter = (name.trim()[0] ?? "?").toUpperCase();
  const safeUrl = url && isTrustedAvatarUrl(url) ? url : null;

  if (safeUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeUrl}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid var(--border)",
          flexShrink: 0,
          display: "block",
          background: "var(--surface-2)",
        }}
      />
    );
  }

  return (
    <span
      aria-label={`${name}'s avatar`}
      role="img"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--fg-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "var(--font-display)",
        fontSize: Math.round(size * 0.45),
        fontWeight: 400,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {letter}
    </span>
  );
}

export default Avatar;
