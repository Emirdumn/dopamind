"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CreditCard, Truck, Shield, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CheckoutPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const [step, setStep] = useState(1);

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 text-center bg-[#E0E7D7] min-h-screen">
        <div className="w-20 h-20 rounded-full bg-[#5a7a52]/10 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#5a7a52]" />
        </div>
        <h1 className="text-3xl font-bold text-[#2d3a2a] mb-4">
          {locale === "tr" ? "Siparişiniz Alındı!" : "Order Received!"}
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          {locale === "tr"
            ? "Siparişiniz başarıyla oluşturuldu. Sipariş detayları e-posta adresinize gönderildi."
            : "Your order has been successfully created. Order details have been sent to your email."}
        </p>
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 mb-8">
          <p className="text-sm text-gray-600">{locale === "tr" ? "Sipariş Numarası" : "Order Number"}</p>
          <p className="text-2xl font-bold text-[#5a7a52]">DPM-ABC12345</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 bg-[#E0E7D7] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2d3a2a] mb-8">
        {locale === "tr" ? "Ödeme" : "Checkout"}
      </h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { num: 1, label: locale === "tr" ? "Adres" : "Address", icon: Truck },
          { num: 2, label: locale === "tr" ? "Ödeme" : "Payment", icon: CreditCard },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s.num ? "bg-[#5a7a52] text-white" : "bg-[#E0E7D7]/60 text-gray-600"
            }`}>
              {s.num}
            </div>
            <span className={`text-sm font-medium ${step >= s.num ? "text-[#2d3a2a]" : "text-gray-600"}`}>
              {s.label}
            </span>
            {s.num < 2 && <div className="flex-1 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#2d3a2a] italic font-serif mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#5a7a52]" />
              {locale === "tr" ? "Teslimat Adresi" : "Shipping Address"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={locale === "tr" ? "Ad" : "First Name"} id="shipping_first_name" />
              <Input label={locale === "tr" ? "Soyad" : "Last Name"} id="shipping_last_name" />
              <Input label={locale === "tr" ? "Telefon" : "Phone"} id="shipping_phone" className="sm:col-span-2" />
              <Input label={locale === "tr" ? "Adres" : "Address"} id="shipping_address" className="sm:col-span-2" />
              <Input label={locale === "tr" ? "Şehir" : "City"} id="shipping_city" />
              <Input label={locale === "tr" ? "Posta Kodu" : "Postal Code"} id="shipping_postal" />
            </div>
          </div>

          <Button size="lg" onClick={() => setStep(2)}>
            {locale === "tr" ? "Ödemeye Devam Et" : "Continue to Payment"}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#2d3a2a] italic font-serif mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#5a7a52]" />
              {locale === "tr" ? "Ödeme Bilgileri" : "Payment Details"}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4">
                <button className="flex-1 p-4 rounded-xl border-2 border-[#5a7a52] bg-[#5a7a52]/5 text-center">
                  <CreditCard className="w-6 h-6 text-[#5a7a52] mx-auto mb-2" />
                  <span className="text-sm font-medium text-[#4a6a44]">
                    {locale === "tr" ? "Kredi Kartı" : "Credit Card"}
                  </span>
                </button>
                <button className="flex-1 p-4 rounded-xl border-2 border-[#B7C396]/30 text-center hover:border-[#5a7a52] transition-colors">
                  <Shield className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-600">Stripe</span>
                </button>
              </div>
              <Input label={locale === "tr" ? "Kart Numarası" : "Card Number"} id="card_number" placeholder="1234 5678 9012 3456" />
              <div className="grid grid-cols-2 gap-4">
                <Input label={locale === "tr" ? "Son Kullanma" : "Expiry"} id="card_expiry" placeholder="MM/YY" />
                <Input label="CVV" id="card_cvv" placeholder="123" />
              </div>
              <Input label={locale === "tr" ? "Kart Üzerindeki İsim" : "Name on Card"} id="card_name" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
              {locale === "tr" ? "Geri" : "Back"}
            </Button>
            <Button size="lg" onClick={() => setStep(3)}>
              {locale === "tr" ? "Siparişi Onayla" : "Place Order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
