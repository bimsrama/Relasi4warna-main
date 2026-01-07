import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, ArrowRight, Check, Globe, Crown, Sparkles } from "lucide-react";

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

const PRICING_PLANS = [
  {
    id: "single",
    name_id: "Laporan Lengkap",
    name_en: "Full Report",
    price_idr: 99000,
    price_usd: 6.99,
    original_price_idr: 149000,
    original_price_usd: 9.99,
    description_id: "Laporan mendalam untuk satu hasil tes",
    description_en: "In-depth report for one test result",
    features_id: [
      "Analisis lengkap kekuatan & blind spot",
      "6 skrip dialog praktis",
      "Rencana aksi 7 hari",
      "Panduan kompatibilitas",
      "Format PDF yang dapat diunduh"
    ],
    features_en: [
      "Complete strengths & blind spots analysis",
      "6 practical dialogue scripts",
      "7-day action plan",
      "Compatibility guide",
      "Downloadable PDF format"
    ],
    popular: true
  },
  {
    id: "couples",
    name_id: "Paket Pasangan",
    name_en: "Couples Pack",
    price_idr: 149000,
    price_usd: 9.99,
    original_price_idr: 199000,
    original_price_usd: 14.99,
    description_id: "Untuk 2 orang dengan analisis hubungan",
    description_en: "For 2 people with relationship analysis",
    features_id: [
      "2 laporan lengkap individual",
      "Analisis kompatibilitas bersama",
      "Peta pola konflik hubungan",
      "Skrip komunikasi khusus pasangan",
      "Ritual mingguan yang disarankan"
    ],
    features_en: [
      "2 complete individual reports",
      "Joint compatibility analysis",
      "Relationship conflict pattern map",
      "Couple-specific communication scripts",
      "Suggested weekly rituals"
    ]
  },
  {
    id: "family",
    name_id: "Paket Keluarga",
    name_en: "Family Pack",
    price_idr: 349000,
    price_usd: 24.99,
    original_price_idr: 449000,
    original_price_usd: 34.99,
    description_id: "Hingga 6 anggota keluarga",
    description_en: "Up to 6 family members",
    features_id: [
      "6 laporan lengkap individual",
      "Dashboard perbandingan keluarga",
      "Rencana aksi keluarga mingguan",
      "Peta dinamika keluarga",
      "Panduan resolusi konflik keluarga"
    ],
    features_en: [
      "6 complete individual reports",
      "Family comparison dashboard",
      "Weekly family action plan",
      "Family dynamics map",
      "Family conflict resolution guide"
    ]
  },
  {
    id: "team",
    name_id: "Paket Tim",
    name_en: "Team Pack",
    price_idr: 499000,
    price_usd: 34.99,
    original_price_idr: 649000,
    original_price_usd: 49.99,
    description_id: "Hingga 10 anggota tim",
    description_en: "Up to 10 team members",
    features_id: [
      "10 laporan lengkap individual",
      "Heatmap tim",
      "Saran peran dalam tim",
      "Generator piagam komunikasi tim",
      "Panduan meeting efektif"
    ],
    features_en: [
      "10 complete individual reports",
      "Team heatmap",
      "Team role suggestions",
      "Team communication charter generator",
      "Effective meeting guide"
    ]
  }
];

