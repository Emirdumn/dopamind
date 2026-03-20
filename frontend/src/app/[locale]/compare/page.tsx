import { Suspense } from "react";
import CompareClient from "./CompareClient";

function CompareFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center bg-[#E0E7D7] pt-24 text-sm text-[#2d3a2a]/60">
      Yükleniyor…
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <CompareClient />
    </Suspense>
  );
}
