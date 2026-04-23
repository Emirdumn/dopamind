import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CompareClient from "./CompareClient";

function CompareFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center gap-2 bg-canvas text-ash">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="font-sans text-[14px] font-medium">Yükleniyor…</span>
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
