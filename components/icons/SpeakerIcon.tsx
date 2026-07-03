/**
 * SpeakerIcon — minimal stroke speaker glyph.
 * Matches the 1.5px stroke language used across other icons in this directory.
 * Use `speaking` prop to show sound waves vs. muted.
 */

interface SpeakerIconProps {
  size?: number;
  speaking?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SpeakerIcon({ size = 16, speaking = false, className, style }: SpeakerIconProps) {
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
      {/* Speaker body */}
      <path
        d="M2 5.5h2.5L8 2.5v11L4.5 10.5H2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sound waves — shown when speaking=true */}
      {speaking ? (
        <>
          <path
            d="M10 5.5a3 3 0 0 1 0 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M11.5 3.5a5.5 5.5 0 0 1 0 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        /* Static single small arc when idle */
        <path
          d="M10 5.5a3 3 0 0 1 0 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      )}
    </svg>
  );
}
