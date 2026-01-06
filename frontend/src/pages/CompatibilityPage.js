import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { 
  ArrowLeft, X, Heart, Zap, Shield, Brain, 
  ArrowRight, ChevronRight, Sparkles, Target,
  AlertCircle, Lightbulb, CheckCircle, User, Crown, Share2
} from "lucide-react";
import axios from "axios";
import ShareCompatibility from "../components/ShareCompatibility";

const ARCHETYPES = {
  driver: {
    name_id: "Penggerak",
    name_en: "Driver",
    color: "#C05640",
    bgColor: "bg-driver/10",
    borderColor: "border-driver/30",
    textColor: "text-driver",
    icon: Target,
    description_id: "Berorientasi hasil, tegas, fokus pada tujuan",
    description_en: "Results-oriented, decisive, goal-focused"
  },
  spark: {
    name_id: "Percikan",
    name_en: "Spark",
    color: "#D99E30",
    bgColor: "bg-spark/10",
    borderColor: "border-spark/30",
    textColor: "text-spark",
    icon: Zap,
    description_id: "Kreatif, energik, penuh antusiasme",
    description_en: "Creative, energetic, full of enthusiasm"
  },
  anchor: {
    name_id: "Jangkar",
    name_en: "Anchor",
    color: "#5D8A66",
    bgColor: "bg-anchor/10",
    borderColor: "border-anchor/30",
    textColor: "text-anchor",
    icon: Shield,
    description_id: "Stabil, suportif, menjaga harmoni",
    description_en: "Stable, supportive, harmony-keeper"
  },
  analyst: {
    name_id: "Analis",
    name_en: "Analyst",
    color: "#5B8FA8",
    bgColor: "bg-analyst/10",
    borderColor: "border-analyst/30",
    textColor: "text-analyst",
    icon: Brain,
    description_id: "Analitis, logis, detail-oriented",
    description_en: "Analytical, logical, detail-oriented"
  }
};

const ENERGY_LABELS = {
  very_high: { id: "Sangat Tinggi", en: "Very High", color: "text-driver" },
  high: { id: "Tinggi", en: "High", color: "text-spark" },
  balanced: { id: "Seimbang", en: "Balanced", color: "text-anchor" },
  low: { id: "Rendah", en: "Low", color: "text-analyst" },
  calm: { id: "Tenang", en: "Calm", color: "text-analyst" }
};

const getScoreColor = (score) => {
  if (score >= 85) return "text-anchor bg-anchor/20";
  if (score >= 75) return "text-spark bg-spark/20";
  if (score >= 65) return "text-driver bg-driver/20";
  return "text-analyst bg-analyst/20";
};

const getScoreBgGradient = (score) => {
  if (score >= 85) return "from-anchor/20 to-anchor/5";
  if (score >= 75) return "from-spark/20 to-spark/5";
  if (score >= 65) return "from-driver/20 to-driver/5";
  return "from-analyst/20 to-analyst/5";
};

