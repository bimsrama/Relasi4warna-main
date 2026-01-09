import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../App";
import { ArrowLeft, Shield, Database, Eye, Trash2, Lock, Globe, Bell, Mail } from "lucide-react";

const PrivacyPage = () => {
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
              <Shield className="w-5 h-5 text-anchor" />
              <span className="font-bold">{t("Kebijakan Privasi", "Privacy Policy")}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-anchor/10 mb-6">
              <Lock className="w-5 h-5 text-anchor" />
              <span className="text-sm font-medium text-anchor">{t("Perlindungan Data", "Data Protection")}</span>
            </div>
            <h1 className="heading-1 text-foreground mb-4">
              {t("Kebijakan Privasi", "Privacy Policy")}
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
                  <p className="text-muted-foreground">
                    Kebijakan Privasi ini menjelaskan bagaimana Relasi4Warna ("Platform", "Kami") mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda sesuai dengan:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (PDP)</li>
                    <li>General Data Protection Regulation (GDPR) untuk pengguna di Uni Eropa</li>
                    <li>California Consumer Privacy Act (CCPA) untuk pengguna di California</li>
                    <li>Standar keamanan data internasional yang berlaku</li>
                  </ul>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">1. Data yang Kami Kumpulkan</h2>
                      <p className="text-muted-foreground mb-3">
                        Kami mengumpulkan data minimum yang diperlukan untuk menyediakan layanan:
                      </p>
                      
                      <h3 className="font-bold text-foreground mt-4 mb-2">a. Data yang Anda Berikan Langsung:</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Informasi Akun:</strong> Nama, alamat email, kata sandi (terenkripsi)</li>
                        <li><strong>Jawaban Tes:</strong> Respons Anda terhadap pertanyaan asesmen</li>
                        <li><strong>Hasil Tes:</strong> Arketipe komunikasi dan skor yang dihitung</li>
                        <li><strong>Data Pembayaran:</strong> Informasi transaksi (diproses oleh pihak ketiga)</li>
                      </ul>

                      <h3 className="font-bold text-foreground mt-4 mb-2">b. Data yang Dikumpulkan Otomatis:</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Data Teknis:</strong> Alamat IP, jenis browser, perangkat, sistem operasi</li>
                        <li><strong>Data Penggunaan:</strong> Waktu akses, halaman yang dikunjungi, durasi sesi</li>
                        <li><strong>Cookies:</strong> Untuk fungsi situs dan preferensi pengguna</li>
                      </ul>

                      <h3 className="font-bold text-foreground mt-4 mb-2">c. Data yang TIDAK Kami Kumpulkan:</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Data kesehatan atau medis</li>
                        <li>Informasi keuangan detail (nomor kartu kredit disimpan oleh payment processor)</li>
                        <li>Data biometrik</li>
                        <li>Data lokasi presisi</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">2. Cara Kami Menggunakan Data</h2>
                      <p className="text-muted-foreground mb-3">
                        Data Anda digunakan <strong>hanya</strong> untuk tujuan berikut:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Penyediaan Layanan:</strong> Menghitung hasil tes, menyimpan riwayat, generate laporan</li>
                        <li><strong>Komunikasi:</strong> Mengirim hasil tes, tips mingguan (jika berlangganan), pembaruan layanan</li>
                        <li><strong>Keamanan:</strong> Mencegah penipuan, melindungi akun, memastikan integritas sistem</li>
                        <li><strong>Peningkatan Layanan:</strong> Analisis agregat (anonim) untuk meningkatkan kualitas tes</li>
                        <li><strong>Kewajiban Hukum:</strong> Memenuhi persyaratan hukum yang berlaku</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-driver" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">3. Perlindungan & Keamanan Data</h2>
                      <p className="text-muted-foreground mb-3">
                        Kami menerapkan langkah-langkah keamanan teknis dan organisasi:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Enkripsi:</strong> Data sensitif dienkripsi saat transit (TLS/SSL) dan saat disimpan</li>
                        <li><strong>Hashing Kata Sandi:</strong> Kata sandi di-hash dengan algoritma bcrypt</li>
                        <li><strong>Akses Terbatas:</strong> Hanya personel berwenang yang dapat mengakses data</li>
                        <li><strong>Audit Log:</strong> Semua akses ke data sensitif dicatat</li>
                        <li><strong>Backup Terenkripsi:</strong> Data dicadangkan secara teratur dengan enkripsi</li>
                        <li><strong>Pembaruan Keamanan:</strong> Sistem diperbarui secara berkala untuk patch keamanan</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">4. Berbagi Data dengan Pihak Ketiga</h2>
                      <p className="text-muted-foreground mb-3">
                        <strong>Kami TIDAK menjual data pengguna kepada pihak ketiga.</strong>
                      </p>
                      <p className="text-muted-foreground mb-3">
                        Data hanya dibagikan dalam situasi terbatas:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Payment Processor:</strong> Xendit untuk memproses pembayaran (mereka memiliki kebijakan privasi sendiri)</li>
                        <li><strong>Email Service:</strong> Resend untuk pengiriman email transaksional</li>
                        <li><strong>Cloud Infrastructure:</strong> Penyedia hosting yang memenuhi standar keamanan</li>
                        <li><strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh pengadilan atau otoritas hukum</li>
                        <li><strong>Dengan Persetujuan:</strong> Jika Anda secara eksplisit menyetujui pembagian data tertentu</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-analyst" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">5. Hak-Hak Anda (Sesuai UU PDP & GDPR)</h2>
                      <p className="text-muted-foreground mb-3">
                        Anda memiliki hak-hak berikut atas data pribadi Anda:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Hak Akses:</strong> Meminta salinan data pribadi yang kami simpan</li>
                        <li><strong>Hak Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat</li>
                        <li><strong>Hak Penghapusan:</strong> Meminta penghapusan data pribadi Anda ("right to be forgotten")</li>
                        <li><strong>Hak Pembatasan:</strong> Membatasi pemrosesan data dalam situasi tertentu</li>
                        <li><strong>Hak Portabilitas:</strong> Menerima data Anda dalam format yang dapat dipindahkan</li>
                        <li><strong>Hak Keberatan:</strong> Menolak pemrosesan data untuk tujuan tertentu</li>
                        <li><strong>Hak Menarik Persetujuan:</strong> Menarik persetujuan kapan saja</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        Untuk menggunakan hak-hak ini, hubungi kami di <strong>privacy@relasi4warna.com</strong>. Kami akan merespons dalam 30 hari kerja.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">6. Penghapusan Data & Retensi</h2>
                      <p className="text-muted-foreground mb-3">
                        <strong>Kebijakan Retensi Data:</strong>
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Data akun disimpan selama akun aktif</li>
                        <li>Hasil tes disimpan untuk riwayat pengguna sampai diminta dihapus</li>
                        <li>Log teknis dihapus otomatis setelah 90 hari</li>
                        <li>Data pembayaran disimpan sesuai kewajiban pajak (5 tahun)</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        <strong>Penghapusan Akun:</strong> Anda dapat meminta penghapusan akun dan semua data terkait kapan saja. Setelah konfirmasi, data akan dihapus permanen dalam 30 hari (kecuali yang wajib disimpan untuk kepatuhan hukum).
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">7. Cookies & Teknologi Pelacakan</h2>
                      <p className="text-muted-foreground mb-3">
                        Kami menggunakan cookies untuk:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Cookies Esensial:</strong> Autentikasi, keamanan, preferensi bahasa</li>
                        <li><strong>Cookies Fungsional:</strong> Mengingat pilihan dan preferensi Anda</li>
                        <li><strong>Cookies Analitik:</strong> Memahami penggunaan situs (data agregat/anonim)</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        Anda dapat mengelola preferensi cookies melalui pengaturan browser. Menonaktifkan cookies esensial dapat mempengaruhi fungsi situs.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">8. Transfer Data Internasional</h2>
                      <p className="text-muted-foreground">
                        Data Anda mungkin diproses di server yang berlokasi di luar Indonesia. Kami memastikan transfer data internasional dilindungi dengan:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Standard Contractual Clauses (SCC) yang disetujui</li>
                        <li>Perjanjian pemrosesan data dengan penyedia layanan</li>
                        <li>Kepatuhan terhadap standar keamanan internasional</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-driver" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">9. Perlindungan Anak</h2>
                      <p className="text-muted-foreground">
                        Platform ini tidak ditujukan untuk anak di bawah 18 tahun. Kami tidak dengan sengaja mengumpulkan data dari anak-anak. Jika Anda adalah orang tua/wali dan mengetahui anak Anda telah memberikan data kepada kami, silakan hubungi kami untuk penghapusan.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-anchor/5 rounded-2xl border border-anchor/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">10. Hubungi Kami</h2>
                      <p className="text-muted-foreground">
                        Untuk pertanyaan, permintaan, atau keluhan terkait privasi:
                      </p>
                      <ul className="list-none text-muted-foreground mt-3 space-y-1">
                        <li><strong>Email:</strong> privacy@relasi4warna.com</li>
                        <li><strong>Data Protection Officer:</strong> dpo@relasi4warna.com</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        Jika Anda tidak puas dengan respons kami, Anda berhak mengajukan keluhan ke otoritas perlindungan data yang berwenang.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                {/* English Content */}
                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <p className="text-muted-foreground">
                    This Privacy Policy explains how 4Color Relating ("Platform", "We") collects, uses, stores, and protects your personal data in accordance with:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Indonesian Law No. 27 of 2022 on Personal Data Protection (PDP)</li>
                    <li>General Data Protection Regulation (GDPR) for users in the European Union</li>
                    <li>California Consumer Privacy Act (CCPA) for users in California</li>
                    <li>Applicable international data security standards</li>
                  </ul>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">1. Data We Collect</h2>
                      <p className="text-muted-foreground mb-3">
                        We collect minimum data necessary to provide our services:
                      </p>
                      
                      <h3 className="font-bold text-foreground mt-4 mb-2">a. Data You Provide Directly:</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                        <li><strong>Test Responses:</strong> Your answers to assessment questions</li>
                        <li><strong>Test Results:</strong> Communication archetypes and calculated scores</li>
                        <li><strong>Payment Data:</strong> Transaction information (processed by third parties)</li>
                      </ul>

                      <h3 className="font-bold text-foreground mt-4 mb-2">b. Data Collected Automatically:</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Technical Data:</strong> IP address, browser type, device, operating system</li>
                        <li><strong>Usage Data:</strong> Access time, pages visited, session duration</li>
                        <li><strong>Cookies:</strong> For site functionality and user preferences</li>
                      </ul>

                      <h3 className="font-bold text-foreground mt-4 mb-2">c. Data We DO NOT Collect:</h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Health or medical data</li>
                        <li>Detailed financial information (credit card numbers stored by payment processor)</li>
                        <li>Biometric data</li>
                        <li>Precise location data</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Your Data</h2>
                      <p className="text-muted-foreground mb-3">
                        Your data is used <strong>only</strong> for the following purposes:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Service Provision:</strong> Calculate test results, store history, generate reports</li>
                        <li><strong>Communication:</strong> Send test results, weekly tips (if subscribed), service updates</li>
                        <li><strong>Security:</strong> Prevent fraud, protect accounts, ensure system integrity</li>
                        <li><strong>Service Improvement:</strong> Aggregate (anonymous) analysis to improve test quality</li>
                        <li><strong>Legal Obligations:</strong> Comply with applicable legal requirements</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-driver" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">3. Data Protection & Security</h2>
                      <p className="text-muted-foreground mb-3">
                        We implement technical and organizational security measures:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Encryption:</strong> Sensitive data encrypted in transit (TLS/SSL) and at rest</li>
                        <li><strong>Password Hashing:</strong> Passwords hashed with bcrypt algorithm</li>
                        <li><strong>Limited Access:</strong> Only authorized personnel can access data</li>
                        <li><strong>Audit Logs:</strong> All access to sensitive data is logged</li>
                        <li><strong>Encrypted Backups:</strong> Data regularly backed up with encryption</li>
                        <li><strong>Security Updates:</strong> Systems regularly updated for security patches</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">4. Third-Party Data Sharing</h2>
                      <p className="text-muted-foreground mb-3">
                        <strong>We DO NOT sell user data to third parties.</strong>
                      </p>
                      <p className="text-muted-foreground mb-3">
                        Data is only shared in limited situations:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Payment Processor:</strong> Xendit for payment processing (they have their own privacy policy)</li>
                        <li><strong>Email Service:</strong> Resend for transactional email delivery</li>
                        <li><strong>Cloud Infrastructure:</strong> Hosting providers meeting security standards</li>
                        <li><strong>Legal Obligations:</strong> If required by court or legal authority</li>
                        <li><strong>With Consent:</strong> If you explicitly consent to specific data sharing</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-analyst/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-analyst" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">5. Your Rights (Under PDP & GDPR)</h2>
                      <p className="text-muted-foreground mb-3">
                        You have the following rights over your personal data:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Right of Access:</strong> Request a copy of personal data we hold</li>
                        <li><strong>Right to Rectification:</strong> Update or correct inaccurate data</li>
                        <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                        <li><strong>Right to Restriction:</strong> Restrict processing in certain situations</li>
                        <li><strong>Right to Portability:</strong> Receive your data in a transferable format</li>
                        <li><strong>Right to Object:</strong> Object to processing for specific purposes</li>
                        <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        To exercise these rights, contact us at <strong>privacy@4colorrelating.com</strong>. We will respond within 30 business days.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">6. Data Deletion & Retention</h2>
                      <p className="text-muted-foreground mb-3">
                        <strong>Data Retention Policy:</strong>
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Account data retained while account is active</li>
                        <li>Test results stored for user history until deletion requested</li>
                        <li>Technical logs automatically deleted after 90 days</li>
                        <li>Payment data retained per tax obligations (5 years)</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        <strong>Account Deletion:</strong> You can request deletion of your account and all related data at any time. After confirmation, data will be permanently deleted within 30 days (except data required for legal compliance).
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-spark" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">7. Cookies & Tracking Technologies</h2>
                      <p className="text-muted-foreground mb-3">
                        We use cookies for:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><strong>Essential Cookies:</strong> Authentication, security, language preferences</li>
                        <li><strong>Functional Cookies:</strong> Remember your choices and preferences</li>
                        <li><strong>Analytics Cookies:</strong> Understand site usage (aggregate/anonymous data)</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        You can manage cookie preferences through browser settings. Disabling essential cookies may affect site functionality.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">8. International Data Transfers</h2>
                      <p className="text-muted-foreground">
                        Your data may be processed on servers located outside Indonesia. We ensure international data transfers are protected by:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Approved Standard Contractual Clauses (SCC)</li>
                        <li>Data processing agreements with service providers</li>
                        <li>Compliance with international security standards</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-secondary/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-driver/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-driver" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">9. Children's Protection</h2>
                      <p className="text-muted-foreground">
                        This Platform is not intended for children under 18 years old. We do not knowingly collect data from children. If you are a parent/guardian and know your child has provided data to us, please contact us for deletion.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="p-6 bg-anchor/5 rounded-2xl border border-anchor/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-anchor/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-anchor" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">10. Contact Us</h2>
                      <p className="text-muted-foreground">
                        For privacy-related questions, requests, or complaints:
                      </p>
                      <ul className="list-none text-muted-foreground mt-3 space-y-1">
                        <li><strong>Email:</strong> privacy@4colorrelating.com</li>
                        <li><strong>Data Protection Officer:</strong> dpo@4colorrelating.com</li>
                      </ul>
                      <p className="text-muted-foreground mt-3">
                        If you are not satisfied with our response, you have the right to file a complaint with the competent data protection authority.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
