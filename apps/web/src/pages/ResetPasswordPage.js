import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ArrowLeft, Lock, CheckCircle, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/auth/verify-reset-token?token=${token}`);
      setTokenValid(true);
      setUserEmail(response.data.email);
    } catch (error) {
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(t("Password minimal 6 karakter", "Password must be at least 6 characters"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("Password tidak cocok", "Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: password
      });
      setSuccess(true);
      toast.success(t("Password berhasil direset!", "Password reset successful!"));
    } catch (error) {
      const message = error.response?.data?.detail || t("Gagal mereset password", "Failed to reset password");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t("Memverifikasi link...", "Verifying link...")}</p>
        </div>
      </div>
    );
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-driver/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-driver" />
            </div>
            <h2 className="heading-2 text-foreground mb-2">
              {t("Link Tidak Valid", "Invalid Link")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(
                "Link reset password tidak ditemukan. Silakan minta link baru.",
                "Password reset link not found. Please request a new link."
              )}
            </p>
            <Link to="/forgot-password">
              <Button className="btn-primary w-full">
                {t("Minta Link Baru", "Request New Link")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-driver/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-driver" />
            </div>
            <h2 className="heading-2 text-foreground mb-2">
              {t("Link Kadaluarsa", "Link Expired")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(
                "Link reset password sudah tidak valid atau sudah digunakan. Silakan minta link baru.",
                "Password reset link is no longer valid or has been used. Please request a new link."
              )}
            </p>
            <Link to="/forgot-password">
              <Button className="btn-primary w-full">
                {t("Minta Link Baru", "Request New Link")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-anchor/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-anchor" />
            </div>
            <h2 className="heading-2 text-foreground mb-4">
              {t("Password Berhasil Direset!", "Password Reset Successful!")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(
                "Password Anda telah berhasil diubah. Silakan login dengan password baru Anda.",
                "Your password has been successfully changed. Please login with your new password."
              )}
            </p>
            <Button 
              className="btn-primary w-full"
              onClick={() => navigate("/login")}
              data-testid="go-to-login"
            >
              {t("Masuk Sekarang", "Sign In Now")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("Kembali ke Login", "Back to Login")}
        </Link>

        <Card className="border-border/50">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="heading-2 text-foreground mb-2">
                {t("Buat Password Baru", "Create New Password")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("untuk", "for")} <span className="font-medium text-foreground">{userEmail}</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Password Baru", "New Password")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("Minimal 6 karakter", "At least 6 characters")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10"
                    data-testid="new-password-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Konfirmasi Password", "Confirm Password")}
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("Ketik ulang password", "Re-enter password")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                  data-testid="confirm-password-input"
                  required
                />
              </div>

              {/* Password requirements */}
              <div className="p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-medium mb-1">{t("Persyaratan password:", "Password requirements:")}</p>
                <ul className="space-y-1">
                  <li className={password.length >= 6 ? "text-anchor" : ""}>
                    {password.length >= 6 ? "✓" : "○"} {t("Minimal 6 karakter", "At least 6 characters")}
                  </li>
                  <li className={password && password === confirmPassword ? "text-anchor" : ""}>
                    {password && password === confirmPassword ? "✓" : "○"} {t("Password cocok", "Passwords match")}
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading || password.length < 6 || password !== confirmPassword}
                data-testid="reset-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("Mereset...", "Resetting...")}
                  </>
                ) : (
                  t("Reset Password", "Reset Password")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
