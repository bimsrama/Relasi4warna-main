import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft, ArrowRight, Globe, CheckCircle } from "lucide-react";

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
              <Button onClick={() => navigate("/series")} className="rounded-full" data-testid="start-btn">
                {t("Mulai Tes", "Start Test")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const ARCHETYPES = [
  { id: "driver", name_id: "Penggerak", name_en: "Driver", color: "#C05640", desc_id: "Tegas, berorientasi hasil, dan memiliki kemampuan mengambil keputusan cepat. Penggerak adalah pemimpin alami yang mendorong tim menuju tujuan.", desc_en: "Assertive, results-oriented, with quick decision-making ability. Drivers are natural leaders who push teams toward goals." },
  { id: "spark", name_id: "Percikan", name_en: "Spark", color: "#D99E30", desc_id: "Ekspresif, kreatif, dan penuh energi. Percikan membawa semangat dan ide-ide segar dalam setiap interaksi.", desc_en: "Expressive, creative, and full of energy. Sparks bring enthusiasm and fresh ideas to every interaction." },
  { id: "anchor", name_id: "Jangkar", name_en: "Anchor", color: "#5D8A66", desc_id: "Stabil, sabar, dan dapat diandalkan. Jangkar adalah pilar ketenangan yang menjaga harmoni dalam hubungan.", desc_en: "Stable, patient, and dependable. Anchors are pillars of calm that maintain harmony in relationships." },
  { id: "analyst", name_id: "Analis", name_en: "Analyst", color: "#5B8FA8", desc_id: "Teliti, sistematis, dan berorientasi kualitas. Analis memastikan setiap keputusan diambil berdasarkan data dan analisis mendalam.", desc_en: "Thorough, systematic, and quality-oriented. Analysts ensure every decision is made based on data and deep analysis." }
];

const STEPS = [
  {
    step: 1,
    title_id: "Pilih Seri Tes",
    title_en: "Choose Test Series",
    desc_id: "Pilih konteks hubungan yang ingin Anda eksplorasi: Keluarga, Bisnis, Persahabatan, atau Pasangan.",
    desc_en: "Choose the relationship context you want to explore: Family, Business, Friendship, or Couples."
  },
  {
    step: 2,
    title_id: "Jawab 24 Pertanyaan",
    title_en: "Answer 24 Questions",
    desc_id: "Jawab pertanyaan situasional yang dirancang untuk mengungkap gaya komunikasi alami Anda. Tidak ada jawaban benar atau salah.",
    desc_en: "Answer situational questions designed to reveal your natural communication style. There are no right or wrong answers."
  },
  {
    step: 3,
    title_id: "Dapatkan Hasil Instan",
    title_en: "Get Instant Results",
    desc_id: "Lihat ringkasan hasil Anda secara langsung, termasuk arketipe primer dan sekunder Anda.",
    desc_en: "See your results summary instantly, including your primary and secondary archetypes."
  },
  {
    step: 4,
    title_id: "Upgrade ke Laporan Lengkap",
    title_en: "Upgrade to Full Report",
    desc_id: "Dapatkan analisis mendalam dengan skrip praktis, rencana aksi, dan panduan kompatibilitas.",
    desc_en: "Get in-depth analysis with practical scripts, action plans, and compatibility guides."
  }
];

const HowItWorksPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6" data-testid="back-link">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Kembali", "Back")}
          </Link>

          {/* Hero */}
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="heading-1 text-foreground mb-4">
              {t("Bagaimana Cara Kerjanya?", "How Does It Work?")}
            </h1>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Relasi4Warna menggunakan framework 4-Drive Communication Archetypes yang kami kembangkan untuk membantu Anda memahami gaya komunikasi Anda dan orang-orang terdekat.",
                "4Color Relating uses our 4-Drive Communication Archetypes framework to help you understand your communication style and those closest to you."
              )}
            </p>
          </div>

          {/* 4 Archetypes */}
          <section className="mb-16 animate-slide-up stagger-1">
            <h2 className="heading-2 text-foreground mb-8 text-center">
              {t("4 Arketipe Komunikasi", "4 Communication Archetypes")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ARCHETYPES.map((arch, idx) => (
                <Card key={arch.id} className="card-hover" style={{ borderLeftWidth: 4, borderLeftColor: arch.color }} data-testid={`archetype-${arch.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: arch.color + "20" }}
                      >
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: arch.color }} />
                      </div>
                      <h3 className="text-xl font-bold" style={{ color: arch.color, fontFamily: 'Merriweather, serif' }}>
                        {language === "id" ? arch.name_id : arch.name_en}
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      {language === "id" ? arch.desc_id : arch.desc_en}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section className="mb-16 animate-slide-up stagger-2">
            <h2 className="heading-2 text-foreground mb-8 text-center">
              {t("Langkah-Langkah", "Steps")}
            </h2>
            <div className="space-y-6">
              {STEPS.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                      {language === "id" ? step.title_id : step.title_en}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "id" ? step.desc_id : step.desc_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16 animate-slide-up stagger-3">
            <h2 className="heading-2 text-foreground mb-8 text-center">
              {t("Mengapa Relasi4Warna?", "Why 4Color Relating?")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title_id: "Berbasis Riset",
                  title_en: "Research-Based",
                  desc_id: "Framework yang dikembangkan berdasarkan studi komunikasi hubungan",
                  desc_en: "Framework developed based on relationship communication studies"
                },
                {
                  title_id: "Praktis & Aplikatif",
                  title_en: "Practical & Applicable",
                  desc_id: "Hasil yang dapat langsung diterapkan dalam kehidupan sehari-hari",
                  desc_en: "Results that can be immediately applied in daily life"
                },
                {
                  title_id: "Privasi Terjaga",
                  title_en: "Privacy Protected",
                  desc_id: "Data Anda aman dan tidak dibagikan ke pihak ketiga",
                  desc_en: "Your data is secure and not shared with third parties"
                }
              ].map((benefit, idx) => (
                <Card key={idx} className="text-center p-6">
                  <CheckCircle className="w-12 h-12 text-anchor mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                    {language === "id" ? benefit.title_id : benefit.title_en}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {language === "id" ? benefit.desc_id : benefit.desc_en}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mb-16 p-6 bg-secondary/50 rounded-2xl animate-slide-up stagger-4">
            <h3 className="font-bold text-foreground mb-2">{t("Disclaimer", "Disclaimer")}</h3>
            <p className="text-sm text-muted-foreground">
              {t(
                "Relasi4Warna adalah alat edukatif untuk membantu pemahaman gaya komunikasi. Ini bukan alat diagnosis psikologis atau medis. Hasil tes bersifat informatif dan tidak dimaksudkan untuk menggantikan konsultasi profesional.",
                "4Color Relating is an educational tool to help understand communication styles. It is not a psychological or medical diagnostic tool. Test results are informative and not intended to replace professional consultation."
              )}
            </p>
          </section>

          {/* CTA */}
          <div className="text-center animate-slide-up stagger-5">
            <Button size="lg" onClick={() => navigate("/series")} className="btn-primary text-lg px-12 py-6" data-testid="cta-btn">
              {t("Mulai Tes Gratis", "Start Free Assessment")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowItWorksPage;
