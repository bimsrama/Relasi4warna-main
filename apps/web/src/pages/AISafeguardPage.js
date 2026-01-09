import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../App";
import { ArrowLeft, Shield, Brain, Heart, AlertTriangle, Scale, Eye, Lock, Users, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

const AISafeguardPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-link">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Kembali", "Back")}
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-analyst" />
              <span className="font-bold">{t("Kebijakan AI Safeguard", "AI Safeguard Policy")}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-analyst/10 mb-6">
              <Brain className="w-5 h-5 text-analyst" />
              <span className="text-sm font-medium text-analyst">
                {t("Kecerdasan Relasi Manusia", "Human Relationship Intelligence")}
              </span>
            </div>
            <h1 className="heading-1 text-foreground mb-4">
              {t("🛡️ Kebijakan AI Safeguard", "🛡️ AI Safeguard Policy")}
            </h1>
            <p className="text-muted-foreground">
              {t("Platform Kecerdasan Relasi Manusia", "Human Relationship Intelligence Platform")}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("Terakhir diperbarui: Januari 2025", "Last updated: January 2025")}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {language === "id" ? (
              <>
                {/* Indonesian Content */}
                
                {/* Section 1 - Tujuan Kebijakan */}
                <Card className="border-analyst/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-analyst" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 1 — Tujuan dan Ruang Lingkup</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p><strong>1.1.</strong> Kebijakan AI Safeguard ini ("Kebijakan") disusun untuk menjamin bahwa penggunaan teknologi kecerdasan buatan (AI) dalam Platform Relasi4Warna dilaksanakan secara bertanggung jawab, etis, dan sesuai dengan peraturan perundang-undangan yang berlaku di Republik Indonesia.</p>
                      <p><strong>1.2.</strong> Kebijakan ini mengatur bahwa AI:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Digunakan semata-mata untuk kepentingan refleksi diri dan pembelajaran relasional, <strong>bukan</strong> untuk diagnosis medis, psikologis, atau klinis;</li>
                        <li>Tidak melabeli, menghakimi, atau menyederhanakan kompleksitas kepribadian manusia;</li>
                        <li>Mencegah penyalahgunaan hasil asesmen dalam konteks keluarga, bisnis, dan komunitas;</li>
                        <li>Memitigasi risiko salah tafsir yang dapat timbul akibat individualisme dan komunikasi digital.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2 - Prinsip Etika */}
                <Card className="border-anchor/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-anchor" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 2 — Prinsip Etika Utama</h2>
                    </div>
                    <div className="space-y-6 text-muted-foreground">
                      <div className="p-4 bg-anchor/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.1. Prinsip Non-Diagnostik (Non-Diagnostic by Design)</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI <strong>tidak</strong> diperkenankan menggunakan terminologi klinis seperti "gangguan", "kelainan", "penyakit", atau istilah medis lainnya;</li>
                          <li>Platform ini <strong>tidak</strong> memberikan klaim medis, psikologis, atau terapeutik;</li>
                          <li>Seluruh hasil disajikan sebagai <em>kecenderungan perilaku komunikasi</em>, bukan identitas permanen atau diagnosis.</li>
                        </ul>
                        <p className="mt-2 text-sm italic border-l-4 border-anchor pl-4">Implementasi: Setiap output AI wajib menyertakan disclaimer: "Hasil ini bersifat reflektif untuk pengembangan diri, bukan diagnosis profesional."</p>
                      </div>

                      <div className="p-4 bg-spark/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.2. Prinsip Tanpa Pelabelan dan Penyalahan (No Labeling, No Blaming)</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI <strong>dilarang</strong> menyebut pengguna atau pihak lain dengan label negatif seperti "toxic", "narsistik", "manipulatif", atau terminologi serupa;</li>
                          <li>Fokus analisis adalah pada <em>perilaku dan konteks situasional</em>, bukan pada karakter atau kepribadian yang bersifat permanen.</li>
                        </ul>
                        <p className="mt-2 text-sm italic border-l-4 border-spark pl-4">Implementasi: Platform menerapkan daftar kata terlarang (blacklist) dan mekanisme penulisan ulang otomatis ke bahasa yang netral dan empatik.</p>
                      </div>

                      <div className="p-4 bg-driver/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.3. Prinsip Tanggung Jawab Pribadi (Self-Responsibility First)</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI <strong>tidak</strong> memvalidasi atau mendukung perilaku menyalahkan pihak lain;</li>
                          <li>Setiap rekomendasi dimulai dari apa yang dapat <em>dilakukan</em> dan <em>dikendalikan</em> oleh pengguna sendiri.</li>
                        </ul>
                        <p className="mt-2 text-sm italic border-l-4 border-driver pl-4">Template wajib: "Yang dapat Anda kendalikan adalah respons dan tindakan Anda sendiri."</p>
                      </div>

                      <div className="p-4 bg-analyst/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.4. Prinsip Kontekstual dan Situasional</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Rekomendasi AI disesuaikan dengan konteks seri asesmen (Keluarga, Pasangan, Bisnis, Persahabatan);</li>
                          <li><strong>Tidak ada</strong> pendekatan "one-size-fits-all" atau generalisasi berlebihan.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3 - Pencegahan Penyalahgunaan */}
                <Card className="border-driver/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-driver" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 3 — Pencegahan Penyalahgunaan</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div className="p-4 bg-driver/5 rounded-xl border-l-4 border-driver">
                        <h3 className="font-bold text-foreground mb-2">3.1. Larangan Penggunaan sebagai Alat Kontrol (Anti-Weaponization)</h3>
                        <p className="mb-2">Hasil asesmen <strong>dilarang keras</strong> digunakan untuk:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Mengontrol atau memanipulasi pasangan, anggota keluarga, atau pihak lain;</li>
                          <li>Menekan atau mendominasi anggota tim atau bawahan;</li>
                          <li>Membenarkan keputusan sepihak yang merugikan pihak lain;</li>
                          <li>Melakukan diskriminasi dalam rekrutmen, promosi, atau hubungan kerja.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">3.2. Larangan Perbandingan yang Menyesatkan (Anti-Comparison Abuse)</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI <strong>tidak</strong> menyatakan satu tipe komunikasi "lebih baik", "lebih benar", atau "lebih unggul" dari tipe lainnya;</li>
                          <li><strong>Tidak ada</strong> hierarki moral atau ranking antar tipe;</li>
                          <li>Setiap output wajib menyebutkan nilai unik dari masing-masing gaya komunikasi.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-anchor/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">3.3. Prioritas De-Eskalasi Konflik</h3>
                        <p>Apabila sistem mendeteksi indikator stres tinggi (stress_flag = true), maka AI:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li><strong>Wajib</strong> memprioritaskan panduan regulasi diri;</li>
                          <li><strong>Menunda</strong> saran konfrontatif atau tindakan langsung;</li>
                          <li>Menyertakan bagian "Jeda dan Regulasi" di awal output.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4 - Pencegahan Salah Tafsir */}
                <Card className="border-spark/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-spark" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 4 — Pencegahan Salah Tafsir</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h3 className="font-bold text-foreground mb-2">4.1. Penggunaan Bahasa Probabilistik</h3>
                        <p>Seluruh output menggunakan bahasa yang menunjukkan probabilitas, bukan kepastian:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Dianjurkan: "cenderung", "sering", "dalam kondisi tertentu", "kemungkinan";</li>
                          <li>Dilarang: "pasti", "selalu", "tidak pernah", pernyataan absolut.</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground mb-2">4.2. Pembingkaian Temporal (Time-Bound)</h3>
                        <p>Platform menekankan bahwa hasil asesmen:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Dapat berubah seiring waktu, pertumbuhan pribadi, dan perubahan konteks;</li>
                          <li>Bukan merupakan label permanen atau identitas tetap;</li>
                          <li>Setiap laporan wajib menyertakan bagian "Bagaimana Hasil Ini Dapat Berubah".</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground mb-2">4.3. Prioritas Skrip Praktis (Script Over Advice)</h3>
                        <p>Rekomendasi diberikan dalam bentuk:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Contoh kalimat dan skrip dialog yang dapat langsung dipraktikkan;</li>
                          <li>Frasa yang <strong>dianjurkan</strong> (USE) dan yang <strong>dihindari</strong> (AVOID);</li>
                          <li>Panduan berbasis tindakan konkret, bukan nasihat abstrak.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 5 - Standar Bahasa */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 5 — Standar Bahasa dan Konten</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-anchor/10 rounded-xl">
                        <h3 className="font-bold text-anchor mb-3">✓ Bahasa yang Dianjurkan</h3>
                        <ul className="space-y-2 text-sm">
                          <li>• "mengundang dialog"</li>
                          <li>• "menjaga batas sehat"</li>
                          <li>• "memperlambat respons"</li>
                          <li>• "memperbaiki, bukan memenangkan"</li>
                          <li>• "memahami perspektif"</li>
                          <li>• "membangun koneksi"</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-driver/10 rounded-xl">
                        <h3 className="font-bold text-driver mb-3">✗ Bahasa yang Dilarang</h3>
                        <ul className="space-y-2 text-sm">
                          <li>• "diagnosa", "gangguan", "penyakit"</li>
                          <li>• "toxic", "rusak", "bermasalah"</li>
                          <li>• "harus", "wajib" (tanpa konteks)</li>
                          <li>• "narsistik", "manipulatif"</li>
                          <li>• Label kepribadian negatif</li>
                          <li>• Pernyataan absolut</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 6 - Transparansi */}
                <Card className="border-analyst/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-analyst" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 6 — Transparansi dan Edukasi Pengguna</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">6.1. Pengungkapan Pra-Asesmen</h3>
                        <p className="italic border-l-4 border-analyst pl-4 py-2 bg-analyst/5 rounded">
                          "Asesmen ini dirancang untuk membantu refleksi gaya komunikasi Anda. Ini bukan alat diagnosis atau penilaian kepribadian secara klinis."
                        </p>
                      </div>

                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">6.2. Panduan Pasca-Hasil</h3>
                        <p className="italic border-l-4 border-anchor pl-4 py-2 bg-anchor/5 rounded">
                          "Gunakan hasil ini sebagai cermin untuk memahami diri, bukan sebagai senjata untuk menilai atau mengontrol orang lain."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 7 - Eskalasi */}
                <Card className="border-driver/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-driver" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 7 — Eskalasi dan Jalur Dukungan Manusia</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p><strong>7.1.</strong> Apabila pengguna menunjukkan atau melaporkan kondisi berikut, AI <strong>wajib</strong> melakukan eskalasi:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Konflik relasional yang berat atau berbahaya;</li>
                        <li>Indikasi distress psikologis tinggi;</li>
                        <li>Permintaan diagnosis atau penilaian klinis.</li>
                      </ul>

                      <p><strong>7.2.</strong> Protokol Eskalasi:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>AI <strong>menolak</strong> memberikan diagnosis atau penilaian klinis;</li>
                        <li>AI <strong>menyarankan</strong> dukungan manusia profesional (konselor, psikolog, mentor);</li>
                        <li>AI <strong>tetap</strong> bersikap empatik dan netral.</li>
                      </ul>

                      <div className="p-4 bg-anchor/10 rounded-xl mt-4">
                        <p className="font-medium text-foreground">Template Respons Aman:</p>
                        <p className="italic mt-2">"Untuk situasi yang kompleks atau berat seperti yang Anda sampaikan, dukungan dari profesional atau pendamping manusia sangat disarankan. Kami di sini untuk membantu refleksi, namun tidak dapat menggantikan bantuan profesional yang mungkin Anda butuhkan."</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 8 - Privasi Data */}
                <Card className="border-anchor/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-anchor" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 8 — Perlindungan Data dan Privasi</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p>Platform menerapkan prinsip-prinsip perlindungan data berikut:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Prinsip Data Minimum:</strong> Hanya mengumpulkan data yang benar-benar diperlukan untuk fungsi layanan;</li>
                        <li><strong>Hak Penghapusan:</strong> Pengguna berhak menghapus data pribadinya secara mandiri;</li>
                        <li><strong>Larangan Penjualan Data:</strong> Data pengguna tidak dijual kepada pihak ketiga dalam kondisi apapun;</li>
                        <li><strong>Agregasi Anonim:</strong> Data analytics hanya digunakan dalam bentuk agregat yang tidak dapat mengidentifikasi individu;</li>
                        <li><strong>Kepatuhan Hukum:</strong> Pengelolaan data sesuai dengan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 9 - QA Audit */}
                <Card className="border-spark/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-spark" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 9 — Jaminan Kualitas dan Audit</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">9.1. Checklist Pra-Rilis Fitur</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">☐ Tidak mengandung istilah klinis atau diagnostik</li>
                          <li className="flex items-center gap-2">☐ Tidak mengandung pelabelan negatif</li>
                          <li className="flex items-center gap-2">☐ Terdapat panduan regulasi diri</li>
                          <li className="flex items-center gap-2">☐ Terdapat skrip komunikasi praktis</li>
                          <li className="flex items-center gap-2">☐ Disclaimer tampil dengan jelas</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground mb-2">9.2. Audit Berkala</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Review output AI secara acak (human-in-the-loop);</li>
                          <li>Pembaruan daftar kata terlarang secara berkala;</li>
                          <li>Evaluasi dan penyempurnaan prompt guardrails.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 10 - Pernyataan Resmi */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Pasal 10 — Pernyataan Resmi Platform</h2>
                    </div>
                    <div className="text-center space-y-6">
                      <blockquote className="text-lg italic text-foreground border-l-4 border-primary pl-6 py-4 bg-background/50 rounded-r-xl">
                        "Platform ini hadir untuk menolong manusia memahami diri dan relasinya secara dewasa—bukan untuk memberi label, menghakimi, atau mengontrol orang lain."
                      </blockquote>
                      <p className="text-sm text-muted-foreground">
                        Dengan menggunakan Platform ini, Pengguna menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan dalam Kebijakan AI Safeguard ini.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* English Content */}
                
                {/* Section 1 */}
                <Card className="border-analyst/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-analyst" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 1 — Purpose and Scope</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p><strong>1.1.</strong> This AI Safeguard Policy ("Policy") is established to ensure that the use of artificial intelligence (AI) technology within the 4Color Relating Platform is conducted responsibly, ethically, and in accordance with applicable laws and regulations.</p>
                      <p><strong>1.2.</strong> This Policy governs that AI shall:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Be used solely for self-reflection and relational learning purposes, <strong>not</strong> for medical, psychological, or clinical diagnosis;</li>
                        <li>Not label, judge, or oversimplify the complexity of human personality;</li>
                        <li>Prevent misuse of assessment results in family, business, and community contexts;</li>
                        <li>Mitigate risks of misinterpretation arising from individualism and digital communication.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2 */}
                <Card className="border-anchor/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-anchor" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 2 — Core Ethical Principles</h2>
                    </div>
                    <div className="space-y-6 text-muted-foreground">
                      <div className="p-4 bg-anchor/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.1. Non-Diagnostic by Design Principle</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI shall <strong>not</strong> use clinical terminology such as "disorder", "abnormality", "disease", or other medical terms;</li>
                          <li>The Platform does <strong>not</strong> make medical, psychological, or therapeutic claims;</li>
                          <li>All results are presented as <em>communication behavior tendencies</em>, not permanent identity or diagnosis.</li>
                        </ul>
                        <p className="mt-2 text-sm italic border-l-4 border-anchor pl-4">Implementation: Every AI output must include the disclaimer: "These results are reflective for self-development, not professional diagnosis."</p>
                      </div>

                      <div className="p-4 bg-spark/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.2. No Labeling, No Blaming Principle</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI is <strong>prohibited</strong> from referring to users or others with negative labels such as "toxic", "narcissistic", "manipulative", or similar terminology;</li>
                          <li>Analysis focuses on <em>behavior and situational context</em>, not on permanent character or personality traits.</li>
                        </ul>
                        <p className="mt-2 text-sm italic border-l-4 border-spark pl-4">Implementation: The Platform implements a prohibited word list (blacklist) and automatic rewriting mechanisms to neutral and empathic language.</p>
                      </div>

                      <div className="p-4 bg-driver/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.3. Self-Responsibility First Principle</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI shall <strong>not</strong> validate or support blaming others;</li>
                          <li>Every recommendation begins with what the user can <em>do</em> and <em>control</em> themselves.</li>
                        </ul>
                        <p className="mt-2 text-sm italic border-l-4 border-driver pl-4">Required template: "What you can control is your own response and actions."</p>
                      </div>

                      <div className="p-4 bg-analyst/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">2.4. Contextual and Situational Principle</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI recommendations are tailored to the assessment series context (Family, Couples, Business, Friendship);</li>
                          <li>There is <strong>no</strong> "one-size-fits-all" approach or excessive generalization.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3 */}
                <Card className="border-driver/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-driver" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 3 — Misuse Prevention</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div className="p-4 bg-driver/5 rounded-xl border-l-4 border-driver">
                        <h3 className="font-bold text-foreground mb-2">3.1. Anti-Weaponization Rule</h3>
                        <p className="mb-2">Assessment results are <strong>strictly prohibited</strong> from being used to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Control or manipulate partners, family members, or others;</li>
                          <li>Pressure or dominate team members or subordinates;</li>
                          <li>Justify unilateral decisions that harm others;</li>
                          <li>Discriminate in recruitment, promotion, or employment relationships.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">3.2. Anti-Comparison Abuse Rule</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>AI shall <strong>not</strong> state that one communication type is "better", "more correct", or "superior" to others;</li>
                          <li>There is <strong>no</strong> moral hierarchy or ranking between types;</li>
                          <li>Every output must mention the unique value of each communication style.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-anchor/5 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">3.3. Conflict De-Escalation Priority</h3>
                        <p>When the system detects high stress indicators (stress_flag = true), AI shall:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li><strong>Prioritize</strong> self-regulation guidance;</li>
                          <li><strong>Delay</strong> confrontational or direct action suggestions;</li>
                          <li>Include a "Pause and Regulate" section at the beginning of output.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4 */}
                <Card className="border-spark/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-spark" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 4 — Misinterpretation Prevention</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h3 className="font-bold text-foreground mb-2">4.1. Probabilistic Language Use</h3>
                        <p>All outputs use language indicating probability, not certainty:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Recommended: "tends to", "often", "under certain conditions", "likely";</li>
                          <li>Prohibited: "definitely", "always", "never", absolute statements.</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground mb-2">4.2. Time-Bound Framing</h3>
                        <p>The Platform emphasizes that assessment results:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Can change over time, personal growth, and contextual changes;</li>
                          <li>Are not permanent labels or fixed identities;</li>
                          <li>Every report must include a section on "How These Results Can Change".</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground mb-2">4.3. Script Over Advice Priority</h3>
                        <p>Recommendations are provided in the form of:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Example sentences and dialogue scripts that can be immediately practiced;</li>
                          <li>Phrases that are <strong>recommended</strong> (USE) and <strong>to avoid</strong> (AVOID);</li>
                          <li>Concrete action-based guidance, not abstract advice.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 5 */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 5 — Language and Content Standards</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-anchor/10 rounded-xl">
                        <h3 className="font-bold text-anchor mb-3">✓ Recommended Language</h3>
                        <ul className="space-y-2 text-sm">
                          <li>• "inviting dialogue"</li>
                          <li>• "maintaining healthy boundaries"</li>
                          <li>• "slowing down responses"</li>
                          <li>• "repairing, not winning"</li>
                          <li>• "understanding perspectives"</li>
                          <li>• "building connection"</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-driver/10 rounded-xl">
                        <h3 className="font-bold text-driver mb-3">✗ Prohibited Language</h3>
                        <ul className="space-y-2 text-sm">
                          <li>• "diagnosis", "disorder", "disease"</li>
                          <li>• "toxic", "broken", "problematic"</li>
                          <li>• "must", "should" (without context)</li>
                          <li>• "narcissistic", "manipulative"</li>
                          <li>• Negative personality labels</li>
                          <li>• Absolute statements</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 6 */}
                <Card className="border-analyst/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-analyst" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 6 — Transparency and User Education</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">6.1. Pre-Assessment Disclosure</h3>
                        <p className="italic border-l-4 border-analyst pl-4 py-2 bg-analyst/5 rounded">
                          "This assessment is designed to help you reflect on your communication style. It is not a diagnostic or clinical personality assessment tool."
                        </p>
                      </div>

                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">6.2. Post-Result Guidance</h3>
                        <p className="italic border-l-4 border-anchor pl-4 py-2 bg-anchor/5 rounded">
                          "Use these results as a mirror to understand yourself, not as a weapon to judge or control others."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 7 */}
                <Card className="border-driver/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-driver" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 7 — Escalation and Human Support Path</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p><strong>7.1.</strong> When users indicate or report the following conditions, AI <strong>must</strong> escalate:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Severe or dangerous relational conflicts;</li>
                        <li>Indications of high psychological distress;</li>
                        <li>Requests for diagnosis or clinical assessment.</li>
                      </ul>

                      <p><strong>7.2.</strong> Escalation Protocol:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>AI <strong>refuses</strong> to provide diagnosis or clinical assessment;</li>
                        <li>AI <strong>recommends</strong> professional human support (counselor, psychologist, mentor);</li>
                        <li>AI <strong>remains</strong> empathic and neutral.</li>
                      </ul>

                      <div className="p-4 bg-anchor/10 rounded-xl mt-4">
                        <p className="font-medium text-foreground">Safe Response Template:</p>
                        <p className="italic mt-2">"For complex or serious situations like what you've described, support from a professional or human companion is highly recommended. We are here to help with reflection, but cannot replace the professional help you may need."</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 8 */}
                <Card className="border-anchor/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-anchor" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 8 — Data Protection and Privacy</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p>The Platform applies the following data protection principles:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Data Minimization Principle:</strong> Only collecting data truly necessary for service functionality;</li>
                        <li><strong>Right to Erasure:</strong> Users have the right to delete their personal data independently;</li>
                        <li><strong>No Data Sales:</strong> User data is not sold to third parties under any circumstances;</li>
                        <li><strong>Anonymous Aggregation:</strong> Analytics data is only used in aggregate form that cannot identify individuals;</li>
                        <li><strong>Legal Compliance:</strong> Data management in accordance with applicable data protection laws and regulations.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 9 */}
                <Card className="border-spark/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-spark" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 9 — Quality Assurance and Audit</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <div className="p-4 bg-secondary/50 rounded-xl">
                        <h3 className="font-bold text-foreground mb-2">9.1. Pre-Release Feature Checklist</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">☐ Contains no clinical or diagnostic terminology</li>
                          <li className="flex items-center gap-2">☐ Contains no negative labeling</li>
                          <li className="flex items-center gap-2">☐ Includes self-regulation guidance</li>
                          <li className="flex items-center gap-2">☐ Includes practical communication scripts</li>
                          <li className="flex items-center gap-2">☐ Disclaimer is clearly displayed</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground mb-2">9.2. Periodic Audit</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Random AI output review (human-in-the-loop);</li>
                          <li>Regular updates to prohibited word lists;</li>
                          <li>Evaluation and improvement of prompt guardrails.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 10 */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Article 10 — Official Platform Statement</h2>
                    </div>
                    <div className="text-center space-y-6">
                      <blockquote className="text-lg italic text-foreground border-l-4 border-primary pl-6 py-4 bg-background/50 rounded-r-xl">
                        "This platform exists to foster relational maturity—not to label, judge, or control others."
                      </blockquote>
                      <p className="text-sm text-muted-foreground">
                        By using this Platform, Users acknowledge that they have read, understood, and agreed to all provisions in this AI Safeguard Policy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground">{t("Syarat & Ketentuan", "Terms & Conditions")}</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-foreground">{t("Kebijakan Privasi", "Privacy Policy")}</Link>
            <span>•</span>
            <Link to="/" className="hover:text-foreground">{t("Beranda", "Home")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AISafeguardPage;