const CompatibilityPage = () => {
  const { t, language } = useLanguage();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [matrix, setMatrix] = useState([]);
  const [archetypes, setArchetypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState(null);
  const [pairDetails, setPairDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showShare, setShowShare] = useState(false);
  
  // User's personal compatibility
  const [userArchetype, setUserArchetype] = useState(null);
  const [userCompatibilities, setUserCompatibilities] = useState([]);
  const [loadingUserCompat, setLoadingUserCompat] = useState(false);

  useEffect(() => {
    fetchMatrix();
    if (isAuthenticated && token) {
      fetchUserArchetype();
    }
  }, [isAuthenticated, token]);

  const fetchUserArchetype = async () => {
    setLoadingUserCompat(true);
    try {
      // Get user's quiz history to find their primary archetype
      const historyRes = await axios.get(`${API}/quiz/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (historyRes.data.results && historyRes.data.results.length > 0) {
        // Get the most recent result's primary archetype
        const latestResult = historyRes.data.results[0];
        const archetype = latestResult.primary_archetype;
        setUserArchetype(archetype);
        
        // Fetch compatibility for this archetype
        const compatRes = await axios.get(`${API}/compatibility/for/${archetype}?language=${language}`);
        setUserCompatibilities(compatRes.data.compatibilities || []);
      }
    } catch (error) {
      console.error("Error fetching user archetype:", error);
    } finally {
      setLoadingUserCompat(false);
    }
  };

  const fetchMatrix = async () => {
    try {
      const response = await axios.get(`${API}/compatibility/matrix`);
      setMatrix(response.data.matrix || []);
      setArchetypes(response.data.archetypes || []);
    } catch (error) {
      console.error("Error fetching compatibility matrix:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPairDetails = async (arch1, arch2) => {
    setLoadingDetails(true);
    try {
      const response = await axios.get(`${API}/compatibility/pair/${arch1}/${arch2}?language=${language}`);
      setPairDetails(response.data);
    } catch (error) {
      console.error("Error fetching pair details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSelectPair = (arch1, arch2) => {
    setSelectedPair({ arch1, arch2 });
    fetchPairDetails(arch1, arch2);
  };

  const closePairDetails = () => {
    setSelectedPair(null);
    setPairDetails(null);
  };

  const getArchetypeName = (archetype) => {
    return language === "id" ? ARCHETYPES[archetype].name_id : ARCHETYPES[archetype].name_en;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-home">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Beranda", "Home")}
            </Link>
            <h1 className="font-bold">{t("Kompatibilitas", "Compatibility")}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("16 Kombinasi", "16 Combinations")}
              </span>
            </div>
            <h1 className="heading-1 text-foreground mb-4">
              {t("Matriks Kompatibilitas", "Compatibility Matrix")}
            </h1>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Pahami dinamika komunikasi antara setiap kombinasi arketipe. Klik pada sel untuk melihat detail lengkap.",
                "Understand communication dynamics between each archetype combination. Click on a cell to see full details."
              )}
            </p>
          </div>

          {/* Archetype Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-slide-up stagger-1">
            {Object.entries(ARCHETYPES).map(([key, arch]) => {
              const Icon = arch.icon;
              return (
                <Card key={key} className={`${arch.borderColor} border-2`} data-testid={`legend-${key}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${arch.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${arch.textColor}`} />
                    </div>
                    <div>
                      <p className={`font-bold ${arch.textColor}`}>
                        {language === "id" ? arch.name_id : arch.name_en}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === "id" ? arch.description_id : arch.description_en}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* My Compatibility Section - Only for logged-in users with test results */}
          {isAuthenticated && userArchetype && (
            <Card className="mb-10 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 animate-slide-up stagger-1" data-testid="my-compatibility-section">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl ${ARCHETYPES[userArchetype].bgColor} flex items-center justify-center`}>
                    {React.createElement(ARCHETYPES[userArchetype].icon, {
                      className: `w-6 h-6 ${ARCHETYPES[userArchetype].textColor}`
                    })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-spark" />
                      <h2 className="heading-3 text-foreground">
                        {t("Kompatibilitas Saya", "My Compatibility")}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("Arketipe Anda:", "Your Archetype:")} 
                      <span className={`font-bold ${ARCHETYPES[userArchetype].textColor} ml-1`}>
                        {getArchetypeName(userArchetype)}
                      </span>
                    </p>
                  </div>
                </div>

                {loadingUserCompat ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {userCompatibilities.map((compat) => {
                      const otherArch = ARCHETYPES[compat.with_archetype];
                      const OtherIcon = otherArch.icon;
                      const scoreColor = getScoreColor(compat.compatibility_score);
                      const isSelf = compat.with_archetype === userArchetype;
                      
                      return (
                        <Card 
                          key={compat.with_archetype}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                            isSelf ? 'ring-2 ring-primary/50' : ''
                          }`}
                          onClick={() => handleSelectPair(userArchetype, compat.with_archetype)}
                          data-testid={`my-compat-${compat.with_archetype}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-10 h-10 rounded-xl ${otherArch.bgColor} flex items-center justify-center`}>
                                <OtherIcon className={`w-5 h-5 ${otherArch.textColor}`} />
                              </div>
                              <div className={`px-3 py-1 rounded-lg ${scoreColor} font-bold text-lg`}>
                                {compat.compatibility_score}
                              </div>
                            </div>
                            <div className="mb-2">
                              <p className={`font-bold ${otherArch.textColor}`}>
                                {getArchetypeName(compat.with_archetype)}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {ENERGY_LABELS[compat.energy]?.[language] || compat.energy}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {compat.title}
                            </p>
                            <div className="flex items-center text-xs text-primary mt-2">
                              {t("Lihat Detail", "View Details")}
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    {t(
                      "💡 Tip: Skor tertinggi menunjukkan kompatibilitas yang paling harmonis dengan arketipe Anda.",
                      "💡 Tip: Highest score indicates the most harmonious compatibility with your archetype."
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not logged in - CTA to take test */}
          {!isAuthenticated && (
            <Card className="mb-10 bg-gradient-to-br from-secondary/50 to-secondary/30 border-dashed animate-slide-up stagger-1" data-testid="login-cta-section">
              <CardContent className="p-6 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold text-foreground mb-2">
                  {t("Lihat Kompatibilitas Personal Anda", "See Your Personal Compatibility")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    "Login dan ambil tes untuk melihat bagaimana arketipe Anda berinteraksi dengan arketipe lain.",
                    "Login and take the test to see how your archetype interacts with others."
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate("/login")} data-testid="login-cta-btn">
                    {t("Login", "Login")}
                  </Button>
                  <Button className="btn-primary" onClick={() => navigate("/series")} data-testid="take-test-cta-btn">
                    {t("Ambil Tes", "Take Test")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logged in but no test results */}
          {isAuthenticated && !userArchetype && !loadingUserCompat && (
            <Card className="mb-10 bg-gradient-to-br from-spark/5 to-spark/10 border-spark/20 animate-slide-up stagger-1" data-testid="no-results-section">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-spark mx-auto mb-4" />
                <h3 className="font-bold text-foreground mb-2">
                  {t("Temukan Kompatibilitas Anda", "Discover Your Compatibility")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    "Anda belum memiliki hasil tes. Ambil tes untuk melihat bagaimana arketipe Anda berinteraksi dengan arketipe lain.",
                    "You don't have any test results yet. Take a test to see how your archetype interacts with others."
                  )}
                </p>
                <Button className="btn-primary" onClick={() => navigate("/series")} data-testid="take-first-test-btn">
                  {t("Ambil Tes Pertama", "Take Your First Test")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Compatibility Matrix Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="animate-slide-up stagger-2">
              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    <div className="p-3"></div>
                    {archetypes.map(arch => {
                      const archData = ARCHETYPES[arch];
                      const Icon = archData.icon;
                      return (
                        <div key={`header-${arch}`} className="p-3 text-center">
                          <div className={`w-10 h-10 mx-auto rounded-xl ${archData.bgColor} flex items-center justify-center mb-2`}>
                            <Icon className={`w-5 h-5 ${archData.textColor}`} />
                          </div>
                          <p className={`font-bold text-sm ${archData.textColor}`}>
                            {getArchetypeName(arch)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Matrix Rows */}
                  {matrix.map(row => {
                    const rowArch = ARCHETYPES[row.archetype];
                    const RowIcon = rowArch.icon;
                    return (
                      <div key={row.archetype} className="grid grid-cols-5 gap-2 mb-2">
                        {/* Row Header */}
                        <div className="p-3 flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-xl ${rowArch.bgColor} flex items-center justify-center flex-shrink-0`}>
                            <RowIcon className={`w-5 h-5 ${rowArch.textColor}`} />
                          </div>
                          <p className={`font-bold text-sm ${rowArch.textColor} hidden sm:block`}>
                            {getArchetypeName(row.archetype)}
                          </p>
                        </div>

                        {/* Compatibility Cells */}
                        {archetypes.map(colArch => {
                          const compatibility = row.compatibilities[colArch];
                          if (!compatibility) return <div key={`${row.archetype}-${colArch}`} className="p-3"></div>;

                          const score = compatibility.score;
                          const scoreColorClass = getScoreColor(score);
                          const isSame = row.archetype === colArch;

                          return (
                            <Card
                              key={`${row.archetype}-${colArch}`}
                              className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                isSame ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                              }`}
                              style={isSame ? { ringColor: ARCHETYPES[row.archetype].color } : {}}
                              onClick={() => handleSelectPair(row.archetype, colArch)}
                              data-testid={`cell-${row.archetype}-${colArch}`}
                            >
                              <CardContent className="p-3 text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${scoreColorClass} font-bold text-lg mb-1`}>
                                  {score}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {ENERGY_LABELS[compatibility.energy]?.[language] || compatibility.energy}
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score Legend */}
              <div className="mt-8 p-4 bg-secondary/50 rounded-xl">
                <p className="text-sm font-medium text-foreground mb-3">
                  {t("Keterangan Skor:", "Score Legend:")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-anchor/20 text-anchor font-bold text-sm flex items-center justify-center">85+</span>
                    <span className="text-sm text-muted-foreground">{t("Sangat Harmonis", "Very Harmonious")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-spark/20 text-spark font-bold text-sm flex items-center justify-center">75+</span>
                    <span className="text-sm text-muted-foreground">{t("Harmonis", "Harmonious")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-driver/20 text-driver font-bold text-sm flex items-center justify-center">65+</span>
                    <span className="text-sm text-muted-foreground">{t("Perlu Usaha", "Needs Effort")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-analyst/20 text-analyst font-bold text-sm flex items-center justify-center">&lt;65</span>
                    <span className="text-sm text-muted-foreground">{t("Menantang", "Challenging")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 text-center animate-slide-up stagger-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="heading-3 text-foreground mb-2">
                  {t("Temukan Arketipe Anda", "Discover Your Archetype")}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t(
                    "Ambil tes untuk mengetahui gaya komunikasi Anda dan lihat kompatibilitas dengan orang lain",
                    "Take the test to discover your communication style and see compatibility with others"
                  )}
                </p>
                <Button className="btn-primary" onClick={() => navigate("/series")} data-testid="take-test-btn">
                  {t("Ambil Tes Sekarang", "Take Test Now")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedPair && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" 
          onClick={closePairDetails}
          data-testid="modal-backdrop"
        >
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={e => e.stopPropagation()}
            data-testid="compatibility-modal"
          >
            {loadingDetails ? (
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">{t("Memuat...", "Loading...")}</p>
              </CardContent>
            ) : pairDetails ? (
              <CardContent className="p-0">
                {/* Modal Header */}
                <div className={`p-6 bg-gradient-to-r ${getScoreBgGradient(pairDetails.compatibility_score)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Archetype 1 */}
                      <div className={`w-12 h-12 rounded-xl ${ARCHETYPES[pairDetails.archetype1].bgColor} flex items-center justify-center`}>
                        {React.createElement(ARCHETYPES[pairDetails.archetype1].icon, {
                          className: `w-6 h-6 ${ARCHETYPES[pairDetails.archetype1].textColor}`
                        })}
                      </div>
                      <Heart className="w-5 h-5 text-muted-foreground" />
                      {/* Archetype 2 */}
                      <div className={`w-12 h-12 rounded-xl ${ARCHETYPES[pairDetails.archetype2].bgColor} flex items-center justify-center`}>
                        {React.createElement(ARCHETYPES[pairDetails.archetype2].icon, {
                          className: `w-6 h-6 ${ARCHETYPES[pairDetails.archetype2].textColor}`
                        })}
                      </div>
                    </div>
                    <button 
                      onClick={closePairDetails}
                      className="p-2 rounded-full hover:bg-secondary transition-colors"
                      data-testid="close-modal-btn"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl ${getScoreColor(pairDetails.compatibility_score)} font-bold text-2xl`}>
                      {pairDetails.compatibility_score}
                    </div>
                    <div>
                      <h2 className="heading-3 text-foreground">{pairDetails.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {getArchetypeName(pairDetails.archetype1)} × {getArchetypeName(pairDetails.archetype2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Summary */}
                  <div>
                    <p className="text-muted-foreground leading-relaxed">{pairDetails.summary}</p>
                  </div>

                  {/* Energy Level */}
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-spark" />
                    <span className="text-sm font-medium">{t("Energi:", "Energy:")}</span>
                    <span className={`text-sm font-bold ${ENERGY_LABELS[pairDetails.energy]?.color || ''}`}>
                      {ENERGY_LABELS[pairDetails.energy]?.[language] || pairDetails.energy}
                    </span>
                  </div>

                  {/* Strengths */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-anchor" />
                      <h3 className="font-bold text-foreground">{t("Kekuatan", "Strengths")}</h3>
                    </div>
                    <ul className="space-y-2">
                      {pairDetails.strengths?.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-anchor mt-2 flex-shrink-0"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-driver" />
                      <h3 className="font-bold text-foreground">{t("Tantangan", "Challenges")}</h3>
                    </div>
                    <ul className="space-y-2">
                      {pairDetails.challenges?.map((challenge, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-driver mt-2 flex-shrink-0"></span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-spark" />
                      <h3 className="font-bold text-foreground">{t("Tips Komunikasi", "Communication Tips")}</h3>
                    </div>
                    <ul className="space-y-2">
                      {pairDetails.tips?.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-spark mt-2 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowShare(true)}
                      className="flex-1"
                      data-testid="share-compat-btn"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {t("Bagikan", "Share")}
                    </Button>
                    <Button 
                      className="btn-primary flex-1"
                      onClick={() => navigate("/series")}
                      data-testid="modal-take-test-btn"
                    >
                      {t("Ambil Tes", "Take Test")}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">{t("Gagal memuat data", "Failed to load data")}</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Share Compatibility Modal */}
      {showShare && pairDetails && (
        <ShareCompatibility
          archetype1={pairDetails.archetype1}
          archetype2={pairDetails.archetype2}
          score={pairDetails.compatibility_score}
          title={pairDetails.title}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default CompatibilityPage;
