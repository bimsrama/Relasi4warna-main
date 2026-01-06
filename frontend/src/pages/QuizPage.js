import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, ArrowRight, Clock, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const QuizPage = () => {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { series } = useParams();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const initQuiz = async () => {
      try {
        // Start quiz attempt
        const attemptRes = await axios.post(
          `${API}/quiz/start`,
          { series, language },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttemptId(attemptRes.data.attempt_id);

        // Get questions
        const questionsRes = await axios.get(`${API}/quiz/questions/${series}?language=${language}`);
        setQuestions(questionsRes.data.questions || []);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing quiz:", error);
        toast.error(t("Gagal memuat pertanyaan", "Failed to load questions"));
        navigate("/series");
      }
    };

    initQuiz();
  }, [series, language, token, navigate, t]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const elapsedMinutes = Math.floor((Date.now() - startTime.current) / 60000);

  const handleSelectOption = (archetype) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: archetype
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.question_id]);
    if (unanswered.length > 0) {
      toast.error(t(
        `Masih ada ${unanswered.length} pertanyaan yang belum dijawab`,
        `There are still ${unanswered.length} unanswered questions`
      ));
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id,
        selected_option
      }));

      const response = await axios.post(
        `${API}/quiz/submit`,
        { attempt_id: attemptId, answers: answersArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(t("Tes selesai!", "Test completed!"));
      navigate(`/result/${response.data.result_id}`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(t("Gagal mengirim jawaban", "Failed to submit answers"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("Memuat pertanyaan...", "Loading questions...")}</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("Tidak ada pertanyaan", "No questions available")}</p>
      </div>
    );
  }

  const ARCHETYPE_COLORS = {
    driver: "#C05640",
    spark: "#D99E30",
    anchor: "#5D8A66",
    analyst: "#5B8FA8"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate("/series")} 
              className="flex items-center text-muted-foreground hover:text-foreground"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Keluar", "Exit")}
            </button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{elapsedMinutes} {t("menit", "min")}</span>
              </div>
              <span>{currentIndex + 1} / {questions.length}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {t("Pertanyaan", "Question")} {currentIndex + 1} {t("dari", "of")} {questions.length}
            </p>
          </div>

          {/* Question */}
          <Card className="mb-8 animate-fade-in" data-testid="question-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6" style={{ fontFamily: 'Merriweather, serif' }}>
                {currentQuestion.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = answers[currentQuestion.question_id] === option.archetype;
                  const archetype = option.archetype;
                  const color = ARCHETYPE_COLORS[archetype] || "#4A3B32";

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option.archetype)}
                      className={`quiz-option ${isSelected ? 'selected' : ''}`}
                      style={isSelected ? { borderColor: color, backgroundColor: color + "10" } : {}}
                      data-testid={`option-${idx}`}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors`}
                          style={{ 
                            borderColor: isSelected ? color : "#E6E2D8",
                            backgroundColor: isSelected ? color : "transparent"
                          }}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-foreground text-left">
                          {language === "id" ? option.text_id : option.text_en}
                        </span>
                      </div>
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
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-full"
              data-testid="prev-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Sebelumnya", "Previous")}
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.question_id]}
                className="btn-primary"
                data-testid="next-btn"
              >
                {t("Selanjutnya", "Next")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="btn-primary"
                data-testid="submit-btn"
              >
                {submitting ? t("Mengirim...", "Submitting...") : t("Selesai", "Finish")}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="mt-8 p-4 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground mb-3">{t("Navigasi Pertanyaan:", "Question Navigator:")}</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.question_id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      isCurrent 
                        ? 'bg-primary text-primary-foreground' 
                        : isAnswered 
                          ? 'bg-anchor text-white' 
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                    data-testid={`nav-${idx}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
