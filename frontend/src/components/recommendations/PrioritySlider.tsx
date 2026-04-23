"use client";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function PrioritySlider({ label, value, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="font-body text-[12px] text-muted">{label}</span>
        <span className="font-heading text-[12px] font-semibold tabular text-primary">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-[#F3F4F6] bg-accent disabled:opacity-40 rounded-[2px]"
      />
    </div>
  );
}
