import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Home, Briefcase, Users, Heart, ArrowRight, Globe, LogOut, Clock, FileText, Settings, Bell, BellOff, Sparkles, Loader2, Trophy, Flame, Grid3X3 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const ARCHETYPES = {
  driver: { name_id: "Penggerak", name_en: "Driver", color: "#C05640" },
  spark: { name_id: "Percikan", name_en: "Spark", color: "#D99E30" },
  anchor: { name_id: "Jangkar", name_en: "Anchor", color: "#5D8A66" },
  analyst: { name_id: "Analis", name_en: "Analyst", color: "#5B8FA8" }
};

const SERIES_ICONS = {
  family: Home,
  business: Briefcase,
  friendship: Users,
  couples: Heart
};

const SERIES_NAMES = {
  family: { id: "Keluarga", en: "Family" },
  business: { id: "Bisnis", en: "Business" },
  friendship: { id: "Persahabatan", en: "Friendship" },
  couples: { id: "Pasangan", en: "Couples" }
};

const DashboardPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipsSubscribed, setTipsSubscribed] = useState(false);
  const [tipsArchetype, setTipsArchetype] = useState(null);
  const [togglingTips, setTogglingTips] = useState(false);
  const [generatingTip, setGeneratingTip] = useState(false);
  const [latestTip, setLatestTip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, tipsRes] = await Promise.all([
          axios.get(`${API}/quiz/history`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/tips/subscription`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { subscribed: false } }))
        ]);
        setResults(historyRes.data.results || []);
        setTipsSubscribed(tipsRes.data.subscribed);
        setTipsArchetype(tipsRes.data.primary_archetype);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const toggleTipsSubscription = async () => {
    setTogglingTips(true);
    try {
      const response = await axios.post(
        `${API}/tips/subscription`,
        { subscribed: !tipsSubscribed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTipsSubscribed(response.data.subscribed);
      setTipsArchetype(response.data.primary_archetype);
      toast.success(
        response.data.subscribed
          ? t("Berhasil berlangganan tips mingguan!", "Successfully subscribed to weekly tips!")
          : t("Berhenti berlangganan tips mingguan", "Unsubscribed from weekly tips")
      );
    } catch (error) {
      toast.error(t("Gagal mengubah langganan", "Failed to update subscription"));
    } finally {
      setTogglingTips(false);
    }
  };

  const generateTip = async () => {
    if (!tipsArchetype && results.length === 0) {
      toast.error(t("Ambil tes terlebih dahulu untuk mendapatkan tips", "Take a test first to get tips"));
      return;
    }
    const archetype = tipsArchetype || results[0]?.primary_archetype;
    setGeneratingTip(true);
    try {
      const response = await axios.post(
        `${API}/tips/generate`,
        { archetype, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLatestTip(response.data);
      toast.success(t("Tips berhasil dibuat!", "Tip generated successfully!"));
    } catch (error) {
      toast.error(t("Gagal membuat tips", "Failed to generate tip"));
    } finally {
      setGeneratingTip(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">R4</span>
              </div>
              <span className="font-bold text-lg text-foreground hidden sm:block">
                {t("Relasi4Warna", "4Color Relating")}
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <button onClick={toggleLanguage} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="language-toggle">
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </button>
              <Button variant="ghost" onClick={logout} className="text-muted-foreground" data-testid="logout-btn">
                <LogOut className="w-4 h-4 mr-2" />
                {t("Keluar", "Logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 animate-slide-up">
            <h1 className="heading-2 text-foreground mb-2">
              {t("Halo", "Hello")}, {user?.name || t("Pengguna", "User")} 👋
            </h1>
            <p className="body-lg text-muted-foreground">
              {t("Selamat datang kembali! Berikut adalah ringkasan perjalanan Anda.", "Welcome back! Here's your journey summary.")}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up stagger-1">
            {Object.entries(SERIES_NAMES).map(([seriesId, names]) => {
              const Icon = SERIES_ICONS[seriesId];
              const hasResult = results.some(r => r.series === seriesId);
              return (
                <Card 
                  key={seriesId}
                  className="card-hover cursor-pointer"
                  onClick={() => navigate(`/quiz/${seriesId}`)}
                  data-testid={`quick-${seriesId}`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{language === "id" ? names.id : names.en}</p>
                      <p className="text-xs text-muted-foreground">
                        {hasResult ? t("Ambil ulang", "Retake") : t("Mulai tes", "Start test")}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Couples Comparison Banner */}
          <Card className="mb-6 bg-gradient-to-br from-driver/5 to-spark/5 border-driver/20 animate-slide-up stagger-1" data-testid="couples-banner">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-driver/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-7 h-7 text-driver" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-foreground mb-1">
                  {t("Fitur Perbandingan Pasangan", "Couples Comparison Feature")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Ambil tes bersama pasangan dan dapatkan laporan kompatibilitas AI yang mendalam",
                    "Take the test with your partner and get an in-depth AI compatibility report"
                  )}
                </p>
              </div>
              <Button 
                className="btn-primary flex-shrink-0" 
                onClick={() => navigate("/couples")}
                data-testid="go-couples-btn"
              >
                <Heart className="w-4 h-4 mr-2" />
                {t("Coba Sekarang", "Try Now")}
              </Button>
            </CardContent>
          </Card>

          {/* Family & Team Pack Banner */}
          <Card className="mb-6 bg-gradient-to-br from-anchor/5 to-analyst/5 border-anchor/20 animate-slide-up stagger-1" data-testid="team-banner">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-anchor" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-foreground mb-1">
                  {t("Paket Keluarga & Tim", "Family & Team Packs")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Pahami dinamika komunikasi keluarga (6 orang) atau tim (10 orang) dengan dashboard dan heatmap",
                    "Understand family (6 people) or team (10 people) communication dynamics with dashboard and heatmap"
                  )}
                </p>
              </div>
              <Button 
                variant="outline"
                className="flex-shrink-0 border-anchor text-anchor hover:bg-anchor/10" 
                onClick={() => navigate("/team")}
                data-testid="go-team-btn"
              >
                <Users className="w-4 h-4 mr-2" />
                {t("Buat Paket", "Create Pack")}
              </Button>
            </CardContent>
          </Card>

          {/* Communication Challenge Banner */}
          <Card className="mb-6 bg-gradient-to-br from-spark/5 to-driver/5 border-spark/20 animate-slide-up stagger-2" data-testid="challenge-banner">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-7 h-7 text-spark" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-foreground mb-1 flex items-center gap-2 justify-center md:justify-start">
                  {t("7-Day Communication Challenge", "7-Day Communication Challenge")}
                  <Flame className="w-4 h-4 text-driver" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Tingkatkan kemampuan komunikasi dengan tantangan harian AI + dapatkan badge & konten premium!",
                    "Improve communication skills with AI daily challenges + earn badges & premium content!"
                  )}
                </p>
              </div>
              <Button 
                className="btn-primary flex-shrink-0" 
                onClick={() => navigate("/challenge")}
                data-testid="go-challenge-btn"
              >
                <Trophy className="w-4 h-4 mr-2" />
                {t("Mulai Challenge", "Start Challenge")}
              </Button>
            </CardContent>
          </Card>

          {/* Compatibility Matrix Banner */}
          <Card className="mb-6 bg-gradient-to-br from-analyst/5 to-anchor/5 border-analyst/20 animate-slide-up stagger-2" data-testid="compatibility-banner">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-analyst/10 flex items-center justify-center flex-shrink-0">
                <Grid3X3 className="w-7 h-7 text-analyst" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-foreground mb-1">
                  {t("Matriks Kompatibilitas", "Compatibility Matrix")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Lihat dinamika komunikasi antara 16 kombinasi arketipe dan temukan cara terbaik berinteraksi",
                    "View communication dynamics between 16 archetype combinations and find the best ways to interact"
                  )}
                </p>
              </div>
              <Button 
                variant="outline"
                className="flex-shrink-0 border-analyst text-analyst hover:bg-analyst/10" 
                onClick={() => navigate("/compatibility")}
                data-testid="go-compatibility-btn"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                {t("Lihat Matriks", "View Matrix")}
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Tips Subscription */}
          <Card className="mb-12 bg-gradient-to-br from-anchor/5 to-analyst/5 border-anchor/20 animate-slide-up stagger-3" data-testid="weekly-tips-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-7 h-7 text-anchor" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground">
                      {t("Tips Komunikasi Mingguan", "Weekly Communication Tips")}
                    </h3>
                    {tipsSubscribed && (
                      <span className="text-xs bg-anchor/20 text-anchor px-2 py-0.5 rounded-full">
                        {t("Aktif", "Active")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t(
                      "Dapatkan tips AI personal setiap minggu berdasarkan arketipe komunikasi Anda untuk meningkatkan hubungan.",
                      "Get personalized AI tips every week based on your communication archetype to improve relationships."
                    )}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={tipsSubscribed ? "outline" : "default"}
                      onClick={toggleTipsSubscription}
                      disabled={togglingTips}
                      className={tipsSubscribed ? "" : "btn-primary"}
                      data-testid="toggle-tips-btn"
                    >
                      {togglingTips ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : tipsSubscribed ? (
                        <BellOff className="w-4 h-4 mr-2" />
                      ) : (
                        <Bell className="w-4 h-4 mr-2" />
                      )}
                      {tipsSubscribed 
                        ? t("Berhenti Berlangganan", "Unsubscribe")
                        : t("Berlangganan Gratis", "Subscribe Free")}
                    </Button>
                    
                    {results.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={generateTip}
                        disabled={generatingTip}
                        data-testid="generate-tip-btn"
                      >
                        {generatingTip ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {generatingTip ? t("Membuat...", "Generating...") : t("Buat Tips Sekarang", "Generate Tip Now")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Latest Tip Display */}
              {latestTip && (
                <div className="mt-6 p-4 bg-background rounded-xl border" data-testid="latest-tip">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-spark" />
                    <span className="text-sm font-medium">{t("Tips Terbaru Anda", "Your Latest Tip")}</span>
                  </div>
                  <div className="prose prose-sm max-w-none text-sm max-h-64 overflow-y-auto">
                    {latestTip.content.split('\n').map((line, idx) => {
                      if (line.startsWith('## ')) {
                        return <h3 key={idx} className="text-base font-bold mt-3 mb-2 text-foreground">{line.replace('## ', '')}</h3>;
                      }
                      if (line.startsWith('**') && line.includes(':**')) {
                        return <p key={idx} className="font-semibold text-foreground mt-2">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.trim()) {
                        return <p key={idx} className="text-muted-foreground">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results History */}
          <div className="animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-3 text-foreground">{t("Riwayat Tes", "Test History")}</h2>
              <Button variant="outline" onClick={() => navigate("/series")} className="rounded-full" data-testid="new-test-btn">
                {t("Tes Baru", "New Test")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-secondary rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-secondary rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <Card className="text-center p-12" data-testid="no-results">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t("Belum ada riwayat tes", "No test history yet")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("Mulai tes pertama Anda untuk melihat hasil di sini", "Start your first test to see results here")}
                </p>
                <Button onClick={() => navigate("/series")} className="btn-primary" data-testid="start-first-test-btn">
                  {t("Mulai Tes Pertama", "Start First Test")}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result, idx) => {
                  const primary = ARCHETYPES[result.primary_archetype];
                  const secondary = ARCHETYPES[result.secondary_archetype];
                  const Icon = SERIES_ICONS[result.series];
                  const seriesNames = SERIES_NAMES[result.series];

                  return (
                    <Card 
                      key={result.result_id}
                      className="card-hover cursor-pointer"
                      onClick={() => navigate(`/result/${result.result_id}`)}
                      data-testid={`result-${idx}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {language === "id" ? seriesNames.id : seriesNames.en}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(result.created_at)}
                              </p>
                            </div>
                          </div>
                          {result.is_paid && (
                            <span className="text-xs bg-anchor/20 text-anchor px-2 py-1 rounded-full">
                              {t("Laporan", "Report")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: primary.color + "20" }}
                          >
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: primary.color }} />
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: primary.color }}>
                              {language === "id" ? primary.name_id : primary.name_en}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              + {language === "id" ? secondary.name_id : secondary.name_en}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-primary">
                          {t("Lihat Detail", "View Details")}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
