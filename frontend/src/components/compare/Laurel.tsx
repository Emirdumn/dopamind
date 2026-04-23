/**
 * Laurel wreath — half, drawn facing left by default. Flip via the
 * `mirror` prop to produce the right half.
 *
 * The Guest-Favorite / ArabaIQ Top Pick lockup flanks a centered
 * rating with one laurel on each side. Rendering a single component
 * twice (with `mirror` on one) keeps the SVG tiny.
 *
 * Color inherits from `currentColor` — paired with `text-ink` in use.
 */
interface Props {
  size?: number;
  mirror?: boolean;
  className?: string;
}

export default function Laurel({ size = 48, mirror = false, className }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 48 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
    >
      {/* Central stem — sweeps from the bottom-outer corner up and in */}
      <path d="M42 56 C 34 46, 26 32, 22 6" />

      {/* Six stylized leaves branching off the stem, small → large */}
      <path d="M22 10 C 17 11, 14 9, 12 5" fill="currentColor" fillOpacity="0.08" />
      <path d="M24 18 C 18 19, 13 17, 10 11" fill="currentColor" fillOpacity="0.08" />
      <path d="M27 26 C 20 28, 14 26, 10 20" fill="currentColor" fillOpacity="0.08" />
      <path d="M30 34 C 22 37, 16 36, 12 30" fill="currentColor" fillOpacity="0.08" />
      <path d="M34 42 C 27 46, 20 46, 15 41" fill="currentColor" fillOpacity="0.08" />
      <path d="M38 50 C 32 54, 24 55, 19 51" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}
