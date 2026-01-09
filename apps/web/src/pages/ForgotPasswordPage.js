import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t("Masukkan email Anda", "Please enter your email"));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/forgot-password`, { email });
      setSubmitted(true);
      const remaining = response.data.remaining_attempts;
      if (remaining !== undefined && remaining <= 1) {
        toast.success(t(
          `Email terkirim! Sisa ${remaining} percobaan dalam 1 jam.`,
          `Email sent! ${remaining} attempts remaining in 1 hour.`
        ));
      } else {
        toast.success(t("Email terkirim!", "Email sent!"));
      }
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit exceeded
        const detail = error.response?.data?.detail;
        const message = language === "id" ? detail?.message : detail?.message_en;
        toast.error(message || t("Terlalu banyak permintaan. Coba lagi nanti.", "Too many requests. Try again later."));
      } else {
        // Other errors - still show success to prevent email enumeration
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
          data-testid="back-to-login"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("Kembali ke Login", "Back to Login")}
        </Link>

        <Card className="border-border/50">
          <CardContent className="p-8">
            {!submitted ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="heading-2 text-foreground mb-2">
                    {t("Lupa Password?", "Forgot Password?")}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Masukkan alamat email Anda dan kami akan mengirimkan link untuk mereset password.",
                      "Enter your email address and we'll send you a link to reset your password."
                    )}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("Alamat Email", "Email Address")}
                    </label>
                    <Input
                      type="email"
                      placeholder={t("contoh@email.com", "example@email.com")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      data-testid="forgot-email-input"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={loading}
                    data-testid="forgot-submit-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("Mengirim...", "Sending...")}
                      </>
                    ) : (
                      t("Kirim Link Reset", "Send Reset Link")
                    )}
                  </Button>
                </form>

                {/* Help text */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {t("Ingat password Anda?", "Remember your password?")}{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    {t("Masuk", "Sign In")}
                  </Link>
                </p>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-anchor/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-anchor" />
                  </div>
                  <h2 className="heading-2 text-foreground mb-4">
                    {t("Cek Email Anda", "Check Your Email")}
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    {t(
                      "Jika email terdaftar, kami telah mengirimkan link reset password ke:",
                      "If the email is registered, we've sent a password reset link to:"
                    )}
                  </p>
                  <p className="font-medium text-foreground mb-6">{email}</p>
                  
                  <div className="p-4 bg-secondary/50 rounded-xl text-sm text-muted-foreground mb-6">
                    <p className="mb-2">
                      <strong>{t("Catatan:", "Note:")}</strong>
                    </p>
                    <ul className="text-left space-y-1">
                      <li>• {t("Link akan kadaluarsa dalam 1 jam", "Link will expire in 1 hour")}</li>
                      <li>• {t("Cek folder spam jika tidak menemukan email", "Check spam folder if you don't see the email")}</li>
                      <li>• {t("Hanya link terbaru yang valid", "Only the latest link is valid")}</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSubmitted(false)}
                      data-testid="try-another-email"
                    >
                      {t("Coba Email Lain", "Try Another Email")}
                    </Button>
                    <Link to="/login" className="block">
                      <Button variant="ghost" className="w-full">
                        {t("Kembali ke Login", "Back to Login")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {t(
            "Butuh bantuan? Hubungi support@relasi4warna.com",
            "Need help? Contact support@relasi4warna.com"
          )}
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
