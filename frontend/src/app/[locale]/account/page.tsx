"use client";

import { useParams, useRouter } from "next/navigation";
import { User, Package, MapPin, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/ui/Button";

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 pt-24 text-center bg-[#E0E7D7] min-h-screen">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#2d3a2a] mb-4">
          {locale === "tr" ? "Giriş Yapın" : "Please Login"}
        </h1>
        <p className="text-gray-600 mb-6">
          {locale === "tr"
            ? "Hesap bilgilerinizi görmek için giriş yapmanız gerekiyor."
            : "You need to login to see your account details."}
        </p>
        <Button onClick={() => router.push(`/${locale}/auth/login`)}>
          {locale === "tr" ? "Giriş Yap" : "Login"}
        </Button>
      </div>
    );
  }

  const menuItems = [
    { icon: Package, label: locale === "tr" ? "Siparişlerim" : "My Orders", count: 3 },
    { icon: MapPin, label: locale === "tr" ? "Adreslerim" : "My Addresses", count: 2 },
    { icon: Settings, label: locale === "tr" ? "Ayarlar" : "Settings" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 bg-[#E0E7D7] min-h-screen">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-10 p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
        <div className="w-20 h-20 rounded-2xl bg-[#5a7a52] flex items-center justify-center text-white text-2xl font-bold">
          {user?.first_name?.[0] || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2d3a2a]">{user?.full_name || "User"}</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-4 p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 hover:border-[#5a7a52] hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E0E7D7]/40 flex items-center justify-center">
              <item.icon className="w-6 h-6 text-[#5a7a52]" />
            </div>
            <div>
              <p className="font-medium text-[#2d3a2a]">{item.label}</p>
              {"count" in item && (
                <p className="text-sm text-gray-600">
                  {item.count} {locale === "tr" ? "adet" : "items"}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => { logout(); router.push(`/${locale}`); }}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        <LogOut className="w-5 h-5" />
        {locale === "tr" ? "Çıkış Yap" : "Logout"}
      </button>
    </div>
  );
}
