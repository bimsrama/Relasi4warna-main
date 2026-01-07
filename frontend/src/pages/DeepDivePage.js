import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { 
  ArrowLeft, ArrowRight, Brain, Sparkles, Lock, 
  CheckCircle, Loader2, Star, Users, Heart, MessageCircle 
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const DeepDivePage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { resultId } = useParams();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [baseResult, setBaseResult] = useState(null);

  const sectionIcons = {
    inner_motivation: Brain,
    stress_response: Sparkles,
    relationship_dynamics: Heart,
    communication_patterns: MessageCircle
  };

  const sectionNames = {
    inner_motivation: { id: "Motivasi Tersembunyi", en: "Hidden Motivations" },
    stress_response: { id: "Respons Stres", en: "Stress Response" },
    relationship_dynamics: { id: "Dinamika Hubungan", en: "Relationship Dynamics" },
    communication_patterns: { id: "Pola Komunikasi", en: "Communication Patterns" }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !resultId) {
        navigate('/login');
        return;
      }

      try {
        // Check base result and payment status
        const [questionsRes, resultRes] = await Promise.all([
          axios.get(`${API}/deep-dive/questions?language=${language}`),
          axios.get(`${API}/quiz/result/${resultId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setQuestions(questionsRes.data.questions);
        setBaseResult(resultRes.data);

        // Check if already has deep dive result
        try {
          const ddResult = await axios.get(`${API}/deep-dive/result/${resultId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setResult(ddResult.data);
          setHasPaid(true);
        } catch (e) {
          // No deep dive result yet
        }

        // Check payment status
        const paymentsRes = await axios.get(`${API}/user/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { payments: [] } }));

        const deepDivePayment = paymentsRes.data.payments?.find(
          p => p.result_id === resultId && 
               (p.product_type === 'deep_dive' || p.product_type === 'subscription') &&
               p.status === 'paid'
        );

        if (deepDivePayment) {
          setHasPaid(true);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(t("Gagal memuat data", "Failed to load data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, resultId, language, navigate, t]);

  const handleAnswer = (option) => {
    const currentQuestion = questions[currentIndex];
    const newAnswer = {
      question_id: currentQuestion.question_id,
      section: currentQuestion.section,
      archetype: option.archetype,
      weight: option.weight
    };

    const newAnswers = [...answers];
    newAnswers[currentIndex] = newAnswer;
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (answers.length < questions.length) {
      toast.error(t("Jawab semua pertanyaan", "Answer all questions"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API}/deep-dive/submit`,
        { result_id: resultId, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setResult(response.data);
      toast.success(t("Analisis Deep Dive selesai!", "Deep Dive analysis complete!"));
    } catch (error) {
      console.error('Error submitting:', error);
      if (error.response?.status === 402) {
        toast.error(t("Silakan beli paket Deep Dive terlebih dahulu", "Please purchase Deep Dive package first"));
        navigate(`/result/${resultId}`);
      } else {
        toast.error(t("Gagal menyimpan hasil", "Failed to save results"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuyDeepDive = async () => {
    try {
      const response = await axios.post(
        `${API}/payment/create`,
        {
          result_id: resultId,
          product_type: "deep_dive",
          currency: "IDR"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      navigate(`/checkout/${response.data.payment_id}`);
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(t("Gagal membuat pembayaran", "Failed to create payment"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t("Memuat...", "Loading...")}</p>
        </div>
      </div>
    );
  }

  // Show payment gate if not paid
  if (!hasPaid) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="flex items-center h-16">
              <button onClick={() => navigate(-1)} className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Kembali", "Back")}
              </button>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="heading-2 text-foreground mb-4">
              {t("Deep Dive Analysis", "Deep Dive Analysis")}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              {t(
                "Analisis mendalam untuk memahami kepribadian Anda secara lebih detail, termasuk dampak terhadap tipe lain dan cara koneksi yang efektif.",
                "In-depth analysis to understand your personality in more detail, including impact on other types and effective connection strategies."
              )}
            </p>

            <Card className="mb-8 text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {t("Yang Anda Dapatkan", "What You'll Get")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    t("16 pertanyaan mendalam untuk analisis lebih akurat", "16 deep questions for more accurate analysis"),
                    t("Profil kepribadian lengkap & pola motivasi tersembunyi", "Complete personality profile & hidden motivation patterns"),
                    t("Analisis respons stres & strategi pemulihan", "Stress response analysis & recovery strategies"),
                    t("Dampak Anda terhadap 4 tipe komunikasi lainnya", "Your impact on the other 4 communication types"),
                    t("Panduan koneksi spesifik untuk setiap tipe", "Specific connection guide for each type"),
                    t("Rencana pengembangan 30 hari", "30-day development plan")
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-6">
              <p className="text-sm text-muted-foreground mb-2">{t("Harga Spesial", "Special Price")}</p>
              <p className="text-3xl font-bold text-foreground mb-4">
                Rp 149.000
              </p>
              <Button size="lg" className="w-full btn-primary" onClick={handleBuyDeepDive}>
                {t("Dapatkan Deep Dive Analysis", "Get Deep Dive Analysis")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show result if already completed
  if (result) {
    const archetypeNames = {
      driver: { id: "Penggerak", en: "Driver", color: "#DC2626" },
      spark: { id: "Percikan", en: "Spark", color: "#F59E0B" },
      anchor: { id: "Jangkar", en: "Anchor", color: "#10B981" },
      analyst: { id: "Analis", en: "Analyst", color: "#3B82F6" }
    };

    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <button onClick={() => navigate(`/result/${resultId}`)} className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Kembali ke Hasil", "Back to Result")}
              </button>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="heading-2 text-foreground mb-2">
                {t("Hasil Deep Dive Analysis", "Deep Dive Analysis Result")}
              </h1>
              <p className="text-muted-foreground">
                {t("Analisis kepribadian mendalam Anda", "Your in-depth personality analysis")}
              </p>
            </div>

            {/* Primary & Secondary */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t("Tipe Utama Deep Dive", "Deep Dive Primary Type")}</p>
                  <p className="text-3xl font-bold" style={{ color: archetypeNames[result.dd_primary].color }}>
                    {language === "id" ? archetypeNames[result.dd_primary].id : archetypeNames[result.dd_primary].en}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    {result.total_scores[result.dd_primary]}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t("Tipe Sekunder Deep Dive", "Deep Dive Secondary Type")}</p>
                  <p className="text-3xl font-bold" style={{ color: archetypeNames[result.dd_secondary].color }}>
                    {language === "id" ? archetypeNames[result.dd_secondary].id : archetypeNames[result.dd_secondary].en}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    {result.total_scores[result.dd_secondary]}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Section Scores */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{t("Skor per Kategori", "Scores by Category")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(result.section_scores || {}).map(([section, scores]) => {
                    const Icon = sectionIcons[section] || Brain;
                    return (
                      <div key={section} className="p-4 rounded-xl bg-secondary/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">
                            {language === "id" ? sectionNames[section]?.id : sectionNames[section]?.en}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(scores).map(([archetype, score]) => (
                            <div key={archetype} className="flex items-center gap-2">
                              <span className="text-xs w-16" style={{ color: archetypeNames[archetype].color }}>
                                {language === "id" ? archetypeNames[archetype].id : archetypeNames[archetype].en}
                              </span>
                              <Progress value={score * 12.5} className="flex-1 h-2" />
                              <span className="text-xs text-muted-foreground w-8">{score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Type Interactions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("Dampak Anda terhadap Tipe Lain", "Your Impact on Other Types")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.type_interactions || {}).map(([type, data]) => {
                    const langData = data[language] || data.id;
                    return (
                      <div key={type} className="p-4 rounded-xl border">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: archetypeNames[type].color }}
                          />
                          <h4 className="font-medium">
                            {t("Dengan", "With")} {language === "id" ? archetypeNames[type].id : archetypeNames[type].en}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{langData.dynamic}</p>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 rounded bg-green-50 dark:bg-green-950/30">
                            <span className="font-medium text-green-700 dark:text-green-400">{t("Kekuatan:", "Strength:")}</span> {langData.strength}
                          </div>
                          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30">
                            <span className="font-medium text-amber-700 dark:text-amber-400">{t("Tantangan:", "Challenge:")}</span> {langData.challenge}
                          </div>
                        </div>
                        <p className="text-sm mt-2 p-2 rounded bg-primary/5">
                          <span className="font-medium">{t("💡 Tips:", "💡 Tip:")}</span> {langData.tip}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Generate AI Report Button */}
            <div className="text-center">
              <Button 
                size="lg" 
                className="btn-primary"
                onClick={() => navigate(`/deep-dive-report/${resultId}`)}
              >
                {t("Lihat Laporan AI Lengkap", "View Full AI Report")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quiz interface
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentSection = currentQuestion?.section;
  const SectionIcon = sectionIcons[currentSection] || Brain;

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)} className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Keluar", "Exit")}
            </button>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-primary">
                <SectionIcon className="w-4 h-4" />
                <span>{language === "id" ? sectionNames[currentSection]?.id : sectionNames[currentSection]?.en}</span>
              </div>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Question */}
          <Card className="mb-8 animate-slide-up">
            <CardContent className="pt-6">
              <p className="text-xl md:text-2xl font-medium text-foreground mb-8 leading-relaxed">
                {currentQuestion?.text}
              </p>

              <div className="space-y-3">
                {currentQuestion?.options.map((option, idx) => {
                  const isSelected = answers[currentIndex]?.archetype === option.archetype;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <span className="text-foreground">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Sebelumnya", "Previous")}
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || answers.length < questions.length}
                className="btn-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("Memproses...", "Processing...")}
                  </>
                ) : (
                  <>
                    {t("Lihat Hasil", "See Results")}
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={!answers[currentIndex]}
              >
                {t("Selanjutnya", "Next")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeepDivePage;
