import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { ArrowLeft, ArrowRight, Download, Share2, Lock, CheckCircle, AlertTriangle, Sparkles, Mail, FileText, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import ShareResult from "../components/ShareResult";

const ARCHETYPES = {
  driver: {
    name_id: "Penggerak",
    name_en: "Driver",
    color: "#C05640",
    bgColor: "#FDF3F1"
  },
  spark: {
    name_id: "Percikan",
    name_en: "Spark",
    color: "#D99E30",
    bgColor: "#FFF9EB"
  },
  anchor: {
    name_id: "Jangkar",
    name_en: "Anchor",
    color: "#5D8A66",
    bgColor: "#F1F7F3"
  },
  analyst: {
    name_id: "Analis",
    name_en: "Analyst",
    color: "#5B8FA8",
    bgColor: "#F0F7FA"
  }
};

const ResultPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { resultId } = useParams();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [archetypeData, setArchetypeData] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [generatingAiReport, setGeneratingAiReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const [resultRes, archetypesRes] = await Promise.all([
          axios.get(`${API}/quiz/result/${resultId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/quiz/archetypes`)
        ]);

        setResult(resultRes.data);
        setArchetypeData(archetypesRes.data.archetypes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching result:", error);
        toast.error(t("Gagal memuat hasil", "Failed to load result"));
        navigate("/dashboard");
      }
    };

    fetchResult();
  }, [resultId, token, navigate, t]);

  const handleGetFullReport = async () => {
    setCreatingPayment(true);
    try {
      const response = await axios.post(
        `${API}/payment/create`,
        { result_id: resultId, product_type: "single_report", currency: "IDR" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/checkout/${response.data.payment_id}`);
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(t("Gagal membuat pembayaran", "Failed to create payment"));
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      toast.error(t("Masukkan alamat email", "Enter email address"));
      return;
    }
    setSendingEmail(true);
    try {
      await axios.post(
        `${API}/email/send-report`,
        { result_id: resultId, recipient_email: recipientEmail, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("Email terkirim!", "Email sent!"));
      setShowEmailForm(false);
      setRecipientEmail("");
    } catch (error) {
      console.error("Error sending email:", error);
      const msg = error.response?.data?.detail || t("Gagal mengirim email", "Failed to send email");
      toast.error(msg);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleGenerateAiReport = async () => {
    setGeneratingAiReport(true);
    try {
      const response = await axios.post(
        `${API}/report/generate/${resultId}?language=${language}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiReport(response.data.content);
      toast.success(t("Laporan AI dibuat!", "AI Report generated!"));
    } catch (error) {
      console.error("Error generating AI report:", error);
      const msg = error.response?.data?.detail || t("Gagal membuat laporan AI", "Failed to generate AI report");
      toast.error(msg);
    } finally {
      setGeneratingAiReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("Memuat hasil...", "Loading result...")}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("Hasil tidak ditemukan", "Result not found")}</p>
      </div>
    );
  }

  const primaryArchetype = ARCHETYPES[result.primary_archetype];
  const secondaryArchetype = ARCHETYPES[result.secondary_archetype];
  const primaryData = archetypeData?.[result.primary_archetype];
  const secondaryData = archetypeData?.[result.secondary_archetype];

  const totalScore = Object.values(result.scores).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-link">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Dashboard", "Dashboard")}
            </Link>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowShare(true)} data-testid="share-btn">
              <Share2 className="w-4 h-4 mr-2" />
              {t("Bagikan", "Share")}
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Result Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6">
              <Sparkles className="w-4 h-4 text-spark" />
              <span className="text-sm font-medium">{t("Hasil Tes Anda", "Your Test Result")}</span>
            </div>
            
            <h1 className="heading-1 text-foreground mb-4">
              {t("Anda adalah", "You are a")} <span style={{ color: primaryArchetype.color }}>
                {language === "id" ? primaryArchetype.name_id : primaryArchetype.name_en}
              </span>
            </h1>
            
            <p className="body-lg text-muted-foreground">
              {t("dengan kecenderungan", "with")} <span style={{ color: secondaryArchetype.color }} className="font-medium">
                {language === "id" ? secondaryArchetype.name_id : secondaryArchetype.name_en}
              </span> {t("sebagai arketipe sekunder", "as secondary archetype")}
            </p>
          </div>

          {/* Score Visualization */}
          <Card className="mb-8 animate-slide-up stagger-1" data-testid="scores-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-6" style={{ fontFamily: 'Merriweather, serif' }}>
                {t("Distribusi Skor", "Score Distribution")}
              </h3>
              <div className="space-y-4">
                {Object.entries(result.scores).sort((a, b) => b[1] - a[1]).map(([archetype, score]) => {
                  const arch = ARCHETYPES[archetype];
                  const percentage = Math.round((score / totalScore) * 100);
                  return (
                    <div key={archetype}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" style={{ color: arch.color }}>
                          {language === "id" ? arch.name_id : arch.name_en}
                        </span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%`, backgroundColor: arch.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Balance Index */}
              <div className="mt-6 p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("Indeks Keseimbangan", "Balance Index")}</span>
                  <span className="font-bold">{(result.balance_index * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.balance_index < 0.3 
                    ? t("Anda memiliki profil yang seimbang", "You have a balanced profile")
                    : t("Anda memiliki kecenderungan dominan", "You have a dominant tendency")}
                </p>
              </div>

              {/* Stress Flag */}
              {result.stress_flag && (
                <div className="mt-4 p-4 rounded-xl bg-destructive/10 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">{t("Perhatian", "Attention")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "Hasil menunjukkan indikator stres. Laporan lengkap akan memberikan tips pengelolaan stres.",
                        "Results show stress indicators. The full report will provide stress management tips."
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Free Summary */}
          <Card className="mb-8 animate-slide-up stagger-2" style={{ borderColor: primaryArchetype.color + "40" }} data-testid="summary-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: primaryArchetype.bgColor }}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primaryArchetype.color }} />
                </div>
                <span style={{ color: primaryArchetype.color }}>
                  {language === "id" ? primaryArchetype.name_id : primaryArchetype.name_en}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <p className="text-muted-foreground">
                {language === "id" ? primaryData?.summary_id : primaryData?.summary_en}
              </p>

              {/* Strengths */}
              <div>
                <h4 className="font-bold text-foreground mb-3">{t("Kekuatan Anda", "Your Strengths")}</h4>
                <ul className="space-y-2">
                  {(language === "id" ? primaryData?.strengths_id : primaryData?.strengths_en)?.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryArchetype.color }} />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Watch-outs */}
              <div>
                <h4 className="font-bold text-foreground mb-3">{t("Yang Perlu Diperhatikan", "Watch-outs")}</h4>
                <ul className="space-y-2">
                  {(language === "id" ? primaryData?.blindspots_id : primaryData?.blindspots_en)?.slice(0, 2).map((blindspot, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                      <span>{blindspot}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Micro Actions */}
              <div>
                <h4 className="font-bold text-foreground mb-3">{t("Langkah Selanjutnya", "Next Steps")}</h4>
                <ul className="space-y-2">
                  {(language === "id" ? primaryData?.communication_tips_id : primaryData?.communication_tips_en)?.slice(0, 3).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <ArrowRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryArchetype.color }} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Upsell CTA */}
          {!result.is_paid && (
            <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 animate-slide-up stagger-3" data-testid="upsell-card">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-primary" />
                      <span className="font-bold text-foreground">{t("Laporan Lengkap", "Full Report")}</span>
                    </div>
                    <h3 className="heading-3 text-foreground mb-3">
                      {t("Dapatkan Insight Mendalam", "Get Deep Insights")}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t(
                        "Laporan lengkap mencakup analisis mendalam, skrip komunikasi praktis, rencana aksi 7 hari, dan panduan kompatibilitas dengan arketipe lain.",
                        "Full report includes in-depth analysis, practical communication scripts, 7-day action plan, and compatibility guide with other archetypes."
                      )}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-anchor" />
                        {t("Analisis kekuatan & blind spot lengkap", "Complete strengths & blind spots analysis")}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-anchor" />
                        {t("6 skrip dialog praktis", "6 practical dialogue scripts")}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-anchor" />
                        {t("Rencana aksi 7 hari", "7-day action plan")}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-anchor" />
                        {t("Panduan kompatibilitas", "Compatibility guide")}
                      </li>
                    </ul>
                  </div>
                  <div className="w-full md:w-auto text-center">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">Rp 99.000</span>
                      <span className="text-muted-foreground ml-2 line-through">Rp 149.000</span>
                    </div>
                    <Button 
                      size="lg"
                      onClick={handleGetFullReport}
                      disabled={creatingPayment}
                      className="btn-primary w-full md:w-auto"
                      data-testid="get-report-btn"
                    >
                      {creatingPayment ? t("Memproses...", "Processing...") : t("Dapatkan Laporan", "Get Report")}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* If paid, show download button */}
          {result.is_paid && (
            <Card className="mb-8 bg-anchor/10 border-anchor/20 animate-slide-up stagger-3" data-testid="download-card">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-12 h-12 text-anchor mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("Laporan Anda Siap!", "Your Report is Ready!")}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t("Unduh atau kirim laporan lengkap Anda", "Download or send your complete report")}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <Button 
                    className="btn-primary" 
                    onClick={() => window.open(`${API}/report/pdf/${resultId}?language=${language}`, '_blank')}
                    data-testid="download-report-btn"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {t("Unduh PDF", "Download PDF")}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    data-testid="email-report-btn"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {t("Kirim via Email", "Send via Email")}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleGenerateAiReport}
                    disabled={generatingAiReport}
                    data-testid="ai-report-btn"
                  >
                    {generatingAiReport ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    {generatingAiReport ? t("Membuat...", "Generating...") : t("Laporan AI", "AI Report")}
                  </Button>
                </div>

                {/* Email Form */}
                {showEmailForm && (
                  <div className="p-4 rounded-xl bg-background border mb-6" data-testid="email-form">
                    <h4 className="font-bold mb-3">{t("Kirim Laporan ke Email", "Send Report to Email")}</h4>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder={t("alamat@email.com", "address@email.com")}
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        data-testid="email-input"
                      />
                      <Button onClick={handleSendEmail} disabled={sendingEmail} data-testid="send-email-btn">
                        {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("Laporan akan dikirim ke email yang Anda masukkan", "Report will be sent to the email you enter")}
                    </p>
                  </div>
                )}

                {/* AI Report Display */}
                {aiReport && (
                  <div className="p-4 rounded-xl bg-background border" data-testid="ai-report-content">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-spark" />
                      <h4 className="font-bold">{t("Laporan AI Personal", "Personal AI Report")}</h4>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert text-sm max-h-96 overflow-y-auto">
                      {aiReport.split('\n').map((line, idx) => {
                        if (line.startsWith('## ')) {
                          return <h2 key={idx} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace('## ', '')}</h2>;
                        }
                        if (line.startsWith('### ')) {
                          return <h3 key={idx} className="text-base font-semibold mt-3 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                        }
                        if (line.startsWith('- ')) {
                          return <li key={idx} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                        }
                        if (line.trim()) {
                          return <p key={idx} className="text-muted-foreground mb-2">{line}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/series")} className="rounded-full" data-testid="new-test-btn">
              {t("Ambil Tes Lain", "Take Another Test")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="rounded-full" data-testid="dashboard-nav-btn">
              {t("Ke Dashboard", "Go to Dashboard")}
            </Button>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShare && (
        <ShareResult 
          resultId={resultId}
          primaryArchetype={result.primary_archetype}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default ResultPage;
