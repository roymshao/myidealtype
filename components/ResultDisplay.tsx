"use client";

import { useCallback, useState, useMemo } from "react";
import type { ProbabilityResult, Criteria, GenderStats } from "@/lib/probability";
import { calculate, MAX_WEIGHT_MALE, MAX_WEIGHT_FEMALE } from "@/lib/probability";
import { formatHeight, formatWeight, formatCount, formatIncome } from "@/lib/formatters";
import { getPersonalityTitle, generateRoastLines, getShareTexts } from "@/lib/resultMessages";
import AdBanner from "./AdBanner";

interface CityEntry {
  id: string; name: string; state: string; aliases: string[];
  pop_male: number; pop_female: number; income_ratio?: number;
}

interface ResultDisplayProps {
  result: ProbabilityResult;
  criteria: Criteria;
  seekerGender: "male" | "female";
  selectedCity: string | null;
  // City comparison
  cities?: CityEntry[];
  stats?: GenderStats;
  maxH?: number;
  maxW?: number;
  onSwitchCity?: (city: CityEntry | null) => void;
}

const TARGET_LABEL: Record<string, string> = { male: "women", female: "men" };

export default function ResultDisplay({
  result, criteria, seekerGender, selectedCity,
  cities, stats, maxH: maxHProp, maxW: maxWProp, onSwitchCity,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const maxW = seekerGender === "female" ? MAX_WEIGHT_MALE : MAX_WEIGHT_FEMALE;
  const accent = seekerGender === "female" ? "#3b82f6" : "#ec4899";

  const personality = getPersonalityTitle(result.probability, seekerGender);
  const roastLines = generateRoastLines(criteria, result, seekerGender);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTexts = getShareTexts(result, personality, seekerGender, shareUrl);

  const downloadLandscapeCard = useCallback(() => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    const W = 540, H = 920;
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(0.55, "#1e293b");
    bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Accent bar top
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 5);

    // Site branding
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("MATE CALCULATOR · matescore.io", W / 2, 30);

    // Personality
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(`${personality.emoji}  ${personality.title}`, W / 2, 54);

    // Thin divider
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 66); ctx.lineTo(W - 60, 66); ctx.stroke();

    // Big percentage
    ctx.fillStyle = result.gradeColor;
    ctx.font = "bold 118px system-ui, sans-serif";
    ctx.fillText(result.percentage, W / 2, 195);

    // Grade badge
    ctx.fillStyle = result.gradeColor + "33";
    fillRoundedRect(ctx, W / 2 - 88, 206, 176, 34, 10);
    ctx.fillStyle = result.gradeColor;
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText(result.grade.toUpperCase(), W / 2, 228);

    // Match text + count
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(`of ${TARGET_LABEL[seekerGender]} in the US match`, W / 2, 258);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 17px system-ui, sans-serif";
    ctx.fillText(formatCount(result.estimatedCount), W / 2, 281);

    if (selectedCity && result.localCount !== null) {
      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(`~${result.localCount.toLocaleString()} in ${selectedCity} metro`, W / 2, 300);
    }

    // Criteria chips row
    const chips = [
      `Age ${criteria.minAge}–${criteria.maxAge}`,
      `${formatHeight(criteria.minHeightIn)}–${criteria.maxHeightIn >= (seekerGender === "female" ? 80 : 75) ? "No max" : formatHeight(criteria.maxHeightIn)}`,
      criteria.minIncomeK > 0 ? `${formatIncome(criteria.minIncomeK)}+ income` : null,
      criteria.minLooksPercentile > 1 || criteria.maxLooksPercentile < 100
        ? `Top ${criteria.minLooksPercentile}%${criteria.maxLooksPercentile < 100 ? `–${criteria.maxLooksPercentile}%` : ""} looks`
        : null,
    ].filter(Boolean) as string[];

    ctx.font = "10px system-ui, sans-serif";
    const chipTotalW = chips.reduce((sum, c) => sum + ctx.measureText(c).width + 20, 0) + (chips.length - 1) * 6;
    let chipX = W / 2 - chipTotalW / 2;
    const chipY = 316;
    for (const chip of chips) {
      const cw = ctx.measureText(chip).width + 20;
      ctx.fillStyle = "#1e293b";
      fillRoundedRect(ctx, chipX, chipY - 14, cw, 22, 6);
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "left";
      ctx.fillText(chip, chipX + 10, chipY + 2);
      chipX += cw + 6;
    }

    // Divider
    ctx.textAlign = "center";
    ctx.strokeStyle = "#334155";
    ctx.beginPath(); ctx.moveTo(36, 344); ctx.lineTo(W - 36, 344); ctx.stroke();

    // Breakdown header
    ctx.fillStyle = "#475569";
    ctx.font = "bold 9px system-ui, sans-serif";
    ctx.fillText("BREAKDOWN", W / 2, 360);

    // Breakdown rows — label left, bar center, % right, all within safe bounds
    const rows = [
      { label: "Age",           v: result.breakdown.age },
      { label: "Height",        v: result.breakdown.height },
      { label: "Weight",        v: result.breakdown.weight },
      { label: "Income",        v: result.breakdown.income },
      { label: "Net Worth",     v: result.breakdown.wealth },
      { label: "Attractiveness",v: result.breakdown.looks },
      { label: "Relationship",  v: result.breakdown.relationship },
      { label: "Education",     v: result.breakdown.education },
      { label: "Heritage",      v: result.breakdown.heritage },
      { label: "Non-Smoker",    v: result.breakdown.smoking },
      ...(result.breakdown.only_child !== undefined
        ? [{ label: "独生子女", v: result.breakdown.only_child }]
        : []),
      ...(result.breakdown.tizhinei !== undefined
        ? [{ label: "体制内", v: result.breakdown.tizhinei }]
        : []),
    ];

    const rowStart = 372;
    const rowGap = 33;
    const labelX = 36;
    const barLeft = 148;
    const barRight = W - 72;   // 468 — leaves 72px on right for pct text
    const barW = barRight - barLeft;  // 320px
    const pctX = W - 12;

    rows.forEach((row, i) => {
      const ry = rowStart + i * rowGap;
      ctx.textAlign = "left";
      ctx.fillStyle = "#64748b";
      ctx.font = "10.5px system-ui, sans-serif";
      ctx.fillText(row.label, labelX, ry + 8);
      // track
      ctx.fillStyle = "#1e293b";
      fillRoundedRect(ctx, barLeft, ry, barW, 8, 4);
      // fill
      ctx.fillStyle = accent + "cc";
      fillRoundedRect(ctx, barLeft, ry, Math.max(4, barW * Math.min(1, row.v)), 8, 4);
      // percentage — right-aligned, safely inside canvas
      ctx.textAlign = "right";
      ctx.fillStyle = "#64748b";
      ctx.font = "9.5px system-ui, sans-serif";
      ctx.fillText(`${(row.v * 100).toFixed(1)}%`, pctX, ry + 8);
    });

    // Message quote
    const msgY = rowStart + rows.length * rowGap + 14;
    ctx.textAlign = "center";
    ctx.fillStyle = "#475569";
    ctx.font = "italic 12px system-ui, sans-serif";
    wrapText(ctx, `"${result.message}"`, W / 2, msgY, W - 72, 19);

    // CTA bar + text
    ctx.fillStyle = accent;
    fillRoundedRect(ctx, W / 2 - 120, H - 78, 240, 44, 12);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText("Calculate yours → matescore.io", W / 2, H - 51);

    ctx.textAlign = "left";

    const link = document.createElement("a");
    link.download = "my-mate-score.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [result, criteria, seekerGender, selectedCity, maxW, accent, personality]);

  const downloadStoryCard = useCallback(() => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = 540 * scale;
    canvas.height = 960 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, 960);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(0.6, "#1e293b");
    bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 540, 960);

    // Accent top bar
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 540, 6);

    // Site branding
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MATE CALCULATOR · matescore.io", 270, 50);

    // Personality emoji (large)
    ctx.font = "72px system-ui, sans-serif";
    ctx.fillText(personality.emoji, 270, 180);

    // Personality title
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText(personality.title, 270, 230);

    // Divider
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 255);
    ctx.lineTo(460, 255);
    ctx.stroke();

    // Percentage
    ctx.fillStyle = result.gradeColor;
    ctx.font = "bold 110px system-ui, sans-serif";
    ctx.fillText(result.percentage, 270, 390);

    // Grade badge
    ctx.fillStyle = result.gradeColor + "33";
    fillRoundedRect(ctx, 185, 405, 170, 36, 12);
    ctx.fillStyle = result.gradeColor;
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(result.grade.toUpperCase(), 270, 429);

    // Match label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText(`of ${TARGET_LABEL[seekerGender]} in the US match`, 270, 470);

    // Count
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText(formatCount(result.estimatedCount), 270, 498);

    if (selectedCity && result.localCount !== null) {
      ctx.fillStyle = "#64748b";
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText(`~${result.localCount.toLocaleString()} in ${selectedCity} metro`, 270, 522);
    }

    // Divider
    ctx.strokeStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(80, 548);
    ctx.lineTo(460, 548);
    ctx.stroke();

    // Criteria chips
    const chips = [
      `Age ${criteria.minAge}–${criteria.maxAge}`,
      formatHeight(criteria.minHeightIn) + (criteria.maxHeightIn >= (seekerGender === "female" ? 80 : 75) ? "+ height" : `–${formatHeight(criteria.maxHeightIn)}`),
      criteria.minIncomeK > 0 ? `$${criteria.minIncomeK}K+ income` : "Any income",
      criteria.minLooksPercentile > 1 || criteria.maxLooksPercentile < 100 ? `Top ${criteria.minLooksPercentile}%${criteria.maxLooksPercentile < 100 ? `–${criteria.maxLooksPercentile}%` : ""} looks` : "Any looks",
    ];

    ctx.font = "13px system-ui, sans-serif";
    let chipX = 60;
    let chipY = 580;
    chips.forEach((chip) => {
      const w = ctx.measureText(chip).width + 24;
      if (chipX + w > 480) { chipX = 60; chipY += 38; }
      ctx.fillStyle = "#1e293b";
      fillRoundedRect(ctx, chipX, chipY - 16, w, 26, 8);
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "left";
      ctx.fillText(chip, chipX + 12, chipY + 3);
      chipX += w + 8;
    });

    // Message quote
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";
    ctx.font = "italic 15px system-ui, sans-serif";
    wrapText(ctx, `"${result.message}"`, 270, 700, 400, 24);

    // CTA
    ctx.fillStyle = accent;
    fillRoundedRect(ctx, 155, 800, 230, 50, 14);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.fillText("Calculate yours →", 270, 832);

    // Bottom branding
    ctx.fillStyle = "#334155";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("matescore.io", 270, 920);

    ctx.textAlign = "left";

    const link = document.createElement("a");
    link.download = "my-mate-score-story.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [result, criteria, seekerGender, selectedCity, accent, personality]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const copyTikTokCaption = useCallback(() => {
    navigator.clipboard.writeText(shareTexts.tiktokCaption).then(() => {
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2000);
    });
  }, [shareTexts.tiktokCaption]);

  const breakdownRows: { label: string; value: number }[] = [
    { label: "Age range", value: result.breakdown.age },
    { label: "Height range", value: result.breakdown.height },
    { label: "Weight range", value: result.breakdown.weight },
    { label: "Income range", value: result.breakdown.income },
    { label: "Net worth", value: result.breakdown.wealth },
    { label: "Attractiveness", value: result.breakdown.looks },
    { label: "Relationship status", value: result.breakdown.relationship },
    { label: "Education", value: result.breakdown.education },
    { label: "Heritage / origin", value: result.breakdown.heritage },
    { label: "Non-smoker", value: result.breakdown.smoking },
    { label: "Nativity", value: result.breakdown.nativity },
    ...(result.breakdown.only_child !== undefined
      ? [{ label: "独生子女", value: result.breakdown.only_child }]
      : []),
    ...(result.breakdown.tizhinei !== undefined
      ? [{ label: "体制内工作", value: result.breakdown.tizhinei }]
      : []),
  ];

  return (
    <div className="space-y-5">
      {/* Main result card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Match probability</p>
            <p className="text-6xl font-black leading-none" style={{ color: result.gradeColor }}>{result.percentage}</p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ background: result.gradeColor + "22", color: result.gradeColor }}
              >
                {result.grade}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nationally</p>
            <p className="text-2xl font-bold text-slate-800">{formatCount(result.estimatedCount)}</p>
            {selectedCity && result.localCount !== null && (
              <>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-3 mb-1">{selectedCity} area</p>
                <p className="text-xl font-bold text-slate-800">~{result.localCount.toLocaleString()}</p>
              </>
            )}
          </div>
        </div>

        {/* Personality title */}
        <div
          className="mt-5 rounded-xl px-4 py-3"
          style={{ background: result.gradeColor + "11", borderLeft: `3px solid ${result.gradeColor}` }}
        >
          <p className="font-bold text-slate-800 text-sm">
            {personality.emoji}&nbsp;&nbsp;{personality.title}
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{personality.subtitle}</p>
        </div>

        {/* Message */}
        <p className="mt-4 text-slate-600 italic border-t border-slate-100 pt-4 text-sm">
          &ldquo;{result.message}&rdquo;
        </p>
      </div>

      {/* Roast section */}
      {roastLines.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">What the numbers really mean</p>
          <div className="space-y-2">
            {roastLines.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base leading-tight mt-0.5">{line.icon}</span>
                <p className="text-sm text-amber-900 leading-relaxed">{line.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Probability breakdown</p>
        <div className="space-y-2">
          {breakdownRows.map((row) => (
            <BreakdownRow key={row.label} label={row.label} value={row.value} accent={accent} />
          ))}
        </div>
      </div>

      <AdBanner slot="REPLACE_RESULTS_AD_SLOT" format="rectangle" className="rounded-xl" />

      {/* Share section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Share your result</p>

        <div className="flex flex-wrap gap-2">
          {/* X/Twitter */}
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareTexts.twitter)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
          >
            <XIcon /> Share on X
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareTexts.whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600 transition"
          >
            <WhatsAppIcon /> WhatsApp
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
          >
            <FacebookIcon /> Facebook
          </a>

          {/* TikTok caption */}
          <button
            onClick={copyTikTokCaption}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <TikTokIcon /> {captionCopied ? "Copied!" : "TikTok Caption"}
          </button>

          {/* Story download */}
          <button
            onClick={downloadStoryCard}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <StoryIcon /> Story Card
          </button>

          {/* Landscape download */}
          <button
            onClick={downloadLandscapeCard}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <DownloadIcon /> Download Card
          </button>

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <LinkIcon /> {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        {captionCopied && (
          <p className="mt-2 text-xs text-slate-500 italic">TikTok caption copied — paste it into your video description!</p>
        )}
      </div>

      {/* City comparison card */}
      {cities && stats && criteria && maxHProp && maxWProp && (
        <CitySwitcherCard
          cities={cities}
          stats={stats}
          criteria={criteria}
          seekerGender={seekerGender}
          maxH={maxHProp}
          maxW={maxWProp}
          baseResult={result}
          currentCityLabel={selectedCity}
          accent={accent}
          onSwitchCity={onSwitchCity}
        />
      )}

      {/* Affiliate */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold mb-1 text-slate-800">Finding your match is hard. These apps help.</p>
        <p className="text-xs text-slate-500 mb-3">Your criteria are specific. Cast a wide net.</p>
        <div className="flex flex-wrap gap-2">
          <a href="https://tinder.com" target="_blank" rel="noopener noreferrer nofollow"
            className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition">Try Tinder</a>
          <a href="https://bumble.com" target="_blank" rel="noopener noreferrer nofollow"
            className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-yellow-500 transition">Try Bumble</a>
          <a href="https://match.com" target="_blank" rel="noopener noreferrer nofollow"
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition">Try Match.com</a>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, accent }: { label: string; value: number; accent: string }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-xs text-slate-600 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, value * 100)}%`, background: accent }}
        />
      </div>
      <span className="w-12 text-right text-xs font-mono text-slate-600">{pct}%</span>
    </div>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const cr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, cr);
  } else {
    ctx.moveTo(x + cr, y);
    ctx.lineTo(x + w - cr, y);
    ctx.arcTo(x + w, y, x + w, y + cr, cr);
    ctx.lineTo(x + w, y + h - cr);
    ctx.arcTo(x + w, y + h, x + w - cr, y + h, cr);
    ctx.lineTo(x + cr, y + h);
    ctx.arcTo(x, y + h, x, y + h - cr, cr);
    ctx.lineTo(x, y + cr);
    ctx.arcTo(x, y, x + cr, y, cr);
    ctx.closePath();
  }
  ctx.fill();
}

function XIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}
function WhatsAppIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>;
}
function FacebookIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function TikTokIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>;
}
function StoryIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>;
}
function DownloadIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
function LinkIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
}

