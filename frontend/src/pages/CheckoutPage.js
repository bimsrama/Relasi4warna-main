import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, CreditCard, CheckCircle, Shield, Lock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const PRODUCTS = {
  single_report: { price_idr: 99000, price_usd: 6.99, name_id: "Laporan Lengkap", name_en: "Full Report" },
  family_pack: { price_idr: 349000, price_usd: 24.99, name_id: "Paket Keluarga", name_en: "Family Pack" },
  team_pack: { price_idr: 499000, price_usd: 34.99, name_id: "Paket Tim", name_en: "Team Pack" },
  couples_pack: { price_idr: 149000, price_usd: 9.99, name_id: "Paket Pasangan", name_en: "Couples Pack" }
};

const CheckoutPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { paymentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // In a real app, fetch payment details from API
    // For demo, we'll simulate it
    setTimeout(() => {
      setPayment({
        payment_id: paymentId,
        product_type: "single_report",
        amount: 99000,
        currency: "IDR"
      });
      setLoading(false);
    }, 500);
  }, [paymentId]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Simulate payment - in production, this would redirect to Xendit
      await axios.post(
        `${API}/payment/simulate-payment/${paymentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(t("Pembayaran berhasil!", "Payment successful!"));
      
      // Navigate back to result page or dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(t("Pembayaran gagal", "Payment failed"));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("Memuat...", "Loading...")}</p>
        </div>
      </div>
    );
  }

  const product = PRODUCTS[payment?.product_type] || PRODUCTS.single_report;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-muted-foreground hover:text-foreground"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Kembali", "Back")}
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              {t("Pembayaran Aman", "Secure Payment")}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="heading-2 text-foreground mb-2">
              {t("Checkout", "Checkout")}
            </h1>
            <p className="text-muted-foreground">
              {t("Selesaikan pembayaran Anda", "Complete your payment")}
            </p>
          </div>

          {/* Order Summary */}
          <Card className="mb-6 animate-slide-up stagger-1" data-testid="order-summary">
            <CardHeader>
              <CardTitle className="text-lg">{t("Ringkasan Pesanan", "Order Summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground font-medium">
                  {language === "id" ? product.name_id : product.name_en}
                </span>
                <span className="font-bold text-foreground">
                  {payment.currency === "IDR" 
                    ? `Rp ${product.price_idr.toLocaleString("id-ID")}`
                    : `$${product.price_usd}`
                  }
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{t("Total", "Total")}</span>
                  <span className="text-xl font-bold text-foreground">
                    {payment.currency === "IDR" 
                      ? `Rp ${product.price_idr.toLocaleString("id-ID")}`
                      : `$${product.price_usd}`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="mb-6 animate-slide-up stagger-2" data-testid="payment-method">
            <CardHeader>
              <CardTitle className="text-lg">{t("Metode Pembayaran", "Payment Method")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-primary bg-primary/5">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Xendit</p>
                    <p className="text-sm text-muted-foreground">
                      {t("Kartu Kredit, Bank Transfer, E-Wallet", "Credit Card, Bank Transfer, E-Wallet")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You'll Get */}
          <Card className="mb-8 animate-slide-up stagger-3" data-testid="benefits">
            <CardHeader>
              <CardTitle className="text-lg">{t("Yang Anda Dapatkan", "What You'll Get")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  t("Analisis lengkap kekuatan & blind spot", "Complete strengths & blind spots analysis"),
                  t("6 skrip dialog praktis", "6 practical dialogue scripts"),
                  t("Rencana aksi 7 hari", "7-day action plan"),
                  t("Panduan kompatibilitas", "Compatibility guide"),
                  t("PDF yang dapat diunduh", "Downloadable PDF")
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-anchor flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pay Button */}
          <Button 
            size="lg"
            onClick={handlePayment}
            disabled={processing}
            className="w-full btn-primary text-lg py-6"
            data-testid="pay-btn"
          >
            {processing ? (
              t("Memproses...", "Processing...")
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                {t("Bayar Sekarang", "Pay Now")}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {t(
              "Pembayaran Anda diproses secara aman melalui Xendit. Kami tidak menyimpan data kartu Anda.",
              "Your payment is securely processed through Xendit. We do not store your card data."
            )}
          </p>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
