import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Home, Briefcase, Users, Heart, ChevronRight, Globe, Menu, X, ArrowRight } from "lucide-react";

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R4</span>
            </div>
            <span className="font-bold text-lg md:text-xl text-foreground hidden sm:block">
              {t("Relasi4Warna", "4Color Relating")}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-how-it-works">
              {t("Cara Kerja", "How It Works")}
            </Link>
            <Link to="/series" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-series">
              {t("Seri Tes", "Test Series")}
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-pricing">
              {t("Harga", "Pricing")}
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-faq">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="language-toggle"
            >
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>

            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")} data-testid="dashboard-btn">
                  {t("Dashboard", "Dashboard")}
                </Button>
                <Button variant="outline" onClick={logout} data-testid="logout-btn" className="hidden sm:flex">
                  {t("Keluar", "Logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} data-testid="login-btn" className="hidden sm:flex">
                  {t("Masuk", "Login")}
                </Button>
                <Button onClick={() => navigate("/series")} data-testid="start-btn" className="rounded-full">
                  {t("Mulai Tes", "Start Test")}
                </Button>
              </>
            )}

            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} data-testid="mobile-menu-btn">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link to="/how-it-works" className="text-foreground py-2" onClick={() => setMenuOpen(false)}>
                {t("Cara Kerja", "How It Works")}
              </Link>
              <Link to="/series" className="text-foreground py-2" onClick={() => setMenuOpen(false)}>
                {t("Seri Tes", "Test Series")}
              </Link>
              <Link to="/pricing" className="text-foreground py-2" onClick={() => setMenuOpen(false)}>
                {t("Harga", "Pricing")}
              </Link>
              <Link to="/faq" className="text-foreground py-2" onClick={() => setMenuOpen(false)}>
                FAQ
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="text-foreground py-2" onClick={() => setMenuOpen(false)}>
                  {t("Masuk", "Login")}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const SERIES_DATA = [
  {
    id: "family",
    name_id: "Keluarga",
    name_en: "Family",
    description_id: "Pahami dinamika komunikasi dalam keluarga Anda. Temukan cara terbaik untuk terhubung dengan orang tua, anak, dan saudara.",
    description_en: "Understand communication dynamics in your family. Find the best ways to connect with parents, children, and siblings.",
    icon: Home,
    color: "#5D8A66",
    bgClass: "gradient-anchor",
    image: "https://images.unsplash.com/photo-1506836467174-27f1042aa48c?w=600&h=400&fit=crop"
  },
  {
    id: "business",
    name_id: "Bisnis",
    name_en: "Business",
    description_id: "Tingkatkan komunikasi tim dan mitra kerja. Optimalkan kolaborasi dan produktivitas.",
    description_en: "Improve team and business partner communication. Optimize collaboration and productivity.",
    icon: Briefcase,
    color: "#5B8FA8",
    bgClass: "gradient-analyst",
    image: "https://images.unsplash.com/photo-1704652329540-851160c7741f?w=600&h=400&fit=crop"
  },
  {
    id: "friendship",
    name_id: "Persahabatan",
    name_en: "Friendship",
    description_id: "Perkuat ikatan dengan sahabat Anda. Pahami perbedaan dan rayakan keunikan masing-masing.",
    description_en: "Strengthen bonds with your friends. Understand differences and celebrate each uniqueness.",
    icon: Users,
    color: "#D99E30",
    bgClass: "gradient-spark",
    image: "https://images.unsplash.com/photo-1753351056838-143bc3e4cf03?w=600&h=400&fit=crop"
  },
  {
    id: "couples",
    name_id: "Pasangan",
    name_en: "Couples",
    description_id: "Bangun komunikasi yang lebih intim dengan pasangan. Ciptakan hubungan yang lebih harmonis.",
    description_en: "Build more intimate communication with your partner. Create a more harmonious relationship.",
    icon: Heart,
    color: "#C05640",
    bgClass: "gradient-driver",
    image: "https://images.unsplash.com/photo-1587485762996-56c4ac180df9?w=600&h=400&fit=crop"
  }
];

const ARCHETYPES = [
  { id: "driver", name_id: "Penggerak", name_en: "Driver", color: "#C05640", description_id: "Tegas & berorientasi hasil", description_en: "Assertive & results-focused" },
  { id: "spark", name_id: "Percikan", name_en: "Spark", color: "#D99E30", description_id: "Ekspresif & penuh energi", description_en: "Expressive & energetic" },
  { id: "anchor", name_id: "Jangkar", name_en: "Anchor", color: "#5D8A66", description_id: "Stabil & harmonis", description_en: "Steady & harmonious" },
  { id: "analyst", name_id: "Analis", name_en: "Analyst", color: "#5B8FA8", description_id: "Teliti & terstruktur", description_en: "Thorough & structured" }
];

const LandingPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <h1 className="heading-1 text-foreground mb-6">
              {t(
                "Kenali Gaya Komunikasi Anda, Bangun Hubungan yang Lebih Bermakna",
                "Discover Your Communication Style, Build More Meaningful Relationships"
              )}
            </h1>
            <p className="body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t(
                "Tes kepribadian komunikasi yang membantu Anda memahami diri sendiri dan orang-orang terdekat. Berbasis 4 arketipe komunikasi yang mudah dipahami.",
                "A communication personality test that helps you understand yourself and those closest to you. Based on 4 easy-to-understand communication archetypes."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/series")} 
                className="btn-primary text-lg px-10 py-6"
                data-testid="hero-start-btn"
              >
                {t("Mulai Tes Gratis", "Start Free Assessment")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate("/how-it-works")}
                className="btn-outline text-lg px-10 py-6"
                data-testid="hero-learn-btn"
              >
                {t("Pelajari Lebih Lanjut", "Learn More")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Archetypes Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-foreground mb-4">
              {t("4 Arketipe Komunikasi", "4 Communication Archetypes")}
            </h2>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Setiap orang memiliki kombinasi unik dari 4 gaya komunikasi ini",
                "Everyone has a unique combination of these 4 communication styles"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ARCHETYPES.map((archetype, idx) => (
              <Card 
                key={archetype.id} 
                className={`card-hover border-2 overflow-hidden animate-slide-up stagger-${idx + 1}`}
                style={{ borderColor: archetype.color + "40" }}
                data-testid={`archetype-card-${archetype.id}`}
              >
                <CardContent className="p-6">
                  <div 
                    className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                    style={{ backgroundColor: archetype.color + "20" }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: archetype.color }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                    {language === "id" ? archetype.name_id : archetype.name_en}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === "id" ? archetype.description_id : archetype.description_en}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Series Section */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-foreground mb-4">
              {t("Pilih Seri Tes Anda", "Choose Your Test Series")}
            </h2>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Tes yang disesuaikan dengan konteks hubungan Anda",
                "Tests tailored to your relationship context"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERIES_DATA.map((series, idx) => {
              const Icon = series.icon;
              return (
                <Card 
                  key={series.id}
                  className={`card-hover overflow-hidden cursor-pointer animate-slide-up stagger-${idx + 1}`}
                  onClick={() => navigate(`/series/${series.id}`)}
                  data-testid={`series-card-${series.id}`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden">
                      <img 
                        src={series.image} 
                        alt={language === "id" ? series.name_id : series.name_en}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to right, ${series.color}20, transparent)` }}
                      />
                    </div>
                    <CardContent className="p-6 md:w-3/5 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: series.color + "20" }}
                        >
                          <Icon className="w-6 h-6" style={{ color: series.color }} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Merriweather, serif' }}>
                          {language === "id" ? series.name_id : series.name_en}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {language === "id" ? series.description_id : series.description_en}
                      </p>
                      <div className="flex items-center text-primary font-medium">
                        {t("Mulai Tes", "Start Test")}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Brief */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-foreground mb-4">
              {t("Bagaimana Cara Kerjanya?", "How Does It Work?")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title_id: "Pilih Seri",
                title_en: "Choose Series",
                desc_id: "Pilih konteks hubungan yang ingin Anda eksplorasi",
                desc_en: "Choose the relationship context you want to explore"
              },
              {
                step: "2",
                title_id: "Jawab Pertanyaan",
                title_en: "Answer Questions",
                desc_id: "24 pertanyaan situasional, hanya 10-15 menit",
                desc_en: "24 situational questions, only 10-15 minutes"
              },
              {
                step: "3",
                title_id: "Dapatkan Insight",
                title_en: "Get Insights",
                desc_id: "Hasil langsung + opsi laporan mendalam",
                desc_en: "Instant results + detailed report option"
              }
            ].map((item, idx) => (
              <div key={idx} className={`text-center animate-slide-up stagger-${idx + 1}`}>
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                  {language === "id" ? item.title_id : item.title_en}
                </h3>
                <p className="text-muted-foreground">
                  {language === "id" ? item.desc_id : item.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-2 text-foreground mb-6">
            {t(
              "Siap Memahami Diri Anda Lebih Baik?",
              "Ready to Understand Yourself Better?"
            )}
          </h2>
          <p className="body-lg text-muted-foreground mb-8">
            {t(
              "Mulai perjalanan pemahaman diri Anda sekarang. Gratis dan tanpa komitmen.",
              "Start your self-understanding journey now. Free and no commitment."
            )}
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/series")} 
            className="btn-primary text-lg px-12 py-6"
            data-testid="cta-start-btn"
          >
            {t("Mulai Tes Gratis", "Start Free Assessment")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">R4</span>
                </div>
                <span className="font-bold text-lg">{t("Relasi4Warna", "4Color Relating")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  "Platform asesmen komunikasi hubungan yang membantu Anda membangun relasi yang lebih bermakna.",
                  "A relationship communication assessment platform that helps you build more meaningful connections."
                )}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t("Seri Tes", "Test Series")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/series/family" className="hover:text-foreground">{t("Keluarga", "Family")}</Link></li>
                <li><Link to="/series/business" className="hover:text-foreground">{t("Bisnis", "Business")}</Link></li>
                <li><Link to="/series/friendship" className="hover:text-foreground">{t("Persahabatan", "Friendship")}</Link></li>
                <li><Link to="/series/couples" className="hover:text-foreground">{t("Pasangan", "Couples")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t("Dukungan", "Support")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-foreground">{t("Cara Kerja", "How It Works")}</Link></li>
                <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">{t("Harga", "Pricing")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t("Legal", "Legal")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground">{t("Syarat & Ketentuan", "Terms & Conditions")}</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">{t("Kebijakan Privasi", "Privacy Policy")}</Link></li>
                <li><Link to="/ai-safeguard" className="hover:text-foreground">{t("Kebijakan AI Safeguard", "AI Safeguard Policy")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 {t("Relasi4Warna", "4Color Relating")}. {t("Hak Cipta Dilindungi.", "All Rights Reserved.")}</p>
            <p className="mt-2">
              {t(
                "Disclaimer: Tes ini bersifat edukatif dan bukan alat diagnosis psikologis.",
                "Disclaimer: This test is educational and not a psychological diagnostic tool."
              )}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
