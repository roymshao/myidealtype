"use client";

import { useState } from "react";
import { HERITAGE_GROUPS } from "@/lib/formatters";

interface HeritageFilterProps {
  selected: string[];
  accent: string;
  onChange: (heritages: string[]) => void;
}

export default function HeritageFilter({ selected, accent, onChange }: HeritageFilterProps) {
  const [openRegion, setOpenRegion] = useState<string | null>(null);
  const isAny = selected.length === 0;

  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((h) => h !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  function countInRegion(regionKey: string): number {
    const group = HERITAGE_GROUPS.find((g) => g.key === regionKey);
    if (!group) return 0;
    return group.items.filter((item) => selected.includes(item.key)).length;
  }

  return (
    <div className="space-y-3">
      {/* Top row: Any + region tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { onChange([]); setOpenRegion(null); }}
          className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-all"
          style={
            isAny
              ? { borderColor: accent, background: accent, color: "white" }
              : { borderColor: "#e2e8f0", background: "white", color: "#64748b" }
          }
        >
          Any / No Preference
        </button>
        {HERITAGE_GROUPS.map((group) => {
          const count = countInRegion(group.key);
          const isOpen = openRegion === group.key;
          return (
            <button
              key={group.key}
              onClick={() => setOpenRegion(isOpen ? null : group.key)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold border transition-all flex items-center gap-1"
              style={
                count > 0
                  ? { borderColor: accent, background: accent + "15", color: accent }
                  : isOpen
                  ? { borderColor: "#94a3b8", background: "#f1f5f9", color: "#334155" }
                  : { borderColor: "#e2e8f0", background: "white", color: "#64748b" }
              }
            >
              {group.region}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white leading-none"
                  style={{ background: accent }}
                >
                  {count}
                </span>
              )}
              <span className="opacity-60">{isOpen ? "▲" : "▾"}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded region chips */}
      {openRegion && (() => {
        const group = HERITAGE_GROUPS.find((g) => g.key === openRegion);
        if (!group) return null;
        return (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500 mb-2">{group.region}</p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const active = selected.includes(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                    style={
                      active
                        ? { borderColor: accent, background: accent, color: "white" }
                        : { borderColor: "#cbd5e1", background: "white", color: "#475569" }
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                const regionKeys = group.items.map((i) => i.key);
                const withoutRegion = selected.filter((h) => !regionKeys.includes(h));
                onChange(withoutRegion);
              }}
              className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition"
            >
              Clear {group.region}
            </button>
          </div>
        );
      })()}

      {/* Selection summary */}
      {!isAny && (
        <p className="text-xs text-slate-500">
          {selected.length} heritage{selected.length !== 1 ? "s" : ""} selected
          {" · "}
          <button
            onClick={() => onChange([])}
            className="underline hover:text-slate-700 transition"
          >
            Clear all
          </button>
        </p>
      )}
    </div>
  );
}
