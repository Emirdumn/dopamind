"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const tokens = await api.login(email, password);
      const profile = await api.getProfile(tokens.access) as Parameters<typeof setAuth>[0];
      setAuth(profile, tokens.access, tokens.refresh);
      router.push(`/${locale}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || (locale === "tr" ? "Giriş başarısız" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] pt-24 flex items-center justify-center px-4 py-12 bg-[#E0E7D7]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#5a7a52] mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2d3a2a]">
            {locale === "tr" ? "Giriş Yap" : "Login"}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === "tr" ? "Hesabınıza giriş yapın" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
          )}

          <Input
            id="email"
            type="email"
            label={locale === "tr" ? "E-posta" : "Email"}
            placeholder="ornek@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label={locale === "tr" ? "Şifre" : "Password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-600 hover:text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {locale === "tr" ? "Giriş Yap" : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {locale === "tr" ? "Hesabınız yok mu?" : "Don't have an account?"}{" "}
          <Link href={`/${locale}/auth/register`} className="text-[#5a7a52] font-medium hover:text-[#4a6a44]">
            {locale === "tr" ? "Kayıt Ol" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
