"use client";

export function RecommendationSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border border-accent bg-surface overflow-hidden animate-pulse rounded-[2px]"
        >
          <div className="h-[2px] bg-accent" />
          <div className="h-16 bg-background border-b border-accent" />
          <div className="p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-accent rounded-[2px] w-2/3" />
              <div className="w-10 h-10 rounded-full bg-accent" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-2 items-center">
                  <div className="h-2 bg-accent rounded-[2px] w-14" />
                  <div className="flex-1 h-[3px] bg-accent rounded-[2px]" />
                </div>
              ))}
            </div>
            <div className="h-16 bg-background border border-accent rounded-[2px]" />
            <div className="h-10 bg-accent rounded-[2px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
