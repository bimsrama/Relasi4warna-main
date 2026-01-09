import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  ArrowLeft, Heart, Users, Send, Copy, CheckCircle, 
  AlertCircle, Sparkles, Loader2, Mail, Link as LinkIcon 
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const CouplesPage = () => {
  const { t, language } = useLanguage();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { packId } = useParams();

  const [loading, setLoading] = useState(false);
  const [myPacks, setMyPacks] = useState([]);
  const [currentPack, setCurrentPack] = useState(null);
  const [packName, setPackName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [comparisonReport, setComparisonReport] = useState(null);
  const [copied, setCopied] = useState(false);
  const [myResults, setMyResults] = useState([]);

  useEffect(() => {
    fetchMyPacks();
    fetchMyResults();
    if (packId) {
      fetchPack(packId);
    }
  }, [packId]);

  const fetchMyPacks = async () => {
    try {
      const response = await axios.get(`${API}/couples/my-packs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyPacks(response.data.packs || []);
    } catch (error) {
      console.error("Error fetching packs:", error);
    }
  };

  const fetchMyResults = async () => {
    try {
      const response = await axios.get(`${API}/quiz/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const couplesResults = (response.data.results || []).filter(r => r.series === "couples");
      setMyResults(couplesResults);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const fetchPack = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/couples/pack/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPack(response.data);
      if (response.data.comparison_report) {
        setComparisonReport(response.data.comparison_report);
      }
    } catch (error) {
      console.error("Error fetching pack:", error);
      toast.error(t("Gagal memuat paket", "Failed to load pack"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePack = async () => {
    if (!packName.trim()) {
      toast.error(t("Masukkan nama paket", "Enter pack name"));
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/couples/create-pack`,
        { pack_name: packName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("Paket pasangan dibuat!", "Couples pack created!"));
      navigate(`/couples/${response.data.pack_id}`);
      setPackName("");
      fetchMyPacks();
    } catch (error) {
      console.error("Error creating pack:", error);
      toast.error(t("Gagal membuat paket", "Failed to create pack"));
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePartner = async () => {
    if (!partnerEmail.trim()) {
      toast.error(t("Masukkan email pasangan", "Enter partner email"));
      return;
    }
    setInviting(true);
    try {
      await axios.post(
        `${API}/couples/invite`,
        { pack_id: packId, partner_email: partnerEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("Undangan terkirim!", "Invitation sent!"));
      setPartnerEmail("");
    } catch (error) {
      console.error("Error inviting partner:", error);
      toast.error(t("Gagal mengirim undangan", "Failed to send invitation"));
    } finally {
      setInviting(false);
    }
  };

  const handleLinkResult = async (resultId) => {
    try {
      await axios.post(
        `${API}/couples/link-result/${packId}?result_id=${resultId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("Hasil terhubung!", "Result linked!"));
      fetchPack(packId);
    } catch (error) {
      console.error("Error linking result:", error);
      toast.error(t("Gagal menghubungkan hasil", "Failed to link result"));
    }
  };

  const handleGenerateComparison = async () => {
    setGeneratingReport(true);
    try {
      const response = await axios.post(
        `${API}/couples/generate-comparison/${packId}?language=${language}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComparisonReport(response.data.comparison);
      toast.success(t("Laporan kompatibilitas dibuat!", "Compatibility report generated!"));
    } catch (error) {
      console.error("Error generating comparison:", error);
      toast.error(error.response?.data?.detail || t("Gagal membuat laporan", "Failed to generate report"));
    } finally {
      setGeneratingReport(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/couples/join/${packId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(t("Link disalin!", "Link copied!"));
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending_partner: { label: t("Menunggu Pasangan", "Waiting for Partner"), color: "bg-amber-500" },
      pending_tests: { label: t("Menunggu Tes", "Waiting for Tests"), color: "bg-blue-500" },
      complete: { label: t("Lengkap", "Complete"), color: "bg-green-500" }
    };
    const s = statusMap[status] || { label: status, color: "bg-gray-500" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs text-white ${s.color}`}>
        {s.label}
      </span>
    );
  };

  // Join pack page
  if (packId && packId.startsWith("join-")) {
    const actualPackId = packId.replace("join-", "");
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Kembali", "Back")}
              </Link>
            </div>
          </div>
        </header>
        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-md mx-auto">
            <Card className="border-driver/30">
              <CardContent className="p-8 text-center">
                <Heart className="w-16 h-16 text-driver mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t("Bergabung dengan Paket Pasangan", "Join Couples Pack")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "Anda diundang untuk mengambil tes komunikasi pasangan bersama.",
                    "You've been invited to take the couples communication test together."
                  )}
                </p>
                <Button 
                  className="btn-primary w-full" 
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${API}/couples/join/${actualPackId}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success(t("Berhasil bergabung!", "Successfully joined!"));
                      navigate(`/couples/${actualPackId}`);
                    } catch (error) {
                      toast.error(error.response?.data?.detail || t("Gagal bergabung", "Failed to join"));
                    }
                  }}
                  data-testid="join-pack-btn"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {t("Bergabung Sekarang", "Join Now")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Pack detail page
  if (packId && currentPack) {
    const isCreator = currentPack.creator_id === user?.user_id;
    const myResultLinked = isCreator ? currentPack.creator_result_id : currentPack.partner_result_id;

    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/couples" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-to-couples">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Paket Pasangan", "Couples Pack")}
              </Link>
              {getStatusBadge(currentPack.status)}
            </div>
          </div>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Pack Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-driver/10 mb-4">
                <Heart className="w-5 h-5 text-driver" />
                <span className="font-medium text-driver">{currentPack.pack_name}</span>
              </div>
              <h1 className="heading-2 text-foreground mb-2">
                {t("Perbandingan Komunikasi Pasangan", "Couples Communication Comparison")}
              </h1>
            </div>

            {/* Members */}
            <Card className="mb-6" data-testid="members-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("Anggota Paket", "Pack Members")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Creator */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                  <div>
                    <p className="font-medium">{currentPack.creator_name || t("Pembuat", "Creator")}</p>
                    <p className="text-sm text-muted-foreground">{isCreator ? t("Anda", "You") : ""}</p>
                  </div>
                  {currentPack.creator_result_id ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      {t("Tes Selesai", "Test Complete")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {t("Belum Tes", "Not Tested")}
                    </span>
                  )}
                </div>

                {/* Partner */}
                {currentPack.partner_id ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                    <div>
                      <p className="font-medium">{currentPack.partner_name || t("Pasangan", "Partner")}</p>
                      <p className="text-sm text-muted-foreground">{!isCreator ? t("Anda", "You") : ""}</p>
                    </div>
                    {currentPack.partner_result_id ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {t("Tes Selesai", "Test Complete")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {t("Belum Tes", "Not Tested")}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-center">
                    <p className="text-muted-foreground mb-4">
                      {t("Pasangan belum bergabung", "Partner hasn't joined yet")}
                    </p>
                    {isCreator && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder={t("Email pasangan", "Partner's email")}
                            value={partnerEmail}
                            onChange={(e) => setPartnerEmail(e.target.value)}
                            data-testid="partner-email-input"
                          />
                          <Button onClick={handleInvitePartner} disabled={inviting} data-testid="send-invite-btn">
                            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">{t("atau", "or")}</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <Button variant="outline" className="w-full" onClick={copyInviteLink} data-testid="copy-link-btn">
                          {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copied ? t("Disalin!", "Copied!") : t("Salin Link Undangan", "Copy Invite Link")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Link Result */}
            {!myResultLinked && myResults.length > 0 && (
              <Card className="mb-6 border-amber-500/30" data-testid="link-result-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <LinkIcon className="w-5 h-5" />
                    {t("Hubungkan Hasil Tes Anda", "Link Your Test Result")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {t(
                      "Pilih hasil tes pasangan Anda untuk dihubungkan ke paket ini:",
                      "Select your couples test result to link to this pack:"
                    )}
                  </p>
                  <div className="space-y-2">
                    {myResults.map((result) => (
                      <div
                        key={result.result_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/70"
                        onClick={() => handleLinkResult(result.result_id)}
                        data-testid={`link-result-${result.result_id}`}
                      >
                        <div>
                          <p className="font-medium">{result.primary_archetype}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(result.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm">{t("Hubungkan", "Link")}</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Need to take test */}
            {!myResultLinked && myResults.length === 0 && (
              <Card className="mb-6 border-driver/30" data-testid="take-test-card">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-driver mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">
                    {t("Anda Perlu Mengambil Tes", "You Need to Take the Test")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t(
                      "Ambil tes seri Pasangan terlebih dahulu untuk dapat melihat perbandingan.",
                      "Take the Couples series test first to see the comparison."
                    )}
                  </p>
                  <Button className="btn-primary" onClick={() => navigate("/quiz/couples")} data-testid="go-to-quiz-btn">
                    <Heart className="w-5 h-5 mr-2" />
                    {t("Mulai Tes Pasangan", "Start Couples Test")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Generate Comparison */}
            {currentPack.status === "complete" && !comparisonReport && (
              <Card className="mb-6 bg-gradient-to-br from-driver/5 to-spark/5 border-driver/20" data-testid="generate-comparison-card">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-12 h-12 text-driver mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {t("Siap Melihat Kompatibilitas?", "Ready to See Compatibility?")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      "Kedua pasangan telah menyelesaikan tes. Generate laporan kompatibilitas AI sekarang!",
                      "Both partners have completed the test. Generate AI compatibility report now!"
                    )}
                  </p>
                  <Button 
                    size="lg" 
                    className="btn-primary" 
                    onClick={handleGenerateComparison}
                    disabled={generatingReport}
                    data-testid="generate-report-btn"
                  >
                    {generatingReport ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("Menganalisis...", "Analyzing...")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t("Generate Laporan AI", "Generate AI Report")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Comparison Report */}
            {comparisonReport && (
              <Card className="mb-6" data-testid="comparison-report-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-driver" />
                    {t("Laporan Kompatibilitas AI", "AI Compatibility Report")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {comparisonReport.split('\n').map((line, idx) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={idx} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={idx} className="font-bold text-foreground">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.trim()) {
                        return <p key={idx} className="text-muted-foreground mb-2">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Main couples page - list packs
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-to-dashboard">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Dashboard", "Dashboard")}
            </Link>
            <h1 className="font-bold">{t("Paket Pasangan", "Couples Pack")}</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-driver/10 mb-4">
              <Heart className="w-5 h-5 text-driver" />
            </div>
            <h1 className="heading-2 text-foreground mb-2">
              {t("Perbandingan Komunikasi Pasangan", "Couples Communication Comparison")}
            </h1>
            <p className="body-lg text-muted-foreground">
              {t(
                "Pahami dinamika komunikasi Anda dan pasangan secara mendalam",
                "Understand your and your partner's communication dynamics deeply"
              )}
            </p>
          </div>

          {/* Create New Pack */}
          <Card className="mb-8 border-driver/30" data-testid="create-pack-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">{t("Buat Paket Baru", "Create New Pack")}</h3>
              <div className="flex gap-3">
                <Input
                  placeholder={t("Nama paket (mis: Aku & Dia)", "Pack name (e.g: Me & You)")}
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  data-testid="pack-name-input"
                />
                <Button onClick={handleCreatePack} disabled={loading} className="btn-primary" data-testid="create-pack-btn">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                  <span className="ml-2">{t("Buat", "Create")}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Packs */}
          <h3 className="text-lg font-bold mb-4">{t("Paket Saya", "My Packs")}</h3>
          {myPacks.length === 0 ? (
            <Card className="border-dashed" data-testid="empty-packs">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t("Belum ada paket pasangan. Buat yang pertama!", "No couples packs yet. Create your first one!")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myPacks.map((pack) => (
                <Card 
                  key={pack.pack_id} 
                  className="cursor-pointer hover:border-driver/50 transition-colors"
                  onClick={() => navigate(`/couples/${pack.pack_id}`)}
                  data-testid={`pack-${pack.pack_id}`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-driver/10 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-driver" />
                      </div>
                      <div>
                        <h4 className="font-bold">{pack.pack_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pack.creator_name} & {pack.partner_name || t("Menunggu...", "Waiting...")}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(pack.status)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CouplesPage;
