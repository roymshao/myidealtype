import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Accent top bar */}
        <div style={{ height: 8, background: "#ec4899", width: "100%", flexShrink: 0 }} />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            gap: 0,
          }}
        >
          {/* Site tag */}
          <div style={{ color: "#64748b", fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", marginBottom: 36 }}>
            MATE CALCULATOR
          </div>

          {/* Main headline */}
          <div
            style={{
              color: "#f8fafc",
              fontSize: 68,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: 28,
            }}
          >
            Are your dating standards actually realistic?
          </div>

          {/* Subline */}
          <div
            style={{
              color: "#94a3b8",
              fontSize: 26,
              textAlign: "center",
              marginBottom: 52,
            }}
          >
            Real math on height, income, looks, age, religion &amp; more.
          </div>

          {/* Grade pills */}
          <div style={{ display: "flex", gap: 14 }}>
            {[
              { label: "REALISTIC", color: "#16a34a" },
              { label: "SELECTIVE", color: "#ca8a04" },
              { label: "VERY SELECTIVE", color: "#ea580c" },
              { label: "ELITE", color: "#dc2626" },
              { label: "DELUSIONAL", color: "#7c3aed" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{
                  background: color + "33",
                  border: `2px solid ${color}`,
                  color,
                  borderRadius: 100,
                  padding: "8px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Accent bottom bar */}
        <div style={{ height: 8, background: "#3b82f6", width: "100%", flexShrink: 0 }} />
      </div>
    ),
    size,
  );
}
