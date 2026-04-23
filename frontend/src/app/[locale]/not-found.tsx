import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-[96px] font-bold text-primary mb-4">404</h1>
        <p className="font-body text-[18px] text-muted mb-8">Sayfa bulunamadı / Page not found</p>
        <Link
          href="/tr"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-[2px] bg-primary text-background font-heading text-[15px] font-semibold hover:bg-primary-dim transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
