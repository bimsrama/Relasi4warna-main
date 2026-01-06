import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ArrowLeft, ArrowRight, Globe } from "lucide-react";

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

const FAQ_DATA = [
  {
    category_id: "Tentang Tes",
    category_en: "About the Test",
    items: [
      {
        question_id: "Apa itu Relasi4Warna?",
        question_en: "What is 4Color Relating?",
        answer_id: "Relasi4Warna adalah platform asesmen komunikasi hubungan yang membantu Anda memahami gaya komunikasi diri sendiri dan orang-orang terdekat. Menggunakan framework 4-Drive Communication Archetypes yang kami kembangkan, tes ini memberikan insight praktis untuk membangun hubungan yang lebih bermakna.",
        answer_en: "4Color Relating is a relationship communication assessment platform that helps you understand your own communication style and those closest to you. Using our 4-Drive Communication Archetypes framework, this test provides practical insights for building more meaningful relationships."
      },
      {
        question_id: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan tes?",
        question_en: "How long does it take to complete the test?",
        answer_id: "Tes terdiri dari 24 pertanyaan dan dapat diselesaikan dalam waktu sekitar 10-15 menit. Tidak ada batas waktu, jadi Anda bisa mengerjakan dengan santai.",
        answer_en: "The test consists of 24 questions and can be completed in about 10-15 minutes. There is no time limit, so you can take your time."
      },
      {
        question_id: "Apakah hasil tes ini akurat?",
        question_en: "Are the test results accurate?",
        answer_id: "Hasil tes memberikan gambaran tentang kecenderungan gaya komunikasi Anda. Akurasi tergantung pada kejujuran jawaban Anda. Ingat, tidak ada jawaban benar atau salah—jawablah sesuai dengan perilaku alami Anda.",
        answer_en: "Test results provide an overview of your communication style tendencies. Accuracy depends on the honesty of your answers. Remember, there are no right or wrong answers—answer according to your natural behavior."
      },
      {
        question_id: "Apakah ini alat diagnosis psikologis?",
        question_en: "Is this a psychological diagnostic tool?",
        answer_id: "Tidak. Relasi4Warna adalah alat edukatif untuk membantu pemahaman diri dan tidak dimaksudkan sebagai alat diagnosis psikologis atau medis. Untuk masalah psikologis serius, silakan konsultasikan dengan profesional.",
        answer_en: "No. 4Color Relating is an educational tool for self-understanding and is not intended as a psychological or medical diagnostic tool. For serious psychological issues, please consult a professional."
      }
    ]
  },
  {
    category_id: "Tentang Arketipe",
    category_en: "About Archetypes",
    items: [
      {
        question_id: "Apa itu 4 Arketipe Komunikasi?",
        question_en: "What are the 4 Communication Archetypes?",
        answer_id: "4 Arketipe Komunikasi adalah: Penggerak (tegas, berorientasi hasil), Percikan (ekspresif, penuh energi), Jangkar (stabil, harmonis), dan Analis (teliti, sistematis). Setiap orang memiliki kombinasi unik dari keempat arketipe ini.",
        answer_en: "The 4 Communication Archetypes are: Driver (assertive, results-oriented), Spark (expressive, energetic), Anchor (stable, harmonious), and Analyst (thorough, systematic). Everyone has a unique combination of these four archetypes."
      },
      {
        question_id: "Apakah arketipe bisa berubah?",
        question_en: "Can archetypes change?",
        answer_id: "Arketipe dasar cenderung stabil, tetapi ekspresinya bisa berbeda tergantung konteks (misalnya di rumah vs di kantor). Itulah mengapa kami menyediakan seri tes yang berbeda untuk konteks yang berbeda.",
        answer_en: "Base archetypes tend to be stable, but their expression can differ depending on context (e.g., at home vs. at work). That's why we provide different test series for different contexts."
      },
      {
        question_id: "Apakah ada arketipe yang lebih baik dari yang lain?",
        question_en: "Is any archetype better than others?",
        answer_id: "Tidak ada arketipe yang lebih baik atau lebih buruk. Setiap arketipe memiliki kekuatan dan potensi tantangannya masing-masing. Kuncinya adalah memahami dan mengoptimalkan gaya komunikasi Anda.",
        answer_en: "No archetype is better or worse. Each archetype has its own strengths and potential challenges. The key is understanding and optimizing your communication style."
      }
    ]
  },
  {
    category_id: "Tentang Pembayaran",
    category_en: "About Payment",
    items: [
      {
        question_id: "Apakah tes gratis?",
        question_en: "Is the test free?",
        answer_id: "Ya, tes dan hasil ringkasan gratis. Laporan lengkap dengan analisis mendalam, skrip praktis, dan rencana aksi tersedia dengan biaya tambahan.",
        answer_en: "Yes, the test and summary results are free. Full reports with in-depth analysis, practical scripts, and action plans are available for an additional fee."
      },
      {
        question_id: "Metode pembayaran apa yang tersedia?",
        question_en: "What payment methods are available?",
        answer_id: "Kami menerima pembayaran melalui kartu kredit/debit, transfer bank, dan berbagai e-wallet melalui platform Xendit yang aman.",
        answer_en: "We accept payments via credit/debit cards, bank transfers, and various e-wallets through the secure Xendit platform."
      },
      {
        question_id: "Apakah ada kebijakan refund?",
        question_en: "Is there a refund policy?",
        answer_id: "Karena sifat digital dari produk kami, refund hanya diberikan jika terjadi kesalahan teknis yang menyebabkan Anda tidak dapat mengakses laporan yang sudah dibeli. Silakan hubungi tim support kami untuk bantuan.",
        answer_en: "Due to the digital nature of our products, refunds are only given if there is a technical error that prevents you from accessing your purchased report. Please contact our support team for assistance."
      }
    ]
  },
  {
    category_id: "Privasi & Keamanan",
    category_en: "Privacy & Security",
    items: [
      {
        question_id: "Apakah data saya aman?",
        question_en: "Is my data safe?",
        answer_id: "Ya. Kami menggunakan enkripsi standar industri dan tidak pernah membagikan data pribadi Anda ke pihak ketiga tanpa persetujuan Anda.",
        answer_en: "Yes. We use industry-standard encryption and never share your personal data with third parties without your consent."
      },
      {
        question_id: "Bagaimana cara menghapus akun saya?",
        question_en: "How do I delete my account?",
        answer_id: "Anda dapat menghapus akun melalui halaman pengaturan atau menghubungi tim support kami. Semua data Anda akan dihapus secara permanen sesuai dengan kebijakan privasi kami.",
        answer_en: "You can delete your account through the settings page or by contacting our support team. All your data will be permanently deleted in accordance with our privacy policy."
      }
    ]
  }
];

const FAQPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6" data-testid="back-link">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Kembali", "Back")}
          </Link>

          <div className="text-center mb-12 animate-slide-up">
            <h1 className="heading-1 text-foreground mb-4">
              FAQ
            </h1>
            <p className="body-lg text-muted-foreground">
              {t(
                "Temukan jawaban untuk pertanyaan yang sering diajukan",
                "Find answers to frequently asked questions"
              )}
            </p>
          </div>

          <div className="space-y-8 animate-slide-up stagger-1">
            {FAQ_DATA.map((category, catIdx) => (
              <div key={catIdx}>
                <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
                  {language === "id" ? category.category_id : category.category_en}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((item, idx) => (
                    <AccordionItem key={idx} value={`${catIdx}-${idx}`} className="border border-border rounded-xl px-4" data-testid={`faq-${catIdx}-${idx}`}>
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium text-foreground">
                          {language === "id" ? item.question_id : item.question_en}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {language === "id" ? item.answer_id : item.answer_en}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 text-center p-8 bg-secondary/30 rounded-2xl animate-slide-up stagger-2">
            <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
              {t("Masih punya pertanyaan?", "Still have questions?")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t(
                "Hubungi tim support kami untuk bantuan lebih lanjut",
                "Contact our support team for further assistance"
              )}
            </p>
            <Button variant="outline" className="rounded-full" data-testid="contact-btn">
              {t("Hubungi Kami", "Contact Us")}
            </Button>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center animate-slide-up stagger-3">
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

export default FAQPage;
