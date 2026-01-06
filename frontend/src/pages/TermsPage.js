import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../App";
import { ArrowLeft, FileText, Shield, Scale, AlertTriangle, Lock, RefreshCw } from "lucide-react";

const TermsPage = () => {
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
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-bold">{t("Syarat & Ketentuan", "Terms & Conditions")}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Scale className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">{t("Dokumen Legal", "Legal Document")}</span>
            </div>
            <h1 className="heading-1 text-foreground mb-4">
              {t("Syarat & Ketentuan Penggunaan", "Terms & Conditions of Use")}
            </h1>
            <p className="text-muted-foreground">
              {t("Terakhir diperbarui: Januari 2025", "Last updated: January 2025")}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {language === "id" ? (
              <div className="space-y-8">
                {/* Indonesian Content */}
                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">1. Definisi Layanan</h2>
                      <p className="text-muted-foreground">
                        Platform Relasi4Warna ("Platform") menyediakan layanan tes refleksi dan edukasi mengenai gaya komunikasi dan relasi berbasis model internal "4 Archetype Communication" (Driver, Spark, Anchor, Analyst). Platform ini dikembangkan dan dioperasikan oleh penyedia layanan ("Kami", "Penyedia").
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <strong>Penting:</strong> Layanan ini bukan merupakan alat diagnosis medis, psikologis, psikiatri, atau klinis. Platform tidak dimaksudkan untuk menggantikan konsultasi profesional dengan psikolog, psikiater, konselor, atau tenaga kesehatan mental lainnya.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">2. Sifat Hasil Tes</h2>
                      <p className="text-muted-foreground">
                        Hasil tes yang diberikan oleh Platform bersifat <strong>indikatif dan reflektif</strong>, bukan kebenaran mutlak atau diagnosis definitif. Hasil tes merupakan gambaran umum berdasarkan jawaban yang Anda berikan pada saat pengisian tes.
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Hasil dapat bervariasi tergantung kondisi emosional dan situasi saat mengisi tes</li>
                        <li>Pengguna bertanggung jawab penuh atas interpretasi dan penggunaan hasil tes</li>
                        <li>Hasil tidak boleh dijadikan satu-satunya dasar pengambilan keputusan penting</li>
                        <li>Kami menyarankan untuk berkonsultasi dengan profesional untuk keputusan signifikan</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">3. Batasan Tanggung Jawab</h2>
                      <p className="text-muted-foreground">
                        Dengan menggunakan Platform ini, Anda memahami dan menyetujui bahwa:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Penyedia Platform <strong>tidak bertanggung jawab</strong> atas keputusan pribadi, keluarga, bisnis, karir, atau relasi yang Anda ambil berdasarkan hasil tes</li>
                        <li>Penyedia tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan Platform</li>
                        <li>Penyedia tidak menjamin bahwa hasil tes akan memenuhi ekspektasi atau kebutuhan spesifik Anda</li>
                        <li>Layanan disediakan "sebagaimana adanya" (as is) tanpa jaminan apapun, baik tersurat maupun tersirat</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        <strong>Klausul Pembatasan:</strong> Dalam hal apapun, total tanggung jawab Penyedia tidak akan melebihi jumlah yang Anda bayarkan kepada Platform dalam 12 bulan terakhir atau Rp 500.000 (mana yang lebih kecil).
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-driver" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">4. Hak Kekayaan Intelektual</h2>
                      <p className="text-muted-foreground">
                        Seluruh konten yang terdapat dalam Platform ini adalah milik eksklusif Penyedia dan dilindungi oleh hukum Hak Kekayaan Intelektual Republik Indonesia (UU No. 28 Tahun 2014 tentang Hak Cipta) dan perjanjian internasional terkait. Konten yang dilindungi termasuk namun tidak terbatas pada:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Pertanyaan tes dan metodologi penilaian</li>
                        <li>Sistem skoring dan algoritma kalkulasi</li>
                        <li>Laporan hasil, analisis, dan rekomendasi</li>
                        <li>Workbook, panduan, dan materi edukasi</li>
                        <li>Desain visual, logo, dan elemen grafis</li>
                        <li>Struktur platform, kode sumber, dan arsitektur sistem</li>
                        <li>Model "4 Archetype Communication" dan seluruh deskripsinya</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-analyst" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">5. Larangan Penggunaan</h2>
                      <p className="text-muted-foreground">
                        Pengguna <strong>dilarang keras</strong> untuk melakukan hal-hal berikut tanpa izin tertulis dari Penyedia:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Menyalin, mereproduksi, atau menduplikasi konten Platform</li>
                        <li>Mendistribusikan, menjual, atau menyewakan konten kepada pihak ketiga</li>
                        <li>Membuat karya turunan berdasarkan konten Platform</li>
                        <li>Mengklaim konten Platform sebagai karya sendiri atau pihak lain</li>
                        <li>Menggunakan konten untuk tujuan komersial tanpa lisensi</li>
                        <li>Melakukan reverse engineering atau dekompilasi sistem</li>
                        <li>Mengakses sistem dengan cara yang tidak sah (hacking)</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        <strong>Sanksi:</strong> Pelanggaran terhadap ketentuan ini dapat dikenakan tuntutan hukum perdata dan/atau pidana sesuai dengan hukum yang berlaku di Indonesia, termasuk ganti rugi materiil dan immateriil.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">6. Perubahan Layanan & Ketentuan</h2>
                      <p className="text-muted-foreground">
                        Penyedia Platform berhak untuk:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Mengubah, memodifikasi, atau menghentikan layanan sewaktu-waktu</li>
                        <li>Memperbarui konten, pertanyaan, dan metodologi tes</li>
                        <li>Mengubah struktur harga dan paket layanan</li>
                        <li>Merevisi Syarat & Ketentuan ini tanpa pemberitahuan terlebih dahulu</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        Penggunaan Platform secara berkelanjutan setelah perubahan merupakan bentuk persetujuan Anda terhadap perubahan tersebut. Kami menyarankan untuk meninjau halaman ini secara berkala.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">7. Hukum yang Berlaku & Penyelesaian Sengketa</h2>
                      <p className="text-muted-foreground">
                        Syarat & Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul sehubungan dengan penggunaan Platform akan diselesaikan melalui:
                      </p>
                      <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-1">
                        <li><strong>Musyawarah:</strong> Para pihak akan berupaya menyelesaikan sengketa secara musyawarah mufakat dalam waktu 30 hari</li>
                        <li><strong>Mediasi:</strong> Jika musyawarah tidak berhasil, sengketa akan diselesaikan melalui mediasi di bawah Badan Arbitrase Nasional Indonesia (BANI)</li>
                        <li><strong>Arbitrase:</strong> Keputusan arbitrase bersifat final dan mengikat kedua belah pihak</li>
                      </ol>
                      <p className="text-muted-foreground mt-3">
                        Tempat kedudukan hukum adalah di Jakarta, Indonesia. Bahasa yang digunakan dalam proses penyelesaian sengketa adalah Bahasa Indonesia.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">8. Ketentuan Lain-lain</h2>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Keterpisahan:</strong> Jika ada ketentuan yang dinyatakan tidak sah atau tidak dapat dilaksanakan, ketentuan lainnya tetap berlaku sepenuhnya</li>
                        <li><strong>Keseluruhan Perjanjian:</strong> Syarat & Ketentuan ini merupakan keseluruhan perjanjian antara Anda dan Penyedia terkait penggunaan Platform</li>
                        <li><strong>Tidak Ada Pengabaian:</strong> Kegagalan Penyedia untuk menegakkan hak tidak dianggap sebagai pengabaian hak tersebut</li>
                        <li><strong>Pengalihan:</strong> Anda tidak dapat mengalihkan hak atau kewajiban Anda berdasarkan ketentuan ini tanpa persetujuan tertulis</li>
                        <li><strong>Force Majeure:</strong> Penyedia tidak bertanggung jawab atas kegagalan pelaksanaan yang disebabkan oleh keadaan di luar kendali wajar</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <h2 className="text-xl font-bold text-foreground mb-3">Persetujuan</h2>
                  <p className="text-muted-foreground">
                    Dengan mengakses dan menggunakan Platform Relasi4Warna, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan Syarat & Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, harap tidak menggunakan Platform.
                  </p>
                  <p className="text-muted-foreground mt-3">
                    Untuk pertanyaan terkait Syarat & Ketentuan ini, silakan hubungi kami melalui email di <strong>legal@relasi4warna.com</strong>
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                {/* English Content */}
                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">1. Service Definition</h2>
                      <p className="text-muted-foreground">
                        The 4Color Relating Platform ("Platform") provides reflection and educational testing services regarding communication and relationship styles based on our internal "4 Archetype Communication" model (Driver, Spark, Anchor, Analyst). This Platform is developed and operated by the service provider ("We", "Provider").
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <strong>Important:</strong> This service is NOT a medical, psychological, psychiatric, or clinical diagnostic tool. The Platform is not intended to replace professional consultation with psychologists, psychiatrists, counselors, or other mental health professionals.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">2. Nature of Test Results</h2>
                      <p className="text-muted-foreground">
                        Test results provided by the Platform are <strong>indicative and reflective</strong> in nature, not absolute truth or definitive diagnosis. Results represent a general overview based on answers you provide at the time of testing.
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Results may vary depending on emotional state and circumstances during testing</li>
                        <li>Users bear full responsibility for interpretation and use of test results</li>
                        <li>Results should not be the sole basis for important decisions</li>
                        <li>We recommend consulting professionals for significant decisions</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">3. Limitation of Liability</h2>
                      <p className="text-muted-foreground">
                        By using this Platform, you understand and agree that:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>The Platform Provider is <strong>not liable</strong> for personal, family, business, career, or relationship decisions made based on test results</li>
                        <li>Provider is not liable for direct, indirect, incidental, or consequential damages arising from Platform use</li>
                        <li>Provider does not guarantee that test results will meet your specific expectations or needs</li>
                        <li>Services are provided "as is" without any warranties, express or implied</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        <strong>Limitation Clause:</strong> In any case, the Provider's total liability shall not exceed the amount you paid to the Platform in the last 12 months or USD 35 (whichever is less).
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-driver" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">4. Intellectual Property Rights</h2>
                      <p className="text-muted-foreground">
                        All content on this Platform is the exclusive property of the Provider and is protected by Indonesian Intellectual Property Law (Law No. 28 of 2014 on Copyright) and related international agreements. Protected content includes but is not limited to:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Test questions and assessment methodology</li>
                        <li>Scoring system and calculation algorithms</li>
                        <li>Result reports, analysis, and recommendations</li>
                        <li>Workbooks, guides, and educational materials</li>
                        <li>Visual design, logos, and graphic elements</li>
                        <li>Platform structure, source code, and system architecture</li>
                        <li>The "4 Archetype Communication" model and all its descriptions</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-analyst" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">5. Prohibited Uses</h2>
                      <p className="text-muted-foreground">
                        Users are <strong>strictly prohibited</strong> from doing the following without written permission from the Provider:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Copying, reproducing, or duplicating Platform content</li>
                        <li>Distributing, selling, or renting content to third parties</li>
                        <li>Creating derivative works based on Platform content</li>
                        <li>Claiming Platform content as your own or another party's work</li>
                        <li>Using content for commercial purposes without license</li>
                        <li>Reverse engineering or decompiling the system</li>
                        <li>Accessing the system through unauthorized means (hacking)</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        <strong>Sanctions:</strong> Violation of these provisions may result in civil and/or criminal legal action under applicable Indonesian law, including material and immaterial damages.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">6. Service & Terms Changes</h2>
                      <p className="text-muted-foreground">
                        The Platform Provider reserves the right to:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Change, modify, or discontinue services at any time</li>
                        <li>Update content, questions, and test methodology</li>
                        <li>Change pricing structure and service packages</li>
                        <li>Revise these Terms & Conditions without prior notice</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        Continued use of the Platform after changes constitutes your acceptance of those changes. We recommend reviewing this page periodically.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">7. Governing Law & Dispute Resolution</h2>
                      <p className="text-muted-foreground">
                        These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising in connection with the use of the Platform shall be resolved through:
                      </p>
                      <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-1">
                        <li><strong>Deliberation:</strong> The parties shall attempt to resolve disputes amicably within 30 days</li>
                        <li><strong>Mediation:</strong> If deliberation fails, disputes shall be resolved through mediation under the Indonesian National Arbitration Board (BANI)</li>
                        <li><strong>Arbitration:</strong> Arbitration decisions are final and binding on both parties</li>
                      </ol>
                      <p className="text-muted-foreground mt-3">
                        The legal domicile is Jakarta, Indonesia. The language used in dispute resolution proceedings is Indonesian, with English translation available upon request.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">8. Miscellaneous Provisions</h2>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Severability:</strong> If any provision is found invalid or unenforceable, other provisions remain in full force</li>
                        <li><strong>Entire Agreement:</strong> These Terms & Conditions constitute the entire agreement between you and the Provider regarding Platform use</li>
                        <li><strong>No Waiver:</strong> Provider's failure to enforce a right shall not be deemed a waiver of that right</li>
                        <li><strong>Assignment:</strong> You may not assign your rights or obligations under these terms without written consent</li>
                        <li><strong>Force Majeure:</strong> Provider is not liable for failure to perform due to circumstances beyond reasonable control</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <h2 className="text-xl font-bold text-foreground mb-3">Agreement</h2>
                  <p className="text-muted-foreground">
                    By accessing and using the 4Color Relating Platform, you represent that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the Platform.
                  </p>
                  <p className="text-muted-foreground mt-3">
                    For questions regarding these Terms & Conditions, please contact us at <strong>legal@4colorrelating.com</strong>
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