const ELITE_PLANS = [
  {
    id: "elite_single",
    name_id: "Elite Report",
    name_en: "Elite Report",
    price_idr: 299000,
    price_usd: 19.99,
    description_id: "Akses modul spesialis sekali pakai",
    description_en: "One-time access to specialist modules",
    features_id: [
      "Semua fitur Laporan Lengkap",
      "Modul Parent-Child Dynamics",
      "Modul Business & Leadership",
      "Modul Team Dynamics",
      "Modul Quarterly Calibration"
    ],
    features_en: [
      "All Full Report features",
      "Parent-Child Dynamics module",
      "Business & Leadership module",
      "Team Dynamics module",
      "Quarterly Calibration module"
    ],
    tier: "elite"
  },
  {
    id: "elite_monthly",
    name_id: "Elite Bulanan",
    name_en: "Elite Monthly",
    price_idr: 499000,
    price_usd: 34.99,
    description_id: "Akses bulanan semua modul Elite",
    description_en: "Monthly access to all Elite modules",
    features_id: [
      "Unlimited Elite Reports",
      "Semua modul spesialis",
      "Priority support",
      "Laporan baru setiap bulan"
    ],
    features_en: [
      "Unlimited Elite Reports",
      "All specialist modules",
      "Priority support",
      "New reports every month"
    ],
    tier: "elite",
    popular: true
  },
  {
    id: "elite_plus_monthly",
    name_id: "Elite+ Program",
    name_en: "Elite+ Program",
    price_idr: 999000,
    price_usd: 69.99,
    description_id: "Termasuk sertifikasi & coaching",
    description_en: "Includes certification & coaching",
    features_id: [
      "Semua fitur Elite",
      "Program Sertifikasi Level 1-4",
      "AI-Human Hybrid Coaching",
      "Governance Dashboard",
      "Certificate of Completion"
    ],
    features_en: [
      "All Elite features",
      "Certification Program Level 1-4",
      "AI-Human Hybrid Coaching",
      "Governance Dashboard",
      "Certificate of Completion"
    ],
    tier: "elite_plus"
  }
];

const PricingPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (idr, usd) => {
    if (language === "id") {
      return `Rp ${idr.toLocaleString("id-ID")}`;
    }
    return `$${usd}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6" data-testid="back-link">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Kembali", "Back")}
          </Link>

          <div className="text-center mb-12 animate-slide-up">
            <h1 className="heading-1 text-foreground mb-4">
              {t("Pilihan Paket", "Pricing Plans")}
            </h1>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Pilih paket yang sesuai dengan kebutuhan Anda. Semua paket termasuk laporan berkualitas tinggi yang dipersonalisasi.",
                "Choose a plan that fits your needs. All plans include high-quality personalized reports."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan, idx) => (
              <Card 
                key={plan.id}
                className={`relative card-hover animate-slide-up stagger-${idx + 1} ${plan.popular ? 'border-primary border-2' : ''}`}
                data-testid={`pricing-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      {t("POPULER", "POPULAR")}
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl mb-2">
                    {language === "id" ? plan.name_id : plan.name_en}
                  </CardTitle>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(plan.price_idr, plan.price_usd)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(plan.original_price_idr, plan.original_price_usd)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === "id" ? plan.description_id : plan.description_en}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {(language === "id" ? plan.features_id : plan.features_en).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-anchor flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'btn-primary' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate("/series")}
                    data-testid={`select-${plan.id}`}
                  >
                    {t("Mulai Sekarang", "Get Started")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Link */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              {t("Punya pertanyaan tentang harga?", "Have questions about pricing?")}
            </p>
            <Button variant="outline" onClick={() => navigate("/faq")} className="rounded-full" data-testid="faq-link">
              {t("Lihat FAQ", "View FAQ")}
            </Button>
          </div>

          {/* Elite Tier Section */}
          <div className="mt-20 pt-12 border-t">
            <div className="text-center mb-12 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-amber-600">{t("Tier Premium", "Premium Tier")}</span>
              </div>
              <h2 className="heading-2 text-foreground mb-4">
                {t("Elite & Elite+ Program", "Elite & Elite+ Program")}
              </h2>
              <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "Dapatkan akses ke modul-modul spesialis dan program sertifikasi untuk insight yang lebih mendalam.",
                  "Get access to specialist modules and certification programs for deeper insights."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ELITE_PLANS.map((plan, idx) => (
                <Card 
                  key={plan.id}
                  className={`relative card-hover animate-slide-up ${plan.popular ? 'border-amber-500 border-2' : 'border-amber-500/30'}`}
                  data-testid={`pricing-${plan.id}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {t("REKOMENDASI", "RECOMMENDED")}
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <CardTitle className="text-xl">
                        {language === "id" ? plan.name_id : plan.name_en}
                      </CardTitle>
                    </div>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(plan.price_idr, plan.price_usd)}
                      </span>
                      {plan.id.includes('monthly') && (
                        <span className="text-sm text-muted-foreground">/{t("bulan", "month")}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === "id" ? plan.description_id : plan.description_en}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {(language === "id" ? plan.features_id : plan.features_en).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => navigate("/series")}
                      data-testid={`select-${plan.id}`}
                    >
                      {t("Mulai Sekarang", "Get Started")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