// ─── City Switcher Card ───────────────────────────────────────────────────────

interface CitySwitcherProps {
  cities: CityEntry[];
  stats: GenderStats;
  criteria: Criteria;
  seekerGender: "male" | "female";
  maxH: number;
  maxW: number;
  baseResult: ProbabilityResult;
  currentCityLabel: string | null;
  accent: string;
  onSwitchCity?: (city: CityEntry | null) => void;
}

function CitySwitcherCard({
  cities, stats, criteria, seekerGender, maxH, maxW,
  baseResult, currentCityLabel, accent, onSwitchCity,
}: CitySwitcherProps) {
  const isFemaleSeeking = seekerGender === "female";
  const [input, setInput] = useState("");
  const [compareCity, setCompareCity] = useState<CityEntry | null>(null);
  const [applied, setApplied] = useState(false);

  const handleInput = (val: string) => {
    setInput(val);
    setApplied(false);
    const lower = val.toLowerCase().trim();
    if (!lower) { setCompareCity(null); return; }
    const match = cities.find(
      (c) =>
        c.name.toLowerCase() === lower ||
        `${c.name.toLowerCase()}, ${c.state.toLowerCase()}` === lower ||
        c.aliases.some((a) => a.toLowerCase() === lower),
    );
    setCompareCity(match ?? null);
  };

  const compareResult = useMemo(() => {
    if (!compareCity) return null;
    const pop = isFemaleSeeking ? compareCity.pop_male : compareCity.pop_female;
    return calculate(criteria, stats, pop, maxH, maxW, compareCity.income_ratio ?? 1.0);
  }, [compareCity, criteria, stats, isFemaleSeeking, maxH, maxW]);

  const baseCount = baseResult.localCount ?? baseResult.estimatedCount;
  const baseLabel = currentCityLabel ?? "Nationally";

  const incomeShift = compareCity
    ? Math.round(((compareCity.income_ratio ?? 1.0) - 1) * 100)
    : 0;

  const handleApply = () => {
    if (!compareCity || !onSwitchCity) return;
    onSwitchCity(compareCity);
    setApplied(true);
  };

  const countDelta = compareResult
    ? ((compareResult.localCount ?? 0) - baseCount)
    : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
        📍 How do your odds change by city?
      </p>

      {/* Current baseline */}
      <div className="flex items-center justify-between mb-3 rounded-lg px-3 py-2.5"
        style={{ background: accent + "10" }}>
        <span className="text-xs font-semibold text-slate-600">
          {baseLabel}
        </span>
        <span className="text-sm font-black" style={{ color: accent }}>
          ~{baseCount.toLocaleString()} people
        </span>
      </div>

      {/* City input */}
      <div className="relative mb-3">
        <input
          type="text"
          list="compare-cities-list"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Type any city to compare…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition pr-8"
          style={{ focusRingColor: accent } as React.CSSProperties}
        />
        {input && (
          <button
            onClick={() => { setInput(""); setCompareCity(null); setApplied(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
          >×</button>
        )}
        <datalist id="compare-cities-list">
          {cities.map((c) => <option key={c.id} value={`${c.name}, ${c.state}`} />)}
          {cities.flatMap((c) => c.aliases.map((a) => <option key={`${c.id}-${a}`} value={a} />))}
        </datalist>
      </div>

      {/* Comparison result */}
      {compareCity && compareResult && (
        <div className="space-y-2">
          <div className="rounded-lg border px-3 py-2.5 flex items-center justify-between"
            style={{ borderColor: accent + "44", background: accent + "08" }}>
            <div>
              <p className="text-sm font-semibold text-slate-700">{compareCity.name}</p>
              {incomeShift !== 0 && (
                <p className="text-xs text-slate-400">
                  Local income {incomeShift > 0 ? "+" : ""}{incomeShift}% vs. national avg
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-black" style={{ color: accent }}>
                ~{(compareResult.localCount ?? 0).toLocaleString()} people
              </p>
              {countDelta !== null && (
                <p className={`text-xs font-semibold ${countDelta >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {countDelta >= 0 ? "+" : ""}{countDelta.toLocaleString()} vs. {baseLabel}
                </p>
              )}
            </div>
          </div>

          {compareResult.grade !== baseResult.grade && (
            <p className="text-xs text-center text-slate-500">
              Grade shifts:{" "}
              <span style={{ color: baseResult.gradeColor }} className="font-semibold">{baseResult.grade}</span>
              {" → "}
              <span style={{ color: compareResult.gradeColor }} className="font-semibold">{compareResult.grade}</span>
            </p>
          )}

          {onSwitchCity && (
            <button
              onClick={handleApply}
              disabled={applied}
              className="w-full rounded-lg py-2 text-xs font-bold transition"
              style={
                applied
                  ? { background: "#f1f5f9", color: "#94a3b8" }
                  : { background: accent, color: "white" }
              }
            >
              {applied ? `✓ Switched to ${compareCity.name}` : `Switch to ${compareCity.name}`}
            </button>
          )}
        </div>
      )}

      {input && !compareCity && (
        <p className="text-xs text-slate-400 text-center py-2">No match — try the full name (e.g. "Chicago, IL")</p>
      )}
    </div>
  );
}
