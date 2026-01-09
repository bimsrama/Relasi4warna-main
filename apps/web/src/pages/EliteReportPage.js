import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { 
  ArrowLeft, Crown, Sparkles, Users, Briefcase, CalendarClock, Baby, 
  Loader2, Check, ChevronRight, Shield, Star, Zap, Download, MessageCircle, Lock,
  GraduationCap, Bot, BarChart3, Globe
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const ARCHETYPES = {
  driver: { name_id: "Penggerak", name_en: "Driver", color: "#C05640" },
  spark: { name_id: "Percikan", name_en: "Spark", color: "#D99E30" },
  anchor: { name_id: "Jangkar", name_en: "Anchor", color: "#5D8A66" },
  analyst: { name_id: "Analis", name_en: "Analyst", color: "#5B8FA8" }
};

const EliteReportPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { resultId } = useParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [userTier, setUserTier] = useState("free");
  const [generating, setGenerating] = useState(false);
  const [eliteReport, setEliteReport] = useState(null);
  const [existingReport, setExistingReport] = useState(null);

  // Module selection state - Elite Modules
  const [activeModules, setActiveModules] = useState({
    quarterly: false,
    parentChild: false,
    business: false,
    team: false
  });

  // Elite+ Module selection state
  const [elitePlusModules, setElitePlusModules] = useState({
    certification: false,
    coaching: false,
    governance: false
  });

  // Active tier tab: 'elite' or 'elite_plus'
  const [activeTierTab, setActiveTierTab] = useState('elite');

  // Module 10: Quarterly Calibration inputs
  const [previousSnapshot, setPreviousSnapshot] = useState({
    primary_archetype: "",
    secondary_archetype: "",
    balance_index: "",
    created_at: ""
  });
  const [selfReportedExperience, setSelfReportedExperience] = useState("");

  // Module 11: Parent-Child inputs
  const [childAgeRange, setChildAgeRange] = useState("");
  const [relationshipChallenges, setRelationshipChallenges] = useState("");

  // Module 12: Business inputs
  const [userRole, setUserRole] = useState("");
  const [counterpartStyle, setCounterpartStyle] = useState("");
  const [businessConflicts, setBusinessConflicts] = useState("");

  // Module 13: Team inputs
  const [teamProfiles, setTeamProfiles] = useState([
    { name: "", primary: "" }
  ]);

  // Elite+ Module 14: Certification inputs
  const [certificationLevel, setCertificationLevel] = useState(1);

  // Elite+ Report state
  const [elitePlusReport, setElitePlusReport] = useState(null);
  const [existingElitePlusReport, setExistingElitePlusReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultRes, meRes] = await Promise.all([
          axios.get(`${API}/quiz/result/${resultId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setResult(resultRes.data);
        setUserTier(meRes.data.tier || "free");

        // Try to get existing elite report
        try {
          const eliteRes = await axios.get(`${API}/report/elite/${resultId}?language=${language}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setExistingReport(eliteRes.data);
          setEliteReport(eliteRes.data.content);
        } catch (e) {
          // No existing report
        }

        // Try to get existing elite+ report
        try {
          const elitePlusRes = await axios.get(`${API}/report/elite-plus/${resultId}?language=${language}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setExistingElitePlusReport(elitePlusRes.data);
          setElitePlusReport(elitePlusRes.data.content);
        } catch (e) {
          // No existing elite+ report
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(t("Gagal memuat data", "Failed to load data"));
        navigate("/dashboard");
      }
    };

    fetchData();
  }, [resultId, token, navigate, t, language]);

  const handleGenerateEliteReport = async () => {
    setGenerating(true);
    try {
      const payload = {
        result_id: resultId,
        language,
        force: true
      };

      // Module 10: Quarterly Calibration
      if (activeModules.quarterly && previousSnapshot.primary_archetype) {
        payload.previous_snapshot = {
          primary_archetype: previousSnapshot.primary_archetype,
          secondary_archetype: previousSnapshot.secondary_archetype,
          balance_index: parseFloat(previousSnapshot.balance_index) || 0.5,
          created_at: previousSnapshot.created_at || "3 months ago"
        };
        payload.self_reported_experience = selfReportedExperience;
      }

      // Module 11: Parent-Child
      if (activeModules.parentChild && childAgeRange) {
        payload.child_age_range = childAgeRange;
        payload.relationship_challenges = relationshipChallenges;
      }

      // Module 12: Business
      if (activeModules.business && userRole) {
        payload.user_role = userRole;
        payload.counterpart_style = counterpartStyle;
        payload.business_conflicts = businessConflicts;
      }

      // Module 13: Team
      if (activeModules.team && teamProfiles.some(t => t.name && t.primary)) {
        payload.team_profiles = teamProfiles.filter(t => t.name && t.primary);
      }

      const response = await axios.post(
        `${API}/report/elite/${resultId}`,
        payload,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 180000 // 3 minutes timeout
        }
      );

      setEliteReport(response.data.content);
      setExistingReport(response.data);
      toast.success(t("Laporan Elite berhasil dibuat!", "Elite Report generated successfully!"));
    } catch (error) {
      console.error("Error generating elite report:", error);
      const msg = error.response?.data?.detail || t("Gagal membuat laporan", "Failed to generate report");
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  // Generate Elite+ Report
  const handleGenerateElitePlusReport = async () => {
    setGenerating(true);
    try {
      const payload = {
        result_id: resultId,
        language,
        force: true,
        include_certification: elitePlusModules.certification,
        certification_level: certificationLevel,
        include_coaching_model: elitePlusModules.coaching,
        include_governance_dashboard: elitePlusModules.governance
      };

      // Include Elite modules if selected
      if (activeModules.quarterly && previousSnapshot.primary_archetype) {
        payload.previous_snapshot = {
          primary_archetype: previousSnapshot.primary_archetype,
          secondary_archetype: previousSnapshot.secondary_archetype,
          balance_index: parseFloat(previousSnapshot.balance_index) || 0.5,
          created_at: previousSnapshot.created_at || "3 months ago"
        };
        payload.self_reported_experience = selfReportedExperience;
      }
      if (activeModules.parentChild && childAgeRange) {
        payload.child_age_range = childAgeRange;
        payload.relationship_challenges = relationshipChallenges;
      }
      if (activeModules.business && userRole) {
        payload.user_role = userRole;
        payload.counterpart_style = counterpartStyle;
        payload.business_conflicts = businessConflicts;
      }
      if (activeModules.team && teamProfiles.some(t => t.name && t.primary)) {
        payload.team_profiles = teamProfiles.filter(t => t.name && t.primary);
      }

      const response = await axios.post(
        `${API}/report/elite-plus/${resultId}`,
        payload,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 180000
        }
      );

      setElitePlusReport(response.data.content);
      setExistingElitePlusReport(response.data);
      toast.success(t("Laporan Elite+ berhasil dibuat!", "Elite+ Report generated successfully!"));
    } catch (error) {
      console.error("Error generating elite+ report:", error);
      const msg = error.response?.data?.detail || t("Gagal membuat laporan Elite+", "Failed to generate Elite+ report");
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpgrade = () => {
    navigate(`/pricing?upgrade=elite&result=${resultId}`);
  };

  const addTeamMember = () => {
    if (teamProfiles.length < 10) {
      setTeamProfiles([...teamProfiles, { name: "", primary: "" }]);
    }
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamProfiles];
    updated[index][field] = value;
    setTeamProfiles(updated);
  };

  const removeTeamMember = (index) => {
    if (teamProfiles.length > 1) {
      setTeamProfiles(teamProfiles.filter((_, i) => i !== index));
    }
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    if (!eliteReport) return;
    
    const primaryName = language === "id" ? ARCHETYPES[result.primary_archetype]?.name_id : ARCHETYPES[result.primary_archetype]?.name_en;
    const summaryMatch = eliteReport.match(/## SECTION 1.*?(?=## SECTION 2|$)/s);
    const summary = summaryMatch 
      ? summaryMatch[0].replace(/## SECTION 1.*?\n/, '').replace(/\*\*/g, '*').substring(0, 400) + "..."
      : "";
    
    const appUrl = window.location.origin;
    
    const message = language === "id"
      ? `🌟 *Laporan Elite AI Saya*\n\nTipe: *${primaryName}*\n\n📝 *Ringkasan:*\n${summary}\n\n---\n💎 Ini adalah laporan ELITE dari Relasi4Warna dengan analisis mendalam.\n\n🔗 ${appUrl}\n\n#Relasi4Warna #EliteReport`
      : `🌟 *My Elite AI Report*\n\nType: *${primaryName}*\n\n📝 *Summary:*\n${summary}\n\n---\n💎 This is an ELITE report from Relasi4Warna with deep analysis.\n\n🔗 ${appUrl}\n\n#Relasi4Warna #EliteReport`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    toast.success(t("Membuka WhatsApp...", "Opening WhatsApp..."));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">{t("Memuat...", "Loading...")}</p>
        </div>
      </div>
    );
  }

  const primaryArch = ARCHETYPES[result?.primary_archetype];
  const isEligible = userTier === "elite" || userTier === "elite_plus" || userTier === "certification";
  const isPaid = result?.is_paid;

  // Not paid - redirect to checkout
  if (!isPaid) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to={`/result/${resultId}`} className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Kembali", "Back")}
              </Link>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-lg mx-auto text-center">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="heading-2 mb-4">{t("Laporan Premium Diperlukan", "Premium Report Required")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("Anda perlu membeli laporan premium terlebih dahulu untuk mengakses fitur Elite.", 
                "You need to purchase the premium report first to access Elite features.")}
            </p>
            <Button onClick={() => navigate(`/result/${resultId}`)} className="btn-primary">
              {t("Beli Laporan Premium", "Buy Premium Report")}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={`/result/${resultId}`} className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-link">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Kembali ke Hasil", "Back to Result")}
            </Link>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleLanguage}
                className="rounded-full"
                data-testid="language-toggle"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === "id" ? "EN" : "ID"}
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">Elite</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-amber-600">{t("Laporan Elite Premium", "Elite Premium Report")}</span>
            </div>
            
            <h1 className="heading-1 text-foreground mb-4">
              {t("Analisis Kepribadian", "Personality Analysis")} <span style={{ color: primaryArch?.color }}>{language === "id" ? primaryArch?.name_id : primaryArch?.name_en}</span>
            </h1>
            
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Pilih modul spesialis untuk mendapatkan insight yang lebih mendalam dan relevan dengan situasi Anda.",
                "Choose specialist modules to get deeper and more relevant insights for your situation."
              )}
            </p>
          </div>

          {/* Tier Check */}
          {!isEligible && (
            <Card className="mb-8 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20 animate-slide-up" data-testid="upgrade-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-6 h-6 text-amber-500" />
                      <span className="font-bold text-foreground">{t("Upgrade ke Elite", "Upgrade to Elite")}</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {t(
                        "Dapatkan akses ke modul-modul spesialis: Parent-Child, Business Leadership, Team Dynamics, dan Quarterly Calibration.",
                        "Get access to specialist modules: Parent-Child, Business Leadership, Team Dynamics, and Quarterly Calibration."
                      )}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {[
                        t("Modul Parent-Child: Analisis hubungan orangtua-anak", "Parent-Child Module: Parent-child relationship analysis"),
                        t("Modul Business: Kepemimpinan & dinamika tim", "Business Module: Leadership & team dynamics"),
                        t("Modul Quarterly: Evaluasi perkembangan per kuartal", "Quarterly Module: Quarterly progress evaluation"),
                        t("AI Report yang dipersonalisasi", "Personalized AI Report")
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                          <Check className="w-4 h-4 text-amber-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-foreground">Rp 299.000</span>
                      <span className="text-sm text-muted-foreground block">{t("per laporan", "per report")}</span>
                    </div>
                    <Button onClick={handleUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" data-testid="upgrade-btn">
                      <Crown className="w-4 h-4 mr-2" />
                      {t("Upgrade Sekarang", "Upgrade Now")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module Selection */}
          {isEligible && (
            <>
              {/* Tier Tabs */}
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant={activeTierTab === 'elite' ? 'default' : 'outline'}
                  onClick={() => setActiveTierTab('elite')}
                  className={`rounded-full ${activeTierTab === 'elite' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : ''}`}
                  data-testid="tab-elite"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Elite
                </Button>
                <Button
                  variant={activeTierTab === 'elite_plus' ? 'default' : 'outline'}
                  onClick={() => setActiveTierTab('elite_plus')}
                  className={`rounded-full ${activeTierTab === 'elite_plus' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''}`}
                  data-testid="tab-elite-plus"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Elite+
                </Button>
              </div>

              {/* Elite Modules */}
              {activeTierTab === 'elite' && (
                <>
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Module 10: Quarterly Calibration */}
                <Card className={`transition-all ${activeModules.quarterly ? 'ring-2 ring-amber-500' : ''}`} data-testid="module-quarterly">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <CalendarClock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t("Kalibrasi Kuartalan", "Quarterly Calibration")}</CardTitle>
                          <CardDescription>{t("Modul 10", "Module 10")}</CardDescription>
                        </div>
                      </div>
                      <Switch 
                        checked={activeModules.quarterly}
                        onCheckedChange={(v) => setActiveModules({...activeModules, quarterly: v})}
                        data-testid="switch-quarterly"
                      />
                    </div>
                  </CardHeader>
                  {activeModules.quarterly && (
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t("Tipe Utama Sebelumnya", "Previous Primary")}</Label>
                          <select 
                            className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                            value={previousSnapshot.primary_archetype}
                            onChange={(e) => setPreviousSnapshot({...previousSnapshot, primary_archetype: e.target.value})}
                            data-testid="prev-primary-select"
                          >
                            <option value="">{t("Pilih...", "Select...")}</option>
                            {Object.entries(ARCHETYPES).map(([key, val]) => (
                              <option key={key} value={key}>{language === "id" ? val.name_id : val.name_en}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">{t("Tipe Sekunder Sebelumnya", "Previous Secondary")}</Label>
                          <select 
                            className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                            value={previousSnapshot.secondary_archetype}
                            onChange={(e) => setPreviousSnapshot({...previousSnapshot, secondary_archetype: e.target.value})}
                            data-testid="prev-secondary-select"
                          >
                            <option value="">{t("Pilih...", "Select...")}</option>
                            {Object.entries(ARCHETYPES).map(([key, val]) => (
                              <option key={key} value={key}>{language === "id" ? val.name_id : val.name_en}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">{t("Pengalaman Sejak Tes Terakhir", "Experience Since Last Test")}</Label>
                        <Textarea 
                          className="mt-1 text-sm"
                          placeholder={t("Ceritakan perubahan yang Anda rasakan...", "Describe changes you've experienced...")}
                          value={selfReportedExperience}
                          onChange={(e) => setSelfReportedExperience(e.target.value)}
                          rows={2}
                          data-testid="self-experience-input"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Module 11: Parent-Child */}
                <Card className={`transition-all ${activeModules.parentChild ? 'ring-2 ring-amber-500' : ''}`} data-testid="module-parent-child">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                          <Baby className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t("Dinamika Orangtua-Anak", "Parent-Child Dynamics")}</CardTitle>
                          <CardDescription>{t("Modul 11", "Module 11")}</CardDescription>
                        </div>
                      </div>
                      <Switch 
                        checked={activeModules.parentChild}
                        onCheckedChange={(v) => setActiveModules({...activeModules, parentChild: v})}
                        data-testid="switch-parent-child"
                      />
                    </div>
                  </CardHeader>
                  {activeModules.parentChild && (
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <Label className="text-xs">{t("Rentang Usia Anak", "Child Age Range")}</Label>
                        <select 
                          className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                          value={childAgeRange}
                          onChange={(e) => setChildAgeRange(e.target.value)}
                          data-testid="child-age-select"
                        >
                          <option value="">{t("Pilih...", "Select...")}</option>
                          <option value="early_childhood">{t("Balita (0-5 tahun)", "Early Childhood (0-5 years)")}</option>
                          <option value="school_age">{t("Usia Sekolah (6-12 tahun)", "School Age (6-12 years)")}</option>
                          <option value="teen">{t("Remaja (13-17 tahun)", "Teenager (13-17 years)")}</option>
                          <option value="young_adult">{t("Dewasa Muda (18-25 tahun)", "Young Adult (18-25 years)")}</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">{t("Tantangan Hubungan", "Relationship Challenges")}</Label>
                        <Textarea 
                          className="mt-1 text-sm"
                          placeholder={t("Jelaskan tantangan yang dihadapi...", "Describe challenges faced...")}
                          value={relationshipChallenges}
                          onChange={(e) => setRelationshipChallenges(e.target.value)}
                          rows={2}
                          data-testid="relationship-challenges-input"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Module 12: Business & Leadership */}
                <Card className={`transition-all ${activeModules.business ? 'ring-2 ring-amber-500' : ''}`} data-testid="module-business">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t("Bisnis & Kepemimpinan", "Business & Leadership")}</CardTitle>
                          <CardDescription>{t("Modul 12", "Module 12")}</CardDescription>
                        </div>
                      </div>
                      <Switch 
                        checked={activeModules.business}
                        onCheckedChange={(v) => setActiveModules({...activeModules, business: v})}
                        data-testid="switch-business"
                      />
                    </div>
                  </CardHeader>
                  {activeModules.business && (
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">{t("Peran Anda", "Your Role")}</Label>
                          <select 
                            className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                            value={userRole}
                            onChange={(e) => setUserRole(e.target.value)}
                            data-testid="user-role-select"
                          >
                            <option value="">{t("Pilih...", "Select...")}</option>
                            <option value="founder">{t("Founder / Entrepreneur", "Founder / Entrepreneur")}</option>
                            <option value="leader">{t("Team Leader / Manager", "Team Leader / Manager")}</option>
                            <option value="partner">{t("Business Partner", "Business Partner")}</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">{t("Gaya Counterpart", "Counterpart Style")}</Label>
                          <select 
                            className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm"
                            value={counterpartStyle}
                            onChange={(e) => setCounterpartStyle(e.target.value)}
                            data-testid="counterpart-select"
                          >
                            <option value="">{t("Pilih...", "Select...")}</option>
                            {Object.entries(ARCHETYPES).map(([key, val]) => (
                              <option key={key} value={key}>{language === "id" ? val.name_id : val.name_en}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">{t("Konflik Bisnis yang Sering Terjadi", "Recurring Business Conflicts")}</Label>
                        <Textarea 
                          className="mt-1 text-sm"
                          placeholder={t("Jelaskan konflik atau tantangan...", "Describe conflicts or challenges...")}
                          value={businessConflicts}
                          onChange={(e) => setBusinessConflicts(e.target.value)}
                          rows={2}
                          data-testid="business-conflicts-input"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Module 13: Team Dynamics */}
                <Card className={`transition-all ${activeModules.team ? 'ring-2 ring-amber-500' : ''}`} data-testid="module-team">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t("Dinamika Tim", "Team Dynamics")}</CardTitle>
                          <CardDescription>{t("Modul 13", "Module 13")}</CardDescription>
                        </div>
                      </div>
                      <Switch 
                        checked={activeModules.team}
                        onCheckedChange={(v) => setActiveModules({...activeModules, team: v})}
                        data-testid="switch-team"
                      />
                    </div>
                  </CardHeader>
                  {activeModules.team && (
                    <CardContent className="space-y-4 pt-0">
                      <Label className="text-xs">{t("Anggota Tim", "Team Members")} ({teamProfiles.length}/10)</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {teamProfiles.map((member, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input 
                              placeholder={t("Nama", "Name")}
                              value={member.name}
                              onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                              className="flex-1 text-sm"
                              data-testid={`team-member-name-${idx}`}
                            />
                            <select 
                              className="px-2 py-2 rounded-md border bg-background text-sm"
                              value={member.primary}
                              onChange={(e) => updateTeamMember(idx, 'primary', e.target.value)}
                              data-testid={`team-member-type-${idx}`}
                            >
                              <option value="">{t("Tipe", "Type")}</option>
                              {Object.entries(ARCHETYPES).map(([key, val]) => (
                                <option key={key} value={key}>{language === "id" ? val.name_id : val.name_en}</option>
                              ))}
                            </select>
                            {teamProfiles.length > 1 && (
                              <Button variant="ghost" size="sm" onClick={() => removeTeamMember(idx)} className="px-2">×</Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={addTeamMember} disabled={teamProfiles.length >= 10} className="w-full">
                        + {t("Tambah Anggota", "Add Member")}
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Generate Elite Button */}
              <div className="text-center mb-8">
                <Button 
                  size="lg"
                  onClick={handleGenerateEliteReport}
                  disabled={generating || !Object.values(activeModules).some(v => v)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8"
                  data-testid="generate-elite-btn"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("Membuat Laporan (1-2 menit)...", "Generating Report (1-2 min)...")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t("Buat Laporan Elite", "Generate Elite Report")}
                    </>
                  )}
                </Button>
                {!Object.values(activeModules).some(v => v) && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("Pilih minimal satu modul untuk melanjutkan", "Select at least one module to continue")}
                  </p>
                )}
              </div>
              </>
              )}

              {/* Elite+ Tab Content */}
              {activeTierTab === 'elite_plus' && (
                <>
                  {/* Elite+ Upgrade Notice for non Elite+ users */}
                  {userTier !== 'elite_plus' && userTier !== 'certification' && (
                    <Card className="mb-8 bg-gradient-to-br from-violet-500/5 to-purple-600/5 border-violet-500/20">
                      <CardContent className="p-6 text-center">
                        <Sparkles className="w-12 h-12 text-violet-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-2">{t("Upgrade ke Elite+", "Upgrade to Elite+")}</h3>
                        <p className="text-muted-foreground mb-4">
                          {t("Dapatkan akses ke Program Sertifikasi, AI-Human Hybrid Coaching, dan Governance Dashboard.", 
                            "Get access to Certification Program, AI-Human Hybrid Coaching, and Governance Dashboard.")}
                        </p>
                        <Button 
                          onClick={() => navigate('/pricing?upgrade=elite_plus')} 
                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                          data-testid="upgrade-elite-plus-btn"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t("Upgrade ke Elite+", "Upgrade to Elite+")}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Elite+ Modules - Available for elite_plus tier */}
                  {(userTier === 'elite_plus' || userTier === 'certification') && (
                    <>
                      <div className="grid gap-6 md:grid-cols-3 mb-8">
                        {/* Module 14: Certification Program */}
                        <Card className={`transition-all ${elitePlusModules.certification ? 'ring-2 ring-violet-500' : ''}`} data-testid="module-certification">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                  <GraduationCap className="w-5 h-5 text-violet-500" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{t("Program Sertifikasi", "Certification Program")}</CardTitle>
                                  <CardDescription>{t("Modul 14", "Module 14")}</CardDescription>
                                </div>
                              </div>
                              <Switch 
                                checked={elitePlusModules.certification}
                                onCheckedChange={(v) => setElitePlusModules({...elitePlusModules, certification: v})}
                                data-testid="switch-certification"
                              />
                            </div>
                          </CardHeader>
                          {elitePlusModules.certification && (
                            <CardContent className="pt-0">
                              <Label className="text-xs">{t("Level Sertifikasi", "Certification Level")}</Label>
                              <div className="flex gap-2 mt-2">
                                {[1, 2, 3, 4].map(level => (
                                  <Button
                                    key={level}
                                    variant={certificationLevel === level ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCertificationLevel(level)}
                                    className={`flex-1 ${certificationLevel === level ? 'bg-violet-500' : ''}`}
                                    data-testid={`cert-level-${level}`}
                                  >
                                    L{level}
                                  </Button>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {certificationLevel === 1 && t("Self-Awareness Foundations", "Self-Awareness Foundations")}
                                {certificationLevel === 2 && t("Relational Fluency", "Relational Fluency")}
                                {certificationLevel === 3 && t("Family System Mastery", "Family System Mastery")}
                                {certificationLevel === 4 && t("Relational Leadership", "Relational Leadership")}
                              </p>
                            </CardContent>
                          )}
                        </Card>

                        {/* Module 15: AI-Human Hybrid Coaching */}
                        <Card className={`transition-all ${elitePlusModules.coaching ? 'ring-2 ring-violet-500' : ''}`} data-testid="module-coaching">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                  <Bot className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{t("Coaching AI-Human", "AI-Human Coaching")}</CardTitle>
                                  <CardDescription>{t("Modul 15", "Module 15")}</CardDescription>
                                </div>
                              </div>
                              <Switch 
                                checked={elitePlusModules.coaching}
                                onCheckedChange={(v) => setElitePlusModules({...elitePlusModules, coaching: v})}
                                data-testid="switch-coaching"
                              />
                            </div>
                          </CardHeader>
                          {elitePlusModules.coaching && (
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground">
                                {t("Laporan akan menyertakan rekomendasi coaching hybrid antara AI dan coach manusia untuk pertumbuhan berkelanjutan.", 
                                  "Report will include hybrid coaching recommendations between AI and human coaches for sustainable growth.")}
                              </p>
                            </CardContent>
                          )}
                        </Card>

                        {/* Module 16: Governance Dashboard */}
                        <Card className={`transition-all ${elitePlusModules.governance ? 'ring-2 ring-violet-500' : ''}`} data-testid="module-governance">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{t("Governance Dashboard", "Governance Dashboard")}</CardTitle>
                                  <CardDescription>{t("Modul 16", "Module 16")}</CardDescription>
                                </div>
                              </div>
                              <Switch 
                                checked={elitePlusModules.governance}
                                onCheckedChange={(v) => setElitePlusModules({...elitePlusModules, governance: v})}
                                data-testid="switch-governance"
                              />
                            </div>
                          </CardHeader>
                          {elitePlusModules.governance && (
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground">
                                {t("Akses ke dashboard dengan metrik governance, compliance status, dan audit trail untuk organisasi.", 
                                  "Access to dashboard with governance metrics, compliance status, and audit trail for organizations.")}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      </div>

                      {/* Generate Elite+ Button */}
                      <div className="text-center mb-8">
                        <Button 
                          size="lg"
                          onClick={handleGenerateElitePlusReport}
                          disabled={generating || !Object.values(elitePlusModules).some(v => v)}
                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8"
                          data-testid="generate-elite-plus-btn"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              {t("Membuat Laporan (1-2 menit)...", "Generating Report (1-2 min)...")}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              {t("Buat Laporan Elite+", "Generate Elite+ Report")}
                            </>
                          )}
                        </Button>
                        {!Object.values(elitePlusModules).some(v => v) && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {t("Pilih minimal satu modul Elite+ untuk melanjutkan", "Select at least one Elite+ module to continue")}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Elite Report Display */}
          {eliteReport && (
            <Card className="animate-slide-up" data-testid="elite-report-content">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-amber-500" />
                    <CardTitle>{t("Laporan Elite Anda", "Your Elite Report")}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleWhatsAppShare}
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white border-0"
                      data-testid="whatsapp-share-elite-btn"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                {existingReport && (
                  <CardDescription>
                    {t("Modul aktif:", "Active modules:")} {
                      Object.entries(existingReport.modules_activated || {})
                        .filter(([_, v]) => v)
                        .map(([k]) => k.replace(/_/g, ' '))
                        .join(', ') || 'None'
                    }
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert max-h-[600px] overflow-y-auto">
                  {eliteReport.split('\n').map((line, idx) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-lg font-bold mt-6 mb-3 text-foreground border-b pb-2">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-base font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={idx} className="font-semibold text-foreground mt-3">{line.replace(/\*\*/g, '')}</p>;
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
              </CardContent>
            </Card>
          )}

          {/* Elite+ Report Display */}
          {elitePlusReport && (
            <Card className="animate-slide-up mt-6" data-testid="elite-plus-report-content">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-violet-500" />
                    <CardTitle>{t("Laporan Elite+ Anda", "Your Elite+ Report")}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleWhatsAppShare}
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white border-0"
                      data-testid="whatsapp-share-elite-plus-btn"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                {existingElitePlusReport && (
                  <CardDescription>
                    {existingElitePlusReport.include_certification && `${t("Sertifikasi Level", "Certification Level")} ${existingElitePlusReport.certification_level || 1}`}
                    {existingElitePlusReport.include_coaching_model && ` • ${t("Coaching Model", "Coaching Model")}`}
                    {existingElitePlusReport.include_governance_dashboard && ` • ${t("Governance", "Governance")}`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert max-h-[600px] overflow-y-auto">
                  {elitePlusReport.split('\n').map((line, idx) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-lg font-bold mt-6 mb-3 text-violet-600 border-b border-violet-200 pb-2">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-base font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={idx} className="font-semibold text-foreground mt-3">{line.replace(/\*\*/g, '')}</p>;
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
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => navigate(`/result/${resultId}`)} className="rounded-full" data-testid="back-to-result-btn">
              {t("Kembali ke Hasil", "Back to Result")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="rounded-full" data-testid="to-dashboard-btn">
              {t("Ke Dashboard", "Go to Dashboard")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EliteReportPage;
