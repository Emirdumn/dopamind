/**
 * ScoreRing — Midnight Showroom semantic-exception component.
 *
 * Per the doc §7 the system normally routes all accent energy through the
 * primary indigo gradient; the score traffic-light (green / amber / red)
 * is a documented exception because at-a-glance data legibility is a
 * functional requirement. The component also renders on the darkest
 * surfaces, so contrast ratios for the numeral and track are higher than
 * MD3 defaults.
 *
 * Visual:
 * - Track ring  → `outline-variant` @ 22% (ghost trace, never solid)
 * - Score ring  → score.hi/mid/lo (≥90 green, ≥75 amber, else red)
 * - Numeral     → `on-surface` (#dce1fb), Inter 700, tabular-nums, tight tracking
 */
interface Props {
  score: number;
  size?: number;
  /** Stroke width. Scales gently with size by default. */
  strokeWidth?: number;
  /** Hide the centered numeral (render ring only). */
  hideLabel?: boolean;
  className?: string;
}

export function ScoreRing({
  score,
  size = 56,
  strokeWidth,
  hideLabel = false,
  className,
}: Props) {
  const sw = strokeWidth ?? Math.max(3, Math.round(size * 0.065));
  const r  = (size - sw * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c  = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const arc = (clamped / 100) * c;

  const stroke =
    clamped >= 90 ? "var(--c-score-hi)" :
    clamped >= 75 ? "var(--c-score-mid)" :
                    "var(--c-score-lo)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score ${clamped} out of 100`}
      className={className}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(67, 71, 88, 0.22)"
        strokeWidth={sw}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${arc} ${c}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {!hideLabel && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--color-on-surface)"
          fontSize={size < 48 ? 11 : size < 64 ? 13 : 16}
          fontWeight={700}
          fontFamily="var(--font-inter), Inter, -apple-system, system-ui, sans-serif"
          style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}
        >
          {Math.round(clamped)}
        </text>
      )}
    </svg>
  );
}
