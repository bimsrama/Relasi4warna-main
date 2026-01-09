import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Home, Briefcase, Users, Heart, ArrowRight, ArrowLeft, Globe, Clock, CheckCircle } from "lucide-react";
import axios from "axios";

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
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
            {isAuthenticated ? (
              <Button variant="ghost" onClick={() => navigate("/dashboard")} data-testid="dashboard-btn">
                {t("Dashboard", "Dashboard")}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => navigate("/login")} data-testid="login-btn">
                {t("Masuk", "Login")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const SERIES_DATA = {
  family: {
    id: "family",
    name_id: "Keluarga",
    name_en: "Family",
    description_id: "Tes ini akan membantu Anda memahami dinamika komunikasi dalam keluarga. Temukan cara terbaik untuk terhubung dengan orang tua, anak, saudara, dan anggota keluarga lainnya.",
    description_en: "This test will help you understand communication dynamics in your family. Find the best ways to connect with parents, children, siblings, and other family members.",
    icon: Home,
    color: "#5D8A66",
    bgClass: "gradient-anchor",
    image: "https://images.unsplash.com/photo-1506836467174-27f1042aa48c?w=800&h=500&fit=crop",
    benefits_id: ["Memahami gaya komunikasi anggota keluarga", "Mengurangi kesalahpahaman", "Membangun hubungan yang lebih harmonis", "Menemukan cara baru untuk terhubung"],
    benefits_en: ["Understand family members' communication styles", "Reduce misunderstandings", "Build more harmonious relationships", "Find new ways to connect"]
  },
  business: {
    id: "business",
    name_id: "Bisnis",
    name_en: "Business",
    description_id: "Tes ini dirancang untuk meningkatkan komunikasi di lingkungan profesional. Optimalkan kolaborasi tim, negosiasi, dan kepemimpinan Anda.",
    description_en: "This test is designed to improve communication in professional settings. Optimize your team collaboration, negotiation, and leadership.",
    icon: Briefcase,
    color: "#5B8FA8",
    bgClass: "gradient-analyst",
    image: "https://images.unsplash.com/photo-1704652329540-851160c7741f?w=800&h=500&fit=crop",
    benefits_id: ["Meningkatkan efektivitas tim", "Komunikasi yang lebih efisien", "Memahami gaya kerja rekan", "Kepemimpinan yang lebih baik"],
    benefits_en: ["Improve team effectiveness", "More efficient communication", "Understand colleagues' work styles", "Better leadership"]
  },
  friendship: {
    id: "friendship",
    name_id: "Persahabatan",
    name_en: "Friendship",
    description_id: "Tes ini akan membantu Anda memahami dinamika pertemanan. Perkuat ikatan dengan sahabat dan pahami cara menjaga hubungan yang sehat.",
    description_en: "This test will help you understand friendship dynamics. Strengthen bonds with friends and understand how to maintain healthy relationships.",
    icon: Users,
    color: "#D99E30",
    bgClass: "gradient-spark",
    image: "https://images.unsplash.com/photo-1753351056838-143bc3e4cf03?w=800&h=500&fit=crop",
    benefits_id: ["Memahami kebutuhan teman", "Komunikasi yang lebih terbuka", "Mengatasi konflik dengan bijak", "Memperdalam ikatan persahabatan"],
    benefits_en: ["Understand friends' needs", "More open communication", "Handle conflicts wisely", "Deepen friendship bonds"]
  },
  couples: {
    id: "couples",
    name_id: "Pasangan",
    name_en: "Couples",
    description_id: "Tes ini khusus untuk pasangan yang ingin membangun komunikasi yang lebih intim dan harmonis. Temukan cara untuk saling memahami lebih dalam.",
    description_en: "This test is specifically for couples who want to build more intimate and harmonious communication. Find ways to understand each other more deeply.",
    icon: Heart,
    color: "#C05640",
    bgClass: "gradient-driver",
    image: "https://images.unsplash.com/photo-1587485762996-56c4ac180df9?w=800&h=500&fit=crop",
    benefits_id: ["Komunikasi yang lebih intim", "Memahami kebutuhan pasangan", "Mengatasi pola konflik", "Membangun hubungan yang lebih kuat"],
    benefits_en: ["More intimate communication", "Understand partner's needs", "Overcome conflict patterns", "Build stronger relationships"]
  }
};

const SeriesPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { seriesId } = useParams();

  // If no seriesId, show series selection
  if (!seriesId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("Kembali", "Back")}
              </Link>
              <h1 className="heading-1 text-foreground mb-4">
                {t("Pilih Seri Tes", "Choose Test Series")}
              </h1>
              <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "Setiap seri dirancang untuk konteks hubungan yang berbeda. Pilih yang paling sesuai dengan kebutuhan Anda.",
                  "Each series is designed for different relationship contexts. Choose the one that best fits your needs."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(SERIES_DATA).map((series, idx) => {
                const Icon = series.icon;
                return (
                  <Card 
                    key={series.id}
                    className={`card-hover overflow-hidden cursor-pointer animate-slide-up stagger-${idx + 1}`}
                    onClick={() => navigate(`/series/${series.id}`)}
                    data-testid={`series-card-${series.id}`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={series.image} 
                        alt={language === "id" ? series.name_id : series.name_en}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to top, ${series.color}90, transparent)` }}
                      />
                      <div className="absolute bottom-4 left-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                          <Icon className="w-6 h-6" style={{ color: series.color }} />
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>
                          {language === "id" ? series.name_id : series.name_en}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {language === "id" ? series.description_id : series.description_en}
                      </p>
                      <div className="flex items-center text-primary font-medium">
                        {t("Mulai Tes", "Start Test")}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show specific series detail
  const series = SERIES_DATA[seriesId];
  if (!series) {
    return navigate("/series");
  }

  const Icon = series.icon;

  const handleStartQuiz = () => {
    if (isAuthenticated) {
      navigate(`/quiz/${seriesId}`);
    } else {
      navigate("/login", { state: { from: `/quiz/${seriesId}` } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/series" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6" data-testid="back-link">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Kembali ke Pilihan Seri", "Back to Series Selection")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="relative rounded-2xl overflow-hidden animate-slide-up">
              <img 
                src={series.image} 
                alt={language === "id" ? series.name_id : series.name_en}
                className="w-full h-64 lg:h-full object-cover"
              />
              <div 
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${series.color}60, transparent)` }}
              />
            </div>

            {/* Content Section */}
            <div className="animate-slide-up stagger-1">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: series.color + "20" }}
                >
                  <Icon className="w-7 h-7" style={{ color: series.color }} />
                </div>
                <div>
                  <h1 className="heading-2 text-foreground">
                    {t("Tes ", "Test: ")}{language === "id" ? series.name_id : series.name_en}
                  </h1>
                </div>
              </div>

              <p className="body-lg text-muted-foreground mb-6">
                {language === "id" ? series.description_id : series.description_en}
              </p>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
                  {t("Yang Akan Anda Dapatkan:", "What You'll Get:")}
                </h3>
                <ul className="space-y-2">
                  {(language === "id" ? series.benefits_id : series.benefits_en).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: series.color }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Test Info */}
              <div className="flex items-center gap-6 mb-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>10-15 {t("menit", "minutes")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>24 {t("pertanyaan", "questions")}</span>
                </div>
              </div>

              {/* CTA */}
              <Button 
                size="lg" 
                onClick={handleStartQuiz}
                className="btn-primary text-lg w-full sm:w-auto px-12 py-6"
                style={{ backgroundColor: series.color }}
                data-testid="start-quiz-btn"
              >
                {t("Mulai Tes Sekarang", "Start Test Now")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              {!isAuthenticated && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {t(
                    "Anda perlu masuk atau daftar untuk memulai tes",
                    "You need to login or register to start the test"
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeriesPage;
