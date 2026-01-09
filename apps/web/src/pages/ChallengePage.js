import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { 
  ArrowLeft, Trophy, Target, CheckCircle, Lock, Sparkles, 
  Calendar, Gift, FileText, Star, Loader2, ChevronRight,
  Award, Flame, BookOpen
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const ARCHETYPE_COLORS = {
  driver: { bg: "bg-driver/20", text: "text-driver", border: "border-driver", gradient: "from-driver/10 to-driver/5" },
  spark: { bg: "bg-spark/20", text: "text-spark", border: "border-spark", gradient: "from-spark/10 to-spark/5" },
  anchor: { bg: "bg-anchor/20", text: "text-anchor", border: "border-anchor", gradient: "from-anchor/10 to-anchor/5" },
  analyst: { bg: "bg-analyst/20", text: "text-analyst", border: "border-analyst", gradient: "from-analyst/10 to-analyst/5" }
};

const ARCHETYPE_NAMES = {
  driver: { id: "Penggerak", en: "Driver" },
  spark: { id: "Percikan", en: "Spark" },
  anchor: { id: "Jangkar", en: "Anchor" },
  analyst: { id: "Analis", en: "Analyst" }
};

const ChallengePage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [startingChallenge, setStartingChallenge] = useState(false);
  const [completingDay, setCompletingDay] = useState(false);
  const [reflection, setReflection] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState("driver");
  const [badges, setBadges] = useState([]);
  const [unlockedContent, setUnlockedContent] = useState([]);
  const [viewingContent, setViewingContent] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [myResults, setMyResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challengeRes, badgesRes, contentRes, resultsRes] = await Promise.all([
        axios.get(`${API}/challenge/active`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/challenge/badges`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/challenge/unlocked-content`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/quiz/history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (challengeRes.data.has_active) {
        setActiveChallenge(challengeRes.data.challenge);
      }
      setBadges(badgesRes.data.badges || []);
      setUnlockedContent(contentRes.data.content || []);
      setMyResults(resultsRes.data.results || []);
      
      // Auto-select archetype from latest result
      if (resultsRes.data.results?.length > 0) {
        setSelectedArchetype(resultsRes.data.results[0].primary_archetype);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    setStartingChallenge(true);
    try {
      const response = await axios.post(
        `${API}/challenge/start`,
        { archetype: selectedArchetype, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status === "already_active") {
        setActiveChallenge(response.data.challenge);
        toast.info(t("Anda sudah memiliki challenge aktif", "You already have an active challenge"));
      } else {
        setActiveChallenge(response.data.challenge);
        toast.success(t("Challenge 7 hari dimulai!", "7-day challenge started!"));
      }
    } catch (error) {
      console.error("Error starting challenge:", error);
      toast.error(t("Gagal memulai challenge", "Failed to start challenge"));
    } finally {
      setStartingChallenge(false);
    }
  };

  const handleCompleteDay = async () => {
    if (!activeChallenge) return;
    
    setCompletingDay(true);
    try {
      const response = await axios.post(
        `${API}/challenge/complete-day/${activeChallenge.challenge_id}?day=${activeChallenge.current_day}&reflection=${encodeURIComponent(reflection)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show badge notifications
      if (response.data.new_badges?.length > 0) {
        response.data.new_badges.forEach(badge => {
          toast.success(
            `${badge.icon} ${t("Badge baru:", "New badge:")} ${language === "id" ? badge.name_id : badge.name_en}`,
            { duration: 5000 }
          );
        });
      }
      
      // Show content unlock notifications
      if (response.data.new_content?.length > 0) {
        response.data.new_content.forEach(content => {
          toast.success(
            `🎁 ${t("Konten terbuka:", "Content unlocked:")} ${language === "id" ? content.name_id : content.name_en}`,
            { duration: 5000 }
          );
        });
      }
      
      if (response.data.challenge_complete) {
        toast.success(t("Selamat! Anda telah menyelesaikan 7-Day Challenge!", "Congratulations! You completed the 7-Day Challenge!"), { duration: 8000 });
      }
      
      setReflection("");
      fetchData(); // Refresh data
      
    } catch (error) {
      console.error("Error completing day:", error);
      toast.error(error.response?.data?.detail || t("Gagal menyelesaikan hari", "Failed to complete day"));
    } finally {
      setCompletingDay(false);
    }
  };

  const handleViewContent = async (contentId) => {
    setViewingContent(contentId);
    setLoadingContent(true);
    try {
      const response = await axios.get(
        `${API}/challenge/premium-content/${contentId}?language=${language}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContentData(response.data);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error(t("Gagal memuat konten", "Failed to load content"));
      setViewingContent(null);
    } finally {
      setLoadingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Content View Modal
  if (viewingContent && contentData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={() => { setViewingContent(null); setContentData(null); }}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Kembali", "Back")}
              </button>
            </div>
          </div>
        </header>
        
        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spark/10 mb-4">
                <Gift className="w-5 h-5 text-spark" />
                <span className="font-medium text-spark">
                  {language === "id" ? contentData.content_info.name_id : contentData.content_info.name_en}
                </span>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6 md:p-8">
                {loadingContent ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {contentData.content.split('\n').map((line, idx) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('**') && line.includes(':**')) {
                        return <p key={idx} className="font-semibold text-foreground mt-2">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={idx} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <li key={idx} className="ml-4 text-muted-foreground list-decimal">{line.replace(/^\d+\./, '').trim()}</li>;
                      }
                      if (line.trim()) {
                        return <p key={idx} className="text-muted-foreground mb-2">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Active Challenge View
  if (activeChallenge && activeChallenge.status === "active") {
    const currentDayData = activeChallenge.days[activeChallenge.current_day - 1];
    const progress = (activeChallenge.completed_days.length / 7) * 100;
    const archColors = ARCHETYPE_COLORS[activeChallenge.archetype] || ARCHETYPE_COLORS.driver;

    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-link">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Dashboard", "Dashboard")}
              </Link>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-spark" />
                <span className="font-bold">{t("Hari", "Day")} {activeChallenge.current_day}/7</span>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Progress Header */}
            <Card className={`mb-6 bg-gradient-to-br ${archColors.gradient} ${archColors.border} border`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {t("7-Day Communication Challenge", "7-Day Communication Challenge")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {language === "id" ? ARCHETYPE_NAMES[activeChallenge.archetype]?.id : ARCHETYPE_NAMES[activeChallenge.archetype]?.en}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-full ${archColors.bg} flex items-center justify-center`}>
                    <Trophy className={`w-7 h-7 ${archColors.text}`} />
                  </div>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{activeChallenge.completed_days.length} {t("hari selesai", "days completed")}</span>
                  <span>{7 - activeChallenge.completed_days.length} {t("hari lagi", "days left")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Day Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    activeChallenge.completed_days.includes(day)
                      ? `${archColors.bg} ${archColors.text}`
                      : day === activeChallenge.current_day
                      ? `${archColors.border} border-2 text-foreground`
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activeChallenge.completed_days.includes(day) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    day
                  )}
                </div>
              ))}
            </div>

            {/* Current Day Challenge */}
            {currentDayData && (
              <Card className="mb-6" data-testid="current-day-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("Hari", "Day")} {activeChallenge.current_day}
                      </p>
                      <CardTitle className="text-xl">{currentDayData.title}</CardTitle>
                    </div>
                    <Target className={`w-6 h-6 ${archColors.text}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{currentDayData.description}</p>
                  
                  <div className={`p-4 rounded-xl ${archColors.bg}`}>
                    <p className="font-semibold text-foreground mb-2">{t("Tugas Hari Ini:", "Today's Task:")}</p>
                    <p className="text-muted-foreground">{currentDayData.task}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-secondary">
                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-spark" />
                      {t("Tips:", "Tips:")}
                    </p>
                    <p className="text-muted-foreground">{currentDayData.tip}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold text-foreground mb-2">{t("Refleksi:", "Reflection:")}</p>
                    <p className="text-sm text-muted-foreground mb-3">{currentDayData.reflection_question}</p>
                    <Textarea
                      placeholder={t("Tuliskan refleksi Anda di sini...", "Write your reflection here...")}
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      rows={3}
                      data-testid="reflection-input"
                    />
                  </div>

                  <Button 
                    className="w-full btn-primary" 
                    size="lg"
                    onClick={handleCompleteDay}
                    disabled={completingDay}
                    data-testid="complete-day-btn"
                  >
                    {completingDay ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    {t("Selesaikan Hari Ini", "Complete Today")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Badges Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-spark" />
                  {t("Badge Anda", "Your Badges")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries({
                    communicator_novice: { days: 1 },
                    steady_speaker: { days: 3 },
                    relationship_builder: { days: 5 },
                    communication_master: { days: 7 }
                  }).map(([badgeId, info]) => {
                    const earned = activeChallenge.badges_earned?.includes(badgeId);
                    const badgeInfo = { 
                      communicator_novice: { icon: "🌱", name_id: "Komunikator Pemula", name_en: "Novice Communicator" },
                      steady_speaker: { icon: "💬", name_id: "Pembicara Mantap", name_en: "Steady Speaker" },
                      relationship_builder: { icon: "🤝", name_id: "Pembangun Hubungan", name_en: "Relationship Builder" },
                      communication_master: { icon: "🏆", name_id: "Master Komunikasi", name_en: "Communication Master" }
                    }[badgeId];
                    
                    return (
                      <div 
                        key={badgeId}
                        className={`p-3 rounded-xl text-center transition-all ${
                          earned 
                            ? "bg-spark/10 border border-spark/30" 
                            : "bg-muted/50 opacity-50"
                        }`}
                      >
                        <span className="text-2xl">{badgeInfo.icon}</span>
                        <p className="text-xs font-medium mt-1">
                          {language === "id" ? badgeInfo.name_id : badgeInfo.name_en}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {info.days} {t("hari", "days")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Unlocked Content Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-anchor" />
                  {t("Konten Premium", "Premium Content")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries({
                    exclusive_tips: { unlock_at: 3, icon: BookOpen, name_id: "Tips Eksklusif", name_en: "Exclusive Tips" },
                    workbook_pdf: { unlock_at: 5, icon: FileText, name_id: "Workbook PDF", name_en: "Workbook PDF" },
                    master_guide: { unlock_at: 7, icon: Star, name_id: "Panduan Master", name_en: "Master Guide" }
                  }).map(([contentId, info]) => {
                    const unlocked = activeChallenge.content_unlocked?.includes(contentId);
                    const Icon = info.icon;
                    
                    return (
                      <div 
                        key={contentId}
                        className={`p-4 rounded-xl flex items-center justify-between ${
                          unlocked ? "bg-anchor/10 border border-anchor/30" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            unlocked ? "bg-anchor/20" : "bg-muted"
                          }`}>
                            {unlocked ? (
                              <Icon className="w-5 h-5 text-anchor" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{language === "id" ? info.name_id : info.name_en}</p>
                            <p className="text-xs text-muted-foreground">
                              {unlocked 
                                ? t("Terbuka!", "Unlocked!")
                                : `${t("Terbuka di hari", "Unlocks at day")} ${info.unlock_at}`
                              }
                            </p>
                          </div>
                        </div>
                        {unlocked && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewContent(contentId)}
                          >
                            {t("Lihat", "View")}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Start Challenge View
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-link">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Dashboard", "Dashboard")}
            </Link>
            <h1 className="font-bold">{t("Communication Challenge", "Communication Challenge")}</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spark/10 mb-4">
              <Trophy className="w-5 h-5 text-spark" />
              <span className="font-medium text-spark">7-Day Challenge</span>
            </div>
            <h1 className="heading-2 text-foreground mb-2">
              {t("Tantangan Komunikasi 7 Hari", "7-Day Communication Challenge")}
            </h1>
            <p className="body-lg text-muted-foreground">
              {t(
                "Tingkatkan kemampuan komunikasi Anda dengan tantangan harian yang dipersonalisasi berdasarkan arketipe Anda",
                "Improve your communication skills with daily challenges personalized to your archetype"
              )}
            </p>
          </div>

          {/* Rewards Preview */}
          <Card className="mb-8 border-spark/30 bg-gradient-to-br from-spark/5 to-anchor/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-spark" />
                {t("Yang Akan Anda Dapatkan", "What You'll Get")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-spark" />
                    {t("Badge", "Badges")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-secondary rounded-full text-xs">🌱 {t("Hari 1", "Day 1")}</span>
                    <span className="px-3 py-1 bg-secondary rounded-full text-xs">💬 {t("Hari 3", "Day 3")}</span>
                    <span className="px-3 py-1 bg-secondary rounded-full text-xs">🤝 {t("Hari 5", "Day 5")}</span>
                    <span className="px-3 py-1 bg-secondary rounded-full text-xs">🏆 {t("Hari 7", "Day 7")}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-anchor" />
                    {t("Konten Premium", "Premium Content")}
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ {t("Tips Eksklusif (Hari 3)", "Exclusive Tips (Day 3)")}</li>
                    <li>✓ {t("Workbook PDF (Hari 5)", "Workbook PDF (Day 5)")}</li>
                    <li>✓ {t("Panduan Master (Hari 7)", "Master Guide (Day 7)")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archetype Selection */}
          <Card className="mb-6" data-testid="archetype-selection">
            <CardHeader>
              <CardTitle>{t("Pilih Arketipe Anda", "Choose Your Archetype")}</CardTitle>
            </CardHeader>
            <CardContent>
              {myResults.length > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  {t("Berdasarkan hasil tes Anda, kami merekomendasikan:", "Based on your test results, we recommend:")}
                  <span className="font-bold text-foreground ml-1">
                    {language === "id" 
                      ? ARCHETYPE_NAMES[myResults[0].primary_archetype]?.id 
                      : ARCHETYPE_NAMES[myResults[0].primary_archetype]?.en}
                  </span>
                </p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(ARCHETYPE_COLORS).map(arch => {
                  const colors = ARCHETYPE_COLORS[arch];
                  const selected = selectedArchetype === arch;
                  
                  return (
                    <button
                      key={arch}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        selected 
                          ? `${colors.border} ${colors.bg}` 
                          : "border-border hover:border-muted-foreground"
                      }`}
                      onClick={() => setSelectedArchetype(arch)}
                      data-testid={`select-${arch}`}
                    >
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${colors.bg}`}>
                        <span className={`text-xl font-bold ${colors.text}`}>
                          {arch.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className={`font-medium ${selected ? colors.text : "text-foreground"}`}>
                        {language === "id" ? ARCHETYPE_NAMES[arch]?.id : ARCHETYPE_NAMES[arch]?.en}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button 
            size="lg" 
            className="w-full btn-primary text-lg py-6"
            onClick={handleStartChallenge}
            disabled={startingChallenge}
            data-testid="start-challenge-btn"
          >
            {startingChallenge ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("Menyiapkan Challenge...", "Preparing Challenge...")}
              </>
            ) : (
              <>
                <Flame className="w-5 h-5 mr-2" />
                {t("Mulai 7-Day Challenge", "Start 7-Day Challenge")}
              </>
            )}
          </Button>

          {/* Previous Badges */}
          {badges.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {t("Badge yang Sudah Diperoleh", "Earned Badges")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {badges.map(badge => (
                    <div 
                      key={badge.id}
                      className="px-4 py-2 bg-spark/10 rounded-full flex items-center gap-2"
                    >
                      <span>{badge.icon}</span>
                      <span className="text-sm font-medium">
                        {language === "id" ? badge.name_id : badge.name_en}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChallengePage;
