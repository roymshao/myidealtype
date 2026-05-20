"use client";

interface RangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  accent: string;
  onChange: (min: number, max: number) => void;
  formatValue?: (v: number) => string;
  labels?: string[];
  noMaxLabel?: string;
  noMaxSentinel?: number;
}

export default function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 1,
  accent,
  onChange,
  formatValue,
  labels,
  noMaxLabel,
  noMaxSentinel,
}: RangeSliderProps) {
  const fmt = (v: number) => {
    if (noMaxSentinel !== undefined && v >= noMaxSentinel && noMaxLabel) return noMaxLabel;
    return formatValue ? formatValue(v) : String(v);
  };

  const leftPct = ((valueMin - min) / (max - min)) * 100;
  const rightPct = ((max - valueMax) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-bold" style={{ color: accent }}>
        <span>{fmt(valueMin)}</span>
        <span>{fmt(valueMax)}</span>
      </div>

      <div className="range-track">
        <div className="range-track-bg" />
        <div
          className="range-track-fill"
          style={{ left: `${leftPct}%`, right: `${rightPct}%`, background: accent }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          className="range-input"
          style={{ "--thumb-color": accent } as React.CSSProperties}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(Math.min(v, valueMax - step), valueMax);
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          className="range-input"
          style={{ "--thumb-color": accent } as React.CSSProperties}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(valueMin, Math.max(v, valueMin + step));
          }}
        />
      </div>

      {labels && (
        <div className="flex justify-between">
          {labels.map((l, i) => (
            <span key={i} className="text-xs text-slate-400">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
