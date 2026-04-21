/**
 * ScoreRing — semantic exception component.
 *
 * Per the rebrand's Do/Don'ts §7 the system normally disallows secondary
 * accent colors; the score traffic-light (green/amber/red) is a documented
 * exception because at-a-glance data legibility is a functional requirement.
 *
 * Visual:
 * - Track ring  → Hairline `#dddddd`
 * - Score ring  → Score Hi/Mid/Lo (≥90 green, ≥75 amber, else red)
 * - Numeral     → Ink Black `#222222`, Inter 700, tabular-nums
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
        stroke="var(--color-hairline)"
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
          fill="var(--color-ink)"
          fontSize={size < 48 ? 11 : size < 64 ? 13 : 16}
          fontWeight={700}
          fontFamily="Inter, -apple-system, system-ui, sans-serif"
          style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}
        >
          {Math.round(clamped)}
        </text>
      )}
    </svg>
  );
}
