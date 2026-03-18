"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError(locale === "tr" ? "Şifreler eşleşmiyor" : "Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(Object.values(data).flat().join(", ") as string);
      }

      router.push(`/${locale}/auth/login`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || (locale === "tr" ? "Kayıt başarısız" : "Registration failed"));
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
            {locale === "tr" ? "Hesap Oluştur" : "Create Account"}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === "tr" ? "Hemen ücretsiz kaydolun" : "Sign up for free"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="first_name"
              name="first_name"
              label={locale === "tr" ? "Ad" : "First Name"}
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              id="last_name"
              name="last_name"
              label={locale === "tr" ? "Soyad" : "Last Name"}
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label={locale === "tr" ? "E-posta" : "Email"}
            placeholder="ornek@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            id="phone"
            name="phone"
            type="tel"
            label={locale === "tr" ? "Telefon" : "Phone"}
            placeholder="+90 555 123 4567"
            value={formData.phone}
            onChange={handleChange}
          />

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label={locale === "tr" ? "Şifre" : "Password"}
              placeholder="En az 8 karakter"
              value={formData.password}
              onChange={handleChange}
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

          <Input
            id="password_confirm"
            name="password_confirm"
            type="password"
            label={locale === "tr" ? "Şifre Tekrar" : "Confirm Password"}
            placeholder="••••••••"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {locale === "tr" ? "Kayıt Ol" : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {locale === "tr" ? "Zaten hesabınız var mı?" : "Already have an account?"}{" "}
          <Link href={`/${locale}/auth/login`} className="text-[#5a7a52] font-medium hover:text-[#4a6a44]">
            {locale === "tr" ? "Giriş Yap" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
