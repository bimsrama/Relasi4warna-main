import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { 
  ArrowLeft, Users, Home, Briefcase, Send, Copy, CheckCircle, 
  AlertCircle, Sparkles, Loader2, Mail, Link as LinkIcon,
  UserPlus, Crown, BarChart3, PieChart
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const ARCHETYPE_COLORS = {
  driver: { bg: "bg-driver/20", text: "text-driver", border: "border-driver" },
  spark: { bg: "bg-spark/20", text: "text-spark", border: "border-spark" },
  anchor: { bg: "bg-anchor/20", text: "text-anchor", border: "border-anchor" },
  analyst: { bg: "bg-analyst/20", text: "text-analyst", border: "border-analyst" }
};

const ARCHETYPE_NAMES = {
  driver: { id: "Penggerak", en: "Driver" },
  spark: { id: "Percikan", en: "Spark" },
  anchor: { id: "Jangkar", en: "Anchor" },
  analyst: { id: "Analis", en: "Analyst" }
};

const TeamPackPage = () => {
  const { t, language } = useLanguage();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { packId, inviteId } = useParams();

  const [loading, setLoading] = useState(false);
  const [myPacks, setMyPacks] = useState([]);
  const [currentPack, setCurrentPack] = useState(null);
  const [packName, setPackName] = useState("");
  const [packType, setPackType] = useState("family");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [teamAnalysis, setTeamAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [myResults, setMyResults] = useState([]);

  useEffect(() => {
    fetchMyPacks();
    fetchMyResults();
    if (packId && !inviteId) {
      fetchPack(packId);
    }
  }, [packId]);

  // Handle invite join
  useEffect(() => {
    if (inviteId) {
      handleJoinViaInvite();
    }
  }, [inviteId]);

  const fetchMyPacks = async () => {
    try {
      const response = await axios.get(`${API}/team/my-packs`, {
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
      setMyResults(response.data.results || []);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const fetchPack = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/team/pack/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPack(response.data);
      if (response.data.team_analysis) {
        setTeamAnalysis(response.data.team_analysis);
      }
    } catch (error) {
      console.error("Error fetching pack:", error);
      toast.error(t("Gagal memuat paket", "Failed to load pack"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinViaInvite = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/team/join/${inviteId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("Berhasil bergabung!", "Successfully joined!"));
      navigate(`/team/${response.data.pack_id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || t("Gagal bergabung", "Failed to join"));
      navigate("/team");
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
      const maxMembers = packType === "family" ? 6 : 10;
      const response = await axios.post(
        `${API}/team/create-pack`,
        { pack_name: packName, pack_type: packType, max_members: maxMembers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("Paket berhasil dibuat!", "Pack created successfully!"));
      navigate(`/team/${response.data.pack_id}`);
      setPackName("");
      fetchMyPacks();
    } catch (error) {
      console.error("Error creating pack:", error);
      toast.error(t("Gagal membuat paket", "Failed to create pack"));
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!memberEmail.trim()) {
      toast.error(t("Masukkan email anggota", "Enter member email"));
      return;
    }
    setInviting(true);
    try {
      await axios.post(
        `${API}/team/invite`,
        { pack_id: packId, member_email: memberEmail, member_name: memberName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t("Undangan terkirim!", "Invitation sent!"));
      setMemberEmail("");
      setMemberName("");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(error.response?.data?.detail || t("Gagal mengirim undangan", "Failed to send invitation"));
    } finally {
      setInviting(false);
    }
  };

  const handleLinkResult = async (resultId) => {
    try {
      await axios.post(
        `${API}/team/link-result/${packId}?result_id=${resultId}`,
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

  const handleGenerateAnalysis = async () => {
    setGeneratingAnalysis(true);
    try {
      const response = await axios.post(
        `${API}/team/generate-analysis/${packId}?language=${language}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeamAnalysis(response.data.analysis);
      toast.success(t("Analisis tim dibuat!", "Team analysis generated!"));
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast.error(error.response?.data?.detail || t("Gagal membuat analisis", "Failed to generate analysis"));
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/team/join-link/${packId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(t("Link disalin!", "Link copied!"));
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = currentPack?.owner_id === user?.user_id;
  const myMembership = currentPack?.members?.find(m => m.user_id === user?.user_id);
  const myLinkedResult = myMembership?.result_id;

  // Join link page
  if (packId && packId.startsWith("join-link-")) {
    const actualPackId = packId.replace("join-link-", "");
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
            <Card className="border-primary/30">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t("Bergabung dengan Paket", "Join Pack")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t(
                    "Anda diundang untuk bergabung dengan paket keluarga/tim.",
                    "You've been invited to join a family/team pack."
                  )}
                </p>
                <Button 
                  className="btn-primary w-full" 
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${API}/team/join-link/${actualPackId}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      toast.success(t("Berhasil bergabung!", "Successfully joined!"));
                      navigate(`/team/${actualPackId}`);
                    } catch (error) {
                      toast.error(error.response?.data?.detail || t("Gagal bergabung", "Failed to join"));
                    }
                  }}
                  data-testid="join-pack-btn"
                >
                  <Users className="w-5 h-5 mr-2" />
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
  if (packId && currentPack && !inviteId) {
    const completedMembers = currentPack.members_with_results?.filter(m => m.result) || [];
    const canGenerateAnalysis = completedMembers.length >= 2;

    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/team" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-to-team">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Paket Saya", "My Packs")}
              </Link>
              <span className={`px-3 py-1 rounded-full text-xs text-white ${
                currentPack.pack_type === "family" ? "bg-anchor" : "bg-analyst"
              }`}>
                {currentPack.pack_type === "family" ? t("Keluarga", "Family") : t("Tim", "Team")}
              </span>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Pack Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
                {currentPack.pack_type === "family" ? (
                  <Home className="w-5 h-5 text-primary" />
                ) : (
                  <Briefcase className="w-5 h-5 text-primary" />
                )}
                <span className="font-medium text-primary">{currentPack.pack_name}</span>
              </div>
              <h1 className="heading-2 text-foreground mb-2">
                {currentPack.pack_type === "family" 
                  ? t("Dashboard Keluarga", "Family Dashboard")
                  : t("Dashboard Tim", "Team Dashboard")}
              </h1>
              <p className="text-muted-foreground">
                {currentPack.members?.length} / {currentPack.max_members} {t("anggota", "members")}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{currentPack.members?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">{t("Anggota", "Members")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-anchor">{completedMembers.length}</p>
                  <p className="text-xs text-muted-foreground">{t("Tes Selesai", "Tests Done")}</p>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">{t("Progress", "Progress")}</p>
                  <Progress value={currentPack.completion_rate || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {Math.round(currentPack.completion_rate || 0)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Heatmap */}
            {currentPack.heatmap && (
              <Card className="mb-6" data-testid="heatmap-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    {t("Distribusi Arketipe", "Archetype Distribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(currentPack.heatmap).map(([arch, count]) => (
                      <div 
                        key={arch} 
                        className={`p-4 rounded-xl text-center ${ARCHETYPE_COLORS[arch]?.bg}`}
                      >
                        <p className={`text-2xl font-bold ${ARCHETYPE_COLORS[arch]?.text}`}>{count}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === "id" ? ARCHETYPE_NAMES[arch]?.id : ARCHETYPE_NAMES[arch]?.en}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Members */}
            <Card className="mb-6" data-testid="members-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("Anggota", "Members")}
                </CardTitle>
                {isOwner && currentPack.members?.length < currentPack.max_members && (
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('invite-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t("Undang", "Invite")}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {currentPack.members_with_results?.map((member, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      member.result ? "bg-secondary" : "bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        member.result 
                          ? ARCHETYPE_COLORS[member.result.primary_archetype]?.bg
                          : "bg-muted"
                      }`}>
                        {member.role === "owner" ? (
                          <Crown className="w-5 h-5 text-spark" />
                        ) : (
                          <span className={`text-sm font-bold ${
                            member.result ? ARCHETYPE_COLORS[member.result.primary_archetype]?.text : "text-muted-foreground"
                          }`}>
                            {member.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.name}
                          {member.user_id === user?.user_id && (
                            <span className="text-xs text-muted-foreground ml-2">({t("Anda", "You")})</span>
                          )}
                        </p>
                        {member.result && (
                          <p className="text-sm text-muted-foreground">
                            {language === "id" 
                              ? ARCHETYPE_NAMES[member.result.primary_archetype]?.id 
                              : ARCHETYPE_NAMES[member.result.primary_archetype]?.en}
                          </p>
                        )}
                      </div>
                    </div>
                    {member.result ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {t("Selesai", "Done")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {t("Belum", "Pending")}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Link My Result */}
            {!myLinkedResult && myResults.length > 0 && (
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
                      "Pilih hasil tes Anda untuk dihubungkan ke paket ini:",
                      "Select your test result to link to this pack:"
                    )}
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {myResults.slice(0, 5).map((result) => (
                      <div
                        key={result.result_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer hover:bg-secondary/70"
                        onClick={() => handleLinkResult(result.result_id)}
                        data-testid={`link-result-${result.result_id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${ARCHETYPE_COLORS[result.primary_archetype]?.bg} flex items-center justify-center`}>
                            <span className={`text-xs font-bold ${ARCHETYPE_COLORS[result.primary_archetype]?.text}`}>
                              {result.primary_archetype?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {language === "id" 
                                ? ARCHETYPE_NAMES[result.primary_archetype]?.id 
                                : ARCHETYPE_NAMES[result.primary_archetype]?.en}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.series} • {new Date(result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm">{t("Pilih", "Select")}</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Need to take test */}
            {!myLinkedResult && myResults.length === 0 && (
              <Card className="mb-6 border-primary/30" data-testid="take-test-card">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">
                    {t("Anda Perlu Mengambil Tes", "You Need to Take the Test")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t(
                      "Ambil tes terlebih dahulu untuk melihat hasil Anda di dashboard tim.",
                      "Take a test first to see your result in the team dashboard."
                    )}
                  </p>
                  <Button className="btn-primary" onClick={() => navigate("/series")} data-testid="go-to-quiz-btn">
                    {t("Mulai Tes", "Start Test")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Invite Section */}
            {isOwner && currentPack.members?.length < currentPack.max_members && (
              <Card className="mb-6" id="invite-section" data-testid="invite-section">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    {t("Undang Anggota Baru", "Invite New Member")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="email"
                      placeholder={t("Email anggota", "Member email")}
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      data-testid="member-email-input"
                    />
                    <Input
                      placeholder={t("Nama (opsional)", "Name (optional)")}
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      data-testid="member-name-input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleInviteMember} disabled={inviting} className="flex-1" data-testid="send-invite-btn">
                      {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      {t("Kirim Undangan", "Send Invitation")}
                    </Button>
                    <Button variant="outline" onClick={copyInviteLink} data-testid="copy-link-btn">
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Analysis */}
            {canGenerateAnalysis && !teamAnalysis && (
              <Card className="mb-6 bg-gradient-to-br from-primary/5 to-spark/5 border-primary/20" data-testid="generate-analysis-card">
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {t("Siap Analisis Dinamika?", "Ready for Dynamics Analysis?")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      `${completedMembers.length} anggota telah menyelesaikan tes. Generate analisis AI sekarang!`,
                      `${completedMembers.length} members have completed the test. Generate AI analysis now!`
                    )}
                  </p>
                  <Button 
                    size="lg" 
                    className="btn-primary" 
                    onClick={handleGenerateAnalysis}
                    disabled={generatingAnalysis}
                    data-testid="generate-analysis-btn"
                  >
                    {generatingAnalysis ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("Menganalisis...", "Analyzing...")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t("Generate Analisis AI", "Generate AI Analysis")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Analysis Display */}
            {teamAnalysis && (
              <Card className="mb-6" data-testid="team-analysis-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {t("Analisis Dinamika AI", "AI Dynamics Analysis")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {teamAnalysis.split('\n').map((line, idx) => {
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

  // Main team page - list packs
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-to-dashboard">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Dashboard", "Dashboard")}
            </Link>
            <h1 className="font-bold">{t("Paket Keluarga & Tim", "Family & Team Packs")}</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h1 className="heading-2 text-foreground mb-2">
              {t("Paket Keluarga & Tim", "Family & Team Packs")}
            </h1>
            <p className="body-lg text-muted-foreground">
              {t(
                "Pahami dinamika komunikasi keluarga atau tim Anda secara mendalam",
                "Understand your family or team communication dynamics deeply"
              )}
            </p>
          </div>

          {/* Create New Pack */}
          <Card className="mb-8 border-primary/30" data-testid="create-pack-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">{t("Buat Paket Baru", "Create New Pack")}</h3>
              
              {/* Pack Type Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    packType === "family" 
                      ? "border-anchor bg-anchor/10" 
                      : "border-border hover:border-anchor/50"
                  }`}
                  onClick={() => setPackType("family")}
                  data-testid="select-family"
                >
                  <Home className={`w-6 h-6 mb-2 ${packType === "family" ? "text-anchor" : "text-muted-foreground"}`} />
                  <p className="font-medium">{t("Keluarga", "Family")}</p>
                  <p className="text-xs text-muted-foreground">{t("Hingga 6 anggota", "Up to 6 members")}</p>
                </button>
                <button
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    packType === "team" 
                      ? "border-analyst bg-analyst/10" 
                      : "border-border hover:border-analyst/50"
                  }`}
                  onClick={() => setPackType("team")}
                  data-testid="select-team"
                >
                  <Briefcase className={`w-6 h-6 mb-2 ${packType === "team" ? "text-analyst" : "text-muted-foreground"}`} />
                  <p className="font-medium">{t("Tim", "Team")}</p>
                  <p className="text-xs text-muted-foreground">{t("Hingga 10 anggota", "Up to 10 members")}</p>
                </button>
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder={t(
                    packType === "family" ? "Nama keluarga (mis: Keluarga Budi)" : "Nama tim (mis: Tim Marketing)",
                    packType === "family" ? "Family name (e.g: The Smiths)" : "Team name (e.g: Marketing Team)"
                  )}
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  data-testid="pack-name-input"
                />
                <Button onClick={handleCreatePack} disabled={loading} className="btn-primary" data-testid="create-pack-btn">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
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
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t("Belum ada paket. Buat yang pertama!", "No packs yet. Create your first one!")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myPacks.map((pack) => (
                <Card 
                  key={pack.pack_id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/team/${pack.pack_id}`)}
                  data-testid={`pack-${pack.pack_id}`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        pack.pack_type === "family" ? "bg-anchor/10" : "bg-analyst/10"
                      }`}>
                        {pack.pack_type === "family" ? (
                          <Home className="w-6 h-6 text-anchor" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-analyst" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold">{pack.pack_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pack.members?.length || 1} / {pack.max_members} {t("anggota", "members")}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs text-white ${
                      pack.pack_type === "family" ? "bg-anchor" : "bg-analyst"
                    }`}>
                      {pack.pack_type === "family" ? t("Keluarga", "Family") : t("Tim", "Team")}
                    </span>
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

export default TeamPackPage;
