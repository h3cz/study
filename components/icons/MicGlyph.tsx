/**
 * MicGlyph — minimal stroke microphone glyph for the "via voice" marker.
 * Matches the 1.5px stroke language used across other icons in this directory.
 */

interface MicGlyphProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function MicGlyph({ size = 12, className, style }: MicGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <rect
        x="6"
        y="2"
        width="4"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
