"use client";
import { ScoreCategory, ScoringSignal } from "@/types";

function SignalRow({ signal }: { signal: ScoringSignal }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
          signal.found
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-white/5 text-white/20"
        }`}
      >
        {signal.found ? "✓" : "·"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium ${signal.found ? "text-white/90" : "text-white/35"}`}>
            {signal.label}
          </span>
          <span className={`text-xs font-mono flex-shrink-0 ${signal.found ? "text-emerald-400" : "text-white/20"}`}>
            {signal.points}/{signal.maxPoints}
          </span>
        </div>
        {signal.detail && (
          <p className={`text-xs mt-0.5 ${signal.found ? "text-white/30" : "text-white/25 italic"}`}>
            {signal.detail}
          </p>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: ScoreCategory }) {
  const pct = Math.round((category.score / category.maxScore) * 100);
  const barColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{category.icon}</span>
          <h3 className="font-semibold text-white/90 text-sm">{category.label}</h3>
          {category.subtitle && (
            <code className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono">
              {category.subtitle}
            </code>
          )}
        </div>
        <span className="text-xs font-mono text-white/50">
          {category.score}/{category.maxScore}
        </span>
      </div>

      <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      <div>
        {category.signals.map((signal) => (
          <SignalRow key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}

export default function ReportCard({ categories }: { categories: ScoreCategory[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Agent file card spans full width since it has the most signals */}
      {categories.map((cat, i) => (
        <div key={cat.id} className={i === 0 ? "lg:col-span-2" : ""}>
          <CategoryCard category={cat} />
        </div>
      ))}
    </div>
  );
}
