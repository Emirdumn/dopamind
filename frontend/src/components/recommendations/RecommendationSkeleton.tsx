"use client";

export function RecommendationSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-[#B7C396]/30 bg-white/50 overflow-hidden animate-pulse"
        >
          <div className="h-20 bg-[#5a7a52]/10" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-[#E0E7D7] rounded w-3/4" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-14 bg-[#E0E7D7] rounded-lg" />
              <div className="h-14 bg-[#E0E7D7] rounded-lg" />
              <div className="h-14 bg-[#E0E7D7] rounded-lg" />
            </div>
            <div className="h-24 bg-[#E0E7D7]/80 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
