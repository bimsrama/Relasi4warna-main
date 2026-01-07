import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, CreditCard, CheckCircle, Shield, Lock, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const PRODUCTS = {
  single_report: { price_idr: 99000, price_usd: 6.99, name_id: "Laporan Lengkap", name_en: "Full Report" },
  family_pack: { price_idr: 349000, price_usd: 24.99, name_id: "Paket Keluarga", name_en: "Family Pack" },
  team_pack: { price_idr: 499000, price_usd: 34.99, name_id: "Paket Tim", name_en: "Team Pack" },
  couples_pack: { price_idr: 149000, price_usd: 9.99, name_id: "Paket Pasangan", name_en: "Couples Pack" },
  // Elite Tier Products
  elite_monthly: { price_idr: 499000, price_usd: 34.99, name_id: "Elite Bulanan", name_en: "Elite Monthly" },
  elite_quarterly: { price_idr: 1299000, price_usd: 89.99, name_id: "Elite 3 Bulan", name_en: "Elite Quarterly" },
  elite_annual: { price_idr: 3999000, price_usd: 279.99, name_id: "Elite Tahunan", name_en: "Elite Annual" },
  elite_single: { price_idr: 299000, price_usd: 19.99, name_id: "Laporan Elite (1x)", name_en: "Elite Report (1x)" },
  // Elite+ Tier Products
  elite_plus_monthly: { price_idr: 999000, price_usd: 69.99, name_id: "Elite+ Bulanan", name_en: "Elite+ Monthly" },
  elite_plus_quarterly: { price_idr: 2499000, price_usd: 169.99, name_id: "Elite+ 3 Bulan", name_en: "Elite+ Quarterly" },
  elite_plus_annual: { price_idr: 7999000, price_usd: 549.99, name_id: "Elite+ Tahunan", name_en: "Elite+ Annual" },
  certification_program: { price_idr: 4999000, price_usd: 349.99, name_id: "Program Sertifikasi RI", name_en: "RI Certification Program" }
};

const CheckoutPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [midtransClientKey, setMidtransClientKey] = useState(null);
  const [error, setError] = useState(null);

  // Load Midtrans Snap script
  useEffect(() => {
    const loadSnapScript = async () => {
      try {
        // Get client key from backend
        const response = await axios.get(`${API}/payment/client-key`);
        const { client_key, is_production } = response.data;
        setMidtransClientKey(client_key);

        // Check if script already loaded
        if (document.getElementById('midtrans-snap-script')) {
          setSnapLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.id = 'midtrans-snap-script';
        script.src = is_production
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', client_key);
        script.onload = () => setSnapLoaded(true);
        script.onerror = () => setError('Failed to load payment gateway');
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading Midtrans:', err);
        setError('Failed to initialize payment gateway');
      }
    };

    loadSnapScript();
  }, []);

  // Fetch payment details
  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentId || !token) return;
      
      try {
        const response = await axios.get(
          `${API}/payment/status/${paymentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPayment(response.data);
        
        // If already paid, redirect
        if (response.data.status === 'paid') {
          toast.success(t("Pembayaran sudah berhasil!", "Payment already completed!"));
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching payment:', err);
        setError('Payment not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId, token, navigate, t]);

  // Handle Midtrans Snap payment
  const handlePayment = useCallback(() => {
    if (!payment?.snap_token || !window.snap) {
      toast.error(t("Gateway pembayaran belum siap", "Payment gateway not ready"));
      return;
    }

    setProcessing(true);

    window.snap.pay(payment.snap_token, {
      onSuccess: function(result) {
        console.log('Payment success:', result);
        toast.success(t("Pembayaran berhasil!", "Payment successful!"));
        navigate(`/result/${payment.result_id}?paid=true`);
      },
      onPending: function(result) {
        console.log('Payment pending:', result);
        toast.info(t("Pembayaran pending, silakan selesaikan pembayaran", "Payment pending, please complete payment"));
        setProcessing(false);
      },
      onError: function(result) {
        console.log('Payment error:', result);
        toast.error(t("Pembayaran gagal", "Payment failed"));
        setProcessing(false);
      },
      onClose: function() {
        console.log('Payment modal closed');
        setProcessing(false);
        // Check if payment was completed
        checkPaymentStatus();
      }
    });
  }, [payment, navigate, t]);

  // Check payment status after modal close
  const checkPaymentStatus = async () => {
    if (!paymentId || !token) return;
    
    try {
      const response = await axios.get(
        `${API}/payment/status/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status === 'paid') {
        toast.success(t("Pembayaran berhasil!", "Payment successful!"));
        navigate(`/result/${response.data.result_id}?paid=true`);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  // Simulate payment for testing
  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      await axios.post(
        `${API}/payment/simulate-payment/${paymentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(t("Pembayaran simulasi berhasil!", "Simulated payment successful!"));
      navigate(`/result/${payment.result_id}?paid=true`);
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error(t("Simulasi gagal", "Simulation failed"));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">{t("Memuat...", "Loading...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("Terjadi Kesalahan", "An Error Occurred")}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              {t("Kembali ke Dashboard", "Back to Dashboard")}
            </Button>
          </CardContent>
        </Card>
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
                  {payment?.currency === "IDR" 
                    ? `Rp ${product.price_idr.toLocaleString("id-ID")}`
                    : `$${product.price_usd}`
                  }
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{t("Total", "Total")}</span>
                  <span className="text-xl font-bold text-foreground">
                    {payment?.currency === "IDR" 
                      ? `Rp ${product.price_idr.toLocaleString("id-ID")}`
                      : `$${product.price_usd}`
                    }
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Order ID: {paymentId}
              </p>
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
                    <p className="font-medium text-foreground">Midtrans</p>
                    <p className="text-sm text-muted-foreground">
                      {t("Kartu Kredit, Bank Transfer, GoPay, OVO, DANA, dll", "Credit Card, Bank Transfer, GoPay, OVO, DANA, etc.")}
                    </p>
                  </div>
                </div>
              </div>
              {!snapLoaded && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("Memuat gateway pembayaran...", "Loading payment gateway...")}
                </div>
              )}
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
            disabled={processing || !snapLoaded || !payment?.snap_token}
            className="w-full btn-primary text-lg py-6"
            data-testid="pay-btn"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("Memproses...", "Processing...")}
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                {t("Bayar Sekarang", "Pay Now")}
              </>
            )}
          </Button>

          {/* Simulate Payment for Testing */}
          {midtransClientKey?.startsWith('SB-') && (
            <Button 
              variant="outline"
              size="lg"
              onClick={handleSimulatePayment}
              disabled={processing}
              className="w-full mt-4"
              data-testid="simulate-btn"
            >
              {t("Simulasi Pembayaran (Testing)", "Simulate Payment (Testing)")}
            </Button>
          )}

          {/* Security Notice */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {t(
              "Pembayaran Anda diproses secara aman melalui Midtrans. Kami tidak menyimpan data kartu Anda.",
              "Your payment is securely processed through Midtrans. We do not store your card data."
            )}
          </p>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
